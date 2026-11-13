from fastapi import APIRouter
from app.config import settings
from app.schemas.report import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health_check():
    tesseract_path = settings.get_tesseract_path()
    return HealthResponse(
        status="healthy",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        gemini_configured=bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip()),
        tesseract_available=bool(tesseract_path),
        tesseract_path=tesseract_path,
        supported_extensions=settings.ALLOWED_EXTENSIONS,
        max_file_size_mb=settings.MAX_FILE_SIZE_BYTES // (1024 * 1024),
    )
