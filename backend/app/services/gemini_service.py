import json
import logging
import re
from typing import Tuple, List, Optional, Dict, Any
from google import genai
from google.genai import types

from app.config import settings
from app.core.prompts import (
    SYSTEM_PROMPT, 
    USER_PROMPT_TEMPLATE,
    CHAT_SYSTEM_PROMPT,
    CHAT_USER_PROMPT_TEMPLATE,
)
from app.schemas.report import (
    GeminiAnalysisResult,
    ExplainedBiomarker,
    SourceFact,
    AiExplanation,
    DetectedBiomarkerRow,
    ChatMessage,
    ChatResponse,
)
from app.services.extractor import parse_detected_rows

logger = logging.getLogger(__name__)

# Primary and fallback Gemini models
GEMINI_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
]

def create_heuristic_fallback(report_text: str) -> GeminiAnalysisResult:
    """
    Safe, rule-based fallback when GEMINI_API_KEY is not configured or API is unreachable.
    Strictly factual: never fabricates missing reference ranges or values.
    """
    detected_rows: List[DetectedBiomarkerRow] = parse_detected_rows(report_text)
    explained_biomarkers: List[ExplainedBiomarker] = []

    for row in detected_rows:
        test_name = row.test_name or "Diagnostic Marker"
        val_str = row.observed_value or "Present"
        has_ref = bool(row.reference_interval)
        ref_str = row.reference_interval if has_ref else None

        # Determine status factually without fabricating
        status_indicator = "unclear_without_range"
        clarity_note = None

        if has_ref and ref_str:
            nums = re.findall(r"\d+(?:\.\d+)?", ref_str)
            if len(nums) >= 2:
                try:
                    low_bound = float(nums[0])
                    high_bound = float(nums[1])
                    obs_num = float(re.sub(r"[^\d\.]", "", val_str))
                    if obs_num < low_bound:
                        status_indicator = "out_of_range"
                    elif obs_num > high_bound:
                        status_indicator = "out_of_range"
                    else:
                        status_indicator = "within_range"
                except Exception:
                    status_indicator = "unclear_without_range"
                    clarity_note = "Could not parse numerical bounds from reference string."
        else:
            clarity_note = "No biological reference interval was stated for this marker in the report text."

        source_fact = SourceFact(
            test_name=test_name,
            extracted_value=val_str,
            unit=row.unit,
            reference_range=ref_str,
            is_reference_range_present=has_ref,
        )

        ai_explanation = AiExplanation(
            simple_language_explanation=f"{test_name} measures an important chemical or cellular indicator in your laboratory specimen. Your observed value is {val_str} {row.unit or ''}.",
            clinical_context="Clinicians evaluate this parameter alongside your complete medical history and physical exam.",
            clarity_note=clarity_note,
            status_indicator=status_indicator,
        )

        explained_biomarkers.append(
            ExplainedBiomarker(
                source_fact=source_fact,
                ai_explanation=ai_explanation,
            )
        )

    # Clarity assessment
    missing_ranges = sum(1 for b in explained_biomarkers if not b.source_fact.is_reference_range_present)
    if not explained_biomarkers:
        clarity = "unclear"
        warning = "No standard laboratory test tables could be identified in the text. Please verify document scan quality and consult a physician."
    elif missing_ranges > (len(explained_biomarkers) / 2):
        clarity = "partially_clear"
        warning = "Several test items lack printed biological reference ranges. Please have a healthcare provider interpret these values."
    else:
        clarity = "clear"
        warning = None

    doctor_questions = [
        f"Could you explain the clinical significance of my observed {b.source_fact.test_name} value ({b.source_fact.extracted_value} {b.source_fact.unit or ''})?"
        for b in explained_biomarkers[:3]
    ]
    if not doctor_questions:
        doctor_questions = [
            "Are there any specific lab results here that warrant repeat testing or lifestyle changes?",
            "What do these overall parameters indicate regarding my general metabolic and organ health?",
        ]

    return GeminiAnalysisResult(
        overall_headline="Extracted Laboratory Report Overview",
        overall_plain_summary=(
            f"A total of {len(explained_biomarkers)} laboratory parameter(s) were factually extracted from your document. "
            "ReportSaathi provides this terminology review for patient health literacy. Always review these results with your physician."
        ),
        report_clarity_assessment=clarity,
        unclear_report_warning=warning,
        explained_biomarkers=explained_biomarkers,
        suggested_doctor_questions=doctor_questions,
    )

