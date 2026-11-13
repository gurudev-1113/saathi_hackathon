import json
import logging
import re
from typing import Tuple, List, Optional
from google import genai
from google.genai import types

from app.config import settings
from app.core.prompts import SYSTEM_PROMPT, USER_PROMPT_TEMPLATE
from app.schemas.report import (
    GeminiAnalysisResult,
    ExplainedBiomarker,
    SourceFact,
    AiExplanation,
    DetectedBiomarkerRow,
)
from app.services.extractor import parse_detected_rows

logger = logging.getLogger(__name__)

# Primary and fallback Gemini models
GEMINI_MODEL = "gemini-2.5-flash"

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

    # If no API key configured, use safe factual fallback
    if not api_key:
        logger.info("GEMINI_API_KEY not configured. Using rule-based factual fallback.")
        fallback_result = create_heuristic_fallback(report_text)
        return (
            fallback_result,
            "heuristic_fallback",
            "GEMINI_API_KEY is not set in backend/.env. Returning factual extraction with rule-based definitions.",
        )

    try:
        # Initialize Google GenAI client
        client = genai.Client(api_key=api_key)

        prompt = USER_PROMPT_TEMPLATE.format(report_text=report_text)

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            temperature=0.2, # Low temperature for factual precision
        )

        logger.info(f"Sending report text ({len(report_text)} chars) to Gemini model {GEMINI_MODEL}...")
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=config,
        )

        raw_response_text = response.text or "{}"
        
        # Clean any accidental markdown code fences
        cleaned_json = raw_response_text.strip()
        if cleaned_json.startswith("```"):
            cleaned_json = re.sub(r"^```(?:json)?\s*", "", cleaned_json)
            cleaned_json = re.sub(r"\s*```$", "", cleaned_json)

        # Validate with Pydantic schema
        validated_result = GeminiAnalysisResult.model_validate_json(cleaned_json)
        logger.info(f"Gemini analysis validated: {len(validated_result.explained_biomarkers)} biomarkers explained.")

        return (
            validated_result,
            "gemini",
            f"Successfully analyzed and explained with Google Gemini ({GEMINI_MODEL}).",
        )

    except Exception as e:
        logger.warning(f"Gemini API request or validation failed ({str(e)}). Falling back safely to heuristic engine.")
        fallback_result = create_heuristic_fallback(report_text)
        return (
            fallback_result,
            "heuristic_fallback",
            f"Gemini API call failed ({str(e)}). Provided safe factual fallback without fabricating data.",
        )
