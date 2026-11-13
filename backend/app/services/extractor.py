import os
import re
import tempfile
import logging
from typing import Tuple, List
from fastapi import UploadFile, HTTPException
from PIL import Image
import pdfplumber
import pypdfium2 as pdfium
import pytesseract

from app.config import settings
from app.schemas.report import DetectedBiomarkerRow

logger = logging.getLogger(__name__)

# Factual regex for tabular lab values (e.g., "Hemoglobin 13.5 g/dL 12.0 - 15.0" or "Fasting Blood Glucose: 108 mg/dL")
# We NEVER fabricate missing items.
LINE_PATTERN = re.compile(
    r"^(?P<name>[A-Za-z][A-Za-z0-9\s\(\)\-\,\.\/\+\%]{2,35}?)\s+"
    r"(?P<val>[<>≤≥]?\s*\d+(?:\.\d+)?)\s*"
    r"(?P<unit>[a-zA-Z\%\/\^0-9\.\µ\u00b5\-]+)?"
    r"(?:\s+(?P<ref>[\d\.\-\s]+(?:\sto\s[\d\.]+)?))?$",
    re.UNICODE
)

def parse_detected_rows(raw_text: str) -> List[DetectedBiomarkerRow]:
    """
    Factually identifies lines that follow standard lab report formats.
    Strictly preserves observed data and NEVER fabricates or assumes missing values.
    """
    rows: List[DetectedBiomarkerRow] = []
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]

    for line in lines:
        match = LINE_PATTERN.match(line)
        if match:
            groups = match.groupdict()
            name = groups.get("name", "").strip()
            # Ignore common header rows
            if name.lower() in ["test name", "investigation", "parameter", "component", "description"]:
                continue
            rows.append(DetectedBiomarkerRow(
                raw_line=line,
                test_name=name,
                observed_value=groups.get("val", "").strip() if groups.get("val") else None,
                unit=groups.get("unit", "").strip() if groups.get("unit") else None,
                reference_interval=groups.get("ref", "").strip() if groups.get("ref") else None,
            ))
        else:
            # Check for simple "Name: Value Unit" pattern
            simple_match = re.search(r"([A-Za-z\s\(\)\-\+]{3,30}):\s*([<>≤≥]?\s*\d+(?:\.\d+)?)\s*([a-zA-Z\%\/\^0-9\µ\-]+)?", line)
            if simple_match:
                rows.append(DetectedBiomarkerRow(
                    raw_line=line,
                    test_name=simple_match.group(1).strip(),
                    observed_value=simple_match.group(2).strip(),
                    unit=simple_match.group(3).strip() if simple_match.group(3) else None,
                    reference_interval=None,
                ))
    return rows

async def validate_and_save_temp(upload_file: UploadFile) -> Tuple[str, str, int, str]:
    """
    Safely validates file format and size, saving to a secure temporary directory.
    Returns (temp_dir, file_path, file_size_bytes, extension).
    """
    filename = upload_file.filename or "unknown"
    _, ext = os.path.splitext(filename.lower())

    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file format '{ext}'. Supported formats are: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )

    temp_dir = tempfile.mkdtemp(prefix="reportsaathi_")
    safe_path = os.path.join(temp_dir, f"report{ext}")

    total_bytes = 0
    chunk_size = 64 * 1024  # 64 KB

    try:
        with open(safe_path, "wb") as f:
            while chunk := await upload_file.read(chunk_size):
                total_bytes += len(chunk)
                if total_bytes > settings.MAX_FILE_SIZE_BYTES:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File exceeds maximum size limit of {settings.MAX_FILE_SIZE_BYTES // (1024*1024)}MB.",
                    )
                f.write(chunk)
    except HTTPException:
        # Clean up immediately if size exceeded
        if os.path.exists(safe_path):
            os.remove(safe_path)
        os.rmdir(temp_dir)
        raise
    except Exception as exc:
        if os.path.exists(safe_path):
            os.remove(safe_path)
        os.rmdir(temp_dir)
        raise HTTPException(status_code=500, detail=f"Failed to save upload safely: {str(exc)}")

    return temp_dir, safe_path, total_bytes, ext

