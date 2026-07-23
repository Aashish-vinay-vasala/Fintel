# Fintel — AI Banking Intelligence Platform

> Full-stack AI platform for financial institutions — fraud detection, credit underwriting, AML screening, regulatory compliance, risk stress testing, treasury management, customer intelligence, document AI, and automated report generation.

---

## What Is Fintel?

Fintel is an AI-powered banking operating system that brings together multiple intelligence modules under one platform. It replaces hours of manual analyst work with real-time AI decisions — scoring transactions for fraud in milliseconds, underwriting loan applications instantly, screening customers against AML/KYC watchlists, and drafting regulatory filings like SARs and CTRs in seconds.

Each module is powered by a LangGraph agent pipeline backed by Groq's LLaMA 3.3 70B model, with XGBoost ML models for fraud and credit scoring.

<img width="1916" height="903" alt="Screenshot 2026-07-23 014204" src="https://github.com/user-attachments/assets/07744648-f041-4d81-90dd-ce4f18efbddc" />
<img width="1917" height="902" alt="Screenshot 2026-07-23 014243" src="https://github.com/user-attachments/assets/453c1aee-155e-4b1e-b947-ca9985c25de3" />
<img width="1916" height="907" alt="Screenshot 2026-07-23 014254" src="https://github.com/user-attachments/assets/aa6d43d7-6a1b-4ff5-afc6-8c7a52c2a5ad" />
<img width="1917" height="913" alt="Screenshot 2026-07-23 014306" src="https://github.com/user-attachments/assets/cbcef011-21e7-4aed-bf62-78538535d4d8" />

---

## Live Deployment

| Service | URL |
|---------|-----|
| **Frontend** | https://fintel-503001.web.app |
| **API Gateway** | https://api-gateway-270336468447.us-central1.run.app |
| **AI Services** | https://ai-services-270336468447.us-central1.run.app |

---

## Modules

| Module | What It Does |
|--------|-------------|
| **Fraud Intel** | Real-time transaction risk scoring. Inputs: amount, hour, frequency, distance, origin. Outputs: fraud score 0–100, APPROVE/REVIEW/BLOCK decision, behavioral explanation |
| **Credit Desk** | AI loan underwriting (XGBoost + LangGraph) — approval decision, rate, max loan, risk factors. DSCR calculator for commercial real estate — debt service coverage, LTV, debt yield, approval recommendation |
| **Risk Console** | Portfolio stress testing across 4 scenarios (mild recession, severe recession, rate shock, cyber attack). Computes NPA ratio, Tier 1 capital, liquidity, LTD ratio |
| **Loan Monitor** | Real-time portfolio health analysis. Enter portfolio metrics + individual loans. Returns health score, early warning indicators, per-loan MONITOR/WATCH/RESTRUCTURE decisions |
| **Treasury Desk** | Interest Rate Risk — NIM stress scenarios (+100/+200/+300/-100/-200 bps), duration gap, EaR. Liquidity Coverage Ratio (LCR) calculator — HQLA breakdown, 30-day net outflows, compliance status |
| **Compliance Hub** | RAG-based regulatory Q&A (BSA, AML, KYC, OFAC, GLBA, FCRA, TILA, CRA). Transaction compliance screening. Regulatory tracker — active regulations, deadlines, impact assessment |
| **AML Intel** | NLP transaction narrative analysis — entity extraction, AML typology detection (structuring, layering, smurfing, round-tripping). Customer screening against OFAC/PEP/sanctions |
| **Customer Intel** | Customer 360 profiling — KYC status, behavioral flags, lifetime value, EDD recommendations. Transaction network graph — node/edge mapping, circular flow detection, shell company links |
| **Risk Assets** | Chargeback Intelligence — dispute classification, win probability, required evidence, Visa/MC reason codes. Collateral Management — haircut analysis, coverage ratio, margin call risk |
| **Benchmarking** | Peer comparison against FDIC call report data — NIM, ROA, ROE, efficiency ratio, NPL, Tier 1 capital vs. peer median and top quartile |
| **Model Audit** | AI model governance — validation status, performance drift, back-testing results |
| **Report Studio** | AI-generated banking reports: SAR, CTR, Risk Assessment, Credit Portfolio Summary, Compliance Audit, Board Executive Summary |
| **Doc AI** | Upload PDF/DOCX/TXT → instant AI summary + conversational Q&A on document content |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite 8 |
| **Styling** | Glassmorphism — `backdrop-filter` blur/saturate, 3D sphere blob backgrounds, CSS variables |
| **Fonts** | Manrope (display/numbers) · DM Sans (body) · JetBrains Mono (data) |
| **Routing** | React Router v7 |
| **Charts** | Recharts + Canvas sparklines |
| **Icons** | Lucide React |
| **Mock Data** | `src/data/mockBank.js` — realistic $4.2B community bank data pre-loaded on every page |
| **Frontend Deploy** | Firebase Hosting |
| **API Gateway** | Node.js + Express |
| **Gateway Deploy** | Google Cloud Run |
| **AI Services** | Python + FastAPI + Uvicorn |
| **LLM** | Groq — llama-3.3-70b-versatile |
| **Agent Orchestration** | LangGraph (multi-step agent pipelines) |
| **ML Models** | XGBoost + scikit-learn (fraud scoring, credit scoring) |
| **Vector DB** | ChromaDB (document embeddings for Doc AI) |
| **PDF Parsing** | pdfplumber + python-docx |
| **AI Deploy** | Google Cloud Run |

