/**
 * VaultIQ Prompt Engineering Library
 * Provides zero-shot, few-shot, and chain-of-thought templates
 * for each banking AI domain.
 */

// ─── Fraud Detection ──────────────────────────────────────────────────────────

const FRAUD_ZERO_SHOT = (input) => `
You are a senior fraud detection AI for a US commercial bank.
Analyze the transaction and return a JSON object with:
fraud_score (0.0–1.0), is_fraud (boolean), recommendation (BLOCK|REVIEW|ALLOW), explanation (string).

TRANSACTION:
${JSON.stringify(input, null, 2)}
`.trim();

const FRAUD_FEW_SHOT = (input) => `
You are a senior fraud detection AI for a US commercial bank.
Learn from these labeled examples, then classify the new transaction.

EXAMPLE 1 — Low risk:
Input:  { "amount": 45, "hour": 14, "frequency_24h": 1, "is_foreign": false, "distance_from_home": 2 }
Output: { "fraud_score": 0.03, "is_fraud": false, "recommendation": "ALLOW", "explanation": "Small daytime domestic purchase, no anomalies." }

EXAMPLE 2 — Medium risk:
Input:  { "amount": 2800, "hour": 22, "frequency_24h": 6, "is_foreign": false, "distance_from_home": 120 }
Output: { "fraud_score": 0.41, "is_fraud": false, "recommendation": "REVIEW", "explanation": "Late-night elevated amount, moderate velocity and distance. Flag for soft review." }

EXAMPLE 3 — High risk (fraud):
Input:  { "amount": 185000, "hour": 2, "frequency_24h": 18, "is_foreign": true, "distance_from_home": 847 }
Output: { "fraud_score": 0.94, "is_fraud": true, "recommendation": "BLOCK", "explanation": "Large foreign wire at 2 AM, extreme velocity (18 txns/24h), 847 km displacement. Multiple simultaneous risk signals. Block immediately and file SAR." }

EXAMPLE 4 — Card-not-present fraud:
Input:  { "amount": 499, "hour": 3, "frequency_24h": 12, "is_foreign": true, "avg_amount_7d": 22 }
Output: { "fraud_score": 0.88, "is_fraud": true, "recommendation": "BLOCK", "explanation": "CNP transaction 22× above 7-day average at 3 AM, high velocity, foreign origin. Classic card-testing pattern followed by large fraudulent charge." }

NEW TRANSACTION TO CLASSIFY:
${JSON.stringify(input, null, 2)}

Return ONLY valid JSON, no prose.
`.trim();

const FRAUD_COT = (input) => `
You are a senior fraud detection AI. Think step-by-step through each risk factor,
then produce your final JSON assessment.

TRANSACTION: ${JSON.stringify(input, null, 2)}

Step 1 — Amount anomaly: Compare amount to avg_amount_7d. Is the deviation significant?
Step 2 — Temporal risk: Evaluate hour_of_day. Is this an unusual time for legitimate transactions?
Step 3 — Velocity risk: Assess frequency_24h. Does this indicate card testing or account takeover?
Step 4 — Geographic risk: Evaluate distance_from_home and is_foreign flag.
Step 5 — Composite score: Combine all factors with appropriate weights.
Step 6 — Decision: Produce final JSON with fraud_score (0-1), is_fraud, recommendation (BLOCK|REVIEW|ALLOW), explanation.

Return ONLY the final JSON object.
`.trim();

// ─── Credit Underwriting ──────────────────────────────────────────────────────

const CREDIT_ZERO_SHOT = (input) => `
You are a senior credit underwriter at a US commercial bank.
Evaluate this loan application and return JSON with:
decision (APPROVED|CONDITIONALLY_APPROVED|DECLINED), approval_score (0-1),
suggested_limit (number), explanation (string), conditions (array of strings if applicable).

APPLICATION: ${JSON.stringify(input, null, 2)}
Return ONLY valid JSON.
`.trim();

