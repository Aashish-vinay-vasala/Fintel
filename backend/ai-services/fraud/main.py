from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fraud.agent import run_fraud_check

app = FastAPI(title="Fraud Detection Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Transaction(BaseModel):
    amount: float
    hour: int
    frequency_24h: int
    avg_amount_7d: float
    distance_from_home: float
    is_foreign: int
    same_city: int

@app.get("/health")
def health():
    return {"status": "ok", "service": "fraud-detection"}

@app.post("/analyze")
def analyze(transaction: Transaction):
    result = run_fraud_check(transaction.dict())
    return result

@app.post("/batch")
def batch_analyze(transactions: list[Transaction]):
    results = [run_fraud_check(t.dict()) for t in transactions]
    return {"results": results, "total": len(results)}