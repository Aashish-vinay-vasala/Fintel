from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage
from typing import TypedDict
from shared.llm import get_llm
from credit.model import load_model, predict

class CreditState(TypedDict):
    application: dict
    approval_score: float
    decision: str
    explanation: str
    suggested_limit: float

def score_application(state: CreditState) -> CreditState:
    model, scaler = load_model()
    score = predict(state["application"], model, scaler)
    state["approval_score"] = score

    if score >= 0.75:
        state["decision"] = "APPROVED"
    elif score >= 0.5:
        state["decision"] = "REVIEW"
    else:
        state["decision"] = "REJECTED"

    return state

def calculate_limit(state: CreditState) -> CreditState:
    app = state["application"]
    income = app["income"]
    score = state["approval_score"]
    dti = app["debt_to_income"]

    base_limit = income * 0.4 * (1 - dti)
    adjusted = base_limit * score
    state["suggested_limit"] = round(adjusted, 2)
    return state

def explain_decision(state: CreditState) -> CreditState:
    llm = get_llm()
    app = state["application"]
    prompt = f"""
You are a banking credit analyst AI. Based on the following loan application, explain the credit decision clearly.

Application details:
- Age: {app['age']}
- Annual Income: ₹{app['income']:,.0f}
- Loan Amount Requested: ₹{app['loan_amount']:,.0f}
- Credit Score: {app['credit_score']}
- Employment Years: {app['employment_years']}
- Existing Loans: {app['existing_loans']}
- Missed Payments (last year): {app['missed_payments']}
- Debt-to-Income Ratio: {app['debt_to_income']:.2%}

Decision: {state['decision']}
Approval Score: {state['approval_score']:.2%}
Suggested Credit Limit: ₹{state['suggested_limit']:,.0f}

In 2-3 sentences, explain this decision to a bank officer. Be specific about the key factors.
"""
    response = llm.invoke([HumanMessage(content=prompt)])
    state["explanation"] = response.content
    return state

def build_credit_agent():
    graph = StateGraph(CreditState)
    graph.add_node("score", score_application)
    graph.add_node("limit", calculate_limit)
    graph.add_node("explain", explain_decision)
    graph.set_entry_point("score")
    graph.add_edge("score", "limit")
    graph.add_edge("limit", "explain")
    graph.add_edge("explain", END)
    return graph.compile()

credit_agent = build_credit_agent()

def run_credit_check(application: dict) -> dict:
    result = credit_agent.invoke({
        "application": application,
        "approval_score": 0.0,
        "decision": "",
        "explanation": "",
        "suggested_limit": 0.0
    })
    return {
        "approval_score": result["approval_score"],
        "decision": result["decision"],
        "suggested_limit": result["suggested_limit"],
        "explanation": result["explanation"]
    }