from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "ReportSaathi" in data["message"]
    print("ROOT TEST PASSED:", data)

def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "ReportSaathi API"
    print("HEALTH TEST PASSED:", data)

if __name__ == "__main__":
    test_root()
    test_health()
    print("ALL API TESTS COMPLETED SUCCESSFULLY!")
