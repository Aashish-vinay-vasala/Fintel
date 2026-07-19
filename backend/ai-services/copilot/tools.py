import json
import re
from typing import Dict, List

from langchain_core.messages import HumanMessage
from langchain_core.tools import tool
from pydantic import BaseModel, Field

from shared.llm import get_llm
from fraud.agent import run_fraud_check
from credit.agent import run_credit_check
from risk.agent import run_risk_analysis
from compliance.rag_chain import check_transaction_compliance


def _extract_json(text, fallback):
    m = re.search(r'\{[\s\S]*\}', text)
    if not m:
        return fallback
    try:
        return json.loads(m.group())
    except Exception:
        return fallback


# ─── Fraud ───────────────────────────────────────────────────────────────
class FraudCheckArgs(BaseModel):
    amount: float = Field(description="Transaction amount")
    hour: int = Field(description="Hour of day the transaction occurred, 0-23")
    frequency_24h: int = Field(description="Number of transactions by this customer in the last 24 hours")
    avg_amount_7d: float = Field(description="Average transaction amount for this customer over the last 7 days")
    distance_from_home: float = Field(description="Distance in km from the customer's home/usual location")
    is_foreign: bool = Field(description="Whether this is a foreign transaction")
    same_city: bool = Field(description="Whether the transaction is in the customer's usual city")


@tool("fraud_check", args_schema=FraudCheckArgs)
def fraud_check(amount, hour, frequency_24h, avg_amount_7d, distance_from_home, is_foreign, same_city):
    """Run real-time fraud scoring on a single transaction."""
    return run_fraud_check({
        "amount": amount, "hour": hour, "frequency_24h": frequency_24h,
        "avg_amount_7d": avg_amount_7d, "distance_from_home": distance_from_home,
        "is_foreign": is_foreign, "same_city": same_city,
    })


# ─── Credit ──────────────────────────────────────────────────────────────
class CreditEvaluateArgs(BaseModel):
    age: int = Field(description="Applicant's age")
    income: float = Field(description="Applicant's annual income")
    loan_amount: float = Field(description="Requested loan amount")
    credit_score: int = Field(description="Applicant's credit score, 300-850")
    employment_years: float = Field(description="Years of continuous employment")
    existing_loans: int = Field(description="Number of existing loans the applicant has")
    missed_payments: int = Field(description="Number of missed payments in the last year")
    debt_to_income: float = Field(description="Debt-to-income ratio, e.g. 0.35 for 35%")


@tool("credit_evaluate", args_schema=CreditEvaluateArgs)
def credit_evaluate(age, income, loan_amount, credit_score, employment_years, existing_loans, missed_payments, debt_to_income):
    """Evaluate a credit/loan application and return an approval decision, suggested limit, and explanation."""
    return run_credit_check({
        "age": age, "income": income, "loan_amount": loan_amount, "credit_score": credit_score,
        "employment_years": employment_years, "existing_loans": existing_loans,
        "missed_payments": missed_payments, "debt_to_income": debt_to_income,
    })


# ─── Risk ────────────────────────────────────────────────────────────────
class RiskAnalyzeArgs(BaseModel):
    total_assets: float = Field(description="Total bank assets")
    loan_portfolio: float = Field(description="Total loan portfolio value")
    npa_amount: float = Field(description="Non-performing asset amount")
    tier1_capital: float = Field(description="Tier 1 capital")
    total_capital: float = Field(description="Total regulatory capital")
    cash_reserves: float = Field(description="Cash reserves")
    investment_securities: float = Field(description="Investment securities held")
    deposits: float = Field(description="Total deposits")


@tool("risk_analyze", args_schema=RiskAnalyzeArgs)
def risk_analyze(total_assets, loan_portfolio, npa_amount, tier1_capital, total_capital, cash_reserves, investment_securities, deposits):
    """Analyze a bank's portfolio risk ratios, run stress tests, and get recommendations."""
    return run_risk_analysis({
        "total_assets": total_assets, "loan_portfolio": loan_portfolio, "npa_amount": npa_amount,
        "tier1_capital": tier1_capital, "total_capital": total_capital, "cash_reserves": cash_reserves,
        "investment_securities": investment_securities, "deposits": deposits,
    })


