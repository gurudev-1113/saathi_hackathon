import io
import sys
from fastapi.testclient import TestClient
from app.main import app
from app.services.gemini_service import analyze_with_gemini, create_heuristic_fallback
from app.schemas.report import GeminiAnalysisResult
from tests.test_api import create_sample_pdf_bytes

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

client = TestClient(app)

def test_heuristic_fallback_preserves_facts():
    sample_text = """
    METRO DIAGNOSTICS
    Hemoglobin 13.5 g/dL 12.0 - 15.0
    Fasting Blood Glucose 108 mg/dL 70 - 99
    Serum Creatinine 0.9 mg/dL
    """
    result, engine, msg = analyze_with_gemini(sample_text)
    assert isinstance(result, GeminiAnalysisResult)
    assert len(result.explained_biomarkers) >= 2

    # Check first biomarker (Hemoglobin)
    hb = next(b for b in result.explained_biomarkers if "Hemoglobin" in b.source_fact.test_name)
    assert hb.source_fact.extracted_value == "13.5"
    assert hb.source_fact.unit == "g/dL"
    assert hb.source_fact.reference_range == "12.0 - 15.0"
    assert hb.source_fact.is_reference_range_present is True
    assert hb.ai_explanation.status_indicator == "within_range"
    assert "Hemoglobin" in hb.ai_explanation.simple_language_explanation

    # Check Creatinine (missing reference range in source text!)
    creat = next(b for b in result.explained_biomarkers if "Creatinine" in b.source_fact.test_name)
    assert creat.source_fact.extracted_value == "0.9"
    # STRICT CHECK: Reference range must NOT be invented!
    assert creat.source_fact.reference_range is None
    assert creat.source_fact.is_reference_range_present is False
    assert creat.ai_explanation.status_indicator == "unclear_without_range"
    assert "No biological reference interval was stated" in creat.ai_explanation.clarity_note

    print("[PASS] Fallback engine strictly preserves facts and does not invent missing ranges")

def test_gemini_schema_validation():
    synthetic_gemini_json = """{
        "overall_headline": "Mild elevation in fasting blood glucose with otherwise normal markers",
        "overall_plain_summary": "Your lab report shows that most standard markers are within normal physiological bounds. Your fasting sugar is slightly above standard threshold.",
        "report_clarity_assessment": "clear",
        "unclear_report_warning": null,
        "explained_biomarkers": [
            {
                "source_fact": {
                    "test_name": "Fasting Blood Glucose",
                    "extracted_value": "108",
                    "unit": "mg/dL",
                    "reference_range": "70 - 99",
                    "is_reference_range_present": true
                },
                "ai_explanation": {
                    "simple_language_explanation": "This test measures the amount of sugar in your bloodstream after fasting overnight.",
                    "clinical_context": "Doctors monitor this to screen for early insulin sensitivity variations.",
                    "clarity_note": null,
                    "status_indicator": "out_of_range"
                }
            }
        ],
        "suggested_doctor_questions": [
            "What lifestyle steps can I take to optimize my fasting glucose?",
            "Should we recheck this in 3 months?"
        ],
        "disclaimer": "Educational information only. Consult your doctor."
    }"""
    validated = GeminiAnalysisResult.model_validate_json(synthetic_gemini_json)
    assert validated.report_clarity_assessment == "clear"
    assert len(validated.explained_biomarkers) == 1
    assert validated.explained_biomarkers[0].source_fact.test_name == "Fasting Blood Glucose"
    assert validated.explained_biomarkers[0].ai_explanation.status_indicator == "out_of_range"
    print("[PASS] Gemini JSON schema validation confirmed")

def test_full_api_analyze_with_gemini_integration():
    pdf_bytes = create_sample_pdf_bytes()
    response = client.post(
        "/api/reports/analyze",
        files={"file": ("synthetic_report.pdf", pdf_bytes, "application/pdf")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "gemini_analysis" in data
    assert data["gemini_analysis"] is not None
    assert "overall_headline" in data["gemini_analysis"]
    assert len(data["gemini_analysis"]["explained_biomarkers"]) >= 1
    print("[PASS] Full API endpoint /api/reports/analyze verified with Gemini integration")
    print(f"  AI Headline: '{data['gemini_analysis']['overall_headline']}'")
    print(f"  AI Engine Used: '{data['ai_engine_used']}' ({data['ai_status_message']})")

if __name__ == "__main__":
    test_heuristic_fallback_preserves_facts()
    test_gemini_schema_validation()
    test_full_api_analyze_with_gemini_integration()
    print("\nALL GEMINI INTEGRATION TESTS PASSED SUCCESSFULLY!")
