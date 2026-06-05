# CV Generator (Harvard ATS Style)

A robust CLI tool that converts a Resume Data File (JSON) into a perfectly formatted PDF Resume using the "Harvard ATS Standard" style. Built with Node.js, Puppeteer, and Handlebars.

## 🚀 Features

- **JSON-to-PDF Conversion**: Separation of content (JSON) and design (Handlebars).
- **Harvard ATS Standard**: Follows strict formatting rules (Times New Roman, 11pt, 0.5" margins, clean layout).
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
  └── package.json          # Dependencies
```

## 🛠️ Installation

1.  **Prerequisites**: Ensure you have [Node.js](https://nodejs.org/) installed.
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

## 🎨 Customization

-   **Styling**: Edit `references/template.hbs` to change fonts, spacing, or layout.
-   **Data Structure**: if you add new sections to `data.json`, make sure to add corresponding HTML loops in `template.hbs`.

## 📄 License
Open Source. Feel free to modify and use for your job applications!
