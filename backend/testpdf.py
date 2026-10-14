from services.pdf_processor import extract_text_from_pdf


pdf_path = "sample.pdf"

pages = extract_text_from_pdf(pdf_path)

for page in pages:
    print("PAGE:", page["page"])
    print(page["text"][:500])
    print("-" * 50)