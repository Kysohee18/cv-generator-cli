const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs-extra');
const path = require('path');

(async () => {
    try {
        console.log('Starting CV Generation...');

        // Paths
        const inputPath = path.join(__dirname, 'input', 'data.json');
        const templatePath = path.join(__dirname, 'references', 'template.hbs');
        const outputPath = path.join(__dirname, 'output', 'resume.pdf');

        // 1. Read Data and Template
        console.log('Reading input data and template...');
        const data = await fs.readJson(inputPath);
        const templateHtml = await fs.readFile(templatePath, 'utf-8');

        // 2. Compile HTML
        console.log('Compiling HTML...');
        const template = handlebars.compile(templateHtml);
        const html = template(data);

        // Optional: Save HTML for debugging
        // await fs.writeFile(path.join(__dirname, 'output', 'debug.html'), html);

        // 3. Render PDF
        console.log('Launching browser for PDF rendering...');
        const browser = await puppeteer.launch({
            headless: "new"
        });
        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: 'networkidle0'
        });

        console.log('Generating PDF...');
        await page.pdf({
            path: outputPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0.5in',
                right: '0.5in',
                bottom: '0.5in',
                left: '0.5in'
            }
        });

        await browser.close();

        console.log(`Success! Resume generated at: ${outputPath}`);

    } catch (error) {
        console.error('Error generating CV:', error);
    }
})();
