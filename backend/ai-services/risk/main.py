from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from risk.agent import run_risk_analysis

app = FastAPI(title="Risk Management Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class PortfolioInput(BaseModel):
    total_assets: float
    loan_portfolio: float
    npa_amount: float
    tier1_capital: float
    total_capital: float
    cash_reserves: float
    investment_securities: float
    deposits: float

@app.get("/health")
def health():
    return {"status": "ok", "service": "risk-management"}

@app.post("/analyze")
def analyze(portfolio: PortfolioInput):
    return run_risk_analysis(portfolio.dict())