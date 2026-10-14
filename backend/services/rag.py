import os

from dotenv import load_dotenv
from google import genai


# Load environment variables
load_dotenv()


# Initialize Gemini client
client = genai.Client()


def generate_answer(question: str, retrieved_chunks: list):

    context = "\n\n".join(
        [
            f"Page {chunk['page']}:\n{chunk['text']}"
            for chunk in retrieved_chunks
        ]
    )

    prompt = f"""
You are a document question-answering assistant.

Answer the user's question using only the
information provided in the document context.

If the answer cannot be found in the context,
say:

"I couldn't find this information in the document."

Do not make up information.

DOCUMENT CONTEXT:

{context}

USER QUESTION:

{question}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text