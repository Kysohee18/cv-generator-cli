const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => {
    return new Promise(resolve => rl.question(query, resolve));
};

(async () => {
    try {
        console.log('Starting CV Generation...');

        console.log('\n--- Pilihan Versi CV ---');
        console.log('1. Versi Lengkap (Standard)');
        console.log('2. Versi Tanpa Pengalaman & Tanpa Nomor Telepon');
        let choice = await askQuestion('Masukkan pilihan Anda (1 atau 2): ');
        
        while (choice !== '1' && choice !== '2') {
            console.log('Pilihan tidak valid.');
            choice = await askQuestion('Masukkan pilihan Anda (1 atau 2): ');
        }
        
        rl.close();

        // Paths
        const inputPath = path.join(__dirname, 'input', 'data.json');
        const templatePath = path.join(__dirname, 'references', 'template.hbs');
        const outputPath = path.join(__dirname, 'output', 'resume.pdf');

        // 1. Read Data and Template
        console.log('Reading input data and template...');
        const data = await fs.readJson(inputPath);
        
        if (choice === '2') {
            console.log('Memodifikasi data: Menghapus Experience dan Nomor Telepon...');
            delete data.experience;
            if (data.header && data.header.contact) {
                delete data.header.contact.phone;
            }
        }
        
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
