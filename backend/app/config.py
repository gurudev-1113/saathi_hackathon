import os
import shutil
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_DIR = os.path.dirname(BACKEND_DIR)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[
            os.path.join(BACKEND_DIR, ".env"),
            os.path.join(ROOT_DIR, ".env"),
            ".env",
        ],
        env_file_encoding="utf-8",
        extra="ignore",
    )
    PROJECT_NAME: str = "ReportSaathi API"
    VERSION: str = "0.2.0"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS: List[str] = [".pdf", ".jpg", ".jpeg", ".png"]
    ALLOWED_MIME_TYPES: List[str] = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/octet-stream",  # Fallback MIME for some browsers
    ]

    # Tesseract configuration
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    def get_tesseract_path(self) -> str | None:
        """Returns the valid path to tesseract if available, else None."""
        # 1. Check custom configured path
        if self.TESSERACT_CMD and os.path.isfile(self.TESSERACT_CMD):
            return self.TESSERACT_CMD
        # 2. Check system PATH
        which_path = shutil.which("tesseract")
        if which_path:
            return which_path
        # 3. Check common Windows standard directories
        common_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
        ]
        for p in common_paths:
            if os.path.isfile(p):
                return p
        return None

settings = Settings()
