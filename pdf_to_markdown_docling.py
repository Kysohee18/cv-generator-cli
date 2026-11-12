import html
import sys
from pathlib import Path


def main():
    if len(sys.argv) != 3:
        raise ValueError("Usage: pdf_to_markdown_docling.py <input.pdf> <output.md>")

    from docling.document_converter import DocumentConverter
    from docling_core.types.doc import ContentLayer

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    result = DocumentConverter().convert(input_path)
    markdown = html.unescape(result.document.export_to_markdown(
        included_content_layers={ContentLayer.BODY, ContentLayer.FURNITURE}
    ))

    if not markdown.strip():
        raise ValueError("Docling returned no Markdown content.")

    output_path.write_text(markdown, encoding="utf-8")
    result.input.release()


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Docling error: {error}", file=sys.stderr)
        sys.exit(1)
