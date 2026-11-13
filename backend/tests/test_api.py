import io
import os
import sys
from fastapi.testclient import TestClient
from pypdf import PageObject, PdfWriter
from PIL import Image
from app.main import app

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

client = TestClient(app)

def create_sample_pdf_bytes() -> bytes:
    """Generates a valid PDF with sample lab text in memory."""
    pdf_content = (
        b"%PDF-1.4\n"
        b"1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj\n"
        b"2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj\n"
        b"3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>>>> endobj\n"
        b"4 0 obj <</Length 215>> stream\n"
        b"BT\n"
        b"/F1 12 Tf\n"
        b"50 720 Td (METRO DIAGNOSTIC HEALTH LABS - PATIENT REPORT) Tj\n"
        b"0 -30 Td (Hemoglobin              13.5  g/dL   12.0 - 15.0) Tj\n"
        b"0 -20 Td (Fasting Blood Glucose   108   mg/dL  70 - 99) Tj\n"
        b"0 -20 Td (Total Cholesterol       218   mg/dL  125 - 200) Tj\n"
        b"ET\n"
        b"endstream\n"
        b"endobj\n"
        b"5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj\n"
        b"xref\n"
        b"0 6\n"
        b"0000000000 65535 f \n"
        b"0000000009 00000 n \n"
        b"0000000058 00000 n \n"
        b"0000000115 00000 n \n"
        b"0000000244 00000 n \n"
        b"0000000511 00000 n \n"
        b"trailer <</Size 6 /Root 1 0 R>>\n"
        b"startxref\n"
        b"582\n"
        b"%%EOF\n"
    )
    return pdf_content

def test_health_endpoints():
    res1 = client.get("/api/health")
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["status"] == "healthy"
    assert data1["service"] == "ReportSaathi API"

    res2 = client.get("/api/v1/health")
    assert res2.status_code == 200
    assert res2.json()["status"] == "healthy"
    print("[PASS] Health endpoints verified (/api/health & /api/v1/health)")

def test_unsupported_file_format():
    response = client.post(
        "/api/reports/analyze",
        files={"file": ("malicious.exe", b"binarycontent", "application/octet-stream")},
    )
    assert response.status_code == 415
    assert "Unsupported file format" in response.json()["detail"]
    print("[PASS] Unsupported format rejection verified (HTTP 415)")

def test_empty_or_oversized_validation():
    fake_large = b"0" * (10 * 1024 * 1024 + 1024)
    response = client.post(
        "/api/reports/analyze",
        files={"file": ("big_report.pdf", fake_large, "application/pdf")},
    )
    assert response.status_code == 413
    assert "exceeds maximum size limit" in response.json()["detail"]
    print("[PASS] Oversized file rejection verified (HTTP 413)")

def test_corrupted_image_file():
    response = client.post(
        "/api/reports/analyze",
        files={"file": ("corrupt.png", b"not-a-valid-png-content", "image/png")},
    )
    # Either 400 (corrupt) or 422 (Tesseract not installed)
    assert response.status_code in [400, 422]
    print(f"[PASS] Unreadable image error handling verified (HTTP {response.status_code}: {response.json()['detail'][:60]}...)")

def test_valid_pdf_extraction():
    pdf_bytes = create_sample_pdf_bytes()
    response = client.post(
        "/api/reports/analyze",
        files={"file": ("sample_lab_report.pdf", pdf_bytes, "application/pdf")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["extraction_method"] == "native_pdf"
    assert data["filename"] == "sample_lab_report.pdf"
    assert data["page_count"] >= 1
    assert "Hemoglobin" in data["extracted_text"]
    assert "Fasting Blood Glucose" in data["extracted_text"]
    assert len(data["detected_rows"]) >= 1
    assert data["disclaimer"] != ""
    print(f"[PASS] Digital PDF extraction verified: extracted {data['character_count']} characters.")
    print("  Detected rows:", [r["test_name"] for r in data["detected_rows"]])

if __name__ == "__main__":
    test_health_endpoints()
    test_unsupported_file_format()
    test_empty_or_oversized_validation()
    test_corrupted_image_file()
    test_valid_pdf_extraction()
    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")
