
from tempfile import NamedTemporaryFile
import os

from pydantic import BaseModel

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.rag import generate_answer
from services.pdf_processor import extract_text_from_pdf
from services.chunker import create_chunks
from services.embeddings import create_embeddings
from services.vector_store import VectorStore


app = FastAPI(
    title="InsightDoc API",
    description="RAG-based Document Intelligence System",
    version="1.0.0"
)

# Store the current document's vector index in memory
vector_store = None


@app.get("/")
def root():
    return {"message": "InsightDoc API is running"}


@app.post("/upload")
def upload_pdf(file: UploadFile = File(...)):
    global vector_store

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    temp_path = None

    try:
        # Save the uploaded PDF temporarily
        with NamedTemporaryFile(delete=False, suffix=".pdf") as temp:
            temp_path = temp.name
            while data := file.file.read(1024 * 1024):
                temp.write(data)

        # Extract PDF text
        pages = extract_text_from_pdf(temp_path)

        # Split text into chunks
        chunks = create_chunks(pages)
        chunks = [chunk for chunk in chunks if chunk["text"].strip()]

        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="No extractable text found in PDF"
            )

        # Generate embeddings
        texts = [chunk["text"] for chunk in chunks]
        embeddings = create_embeddings(texts)

        # Create FAISS index
        dimension = embeddings.shape[1]
        new_store = VectorStore(dimension)
        new_store.add(embeddings, chunks)

        # Replace current document index
        vector_store = new_store

        return {
            "message": "PDF processed successfully",
            "filename": file.filename,
            "pages": len(pages),
            "chunks": len(chunks)
        }

    finally:
        file.file.close()
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


class AskRequest(BaseModel):
    question: str


@app.post("/ask")
def ask_question(request: AskRequest):
    global vector_store

    if vector_store is None:
        raise HTTPException(
            status_code=400,
            detail="Please upload a PDF first."
        )

    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    # Convert the question into an embedding
    query_embedding = create_embeddings([question])[0]

    # Retrieve the top 5 relevant chunks
    retrieved_chunks = vector_store.search(
        query_embedding,
        top_k=5
    )

    if not retrieved_chunks:
        raise HTTPException(
            status_code=404,
            detail="No relevant content found."
        )

    # Generate an answer using Gemini
    answer = generate_answer(
        question,
        retrieved_chunks
    )

    # Return the answer and source pages
    sources = [
        {
            "page": chunk["page"],
            "text": chunk["text"][:300]
        }
        for chunk in retrieved_chunks
    ]

    return {
        "question": question,
        "answer": answer,
        "sources": sources
    }
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)