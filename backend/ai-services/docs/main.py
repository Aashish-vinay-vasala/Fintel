from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import FakeEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from dotenv import load_dotenv
import pdfplumber
import docx
import uuid
import os
import io

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

app = FastAPI(title="Document Intelligence Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile",
    temperature=0.1
)

embeddings = FakeEmbeddings(size=384)


doc_stores = {}

def extract_text(file_bytes: bytes, filename: str) -> str:
    ext = filename.lower().split(".")[-1]

    if ext == "pdf":
        text = ""
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text

    elif ext in ["docx", "doc"]:
        doc = docx.Document(io.BytesIO(file_bytes))
        return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])

    elif ext == "txt":
        return file_bytes.decode("utf-8", errors="ignore")

    else:
        return file_bytes.decode("utf-8", errors="ignore")

def get_summary(text: str) -> dict:
    truncated = text[:6000]

    system = """You are a senior banking document analyst AI. 
You specialize in analyzing contracts, loan agreements, compliance documents, and internal banking policies.
Always respond in clear, plain English that a non-lawyer can understand.
Be specific, structured, and highlight anything that needs attention.
Never show your reasoning process, analysis steps, or meta-commentary.
Go straight to the answer — no 'analyzing content', 'identifying sections', or 'let me break this down'."""

    summary_prompt = f"""Analyze this banking document and provide:

1. DOCUMENT TYPE
What kind of document is this? (loan agreement, contract, policy, compliance report, etc.)

2. PLAIN ENGLISH SUMMARY
Summarize what this document is about in 3-4 sentences. No jargon.

3. KEY POINTS
List the 5 most important things someone reading this document needs to know.

4. RISK FLAGS
List any clauses, terms, or sections that are unusual, risky, or need attention. If none, say "No major risk flags found."

5. RECOMMENDED ACTION
What should the reader do after reading this document?

Document:
{truncated}"""

    response = llm.invoke([
        SystemMessage(content=system),
        HumanMessage(content=summary_prompt)
    ])

    return {"summary": response.content}

def build_doc_vectorstore(text: str, doc_id: str):
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    docs = splitter.create_documents([text])
    for d in docs:
        d.metadata["doc_id"] = doc_id

    vs = Chroma.from_documents(
        documents=docs,
        embedding=embeddings,
        persist_directory=f"./docs/chroma_{doc_id}"
    )
    doc_stores[doc_id] = vs
    return vs

def answer_question(doc_id: str, question: str, doc_text: str) -> str:
    if doc_id not in doc_stores:
        build_doc_vectorstore(doc_text, doc_id)

    vs = doc_stores[doc_id]
    retriever = vs.as_retriever(search_kwargs={"k": 4})

    system = """You are an expert banking document analyst AI.
Answer questions about the provided document clearly and accurately.

Use these techniques:
- Zero-shot: For straightforward factual questions, answer directly from the document.
- One-shot reasoning: For complex questions, reason step by step before answering.
- If the answer is not in the document, say clearly: "This information is not found in the document."
- Always cite which part of the document your answer comes from.
- Use plain English. Avoid legal jargon unless necessary."""

    prompt = ChatPromptTemplate.from_messages([
        ("system", system),
        ("human", """Document context:
{context}

Question: {question}

Provide a clear, structured answer. If reasoning is needed, think step by step first.""")
    ])

    def format_docs(docs):
        return "\n\n".join(f"[Section {i+1}]: {d.page_content}" for i, d in enumerate(docs))

    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain.invoke(question)

doc_cache = {}

@app.get("/health")
def health():
    return {"status": "ok", "service": "document-intelligence"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    file_bytes = await file.read()
    text = extract_text(file_bytes, file.filename)

    if not text.strip():
        return {"error": "Could not extract text from document."}

    doc_id = str(uuid.uuid4())
    doc_cache[doc_id] = text

    build_doc_vectorstore(text, doc_id)
    result = get_summary(text)

    return {
        "doc_id": doc_id,
        "filename": file.filename,
        "char_count": len(text),
        "summary": result["summary"]
    }

@app.post("/ask")
async def ask_question(doc_id: str = Form(...), question: str = Form(...)):
    if doc_id not in doc_cache:
        return {"error": "Document not found. Please upload again."}

    text = doc_cache[doc_id]
    answer = answer_question(doc_id, question, text)

    return {
        "doc_id": doc_id,
        "question": question,
        "answer": answer
    }