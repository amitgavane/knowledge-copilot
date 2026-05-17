# TCS Knowledge Copilot 🚀

An Enterprise-grade Retrieval-Augmented Generation (RAG) AI Assistant.

## Overview
This project is a full-stack AI application designed to read, vectorize, and query enterprise documents (PDFs) securely. It uses local vector embeddings to ensure data privacy and connects to cloud LLMs for intelligent, context-aware answers. 

## Tech Stack
* **Frontend:** React.js, Tailwind CSS, Lucide Icons
* **Backend:** Python, FastAPI
* **AI & Database:** HuggingFace (Local Embeddings), ChromaDB (Vector Store), Gemini 2.5 Flash via OpenRouter (LLM)
* **Architecture:** RAG (Retrieval-Augmented Generation)

## Key Features
* 📄 **Document Processing:** Upload and parse complex PDF documents.
* 🔒 **Data Privacy:** Local vectorization ensures sensitive documents are not blindly sent to public APIs.
* 💬 **Modern UI:** Responsive, dark-mode ready Chat UI with markdown support and interactive animations.
* 🔍 **Hallucination Prevention:** The AI provides exact source citations from the uploaded documents to verify its answers.