---

## Project Structure

```
ai-banking-platform/
│
├── frontend/                          # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx                    # Router + auth guard (PrivateRoute)
│   │   ├── index.css                  # Design tokens, glassmorphism, blob backgrounds
│   │   ├── data/
│   │   │   └── mockBank.js            # Pre-built mock data for all 13 modules
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # KPI overview, live alerts, sparklines
│   │   │   ├── Fraud.jsx              # Transaction risk scoring
│   │   │   ├── CreditSuite.jsx        # Credit underwriting + DSCR (tabbed)
│   │   │   ├── Risk.jsx               # Portfolio stress testing
│   │   │   ├── LoanMonitor.jsx        # Loan portfolio health + EWI
│   │   │   ├── Treasury.jsx           # IRR + LCR (tabbed)
│   │   │   ├── ComplianceHub.jsx      # Q&A + transaction check + reg tracker (tabbed)
│   │   │   ├── AML.jsx                # Narrative NLP + customer screening
│   │   │   ├── CustomerIntel.jsx      # Customer 360 + network graph (tabbed)
│   │   │   ├── RiskAssets.jsx         # Chargeback + collateral (tabbed)
│   │   │   ├── Benchmarking.jsx       # Peer benchmarking
│   │   │   ├── ModelRisk.jsx          # Model governance
│   │   │   ├── Reports.jsx            # Report Studio (SAR, CTR, etc.)
│   │   │   ├── Documents.jsx          # Doc upload + AI Q&A
│   │   │   ├── Login.jsx              # Auth (localStorage)
│   │   │   └── Settings.jsx           # Profile, preferences
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx        # Grouped nav with section labels
│   │   │   │   └── Topbar.jsx         # Glass header, live clock, system status
│   │   │   └── ui/
│   │   │       ├── PageLayout.jsx     # Wraps Topbar + page content
│   │   │       └── TabBar.jsx         # Shared tab component used by all multi-tab pages
│   │   └── services/
│   │       └── api.js                 # All API calls — maps frontend → backend fields
│   └── Dockerfile
│
├── backend/
│   ├── api-gateway/                   # Express proxy — routes frontend → AI services
│   │   ├── src/
│   │   │   ├── index.js               # Route registration + health check
│   │   │   └── routes/
│   │   │       ├── fraud.js
│   │   │       ├── credit.js
│   │   │       ├── compliance.js
│   │   │       ├── risk.js
│   │   │       ├── docs.js
│   │   │       ├── reports.js
│   │   │       ├── aml.js
│   │   │       └── loans.js
│   │   └── Dockerfile
│   │
│   └── ai-services/                   # FastAPI — all AI logic
│       ├── run.py                     # Unified entry point (all routes, port 8080)
│       ├── shared/
│       │   └── llm.py                 # get_llm() → Groq ChatGroq instance
│       ├── fraud/
│       │   ├── agent.py               # LangGraph: score_transaction → explain_decision
│       │   ├── model.py               # XGBoost model loader
│       │   └── main.py
│       ├── credit/
│       │   ├── agent.py               # LangGraph: score → limit → explain
│       │   ├── model.py
│       │   └── main.py
│       ├── compliance/
│       │   ├── rag_chain.py           # RAG compliance checker
│       │   └── main.py
│       ├── risk/
│       │   ├── agent.py               # LangGraph: analyze → stress → recommend
│       │   ├── model.py               # Ratio calculators, stress test functions
│       │   └── main.py
│       ├── docs/
│       │   └── main.py                # PDF/DOCX extract, ChromaDB, RAG Q&A
│       ├── requirements.txt
│       └── Dockerfile
│
└── README.md
```

