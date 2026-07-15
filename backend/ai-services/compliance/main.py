from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from compliance.rag_chain import check_compliance, check_transaction_compliance

app = FastAPI(title="Compliance RAG Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ComplianceQuery(BaseModel):
    question: str

class TransactionCheck(BaseModel):
    amount: float
    type: str = "digital"
    is_foreign: bool = False
    customer_id: Optional[str] = None

@app.get("/health")
def health():
    return {"status": "ok", "service": "compliance-rag"}

@app.post("/query")
def query_compliance(body: ComplianceQuery):
    return check_compliance(body.question)

@app.post("/check-transaction")
def check_transaction(txn: TransactionCheck):
    return check_transaction_compliance(txn.dict())