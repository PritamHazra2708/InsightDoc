from services.embeddings import create_embeddings


texts = [
    "TF-IDF represents documents as numerical vectors.",
    "Cosine similarity measures similarity between vectors.",
    "Football is a popular sport."
]

embeddings = create_embeddings(texts)

print("Number of texts:", len(texts))
print("Embedding shape:", embeddings.shape)

for i, embedding in enumerate(embeddings):
    print(f"\nText {i + 1}:")
    print(texts[i])

    print("First 10 numbers:")
    print(embedding[:10])