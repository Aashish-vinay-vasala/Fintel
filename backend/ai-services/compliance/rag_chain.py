from langchain_groq import ChatGroq
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import FakeEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

REGULATIONS = """
US BANKING COMPLIANCE GUIDELINES 2024:

1. KNOW YOUR CUSTOMER (KYC) - FinCEN Requirements
Banks must verify identity of all customers under the Customer Identification Program (CIP).
Required documents: Government-issued photo ID (passport, driver's license), SSN or EIN.
Beneficial ownership must be verified for legal entity customers (25% ownership threshold).
Enhanced Due Diligence (EDD) required for high-risk customers and Politically Exposed Persons (PEPs).

2. SUSPICIOUS ACTIVITY REPORTING (SAR)
Banks must file a SAR with FinCEN for transactions suspected of involving illegal activity above $5,000.
SAR must be filed within 30 calendar days of detecting suspicious activity.
If no suspect is identified, filing window extends to 60 days.
Banks are prohibited from tipping off the subject of a SAR filing.
SARs must be retained for 5 years from the date of filing.

3. ANTI MONEY LAUNDERING (AML) - Bank Secrecy Act (BSA)
Three stages of money laundering: placement, layering, integration.
Banks must implement a written AML compliance program approved by the Board of Directors.
Program must include internal controls, independent testing, designated BSA officer, and training.
Structuring transactions to evade $10,000 reporting threshold is a federal crime (31 USC 5324).
OFAC screening required against SDN list for all customers and transactions.

4. CURRENCY TRANSACTION REPORTING (CTR)
All cash transactions exceeding $10,000 must be reported to FinCEN using Form 104.
CTR must be filed within 15 days of the transaction.
Multiple transactions by the same customer on the same day are aggregated.
Exemptions available for certain businesses (Phase I and Phase II exemptions).
Penalty for willful non-filing: up to $500,000 fine and 10 years imprisonment.

5. FRAUD PREVENTION - OCC Guidelines
Banks must report significant fraud incidents to the OCC within 36 hours.
Cyber incidents affecting core banking systems must be reported to primary federal regulator immediately.
Banks must maintain fraud risk management programs reviewed annually.
Elder financial exploitation must be reported to Adult Protective Services.

6. CREDIT RISK - Federal Reserve Guidelines
Non-performing loan classification: loan past due 90+ days or on non-accrual status.
Banks must maintain Tier 1 Capital Ratio of minimum 6% (well-capitalized: 8%).
Total Capital Ratio minimum 8% (well-capitalized: 10%).
Allowance for Credit Losses (ACL) must follow CECL methodology under ASC 326.
Stress testing required for banks with assets over $100 billion (DFAST).

7. DATA PRIVACY - GLBA & CCPA
Gramm-Leach-Bliley Act (GLBA): Banks must provide privacy notices and opt-out rights.
Customer financial data must be protected with administrative, technical, and physical safeguards.
Data breach notification required within 30 days under GLBA Safeguards Rule.
California Consumer Privacy Act (CCPA): Right to know, delete, and opt-out of data sale.
Data retention: records must be kept minimum 5 years per BSA requirements.

8. CONSUMER PROTECTION - CFPB Regulations
Truth in Lending Act (TILA): APR must be disclosed clearly before loan consummation.
Fair Credit Reporting Act (FCRA): Adverse action notice required within 30 days of credit denial.
Equal Credit Opportunity Act (ECOA): Prohibits discrimination based on race, color, religion, national origin, sex, age.
Community Reinvestment Act (CRA): Banks must meet credit needs of all communities including low-income areas.
Real Estate Settlement Procedures Act (RESPA): Loan estimate must be provided within 3 business days.

9. DIGITAL BANKING & FINTECH
OCC guidelines require same risk management standards for digital and traditional banking.
Third-party risk management: due diligence required for all fintech partnerships.
Buy Now Pay Later (BNPL): CFPB guidance requires clear disclosure of terms and fees.
Crypto assets: FinCEN requires MSB registration for crypto exchanges operating in the US.
Open banking: Dodd-Frank Section 1033 gives consumers right to access their financial data.

10. MORTGAGE & LENDING COMPLIANCE
Home Mortgage Disclosure Act (HMDA): Annual reporting of mortgage data required.
Qualified Mortgage (QM) Rule: DTI ratio must not exceed 43% for safe harbor protection.
Flood insurance required for properties in FEMA Special Flood Hazard Areas.
Ability to Repay (ATR) rule: Lenders must verify borrower's ability to repay before origination.
"""

