from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import shutil
import os
from dotenv import load_dotenv

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# --- NEW: WE USE THE UNIVERSAL OPENAI WRAPPER FOR OPENROUTER ---
from langchain_openai import ChatOpenAI

load_dotenv()

app = FastAPI(title="TCS Knowledge Copilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "success", "message": "Knowledge Copilot Backend is Running!"}

@app.post("/test-message")
def test_post_route(user_message: str):
    return {"response": f"The server received your message: {user_message}"}

@app.post("/upload-doc")
async def upload_and_chunk_document(file: UploadFile = File(...)):
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        loader = PyPDFLoader(temp_file_path)
        documents = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        chunks = text_splitter.split_documents(documents)

        # Local embeddings 
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

        # Save to ChromaDB
        vector_store = Chroma.from_documents(
            documents=chunks, 
            embedding=embeddings, 
            persist_directory="./chroma_db"
        )
        
        return {
            "status": "success",
            "message": f"Successfully vectorized {len(chunks)} chunks into ChromaDB locally!",
            "filename": file.filename
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

# --- Chat Schema ---
class ChatRequest(BaseModel):
    question: str

# --- Chat Route ---
@app.post("/chat")
def chat_with_document(request: ChatRequest):
    try:
        # Step 1: Connect to local ChromaDB
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vector_store = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)

        # Step 2: Search the Database
        search_results = vector_store.similarity_search(request.question, k=3)
        context_string = "\n\n".join([doc.page_content for doc in search_results])

        # Step 3: Strict Enterprise Prompt
        strict_prompt = f"""
        You are an internal enterprise AI Copilot for TCS.
        Answer the user's question using ONLY the context provided below.
        If the answer is not in the context, do not guess. Simply say: "I do not have information about that in the uploaded documents."

        Context:
        {context_string}

        User Question: {request.question}
        """

       
       # Step 4: Call Gemini via OpenRouter
        # We explicitly limit max_tokens so the free tier doesn't block the request
        llm = ChatOpenAI(
            model="google/gemini-2.5-flash",
            openai_api_key=os.getenv("OPENROUTER_API_KEY"),
            openai_api_base="https://openrouter.ai/api/v1",
            max_tokens=1000, 
        )
        
        response = llm.invoke(strict_prompt)

        return {
            "status": "success",
            "question": request.question,
            "answer": response.content,
            "sources_used": [doc.page_content for doc in search_results] 
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}