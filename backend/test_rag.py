from services.pdf_processor import extract_text_from_pdf
from services.chunker import create_chunks
from services.embeddings import create_embeddings
from services.vector_store import VectorStore
from services.rag import generate_answer


# -----------------------------
# 1. Load PDF
# -----------------------------

pdf_path = "sample.pdf"

pages = extract_text_from_pdf(pdf_path)

print(f"Pages extracted: {len(pages)}")


# -----------------------------
# 2. Create chunks
# -----------------------------

chunks = create_chunks(pages)

print(f"Total chunks: {len(chunks)}")


# -----------------------------
# 3. Create embeddings
# -----------------------------

texts = [
    chunk["text"]
    for chunk in chunks
]

embeddings = create_embeddings(texts)

print(f"Embedding shape: {embeddings.shape}")


# -----------------------------
# 4. Create FAISS vector store
# -----------------------------

dimension = embeddings.shape[1]

vector_store = VectorStore(dimension)

vector_store.add(
    embeddings,
    chunks
)

print("Vectors added to FAISS.")


# -----------------------------
# 5. Ask a question
# -----------------------------

question = "What is TF-IDF?"

print(f"\nQuestion: {question}")


# -----------------------------
# 6. Embed the question
# -----------------------------

query_embedding = create_embeddings([question])[0]


# -----------------------------
# 7. Search FAISS
# -----------------------------

retrieved_chunks = vector_store.search(
    query_embedding,
    top_k=5
)

print(f"\nRetrieved chunks: {len(retrieved_chunks)}")


# -----------------------------
# 8. Show retrieved sources
# -----------------------------

print("\n--- Retrieved Sources ---")

for i, chunk in enumerate(retrieved_chunks, start=1):

    print(f"\nResult {i}")
    print(f"Page: {chunk['page']}")
    print(f"Text: {chunk['text'][:300]}...")


# -----------------------------
# 9. Generate answer using Gemini
# -----------------------------

answer = generate_answer(
    question,
    retrieved_chunks
)


# -----------------------------
# 10. Display final answer
# -----------------------------

print("\n==============================")
print("FINAL ANSWER")
print("==============================")

print(answer)