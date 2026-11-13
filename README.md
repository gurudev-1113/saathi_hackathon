# ReportSaathi 🩺
> **Empowering patients with simple, safe, educational explanations of medical laboratory reports.**

ReportSaathi is an open health-literacy web application that converts complex medical lab reports into clear, 8th-grade plain language. It bridges the communication gap between diagnostic data and patient comprehension using Google Gemini AI, structured Pydantic data modeling, and Supabase Row-Level Security (RLS).

---

## ⚠️ Medical Safety & Educational Disclaimer
> **IMPORTANT: FOR EDUCATIONAL PURPOSES ONLY**  
> ReportSaathi is strictly an educational tool designed to foster informed discussions with licensed healthcare professionals.  
> - It does **NOT** provide clinical diagnoses, triage, or prognoses.  
> - It does **NOT** recommend or prescribe medications, treatments, or dosage adjustments.  
> - It never extrapolates, predicts, or fabricates missing biomarker values or reference ranges.  
> - If you are experiencing a medical emergency, seek urgent medical attention immediately.

---

## 🏛️ System Architecture

```
                       +---------------------------------------+
                       |   React 18 + Vite + Tailwind CSS UI   |
                       | (Auth Gate, Drag & Drop, Grounded Chat)|
                       +---------------------------------------+
                                           |
                                [REST API / JSON Payload]
                                           v
                       +---------------------------------------+
                       |        FastAPI Backend Service        |
                       |    (/api/reports/analyze, /chat)      |
                       +---------------------------------------+
                               /                       \
        [Digital PDF or OCR Text]                [Grounding Context]
                             v                           v
     +----------------------------------+   +----------------------------------+
     | Extraction & Ingestion Engine    |   | Gemini Intelligence Pipeline     |
     | - pdfplumber (Digital text)      |   | - Multi-model fallback list      |
     | - pypdfium2 + pytesseract (OCR)  |   | - Pydantic JSON schema mode      |
     | - Zero-fabrication regex parser  |   | - Report-grounded QA safety      |
     +----------------------------------+   +----------------------------------+
                             \                           /
                              +-------------------------+
                                           |
                               [Structured Summary JSON]
                                           v
                       +---------------------------------------+
                       |          Supabase PostgreSQL          |
                       | - Row-Level Security (RLS)            |
                       | - Only structured summaries saved     |
                       | - Raw files/scans are NEVER stored    |
                       +---------------------------------------+
```

---

## 🚀 Key Features

1. **Multi-Format Ingestion**: Accepts text-searchable PDFs, scanned image PDFs, JPGs, and PNGs with safe streaming temporary-file handling up to 10 MB.
2. **Decoupled Source Facts vs. AI Explanations**: Raw numbers extracted directly from the report are visually distinguished from AI-generated plain-language explanations.
3. **Multi-Model Fallback & Resilience**: Dynamically handles Google AI traffic spikes by rotating between `gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-3.7-flash`, and `gemini-3.8-flash`, backed by a rule-based heuristic parser.
4. **Report-Grounded Educational Chat**: An interactive chat toolbar answering patient questions **only** from the selected report's extracted contents. Rejects ungrounded medical inquiries and prescription requests.
5. **Supabase Row-Level Security**: Structured report history is isolated to the authenticated user via Postgres RLS policies. The user retains complete control to delete any saved report.
6. **Graceful Demo Fallback**: When Supabase credentials or internet access are unavailable, the application operates locally without crashing or pretending cloud data was saved.

---

## 💻 Local Setup & Installation

### Prerequisites
- **Python**: Version 3.10+ (tested on Python 3.14)
- **Node.js**: Version 18+ (tested on Node.js 20+)
- **Git**
- *(Optional)* **Tesseract OCR**: Recommended for image OCR on Windows/Linux.

---

### Step 1: Clone Repository
```powershell
git clone https://github.com/gurudev-1113/saathi_hackathon.git
cd saathi_hackathon
```

---

### Step 2: Backend Configuration & Startup

1. Open a terminal in the `backend/` directory:
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1   # On Linux/macOS: source venv/bin/activate
   pip install -r requirements.txt
   ```

2. Create your environment configuration file:
   ```powershell
   cp .env.example .env
   ```

3. Populate the required environment variables in `backend/.env`:
   ```env
   PORT=8000
   ENVIRONMENT=development
   CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]
   
   # Google Gemini API Key from Google AI Studio
   GEMINI_API_KEY=your_gemini_api_key_here

   # Tesseract Executable (Optional)
   TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe

   # Supabase Credentials (Optional for cloud history)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_supabase_secret_key
   ```

4. Start the FastAPI backend server:
   ```powershell
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - Health Check: `http://localhost:8000/api/health`
   - Interactive Swagger API Documentation: `http://localhost:8000/docs`

---

### Step 3: Frontend Configuration & Startup

1. Open a second terminal in the `frontend/` directory:
   ```powershell
   cd frontend
   npm install
   ```

2. Create your environment configuration file:
   ```powershell
   cp .env.example .env
   ```

3. Configure `frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_publishable_anon_key
   ```

4. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   - Access the web application at: `http://localhost:5173`

---

## 🧪 Testing & Verification

### Running Backend Pytest Suite
ReportSaathi includes comprehensive automated unit and integration tests covering API input validation, PDF extraction, OCR handling, Pydantic schema validation, chat grounding, and prescription refusal guardrails.