def analyze_with_gemini(report_text: str) -> Tuple[GeminiAnalysisResult, str, str]:
    """
    Sends extracted report text to Google Gemini API using structured JSON schema.
    Returns: (validated_result, engine_used, status_message)
    """
    api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""

    if not api_key:
        logger.info("GEMINI_API_KEY not configured. Using rule-based factual fallback.")
        fallback_result = create_heuristic_fallback(report_text)
        return (
            fallback_result,
            "heuristic_fallback",
            "GEMINI_API_KEY is not set in backend/.env. Returning factual extraction with rule-based definitions.",
        )

    client = genai.Client(api_key=api_key)
    prompt = USER_PROMPT_TEMPLATE.format(report_text=report_text)
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        response_mime_type="application/json",
        temperature=0.2,
    )

    last_error = None
    for model_name in GEMINI_MODELS:
        try:
            logger.info(f"Sending report text ({len(report_text)} chars) to Gemini model {model_name}...")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config,
            )

            raw_response_text = response.text or "{}"
            cleaned_json = raw_response_text.strip()
            if cleaned_json.startswith("```"):
                cleaned_json = re.sub(r"^```(?:json)?\s*", "", cleaned_json)
                cleaned_json = re.sub(r"\s*```$", "", cleaned_json)

            validated_result = GeminiAnalysisResult.model_validate_json(cleaned_json)
            logger.info(f"Gemini analysis validated: {len(validated_result.explained_biomarkers)} biomarkers explained using {model_name}.")

            return (
                validated_result,
                "gemini",
                f"Successfully analyzed and explained with Google Gemini ({model_name}).",
            )
        except Exception as e:
            last_error = e
            logger.warning(f"Attempt with model {model_name} failed: {e}. Trying next available model...")

    logger.warning(f"All Gemini models failed ({str(last_error)}). Falling back safely to heuristic engine.")
    fallback_result = create_heuristic_fallback(report_text)
    return (
        fallback_result,
        "heuristic_fallback",
        f"Gemini API request failed ({str(last_error)}). Provided safe factual fallback.",
    )

def chat_about_report(
    message: str,
    report_title: str,
    report_text: Optional[str] = None,
    biomarkers: Optional[List[Dict[str, Any]]] = None,
    chat_history: Optional[List[ChatMessage]] = None,
) -> ChatResponse:
    """
    Answers a patient's question strictly grounded in the currently selected report.
    If the question asks about data not present in the report, explicitly states it is unavailable.
    """
    # 1. Build concise report context string
    context_lines = []
    if report_text:
        context_lines.append(report_text.strip())
    elif biomarkers:
        for b in biomarkers:
            name = b.get("name") or b.get("test_name", "Test")
            val = b.get("value") or b.get("extracted_value", "")
            unit = b.get("unit", "")
            ref = b.get("referenceInterval") or b.get("reference_range", "Not specified")
            context_lines.append(f"{name}: {val} {unit} (Reference: {ref})")

    report_context_str = "\n".join(context_lines) if context_lines else "No specific test values extracted."

    # Format chat history
    history_lines = []
    if chat_history:
        for h in chat_history[-4:]: # Keep last 4 turns for context
            role_label = "Patient" if h.role == "user" else "Assistant"
            history_lines.append(f"{role_label}: {h.content}")
    chat_history_str = "\n".join(history_lines) if history_lines else ""

    api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""

    # Call Gemini if API key is present
    if api_key:
        client = genai.Client(api_key=api_key)
        user_prompt = CHAT_USER_PROMPT_TEMPLATE.format(
            report_title=report_title,
            report_context=report_context_str,
            chat_history_str=f"RECENT CONVERSATION:\n{chat_history_str}\n" if chat_history_str else "",
            user_question=message,
        )

        config = types.GenerateContentConfig(
            system_instruction=CHAT_SYSTEM_PROMPT,
            temperature=0.2, # Low temperature for strict factual grounding
        )

        for model_name in GEMINI_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=user_prompt,
                    config=config,
                )
                reply_text = response.text or ""
                if reply_text.strip():
                    is_outside = "not available in your uploaded laboratory report" in reply_text.lower() or "not in this report" in reply_text.lower()
                    return ChatResponse(
                        reply=reply_text.strip(),
                        grounded_in_report=not is_outside,
                    )
            except Exception as e:
                logger.warning(f"Chat attempt with {model_name} failed: {e}")

    # Safe heuristic fallback when offline or API key absent
    lower_msg = message.lower()
    matched_items = []
    if biomarkers:
        for b in biomarkers:
            b_name = (b.get("name") or b.get("test_name", "")).lower()
            if b_name and (b_name in lower_msg or any(word in lower_msg for word in b_name.split() if len(word) > 3)):
                matched_items.append(b)

    if matched_items:
        details = []
        for item in matched_items:
            name = item.get("name") or item.get("test_name")
            val = item.get("value") or item.get("extracted_value")
            unit = item.get("unit", "")
            ref = item.get("referenceInterval") or item.get("reference_range", "Not stated")
            meaning = item.get("plainMeaning", "")
            details.append(f"• **{name}**: Your report lists an observed value of **{val} {unit}** (Reference: {ref}). {meaning}")
        
        reply = (
            f"Based on your report **{report_title}**:\n\n" +
            "\n\n".join(details) +
            "\n\nPlease remember that lab results should always be interpreted by your doctor in the context of your overall health and medical history."
        )
        return ChatResponse(reply=reply, grounded_in_report=True)
    else:
        # Strict rule: Information not supported by report -> say unavailable
        reply = (
            f"This information is not available in your currently selected laboratory report ('{report_title}'). "
            "ReportSaathi can only answer questions about tests and values specifically listed in this report. "
            "I recommend discussing this question directly with a qualified healthcare professional."
        )
        return ChatResponse(reply=reply, grounded_in_report=False)
