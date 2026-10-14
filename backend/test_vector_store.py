from services.embeddings import create_embeddings
from services.vector_store import VectorStore


texts = [
    "TF-IDF represents documents as numerical vectors.",
    "Cosine similarity measures similarity between vectors.",
    "Football is a popular sport.",
    "Text preprocessing removes unnecessary words.",
    "Machine learning models learn patterns from data."
]


# Create embeddings
embeddings = create_embeddings(texts)

print("Embedding shape:", embeddings.shape)


# Create vector store
dimension = embeddings.shape[1]

vector_store = VectorStore(dimension)


# Store vectors and text
chunks = [
    {"text": text, "page": 1}
    for text in texts
]

vector_store.add(
    embeddings,
    chunks
)


# Create query
query = "How are documents represented using TF-IDF?"

query_embedding = create_embeddings([query])[0]


# Search
results = vector_store.search(
    query_embedding,
    top_k=3
)


print("\nSearch Query:")
print(query)

print("\nTop Results:")

for i, result in enumerate(results, start=1):

    print(f"\nResult {i}:")
    print(result["text"])