vectorstore = None

def get_vectorstore():
    global vectorstore
    if vectorstore is not None:
        return vectorstore

    embeddings = FakeEmbeddings(size=384)


    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = splitter.create_documents([REGULATIONS])

    vectorstore = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        persist_directory="./compliance/chroma_db"
    )
    return vectorstore

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def get_rag_chain():
    llm = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",
        temperature=0.1
    )

    prompt = PromptTemplate(
        template="""You are a banking compliance officer AI with deep knowledge of US banking regulations.
Use ONLY the following regulatory context to answer the question.
If the answer is not found in the context, respond with:
"This specific query is outside the current regulatory knowledge base. Please consult your compliance team or refer to FinCEN/OCC/CFPB official guidelines."

Context: {context}

Question: {question}

Provide a clear answer with:
1. Direct answer (or state if not found in knowledge base)
2. Relevant regulation reference (if applicable)
3. Required action if any (if applicable)
""",
        input_variables=["context", "question"]
    )

    retriever = get_vectorstore().as_retriever(search_kwargs={"k": 3})

    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    return chain

def check_compliance(question: str) -> dict:
    llm = get_llm()
    prompt = f"""You are a US banking compliance officer AI with deep knowledge of US banking regulations including BSA, AML, KYC, SAR, CTR, OFAC, GLBA, FCRA, TILA, CRA.

Answer this compliance question accurately and specifically:
{question}

Provide:
1. Direct answer with specific requirements
2. Relevant regulation reference
3. Required action if any

If truly outside banking compliance scope, say so."""

    response = llm.invoke([HumanMessage(content=prompt)])
    not_found = "outside" in response.content.lower() and "knowledge" in response.content.lower()
    return {
        "question": question,
        "answer": response.content,
        "status": "not_found" if not_found else "requires_action" if "must" in response.content.lower() else "compliant"
    }

def check_transaction_compliance(transaction: dict) -> dict:
    amount = transaction.get("amount", 0)
    txn_type = transaction.get("type", "digital")
    is_foreign = transaction.get("is_foreign", False)

    flags = []

    if txn_type == "cash" and amount >= 10000:
        flags.append({
            "rule": "CTR Required",
            "detail": f"Cash transaction ${amount:,.0f} exceeds $10,000 limit. Must file CTR with FinCEN within 15 days.",
            "severity": "high"
        })

    if amount >= 5000 and txn_type != "cash":
        flags.append({
            "rule": "SAR Review",
            "detail": f"Transaction of ${amount:,.0f} may require SAR filing if suspicious activity is detected.",
            "severity": "medium"
        })

    if amount >= 1000000:
        flags.append({
            "rule": "Fraud Reporting",
            "detail": "Large transaction. Monitor for OCC fraud reporting obligation within 36 hours.",
            "severity": "medium"
        })

    if is_foreign:
        flags.append({
            "rule": "OFAC Screening Required",
            "detail": "Foreign transaction detected. OFAC SDN list screening mandatory before processing.",
            "severity": "high"
        })

    if not flags:
        flags.append({
            "rule": "Clear",
            "detail": "No compliance flags triggered for this transaction.",
            "severity": "none"
        })

    question = f"A {'cash' if txn_type == 'cash' else 'digital'} transaction of ${amount:,.0f} {'from a foreign account' if is_foreign else ''} was made. What are the US banking compliance obligations?"
    chain = get_rag_chain()
    answer = chain.invoke(question)

    not_found = "outside the current regulatory knowledge base" in answer.lower()

    return {
        "transaction": transaction,
        "flags": flags,
        "compliance_guidance": answer,
        "requires_action": any(f["severity"] == "high" for f in flags),
        "status": "not_found" if not_found else "requires_action" if any(f["severity"] == "high" for f in flags) else "compliant"
    }