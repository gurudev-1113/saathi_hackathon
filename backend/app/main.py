from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Educational Medical Laboratory Report Explainer API with text and OCR extraction",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Support both /api/v1 and /api routes
app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Welcome to ReportSaathi API - Medical Report Explainer",
        "docs_url": "/docs",
        "health_check": "/api/health",
        "analyze_endpoint": "/api/reports/analyze",
    }