const CREDIT_FEW_SHOT = (input) => `
You are a senior credit underwriter at a US commercial bank.
Use these examples to calibrate your decision-making.

EXAMPLE 1 — Strong approval:
Input:  { "age": 42, "income": 220000, "loan_amount": 350000, "credit_score": 790, "employment_years": 15, "missed_payments": 0, "debt_to_income": 0.22 }
Output: { "decision": "APPROVED", "approval_score": 0.92, "suggested_limit": 400000, "explanation": "Excellent credit profile. High income, long tenure, pristine payment history, conservative DTI. Approve at requested amount with standard terms.", "conditions": [] }

EXAMPLE 2 — Conditional approval:
Input:  { "age": 29, "income": 78000, "loan_amount": 280000, "credit_score": 682, "employment_years": 3, "missed_payments": 1, "debt_to_income": 0.41 }
Output: { "decision": "CONDITIONALLY_APPROVED", "approval_score": 0.61, "suggested_limit": 240000, "explanation": "Adequate income but elevated DTI and one recent missed payment. Approve at reduced limit with co-signer or 15% down payment requirement.", "conditions": ["Provide 6 months bank statements", "DTI must not exceed 43% post-origination", "Minimum 10% down payment"] }

EXAMPLE 3 — Decline:
Input:  { "age": 24, "income": 32000, "loan_amount": 420000, "credit_score": 551, "employment_years": 1, "missed_payments": 5, "debt_to_income": 0.72 }
Output: { "decision": "DECLINED", "approval_score": 0.08, "suggested_limit": 0, "explanation": "Application declined. Poor credit history with 5 missed payments, loan-to-income ratio of 13× exceeds policy limit, DTI of 72% is severely above 43% threshold. Recommend credit counseling and 12-month credit improvement plan before reapplication.", "conditions": [] }

NOW EVALUATE:
${JSON.stringify(input, null, 2)}

Return ONLY valid JSON.
`.trim();

const CREDIT_COT = (input) => `
You are a bank credit officer. Apply the 5Cs of Credit framework step-by-step.

APPLICATION: ${JSON.stringify(input, null, 2)}

1. CHARACTER (credit_score, missed_payments): What does the payment history indicate?
2. CAPACITY (income, loan_amount, debt_to_income): Can the applicant service this debt?
3. CAPITAL (existing_loans, employment_years): What assets/stability back this loan?
4. CONDITIONS (loan_amount, current rate environment): Are the loan terms sound?
5. COLLATERAL: Implied from loan type and amount.
6. FINAL DECISION: Synthesize into JSON with decision, approval_score (0-1), suggested_limit, explanation, conditions[].

Return ONLY the final JSON.
`.trim();

// ─── Risk Analysis ────────────────────────────────────────────────────────────

const RISK_ZERO_SHOT = (input) => `
You are a bank chief risk officer. Analyze the portfolio risk metrics and return JSON with:
overall_risk (LOW|MODERATE|HIGH|CRITICAL), risk_score (0-100), tier1_ratio (%),
total_capital_ratio (%), npa_ratio (%), liquidity_ratio (%),
metrics (array), top_risks (array), recommendations (array), summary (string).

PORTFOLIO: ${JSON.stringify(input, null, 2)}
Return ONLY valid JSON.
`.trim();

const RISK_FEW_SHOT = (input) => `
You are a bank chief risk officer applying Basel III and FDIC frameworks.

EXAMPLE — Well-capitalized community bank:
Input:  { "total_assets": 2100, "loan_portfolio": 1400, "npa_amount": 21, "tier1_capital": 210, "total_capital": 228, "cash_reserves": 180, "deposits": 1780 }
Output: { "overall_risk": "LOW", "risk_score": 28, "tier1_ratio": 10.0, "npa_ratio": 1.5, "summary": "Well-capitalized with conservative NPA ratio. Adequate liquidity. No immediate concerns.", "top_risks": [{"risk": "Moderate CRE concentration", "severity": "LOW"}], "recommendations": ["Maintain current capital trajectory", "Continue quarterly stress testing"] }

EXAMPLE — Stressed bank:
Input:  { "total_assets": 4200, "loan_portfolio": 2840, "npa_amount": 142, "tier1_capital": 336, "total_capital": 357, "cash_reserves": 210, "deposits": 3540 }
Output: { "overall_risk": "HIGH", "risk_score": 74, "tier1_ratio": 8.0, "npa_ratio": 5.0, "summary": "NPA ratio at 5% signals material credit stress. Tier 1 ratio approaching regulatory minimum buffer. Immediate action required.", "top_risks": [{"risk": "NPA ratio 5% exceeds 2% peer average", "severity": "HIGH"}, {"risk": "Tier 1 close to 8% minimum", "severity": "HIGH"}], "recommendations": ["Raise $40M capital immediately", "Initiate NPA workout program", "Reduce new loan originations"] }

ANALYZE:
${JSON.stringify(input, null, 2)}
Return ONLY valid JSON.
`.trim();

