import os
import shutil
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.report import (
    ReportAnalysisResponse, 
    ChatRequest, 
    ChatResponse
)
from app.services.extractor import (
    validate_and_save_temp,
    extract_from_pdf,
    extract_from_image,
    parse_detected_rows,
)
from app.services.gemini_service import analyze_with_gemini, chat_about_report

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post(
    "/analyze",
    response_model=ReportAnalysisResponse,
    summary="Upload, extract text, and explain report with Gemini API",
    description="Accepts PDF, JPG, or PNG, extracts text safely, sends to Gemini API for structured plain-language explanation, and returns validated JSON.",
)
async def analyze_report(
    file: UploadFile = File(..., description="Laboratory report file (PDF, JPG, PNG)")
):
    temp_dir = None
    file_path = None

    try:
        temp_dir, file_path, file_size_bytes, ext = await validate_and_save_temp(file)
        
        if ext == ".pdf":
            extracted_text, page_count, method = extract_from_pdf(file_path)
        elif ext in [".jpg", ".jpeg", ".png"]:
            extracted_text, page_count, method = extract_from_image(file_path)
        else:
            raise HTTPException(status_code=415, detail=f"Unsupported file type: {ext}")

        detected_rows = parse_detected_rows(extracted_text)

        lines = [l for l in extracted_text.splitlines() if l.strip()]
        char_count = len(extracted_text)

        gemini_result, ai_engine, ai_status = analyze_with_gemini(extracted_text)

        status = "success" if char_count > 0 else "warning"
        message = (
            f"Successfully extracted {char_count} characters across {page_count} page(s) using {method}."
            if status == "success"
            else "Extraction completed, but character count is minimal. Verify document clarity."
        )

        return ReportAnalysisResponse(
            status=status,
            filename=file.filename or "uploaded_report",
            file_type=ext.lstrip(".").upper(),
            file_size_bytes=file_size_bytes,
            page_count=page_count,
            character_count=char_count,
            line_count=len(lines),
            extraction_method=method,
            extracted_text=extracted_text,
            detected_rows=detected_rows,
            gemini_analysis=gemini_result,
            ai_engine_used=ai_engine,
            ai_status_message=ai_status,
            message=message,
        )

    finally:
        if temp_dir and os.path.exists(temp_dir):
            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception as e:
                logger.error(f"Error removing temporary directory {temp_dir}: {e}")

@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Report-grounded educational question answering",
    description="Answers questions strictly using information present in the selected report. Does not diagnose or prescribe.",
)
async def chat_report(request: ChatRequest):
    try:
        response = chat_about_report(
            message=request.message,
            report_title=request.report_title,
            report_text=request.report_text,
            biomarkers=request.biomarkers,
            chat_history=request.chat_history,
        )
        return response
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Chat service encountered an issue: {str(e)}"
        )
