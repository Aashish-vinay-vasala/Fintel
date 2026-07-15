from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

def get_llm():
    key = os.getenv("GROQ_API_KEY")
    print(f"Loaded key: {key[:10]}...")  # debug line
    return ChatGroq(
        api_key=key,
        model="llama-3.3-70b-versatile",
        temperature=0.1,
    )