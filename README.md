# ReportSaathi 🩺

> **Empowering patients with simple, educational explanations of medical laboratory reports.**

ReportSaathi is an open, educational web application designed to bridge the health literacy gap. It converts complex medical terminology, multi-column lab values, and reference ranges into clear, patient-friendly explanations without compromising medical nuance.

---

## ⚠️ Important Medical Disclaimer
**ReportSaathi is strictly for educational and informational purposes.** It does **not** provide clinical diagnoses, medical advice, treatment recommendations, or prescriptions. Always consult a qualified physician or healthcare provider for interpretation of diagnostic test results.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React Icons
- **Backend:** Python 3.14, FastAPI, Pydantic v2, Uvicorn
- **Extraction Engine:** `pdfplumber` (Digital PDFs), `pytesseract` & Google Gemini Vision (scanned images & photos)
- **AI Intelligence:** Google Gemini API (structured JSON schema mode)
- **Database & Auth (Optional):** Supabase (PostgreSQL with Row Level Security)

---

## 📁 Repository Structure

```text
report-saathi/
├── backend/
│   ├── app/
│   │   ├── api/             # API routes & versioned endpoints
│   │   ├── core/            # Security, PII sanitization, prompt templates
│   │   ├── schemas/         # Pydantic schemas for biomarkers and reports
│   │   ├── services/        # PDF extraction, OCR, Gemini service, Supabase
│   │   ├── config.py        # Pydantic settings & environment configuration
│   │   └── main.py          # FastAPI application entrypoint
│   ├── requirements.txt     # Python dependencies
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (upload, report view, glossary)
│   │   ├── services/        # API client & Supabase connector
│   │   ├── App.jsx          # Root application shell
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## 🚀 Running Locally

### 1. Backend

```powershell
cd backend
# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
- API Health Check: `http://localhost:8000/api/v1/health`
- Interactive Swagger Docs: `http://localhost:8000/docs`

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🗺️ Implementation Phases
- [x] **Phase 1: Project Scaffolding & Core Architecture Setup** (FastAPI backend, Vite React frontend, Tailwind CSS, health monitoring)
- [ ] **Phase 2: Ingestion & Text/OCR Extraction Engine** (PDF parsing, OCR fallback, PII sanitization)
- [ ] **Phase 3: Gemini AI Explanation Service & Guardrails** (Structured JSON output, biomarker classification, medical safety prompts)
- [ ] **Phase 4: Frontend UI / UX & Interactive Report Dashboard** (Upload dropzone, biomarker status cards, doctor question checklist)
- [ ] **Phase 5: Supabase Auth & Saved Report History** (Optional user profiles, persistent past reports)
- [ ] **Phase 6: End-to-End Testing & Hardening**