```powershell
# From the repository root
$env:PYTHONPATH="backend"
.\backend\venv\Scripts\pytest.exe backend\tests -v
```

**Test Coverage Summary:**
- `test_health_endpoints`: Validates `/api/health` and `/api/v1/health` with dynamic status indicators.
- `test_unsupported_file_format`: Confirms HTTP 415 rejection for executables and unsupported media.
- `test_empty_or_oversized_validation`: Enforces 10 MB file size limit and non-empty payload checks.
- `test_corrupted_image_file`: Verifies resilient handling of corrupt image streams.
- `test_valid_pdf_extraction`: Tests digital PDF extraction without hallucinations.
- `test_heuristic_fallback_preserves_facts`: Asserts zero-fabrication fallback logic when offline.
- `test_gemini_schema_validation`: Validates strict Pydantic structure for biomarker analysis.
- `test_grounded_chat_query`: Verifies accurate answers from report facts.
- `test_ungrounded_chat_query`: Asserts polite refusal when question is outside the report context.
- `test_prescription_guardrail`: Asserts strict refusal to prescribe drugs or alter dosages.

### Verifying Frontend Production Build
```powershell
cd frontend
npm run build
```
Builds cleanly with zero errors to the `frontend/dist/` bundle.

---

## 🗄️ Database Setup (Supabase & RLS)

To enable cloud report saving with patient privacy:
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste and execute the contents of `backend/supabase_schema.sql`.
4. This creates:
   - `profiles`: Linked to `auth.users` via cascading deletion.
   - `report_history`: Storing structured summaries only.
   - Row-Level Security (RLS) policies ensuring users can select, insert, and delete **only their own** reports (`auth.uid() = user_id`).
   - Trigger `on_auth_user_created` to auto-initialize profile rows upon registration.

---

## 🌐 Production Deployment Guide

### A. Deploy Frontend on Cloudflare Pages

1. Log into your [Cloudflare Dashboard](https://dash.cloudflare.com) and navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your repository `gurudev-1113/saathi_hackathon`.
3. Configure build settings:
   - **Framework preset**: `Vite`
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Add Environment Variables under **Settings > Environment variables**:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com` (your deployed Render API URL)
   - `VITE_SUPABASE_URL`: `https://aaouzzduyckrgesyioci.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_...`
5. Click **Save and Deploy**.

---

### B. Deploy Backend on Render

1. Log into [Render](https://render.com) and click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. Configure the web service:
   - **Name**: `reportsaathi-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set Environment Variables in Render:
   - `GEMINI_API_KEY`: *(Your Google AI Studio API key)*
   - `CORS_ORIGINS`: `["https://your-app.pages.dev", "http://localhost:5173"]`
   - `SUPABASE_URL`: `https://aaouzzduyckrgesyioci.supabase.co`
   - `SUPABASE_KEY`: *(Your Supabase secret key)*
   - `ENVIRONMENT`: `production`
5. Health Check Path: `/api/health`
6. Click **Create Web Service**.

> **Note on Deployment Status:**  
> Deployment configurations, health routes, and build commands are fully prepared and tested locally. Live public deployment requires authenticating with your personal Cloudflare and Render dashboards to initiate the build webhooks.

---

## 🔍 Troubleshooting Guide

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **OCR Fails on Scanned Images** | Tesseract binary not installed on host machine. | Install Tesseract OCR from [UB-Mannheim](https://github.com/UB-Mannheim/tesseract/wiki) or upload a text-searchable digital PDF. The backend gracefully reports when OCR binary is missing. |
| **Gemini 503 Service Unavailable** | Google AI transient demand spike. | Built-in fallback iterates automatically through `gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-3.7-flash`, and `gemini-3.8-flash`. If all models are exhausted, the deterministic heuristic extractor activates. |
| **CORS Error in Browser** | Backend `CORS_ORIGINS` does not match the frontend origin. | Add your frontend port/domain to `CORS_ORIGINS` in `backend/.env` or Render environment settings. |
| **Supabase RLS Permission Denied** | User not authenticated or trying to write to another user's ID. | Ensure user is signed in with a valid UUID. The frontend includes a client check (`isValidUUID`) that falls back to local storage for guests and demo accounts. |

---

## 📋 QA Checklist & Current Limitations

### Completed QA Verifications
- [x] **File Upload Validation**: Enforces PDF, JPG, PNG types; rejects executables, scripts, and files exceeding 10 MB.
- [x] **OCR & Scanned PDF Resilience**: Graceful error handling and diagnostic messaging when text streams are absent.
- [x] **Gemini API Error Resilience**: Multi-model failover and rule-based heuristic extraction ensure zero crashed requests.
- [x] **Privacy by Design**: Raw uploaded medical scans and documents are never persisted to disk or cloud databases.
- [x] **Strict Clinical Guardrails**: Refuses clinical diagnoses, emergency recommendations, and drug prescriptions in both analysis and chat.
- [x] **Row-Level Security**: Enforced in PostgreSQL schema preventing cross-user data exposure.
- [x] **Mobile Responsiveness**: Adaptive layouts for mobile, tablet, and desktop viewports.

### Known Limitations
1. **Scanned PDF OCR Dependency**: Processing scanned photographs without native text streams requires the host environment to have Tesseract OCR installed.
2. **Tabular Variance Across Labs**: Highly unconventional or handwritten lab report formats may require manual inspection via the built-in "Raw Extracted Text" inspector.

---

## 📄 License
This project is licensed under the MIT License for educational and research use.
