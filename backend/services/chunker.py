def create_chunks(pages, chunk_size=500, overlap=100):
    chunks = []

    for page in pages:
        text = page["text"]

        start = 0

        while start < len(text):
            end = start + chunk_size

            chunk_text = text[start:end]

            chunks.append({
                "text": chunk_text,
                "page": page["page"]
            })

            start += chunk_size - overlap

    return chunks