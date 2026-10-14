<div align="center">

# 📄 InsightDoc
**Turn your PDFs into an interactive knowledge source.**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://reactjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*InsightDoc is a RAG-based (Retrieval-Augmented Generation) document intelligence application. It allows users to upload PDFs, retrieve relevant information via semantic search, and ask questions in natural language, backed by Google's Gemini AI.*

</div>

---

## ✨ Features

*   📤 **PDF Upload:** Seamlessly upload documents through a modern web interface.
*   📝 **Text Extraction:** Robust text extraction from PDF pages using PyMuPDF.
*   ✂️ **Text Chunking:** Smartly split extracted content into smaller, semantic pieces for accurate retrieval.
*   🧠 **Semantic Embeddings:** Generate rich vector representations using `Sentence Transformers`.
*   🔍 **Vector Search:** Ultra-fast similarity search and context retrieval using FAISS.
*   🤖 **AI-Powered Q&A:** Generate highly accurate, context-informed answers using the Google Gemini API.
*   📑 **Source References:** Instantly view relevant source-page numbers and text snippets to verify AI claims.
*   🎨 **Modern UI:** Responsive, sleek React interface styled with Tailwind CSS.
*   📖 **API Documentation:** Interactive backend endpoints through FastAPI's Swagger UI.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** ⚛️ | React, Vite, Tailwind CSS |
| **Backend** 🐍 | Python, FastAPI, Uvicorn |
| **PDF Processing** 📄 | PyMuPDF |
| **Embeddings** 🧩 | Sentence Transformers (`all-MiniLM-L6-v2`) |
| **Vector Search** 🔎 | FAISS |
| **Generative AI** 🧠 | Google Gemini API |
| **Configuration** ⚙️ | Python `python-dotenv` |
| **API Testing** 🧪 | FastAPI Swagger UI |

---

## 🏗️ Architecture

```text
User
 │
 ├──> ⚛️ React + Tailwind Frontend (PDF upload / question)
 │
 └──> 🐍 FastAPI Backend
       │
       ├──> 📄 PDF Text Extraction (PyMuPDF)
       ├──> ✂️ Text Chunking
       ├──> 🧩 Sentence Transformer Embeddings
       ├──> 🔎 FAISS Similarity Search
       │
       └──> 🧠 Retrieved Context + User Question 
             │
             └──> 🤖 Gemini Model
                   │
                   └──> 💡 Answer + Source References
                         │
                         └──> ⚛️ React Frontend
                         