import numpy as np
from dataclasses import dataclass
from typing import List

@dataclass
class Portfolio:
    total_assets: float
    loan_portfolio: float
    npa_amount: float
    tier1_capital: float
    total_capital: float
    cash_reserves: float
    investment_securities: float
    deposits: float

def calculate_ratios(portfolio: Portfolio) -> dict:
    npa_ratio = (portfolio.npa_amount / portfolio.loan_portfolio) * 100
    tier1_ratio = (portfolio.tier1_capital / portfolio.total_assets) * 100
    total_capital_ratio = (portfolio.total_capital / portfolio.total_assets) * 100
    liquidity_ratio = (portfolio.cash_reserves / portfolio.deposits) * 100
    loan_to_deposit = (portfolio.loan_portfolio / portfolio.deposits) * 100

    return {
        "npa_ratio": round(npa_ratio, 2),
        "tier1_capital_ratio": round(tier1_ratio, 2),
        "total_capital_ratio": round(total_capital_ratio, 2),
        "liquidity_ratio": round(liquidity_ratio, 2),
        "loan_to_deposit_ratio": round(loan_to_deposit, 2),
    }

def stress_test(portfolio: Portfolio, scenario: str) -> dict:
    scenarios = {
        "mild_recession": {
            "npa_increase": 1.5,
            "asset_decline": 0.05,
            "deposit_outflow": 0.08,
            "description": "Mild recession — NPA up 50%, assets down 5%, deposit outflow 8%"
        },
        "severe_recession": {
            "npa_increase": 3.0,
            "asset_decline": 0.15,
            "deposit_outflow": 0.20,
            "description": "Severe recession — NPA tripled, assets down 15%, deposit outflow 20%"
        },
        "interest_rate_shock": {
            "npa_increase": 1.2,
            "asset_decline": 0.08,
            "deposit_outflow": 0.10,
            "description": "Interest rate shock +300bps — bond portfolio losses, deposit pressure"
        },
        "cyber_attack": {
            "npa_increase": 1.0,
            "asset_decline": 0.02,
            "deposit_outflow": 0.15,
            "description": "Cyber attack — operational losses, customer confidence impact"
        }
    }

    s = scenarios.get(scenario, scenarios["mild_recession"])

    stressed_npa = portfolio.npa_amount * s["npa_increase"]
    stressed_assets = portfolio.total_assets * (1 - s["asset_decline"])
    stressed_deposits = portfolio.deposits * (1 - s["deposit_outflow"])
    stressed_capital = portfolio.tier1_capital - (stressed_npa - portfolio.npa_amount) * 0.5

    stressed_npa_ratio = (stressed_npa / portfolio.loan_portfolio) * 100
    stressed_tier1 = (stressed_capital / stressed_assets) * 100
    stressed_liquidity = (portfolio.cash_reserves / stressed_deposits) * 100

    breaches = []
    if stressed_tier1 < 6.0:
        breaches.append(f"Tier 1 Capital ratio breaches minimum (6%). Stressed: {stressed_tier1:.2f}%")
    if stressed_npa_ratio > 10:
        breaches.append(f"NPA ratio critically high at {stressed_npa_ratio:.2f}%")
    if stressed_liquidity < 10:
        breaches.append(f"Liquidity ratio critically low at {stressed_liquidity:.2f}%")

    return {
        "scenario": scenario,
        "description": s["description"],
        "stressed_metrics": {
            "npa_ratio": round(stressed_npa_ratio, 2),
            "tier1_capital_ratio": round(stressed_tier1, 2),
            "liquidity_ratio": round(stressed_liquidity, 2),
        },
        "regulatory_breaches": breaches,
        "passed": len(breaches) == 0
    }

def calculate_risk_score(ratios: dict) -> dict:
    score = 100

    if ratios["npa_ratio"] > 10:
        score -= 30
    elif ratios["npa_ratio"] > 5:
        score -= 15
    elif ratios["npa_ratio"] > 2:
        score -= 5

    if ratios["tier1_capital_ratio"] < 6:
        score -= 30
    elif ratios["tier1_capital_ratio"] < 8:
        score -= 10

    if ratios["liquidity_ratio"] < 10:
        score -= 25
    elif ratios["liquidity_ratio"] < 20:
        score -= 10

    if ratios["loan_to_deposit_ratio"] > 90:
        score -= 15
    elif ratios["loan_to_deposit_ratio"] > 80:
        score -= 5

    score = max(0, min(100, score))

    if score >= 80:
        rating = "LOW RISK"
        color = "green"
    elif score >= 60:
        rating = "MODERATE RISK"
        color = "yellow"
    elif score >= 40:
        rating = "HIGH RISK"
        color = "orange"
    else:
        rating = "CRITICAL RISK"
        color = "red"

    return {"score": score, "rating": rating, "color": color}