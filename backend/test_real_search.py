from services.pdf_processor import extract_text_from_pdf
from services.chunker import create_chunks
from services.embeddings import create_embeddings
from services.vector_store import VectorStore


# 1. Extract PDF text
pdf_path = "sample.pdf"

pages = extract_text_from_pdf(pdf_path)

print("Pages extracted:", len(pages))


# 2. Create chunks
chunks = create_chunks(pages)

print("Total chunks:", len(chunks))


# 3. Extract only the text from each chunk
texts = [
    chunk["text"]
    for chunk in chunks
]


# 4. Create embeddings
embeddings = create_embeddings(texts)

print("Embedding shape:", embeddings.shape)


# 5. Create FAISS vector store
dimension = embeddings.shape[1]

vector_store = VectorStore(dimension)


# 6. Store embeddings + chunks
vector_store.add(
    embeddings,
    chunks
)


# 7. Ask a question
query = "What is TF-IDF?"

query_embedding = create_embeddings([query])[0]


# 8. Search FAISS
results = vector_store.search(
    query_embedding,
    top_k=3
)


# 9. Display results
print("\n==============================")
print("QUESTION:")
print(query)

print("\nTOP RESULTS:")
print("==============================")


for i, result in enumerate(results, start=1):

    print(f"\nResult {i}")
    print("Page:", result["page"])
    print("Text:")
    print(result["text"])
    print("-" * 60)