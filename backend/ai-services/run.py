import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

def get_llm():
    return ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",
        temperature=0.1
    )

app = FastAPI(title="VaultIQ AI Services")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/fraud/analyze")
async def fraud_analyze(request: dict):
    from fraud.agent import run_fraud_check
    return run_fraud_check(request)

@app.post("/credit/evaluate")
async def credit_evaluate(request: dict):
    from credit.agent import run_credit_check
    return run_credit_check(request)

@app.post("/compliance/query")
async def compliance_query(request: dict):
    from langchain_groq import ChatGroq
    from langchain_core.messages import HumanMessage
    llm = ChatGroq(api_key=os.getenv("GROQ_API_KEY"), model="llama-3.3-70b-versatile", temperature=0.1)
    # The gateway already builds a complete, ready-to-send prompt (compliance-officer
    # framing + output format) before it gets here — wrapping it again causes the LLM
    # to satisfy two conflicting instruction sets and emit JSON followed by loose prose.
    question = request["question"]
    response = llm.invoke([HumanMessage(content=question)])
    not_found = "outside" in response.content.lower() and "knowledge" in response.content.lower()
    return {
        "question": question,
        "answer": response.content,
        "status": "not_found" if not_found else "requires_action" if "must" in response.content.lower() else "compliant"
    }

@app.post("/compliance/check-transaction")
async def compliance_txn(request: dict):
    from compliance.rag_chain import check_transaction_compliance
    return check_transaction_compliance(request)

@app.post("/risk/analyze")
async def risk_analyze(request: dict):
    from risk.agent import run_risk_analysis
    return run_risk_analysis(request)

@app.post("/docs-ai/upload")
async def docs_upload(file: UploadFile = File(...)):
    from docs.main import extract_text, get_summary, build_doc_vectorstore, doc_cache
    import uuid
    file_bytes = await file.read()
    text = extract_text(file_bytes, file.filename)
    if not text.strip():
        return {"error": "Could not extract text from document."}
    doc_id = str(uuid.uuid4())
    doc_cache[doc_id] = text
    build_doc_vectorstore(text, doc_id)
    result = get_summary(text)
    return {
        "doc_id": doc_id,
        "filename": file.filename,
        "char_count": len(text),
        "summary": result["summary"]
    }

@app.post("/docs-ai/ask")
async def docs_ask(doc_id: str = Form(...), question: str = Form(...)):
    from docs.main import answer_question, doc_cache
    if doc_id not in doc_cache:
        return {"error": "Document not found. Please upload again."}
    text = doc_cache[doc_id]
    answer = answer_question(doc_id, question, text)
    return {"doc_id": doc_id, "question": question, "answer": answer}

@app.post("/reports/generate")
async def reports_generate(request: dict):
    import datetime, re
    report_type = request.get("report_type", "")
    context = request.get("context", {})
    labels = {
        "sar": "Suspicious Activity Report (SAR) — FinCEN Filing",
        "ctr": "Currency Transaction Report (CTR) — FinCEN Filing",
        "risk_assessment": "Portfolio Risk Assessment Report",
        "credit_portfolio": "Credit Portfolio Summary Report",
        "compliance_audit": "Compliance Audit Report",
        "board_summary": "Board Executive Summary",
    }
    label = labels.get(report_type, report_type.upper())
    ctx_str = "\n".join([f"- {k.replace('_', ' ').title()}: {v}" for k, v in context.items() if v])
    prompt = f"""You are a senior banking analyst and compliance officer. Generate a complete, professional {label}.

Parameters provided:
{ctx_str}

Write the full report with clearly labeled sections:
1. Executive Summary
2. Key Details / Findings
3. Risk Assessment / Analysis
4. Required Actions / Recommendations
5. Regulatory References (where applicable)

Use formal banking language. Be specific and data-driven."""
    llm = get_llm()
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"report_type": report_type, "label": label, "content": response.content,
            "generated_at": datetime.datetime.utcnow().isoformat()}


