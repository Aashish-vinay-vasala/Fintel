from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from credit.agent import run_credit_check

app = FastAPI(title="Credit Scoring Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoanApplication(BaseModel):
    age: int
    income: float
    loan_amount: float
    credit_score: int
    employment_years: int
    existing_loans: int
    missed_payments: int
    debt_to_income: float

@app.get("/health")
def health():
    return {"status": "ok", "service": "credit-scoring"}

@app.post("/evaluate")
def evaluate(application: LoanApplication):
    return run_credit_check(application.dict())