def extract_from_pdf(file_path: str) -> Tuple[str, int, str]:
    """
    Extracts text from PDF.
    Attempts digital PDF text extraction first.
    If digital text is sparse/scanned, falls back to page rendering + Tesseract OCR.
    Returns (extracted_text, page_count, extraction_method).
    """
    extracted_pages: List[str] = []
    page_count = 0

    # 1. Native digital text extraction via pdfplumber
    try:
        with pdfplumber.open(file_path) as pdf:
            page_count = len(pdf.pages)
            for page_idx, page in enumerate(pdf.pages, start=1):
                text = page.extract_text() or ""
                if text.strip():
                    extracted_pages.append(f"--- Page {page_idx} ---\n{text.strip()}")
    except Exception as e:
        logger.warning(f"pdfplumber extraction encountered issue: {e}")

    full_digital_text = "\n\n".join(extracted_pages).strip()

    # If substantial digital text was extracted (>= 30 characters), return it
    if len(full_digital_text) >= 30:
        return full_digital_text, page_count, "native_pdf"

    # 2. Scanned PDF fallback via pypdfium2 + Tesseract OCR
    tesseract_path = settings.get_tesseract_path()
    if not tesseract_path:
        # If no digital text and no Tesseract
        if full_digital_text:
            return full_digital_text, page_count, "native_pdf"
        raise HTTPException(
            status_code=422,
            detail=(
                "The uploaded PDF appears to be a scanned image or photograph with no digital text stream, "
                "and Tesseract OCR is not installed on the server. Please install Tesseract-OCR or upload a text-searchable digital PDF."
            ),
        )

    pytesseract.pytesseract.tesseract_cmd = tesseract_path
    ocr_pages: List[str] = []

    try:
        pdf = pdfium.PdfDocument(file_path)
        page_count = len(pdf)
        for page_idx in range(page_count):
            page = pdf[page_idx]
            pil_image = page.render(scale=2.0).to_pil()
            page_ocr_text = pytesseract.image_to_string(pil_image)
            if page_ocr_text.strip():
                ocr_pages.append(f"--- Page {page_idx + 1} (OCR) ---\n{page_ocr_text.strip()}")
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Failed to perform OCR on scanned PDF pages: {str(e)}",
        )

    full_ocr_text = "\n\n".join(ocr_pages).strip()
    if not full_ocr_text:
        raise HTTPException(
            status_code=422,
            detail="The scanned PDF was processed, but no readable text or values could be identified. The scan may be blank or too low-resolution.",
        )

    return full_ocr_text, page_count, "ocr_tesseract"

def extract_from_image(file_path: str) -> Tuple[str, int, str]:
    """
    Extracts text from image file using Tesseract OCR.
    Validates image readability and handles missing OCR gracefully.
    Returns (extracted_text, page_count=1, extraction_method).
    """
    tesseract_path = settings.get_tesseract_path()
    if not tesseract_path:
        raise HTTPException(
            status_code=422,
            detail=(
                "Tesseract OCR is required for image files (.jpg, .png), but is not currently installed or configured on the server. "
                "Please configure TESSERACT_CMD in .env or upload a digital PDF."
            ),
        )

    try:
        with Image.open(file_path) as img:
            img.verify()  # Verify image integrity
        # Re-open for actual processing after verify()
        with Image.open(file_path) as img:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path
            raw_text = pytesseract.image_to_string(img)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=400,
            detail=f"The uploaded image file is unreadable or corrupted: {str(e)}",
        )

    cleaned_text = raw_text.strip()
    if not cleaned_text:
        raise HTTPException(
            status_code=422,
            detail="The image was scanned with OCR, but no text or numbers were found. Please upload a clearer, higher-contrast photo or digital PDF.",
        )

    return cleaned_text, 1, "ocr_tesseract"