@app.post("/aml/analyze-narrative")
async def aml_analyze_narrative(request: dict):
    import json, re
    narrative = request.get("narrative", "")
    prompt = f"""You are an AML specialist AI. Analyze this transaction narrative for suspicious activity:

NARRATIVE: {narrative}

Return a JSON object with exactly these fields:
- risk_level: "HIGH", "MEDIUM", or "LOW"
- risk_score: integer 0-100
- entities: array of objects with "type" (PERSON/AMOUNT/LOCATION/DATE/ORGANIZATION) and "value"
- red_flags: array of specific suspicious indicators found in the text
- patterns: array of AML typologies detected (structuring, layering, smurfing, trade-based ML, etc.)
- recommendation: string — recommended action with reasoning

Return ONLY valid JSON, no extra text."""
    llm = get_llm()
    response = llm.invoke([HumanMessage(content=prompt)])
    try:
        m = re.search(r'\{.*\}', response.content, re.DOTALL)
        return json.loads(m.group()) if m else {"risk_level": "MEDIUM", "risk_score": 50, "entities": [], "red_flags": [], "patterns": [], "recommendation": response.content}
    except Exception:
        return {"risk_level": "MEDIUM", "risk_score": 50, "entities": [], "red_flags": [], "patterns": [], "recommendation": response.content}


@app.post("/aml/screen-customer")
async def aml_screen_customer(request: dict):
    import json, re
    prompt = f"""You are a KYC/AML compliance officer AI. Screen this customer:

Name: {request.get('name', '')}
DOB: {request.get('dob', '')}
Country: {request.get('country', '')}
Occupation: {request.get('occupation', '')}
Account Age: {request.get('account_age_months', '')} months

Return a JSON object with exactly these fields:
- risk_level: "HIGH", "MEDIUM", or "LOW"
- checks: array of objects with "name" and "passed" (boolean) for: OFAC Sanctions List, PEP Screening, Adverse Media, High-Risk Country, Occupation Risk, Account Behavior
- risk_factors: array of specific risk factors identified
- recommendation: string with required due diligence actions

Return ONLY valid JSON, no extra text."""
    llm = get_llm()
    response = llm.invoke([HumanMessage(content=prompt)])
    try:
        m = re.search(r'\{.*\}', response.content, re.DOTALL)
        return json.loads(m.group()) if m else {"risk_level": "LOW", "checks": [], "risk_factors": [], "recommendation": response.content}
    except Exception:
        return {"risk_level": "LOW", "checks": [], "risk_factors": [], "recommendation": response.content}


@app.post("/loans/monitor")
async def loans_monitor(request: dict):
    import json, re
    portfolio = request.get("portfolio", {})
    loans = request.get("loans", [])
    port_str = "\n".join([f"- {k.replace('_',' ').title()}: {v}" for k, v in portfolio.items() if v]) or "Not provided"
    loans_str = "\n".join([f"  * {l.get('borrower')}: {l.get('loan_type')}, ${l.get('outstanding','0')}K outstanding, {l.get('days_past_due',0)} DPD, collateral ${l.get('collateral_value','0')}K" for l in loans if l.get('borrower')]) or "None"
    prompt = f"""You are a credit risk officer AI. Analyze this loan portfolio:

PORTFOLIO METRICS:
{port_str}

WATCH LIST LOANS:
{loans_str}

Return a JSON object with exactly these fields:
- health_score: integer 0-100
- rating: "EXCELLENT", "GOOD", "FAIR", "POOR", or "CRITICAL"
- ewi_count: integer count of early warning indicators
- early_warnings: array of objects with "indicator" (string) and "severity" ("HIGH" or "MEDIUM")
- loan_analysis: array per loan with "borrower", "action" (MONITOR/WATCH/RESTRUCTURE/WRITE-OFF), "note"
- recommendations: array of 4-5 actionable strings
- summary: 2-3 sentence portfolio assessment

Return ONLY valid JSON, no extra text."""
    llm = get_llm()
    response = llm.invoke([HumanMessage(content=prompt)])
    try:
        m = re.search(r'\{.*\}', response.content, re.DOTALL)
        return json.loads(m.group()) if m else {"health_score": 70, "rating": "FAIR", "ewi_count": 0, "early_warnings": [], "loan_analysis": [], "recommendations": [], "summary": response.content}
    except Exception:
        return {"health_score": 70, "rating": "FAIR", "ewi_count": 0, "early_warnings": [], "loan_analysis": [], "recommendations": [], "summary": response.content}


@app.post("/copilot/chat")
async def copilot_chat(request: dict):
    from copilot.agent import run_copilot_chat
    return run_copilot_chat(request)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("run:app", host="0.0.0.0", port=8080, reload=True)