# ─── Compliance ──────────────────────────────────────────────────────────
class ComplianceCheckArgs(BaseModel):
    amount: float = Field(description="Transaction amount")
    type: str = Field(description="Transaction type: 'cash', 'wire', 'ach', 'check', or 'digital'")
    is_foreign: bool = Field(description="Whether this is a foreign transaction")


@tool("compliance_check_transaction", args_schema=ComplianceCheckArgs)
def compliance_check_transaction(amount, type, is_foreign):
    """Screen a single transaction for US banking compliance obligations (CTR, SAR, OFAC)."""
    return check_transaction_compliance({"amount": amount, "type": type, "is_foreign": is_foreign})


# ─── AML narrative analysis ─────────────────────────────────────────────
class AmlNarrativeArgs(BaseModel):
    narrative: str = Field(description="Free-text description of the transaction activity to analyze for suspicious patterns")


@tool("aml_analyze_narrative", args_schema=AmlNarrativeArgs)
def aml_analyze_narrative(narrative):
    """Analyze a transaction narrative for AML red flags and suspicious activity typologies."""
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
    response = get_llm().invoke([HumanMessage(content=prompt)])
    return _extract_json(response.content, {
        "risk_level": "MEDIUM", "risk_score": 50, "entities": [], "red_flags": [],
        "patterns": [], "recommendation": response.content,
    })


# ─── AML customer screening ─────────────────────────────────────────────
class AmlScreenCustomerArgs(BaseModel):
    name: str = Field(description="Customer full name")
    dob: str = Field(description="Customer date of birth")
    country: str = Field(description="Customer's country of residence")
    occupation: str = Field(description="Customer's occupation")
    account_age_months: int = Field(description="How many months the account has been open")


@tool("aml_screen_customer", args_schema=AmlScreenCustomerArgs)
def aml_screen_customer(name, dob, country, occupation, account_age_months):
    """Run a KYC/AML screening on a customer (OFAC, PEP, adverse media, risk factors)."""
    prompt = f"""You are a KYC/AML compliance officer AI. Screen this customer:

Name: {name}
DOB: {dob}
Country: {country}
Occupation: {occupation}
Account Age: {account_age_months} months

Return a JSON object with exactly these fields:
- risk_level: "HIGH", "MEDIUM", or "LOW"
- checks: array of objects with "name" and "passed" (boolean) for: OFAC Sanctions List, PEP Screening, Adverse Media, High-Risk Country, Occupation Risk, Account Behavior
- risk_factors: array of specific risk factors identified
- recommendation: string with required due diligence actions

Return ONLY valid JSON, no extra text."""
    response = get_llm().invoke([HumanMessage(content=prompt)])
    return _extract_json(response.content, {
        "risk_level": "LOW", "checks": [], "risk_factors": [], "recommendation": response.content,
    })


# ─── Loan portfolio monitoring ──────────────────────────────────────────
class LoanItem(BaseModel):
    borrower: str = Field(description="Borrower name")
    loan_type: str = Field(description="Type of loan, e.g. commercial, mortgage, auto")
    outstanding: float = Field(description="Outstanding balance in $K")
    days_past_due: int = Field(default=0, description="Days past due")
    collateral_value: float = Field(default=0, description="Collateral value in $K")


class LoansMonitorArgs(BaseModel):
    total_portfolio_value: float = Field(description="Total outstanding loan portfolio value, $K")
    average_dpd: float = Field(description="Average days-past-due across the watch list")
    npl_ratio: float = Field(description="Non-performing loan ratio, %")
    loans: List[LoanItem] = Field(description="Watch-list loans to analyze")


