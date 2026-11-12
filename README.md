# CV Generator (ATS-Oriented Style)

A CLI tool that converts resume data from JSON into PDF and extracts selectable PDF text into Markdown. The template uses a simple, text-focused layout; ATS compatibility can vary by parser.

## 🚀 Features

- **JSON-to-PDF Conversion**: Separation of content (JSON) and design (Handlebars).
- **PDF-to-Markdown Extraction**: Extracts selectable text, groups it by page and line, and lists clickable links. Scanned PDFs need OCR.
- **Advanced PDF Parsing**: Optional Docling engine adds layout-aware reading order, tables, and OCR support.
- **Text-focused layout**: Uses Times New Roman, 11pt body text, and 0.5" margins.
- **Automated Formatting**: Automatically handles layout for education, experience, projects, skills, and certificates.
- **Hyperlink Support**: Clickable links for email, LinkedIn, and GitHub.

## 📂 Project Structure

```
/cv-generator
  ├── input/
  │   └── data.json         # Your resume content (EDIT THIS)
  ├── output/
  │   └── resume.pdf        # The generated PDF
  ├── references/
  │   └── template.hbs      # HTML/HB template for styling
  ├── convert.js            # Main logic script
  ├── pdf-to-markdown.js    # PDF text extraction script
  ├── pdf_to_markdown_docling.py # Optional layout parser bridge
  ├── requirements-advanced.txt # Optional Python dependencies
  └── package.json          # Dependencies
```

## 🛠️ Installation

1.  **Prerequisites**: Ensure you have Node.js 20 or newer installed.
2.  **Install Dependencies**:
    Open a terminal in this folder and run:
    ```bash
    npm install
    ```

## ✍️ Usage

1.  **Edit Content**:
    Open `input/data.json` and update it with your personal information.
    -   *Tip: Keep the structure (header, experience, projects, etc.) intact.*

2.  **Generate PDF**:
    Run the following command in your terminal:
    ```bash
    node convert.js
    ```

3.  **View Output**:
    Your new resume will be available at `output/resume.pdf`.

4.  **Convert PDF to Markdown**:
    ```bash
    node pdf-to-markdown.js output/resume.pdf
    ```
    This creates `output/resume.md`. Pass a second path to choose another output file.

    For layout-aware parsing, install Python 3.10+ and Docling in a local virtual environment:
    ```bash
    py -3 -m venv .venv
    .venv\Scripts\python.exe -m pip install -r requirements-advanced.txt
    node pdf-to-markdown.js output/resume.pdf output/resume.md --engine docling
    ```
    Docling downloads models on first use. OCR needs an available OCR engine. See [Docling setup](https://docling-project.github.io/docling/getting_started/installation/).

## 🎨 Customization

-   **Styling**: Edit `references/template.hbs` to change fonts, spacing, or layout.
-   **Data Structure**: if you add new sections to `data.json`, make sure to add corresponding HTML loops in `template.hbs`.

## 📄 License
Open Source. Feel free to modify and use for your job applications!
