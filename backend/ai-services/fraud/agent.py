from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage
from typing import TypedDict
from shared.llm import get_llm
from fraud.model import load_model, predict

class FraudState(TypedDict):
    transaction: dict
    fraud_score: float
    is_fraud: bool
    explanation: str
    recommendation: str

def score_transaction(state: FraudState) -> FraudState:
    model, scaler = load_model()
    score = predict(state["transaction"], model, scaler)
    state["fraud_score"] = score
    state["is_fraud"] = score > 0.6
    return state

def explain_decision(state: FraudState) -> FraudState:
    if not state["is_fraud"]:
        state["explanation"] = "Transaction appears normal based on pattern analysis."
        state["recommendation"] = "APPROVE"
        return state

    llm = get_llm()
    txn = state["transaction"]
    prompt = f"""
You are a banking fraud analyst AI. A transaction has been flagged as potentially fraudulent.

Transaction details:
- Amount: ₹{txn['amount']:,.0f}
- Hour of day: {txn['hour']}:00
- Transactions in last 24h: {txn['frequency_24h']}
- Avg transaction amount (7 days): ₹{txn['avg_amount_7d']:,.0f}
- Distance from home: {txn['distance_from_home']:.1f} km
- Foreign transaction: {'Yes' if txn['is_foreign'] else 'No'}
- Same city as usual: {'Yes' if txn['same_city'] else 'No'}
- Fraud probability score: {state['fraud_score']:.2%}

In 2-3 sentences, explain why this transaction is suspicious. Be specific and concise.
"""
    response = llm.invoke([HumanMessage(content=prompt)])
    state["explanation"] = response.content
    state["recommendation"] = "BLOCK" if state["fraud_score"] > 0.85 else "REVIEW"
    return state

def build_fraud_agent():
    graph = StateGraph(FraudState)
    graph.add_node("score", score_transaction)
    graph.add_node("explain", explain_decision)
    graph.set_entry_point("score")
    graph.add_edge("score", "explain")
    graph.add_edge("explain", END)
    return graph.compile()

fraud_agent = build_fraud_agent()

def run_fraud_check(transaction: dict) -> dict:
    result = fraud_agent.invoke({
        "transaction": transaction,
        "fraud_score": 0.0,
        "is_fraud": False,
        "explanation": "",
        "recommendation": ""
    })
    return {
        "fraud_score": result["fraud_score"],
        "is_fraud": result["is_fraud"],
        "explanation": result["explanation"],
        "recommendation": result["recommendation"]
    }