---

## API Reference

### Gateway base URL
```
http://localhost:3001/api   # or your deployed gateway URL
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/fraud/analyze` | Score a transaction for fraud |
| `POST` | `/fraud/batch` | Batch-score multiple transactions |
| `POST` | `/credit/evaluate` | Evaluate a loan application |
| `POST` | `/credit/dscr` | Calculate DSCR for commercial real estate |
| `POST` | `/compliance/query` | Ask a regulatory question (RAG) |
| `POST` | `/compliance/check-transaction` | Screen transaction for compliance |
| `POST` | `/compliance/regulatory` | Track active regulations and deadlines |
| `POST` | `/risk/analyze` | Run portfolio stress test |
| `POST` | `/risk/interest-rate` | IRR analysis — NIM scenarios, duration gap |
| `POST` | `/risk/lcr` | Liquidity Coverage Ratio calculation |
| `POST` | `/aml/narrative` | NLP analysis of transaction narrative |
| `POST` | `/aml/screen` | Screen customer against watchlists |
| `POST` | `/loans/monitor` | Portfolio health + early warning indicators |
| `POST` | `/loans/customer-profile` | Customer 360 risk profile |
| `POST` | `/loans/network` | Transaction network graph analysis |
| `POST` | `/loans/chargeback` | Chargeback dispute classification |
| `POST` | `/loans/collateral` | Collateral coverage analysis |
| `POST` | `/loans/benchmark` | Peer benchmarking vs. FDIC call report data |
| `POST` | `/reports/generate` | Generate SAR, CTR, Risk, Board report |
| `POST` | `/docs/upload` | Upload document (multipart) |
| `POST` | `/docs/ask` | Q&A on uploaded document |
| `GET`  | `/health` | Gateway + AI service health check |

---

## Local Setup

### Prerequisites
- Node.js 20+, Python 3.11+
- [Groq API key](https://console.groq.com) (free)

### 1 — AI Services
```bash
cd backend/ai-services

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

echo "GROQ_API_KEY=your_key_here" > .env

python run.py                   # → http://localhost:8080
```

### 2 — API Gateway
```bash
cd backend/api-gateway
npm install
npm run dev                     # → http://localhost:3001
```

### 3 — Frontend
```bash
cd frontend
npm install

echo "VITE_API_URL=http://localhost:3001/api" > .env.local

npm run dev                     # → http://localhost:5173
```

---

## Deployment (Google Cloud Run + Firebase Hosting)

```bash
# AI Services → Cloud Run
gcloud run deploy ai-services --source backend/ai-services --project fintel-503001 --region us-central1 \
  --allow-unauthenticated --memory 1Gi --timeout 300 \
  --set-secrets=GROQ_API_KEY=GROQ_API_KEY:latest

# API Gateway → Cloud Run (wired to the ai-services URL above)
gcloud run deploy api-gateway --source backend/api-gateway --project fintel-503001 --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars=AI_URL=https://ai-services-270336468447.us-central1.run.app \
  --set-secrets=SUPABASE_URL=SUPABASE_URL:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest

# Frontend → Firebase Hosting (wired to the api-gateway URL above via frontend/.env.production.local)
cd frontend
npm run build
firebase deploy --only hosting --project fintel-503001
```

Secrets (`GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) live in Google Secret Manager, not plain env vars.

---

## Auth

Currently uses `localStorage` for session persistence (any email + password works). Firebase Authentication is the planned replacement.

---

## Known Limitations

- **Doc AI on Cloud Run** — `doc_cache` is in-memory. After a cold start, re-upload is needed.
- **Cold starts** — First request after inactivity may take 10–20s on Cloud Run.
- **Scanned PDFs** — Requires a searchable PDF. Use [ilovepdf.com](https://ilovepdf.com) to OCR first.

---

## Roadmap

- [ ] Firebase Authentication (replace localStorage)
- [ ] Persistent document storage (Cloud Storage + Firestore)
- [ ] Streaming LLM responses
- [ ] Real transaction data connectors (Plaid, open banking)
- [ ] Role-based access control (analyst / manager / admin)
- [ ] Mobile app

---

Built with FastAPI · React · LLaMA 3.3 70B · LangGraph · XGBoost · ChromaDB · Google Cloud