// ─── Compliance Q&A ───────────────────────────────────────────────────────────

const COMPLIANCE_ZERO_SHOT = (question) => `
You are a bank compliance officer with expertise in BSA/AML, FFIEC, Basel III, and US banking regulations.
Answer the following compliance question accurately and cite specific regulations where applicable.

QUESTION: ${question}

Return JSON with: answer (string), status ("compliant"|"non_compliant"|"requires_review"|"not_applicable"),
citations (array of regulation references).
`.trim();

const COMPLIANCE_FEW_SHOT = (question) => `
You are a senior bank compliance officer. Use these examples to calibrate response quality.

EXAMPLE 1:
Question: "When must a CTR be filed?"
Answer: { "answer": "A Currency Transaction Report (CTR) must be filed with FinCEN within 15 calendar days after the transaction date for any cash transaction exceeding $10,000, or multiple transactions totaling more than $10,000 in a single business day by or for the same person. Reference: 31 CFR §1010.311.", "status": "compliant", "citations": ["31 CFR §1010.311", "BSA/AML Examination Manual Chapter 12"] }

EXAMPLE 2:
Question: "Can we share SAR information with the subject of the report?"
Answer: { "answer": "No. Under the SAR confidentiality provision (31 USC §5318(g)(2)), a financial institution and its employees are strictly prohibited from disclosing the existence of a SAR or any information that would reveal a SAR has been filed. This includes notifying the subject, their attorney, or any third party. Violation can result in criminal penalties.", "status": "non_compliant", "citations": ["31 USC §5318(g)(2)", "FinCEN Advisory FIN-2007-A003"] }

NOW ANSWER:
Question: "${question}"
Return ONLY valid JSON.
`.trim();

// ─── AML Narrative Analysis ───────────────────────────────────────────────────

const AML_FEW_SHOT = (narrative) => `
You are an AML Investigator with FinCEN certification.

EXAMPLE — Structuring pattern:
Narrative: "Customer deposited $9,800 on Monday, $9,500 on Tuesday, and $9,700 on Wednesday at three different branches."
Output: { "risk_level": "HIGH", "risk_score": 89, "entities": [{"type":"AMOUNT","value":"$9,800/$9,500/$9,700 over 3 days"}], "red_flags": ["Structuring — deposits just below $10,000 CTR threshold", "Multi-branch pattern", "Three consecutive days"], "patterns": ["Structuring/Smurfing"], "recommendation": "File SAR immediately. Pattern meets 31 CFR 1010.314 structuring definition." }

EXAMPLE — Normal business:
Narrative: "Payroll direct deposit of $14,200 to business checking account from employer XYZ Corp."
Output: { "risk_level": "LOW", "risk_score": 5, "entities": [{"type":"AMOUNT","value":"$14,200"},{"type":"ORGANIZATION","value":"XYZ Corp"}], "red_flags": [], "patterns": [], "recommendation": "No action required. Routine payroll transaction consistent with account profile." }

NOW ANALYZE:
Narrative: "${narrative}"
Return ONLY valid JSON.
`.trim();

// ─── Prompt selector ──────────────────────────────────────────────────────────

const VARIANTS = {
  fraud: {
    zero_shot:  FRAUD_ZERO_SHOT,
    few_shot:   FRAUD_FEW_SHOT,
    cot:        FRAUD_COT,
  },
  credit: {
    zero_shot:  CREDIT_ZERO_SHOT,
    few_shot:   CREDIT_FEW_SHOT,
    cot:        CREDIT_COT,
  },
  risk: {
    zero_shot:  RISK_ZERO_SHOT,
    few_shot:   RISK_FEW_SHOT,
  },
  compliance: {
    zero_shot:  COMPLIANCE_ZERO_SHOT,
    few_shot:   COMPLIANCE_FEW_SHOT,
  },
  aml: {
    few_shot:   AML_FEW_SHOT,
  },
};

function getPrompt(domain, variant, input) {
  const domainVariants = VARIANTS[domain];
  if (!domainVariants) throw new Error(`Unknown domain: ${domain}`);
  const fn = domainVariants[variant] || domainVariants['zero_shot'] || domainVariants[Object.keys(domainVariants)[0]];
  return fn(input);
}

module.exports = { getPrompt, VARIANTS };
