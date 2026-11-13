from typing import List, Optional
from pydantic import BaseModel, Field

class DetectedBiomarkerRow(BaseModel):
    """Candidate biomarker line extracted from raw text without inventing missing data."""
    raw_line: str = Field(..., description="Raw text line from laboratory report")
    test_name: Optional[str] = Field(None, description="Identified test name if detected")
    observed_value: Optional[str] = Field(None, description="Extracted numerical or categorical value")
    unit: Optional[str] = Field(None, description="Extracted unit of measurement if present")
    reference_interval: Optional[str] = Field(None, description="Extracted biological reference interval if present in report text")

class SourceFact(BaseModel):
    """Factual, unedited laboratory finding extracted strictly from the document."""
    test_name: str = Field(..., description="Exact test or investigation name found in report")
    extracted_value: str = Field(..., description="Observed numeric or qualitative test result")
    unit: Optional[str] = Field(None, description="Unit of measurement explicitly present in source text, else null")
    reference_range: Optional[str] = Field(None, description="Reference range explicitly stated in report text, else null (NEVER invented)")
    is_reference_range_present: bool = Field(..., description="True if the lab provided a reference range in the report text")

class AiExplanation(BaseModel):
    """Patient-friendly plain language translation and educational context."""
    simple_language_explanation: str = Field(..., description="8th-grade level explanation of what this test marker measures")
    clinical_context: str = Field(..., description="Why physicians commonly review this marker in clinical assessment")
    clarity_note: Optional[str] = Field(None, description="Flag for missing reference range, ambiguous units, or unclear scanning")
    status_indicator: str = Field(
        ...,
        description="'within_range', 'out_of_range', or 'unclear_without_range'"
    )

class ExplainedBiomarker(BaseModel):
    """Pairs raw source-extracted ground facts with decoupled educational AI explanations."""
    source_fact: SourceFact
    ai_explanation: AiExplanation

class GeminiAnalysisResult(BaseModel):
    """Structured response from Gemini API."""
    overall_headline: str = Field(..., description="High-level conversational overview headline")
    overall_plain_summary: str = Field(..., description="2-paragraph plain-language assessment of the report findings")
    report_clarity_assessment: str = Field(
        ...,
        description="'clear', 'partially_clear', or 'unclear'"
    )
    unclear_report_warning: Optional[str] = Field(
        None,
        description="Warning prompt when report is missing critical reference data or is ambiguous, advising physician consult"
    )
    explained_biomarkers: List[ExplainedBiomarker] = Field(
        default_factory=list,
        description="Structured list of biomarkers pairing source facts with simple explanations"
    )
    suggested_doctor_questions: List[str] = Field(
        default_factory=list,
        description="Constructive questions the patient can ask their physician during appointment"
    )
    disclaimer: str = Field(
        default="ReportSaathi provides educational health literacy support only. It does not provide medical diagnosis, treatment recommendations, or prescriptions. Always consult a licensed healthcare professional for clinical evaluation.",
        description="Mandatory educational disclaimer"
    )

class ReportAnalysisResponse(BaseModel):
    status: str = Field(..., description="'success', 'warning', or 'error'")
    filename: str
    file_type: str
    file_size_bytes: int
    page_count: int
    character_count: int
    line_count: int
    extraction_method: str = Field(..., description="'native_pdf', 'ocr_tesseract', or 'none'")
    extracted_text: str = Field(..., description="Full text extracted from document")
    detected_rows: List[DetectedBiomarkerRow] = Field(default_factory=list, description="Factual raw parsed rows")
    gemini_analysis: Optional[GeminiAnalysisResult] = Field(None, description="Validated Gemini AI structured explanation")
    ai_engine_used: str = Field(default="gemini", description="'gemini', 'heuristic_fallback', or 'none'")
    ai_status_message: str = Field(default="Analysis complete", description="Details on AI service status or fallback reason")
    message: str = Field(..., description="Informational message regarding the extraction")
    disclaimer: str = Field(
        default="ReportSaathi is for educational and health literacy purposes only. No clinical diagnosis is made. Never invent or alter medical values.",
        description="Mandatory educational disclaimer"
    )

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    gemini_configured: bool
    tesseract_available: bool
    tesseract_path: Optional[str] = None
    supported_extensions: List[str]
    max_file_size_mb: int
