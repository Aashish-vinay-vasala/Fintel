from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage
from typing import TypedDict, List
from shared.llm import get_llm
from risk.model import Portfolio, calculate_ratios, stress_test, calculate_risk_score
from dataclasses import fields

PORTFOLIO_FIELDS = {f.name for f in fields(Portfolio)}

class RiskState(TypedDict):
    portfolio: dict
    ratios: dict
    stress_results: list
    risk_score: dict
    explanation: str
    recommendations: list

def analyze_ratios(state: RiskState) -> RiskState:
    p = {k: v for k, v in state["portfolio"].items() if k in PORTFOLIO_FIELDS}
    portfolio = Portfolio(**p)
    state["ratios"] = calculate_ratios(portfolio)
    return state

def run_stress_tests(state: RiskState) -> RiskState:
    p = {k: v for k, v in state["portfolio"].items() if k in PORTFOLIO_FIELDS}
    portfolio = Portfolio(**p)
    scenarios = ["mild_recession", "severe_recession", "interest_rate_shock", "cyber_attack"]
    state["stress_results"] = [stress_test(portfolio, s) for s in scenarios]
    state["risk_score"] = calculate_risk_score(state["ratios"])
    return state

def generate_recommendations(state: RiskState) -> RiskState:
    llm = get_llm()
    ratios = state["ratios"]
    risk = state["risk_score"]
    breaches = []
    for sr in state["stress_results"]:
        breaches.extend(sr["regulatory_breaches"])

    prompt = f"""
You are a senior bank risk officer AI. Analyze this bank's risk profile and provide actionable recommendations.

Current Ratios:
- NPA Ratio: {ratios['npa_ratio']}%
- Tier 1 Capital Ratio: {ratios['tier1_capital_ratio']}%
- Total Capital Ratio: {ratios['total_capital_ratio']}%
- Liquidity Ratio: {ratios['liquidity_ratio']}%
- Loan to Deposit Ratio: {ratios['loan_to_deposit_ratio']}%

Overall Risk Score: {risk['score']}/100 — {risk['rating']}

Stress Test Breaches Detected:
{chr(10).join(breaches) if breaches else 'No breaches detected in any scenario.'}

Provide:
1. Brief risk summary (2 sentences)
2. Top 3 specific recommendations with priority (High/Medium/Low)
3. Immediate actions required if any
"""
    response = llm.invoke([HumanMessage(content=prompt)])
    state["explanation"] = response.content

    recs = []
    if ratios["npa_ratio"] > 5:
        recs.append({"priority": "High", "action": "Increase loan loss provisioning immediately"})
    if ratios["tier1_capital_ratio"] < 8:
        recs.append({"priority": "High", "action": "Raise additional Tier 1 capital"})
    if ratios["liquidity_ratio"] < 20:
        recs.append({"priority": "Medium", "action": "Increase cash reserves and liquid assets"})
    if ratios["loan_to_deposit_ratio"] > 85:
        recs.append({"priority": "Medium", "action": "Reduce loan disbursements or grow deposit base"})
    if not recs:
        recs.append({"priority": "Low", "action": "Maintain current ratios and monitor quarterly"})

    state["recommendations"] = recs
    return state

def build_risk_agent():
    graph = StateGraph(RiskState)
    graph.add_node("analyze", analyze_ratios)
    graph.add_node("stress", run_stress_tests)
    graph.add_node("recommend", generate_recommendations)
    graph.set_entry_point("analyze")
    graph.add_edge("analyze", "stress")
    graph.add_edge("stress", "recommend")
    graph.add_edge("recommend", END)
    return graph.compile()

risk_agent = build_risk_agent()

def run_risk_analysis(portfolio: dict) -> dict:
    result = risk_agent.invoke({
        "portfolio": portfolio,
        "ratios": {},
        "stress_results": [],
        "risk_score": {},
        "explanation": "",
        "recommendations": []
    })
    return {
        "ratios": result["ratios"],
        "risk_score": result["risk_score"],
        "stress_tests": result["stress_results"],
        "explanation": result["explanation"],
        "recommendations": result["recommendations"]
    }