@tool("loans_monitor", args_schema=LoansMonitorArgs)
def loans_monitor(total_portfolio_value, average_dpd, npl_ratio, loans):
    """Analyze a loan portfolio's health, early warning indicators, and get per-loan recommendations."""
    portfolio = {"total_portfolio_value": total_portfolio_value, "average_dpd": average_dpd, "npl_ratio": npl_ratio}
    loans_list = [l.dict() if hasattr(l, "dict") else l for l in loans]
    port_str = ", ".join(f"{k.replace('_', ' ').title()}: {v}" for k, v in portfolio.items())
    loans_str = "; ".join(
        f"{l['borrower']} ({l['loan_type']}, ${l['outstanding']}K, {l.get('days_past_due', 0)} DPD, collateral ${l.get('collateral_value', 0)}K)"
        for l in loans_list
    ) or "none"
    prompt = f"""You are a credit risk officer AI. Analyze this loan portfolio:

PORTFOLIO METRICS: {port_str}
WATCH LIST LOANS: {loans_str}

Return a JSON object with exactly these fields:
- health_score: integer 0-100
- rating: "EXCELLENT", "GOOD", "FAIR", "POOR", or "CRITICAL"
- ewi_count: integer count of early warning indicators
- early_warnings: array of objects with "indicator" (string) and "severity" ("HIGH" or "MEDIUM")
- loan_analysis: array per loan with "borrower", "action" (MONITOR/WATCH/RESTRUCTURE/WRITE-OFF), "note"
- recommendations: array of 4-5 actionable strings
- summary: 2-3 sentence portfolio assessment

Return ONLY valid JSON, no extra text."""
    response = get_llm().invoke([HumanMessage(content=prompt)])
    return _extract_json(response.content, {
        "health_score": 70, "rating": "FAIR", "ewi_count": 0, "early_warnings": [],
        "loan_analysis": [], "recommendations": [], "summary": response.content,
    })


# ─── Report generation ───────────────────────────────────────────────────
REPORT_LABELS = {
    "sar":               "Suspicious Activity Report (SAR) — FinCEN Filing",
    "ctr":               "Currency Transaction Report (CTR) — FinCEN Filing",
    "risk_assessment":   "Portfolio Risk Assessment Report",
    "credit_portfolio":  "Credit Portfolio Summary Report",
    "compliance_audit":  "Compliance Audit Report",
    "board_summary":      "Board Executive Summary",
}


class ReportsGenerateArgs(BaseModel):
    report_type: str = Field(description="One of: sar, ctr, risk_assessment, credit_portfolio, compliance_audit, board_summary")
    context: Dict[str, str] = Field(description="Key facts/parameters to include in the report, e.g. {'amount': '15000', 'customer': 'Jane Doe'}")


@tool("reports_generate", args_schema=ReportsGenerateArgs)
def reports_generate(report_type, context):
    """Draft a complete professional banking report (SAR, CTR, risk assessment, credit portfolio summary, compliance audit, or board summary)."""
    label = REPORT_LABELS.get(report_type, report_type.upper())
    ctx_str = "\n".join(f"- {k.replace('_', ' ').title()}: {v}" for k, v in context.items() if v)
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
    response = get_llm().invoke([HumanMessage(content=prompt)])
    return {"report_type": report_type, "label": label, "content": response.content}


# ─── Registry ─────────────────────────────────────────────────────────────
TOOLS = {
    "fraud_check":                  fraud_check,
    "credit_evaluate":               credit_evaluate,
    "risk_analyze":                  risk_analyze,
    "compliance_check_transaction":  compliance_check_transaction,
    "aml_analyze_narrative":         aml_analyze_narrative,
    "aml_screen_customer":           aml_screen_customer,
    "loans_monitor":                 loans_monitor,
    "reports_generate":              reports_generate,
}

TOOL_LABELS = {
    "fraud_check":                  "Fraud Check",
    "credit_evaluate":               "Credit Evaluation",
    "risk_analyze":                  "Risk Analysis",
    "compliance_check_transaction":  "Compliance Transaction Screening",
    "aml_analyze_narrative":         "AML Narrative Analysis",
    "aml_screen_customer":           "AML Customer Screening",
    "loans_monitor":                 "Loan Portfolio Monitor",
    "reports_generate":              "Report Generation",
}
