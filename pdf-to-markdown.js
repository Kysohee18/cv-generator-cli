const fs = require('fs-extra');
const path = require('path');
const { spawnSync } = require('child_process');

const groupIntoLines = (items, pageWidth) => {
    const lines = [];

    for (const item of items) {
        if (!item.str || !item.str.trim() || !Array.isArray(item.transform)) continue;

        const y = item.transform[5];
        let line = lines.find(candidate => Math.abs(candidate.y - y) <= 2);
        if (!line) {
            line = { y, items: [] };
            lines.push(line);
        }
        line.items.push({
            x: item.transform[4],
            width: item.width || 0,
            text: item.str
        });
    }

    return lines
        .sort((a, b) => b.y - a.y)
        .map(line => {
            const parts = line.items.sort((a, b) => a.x - b.x);
            let text = '';
            let previous;

            for (const part of parts) {
                const currentText = part.text.trim();
                if (!currentText) continue;

                if (previous && !/\s$/.test(text) && !/^\s/.test(part.text)) {
                    const gap = part.x - (previous.x + previous.width);
                    text += gap > 80 || part.x > pageWidth * 0.65 ? ' | ' : ' ';
                }

                text += currentText;
                previous = part;
            }

            return {
                text: text.replace(/\s+/g, ' ').trim(),
                x: parts[0]?.x || 0,
                endX: parts.reduce((end, part) => Math.max(end, part.x + part.width), 0)
            };
        })
        .filter(line => line.text);
};

const formatLine = (line) => {
    const bullet = line.match(/^[•●▪◦]\s*(.*)$/);
    if (bullet) return `- ${bullet[1]}`;

    const letters = line.match(/[A-Z]/g);
    if (letters && line === line.toUpperCase() && line.length <= 90) {
        return `## ${line}`;
    }

    return line;
};

const formatPageLines = (lines, pageWidth) => {
    if (!lines.length) return [];

    const leftEdge = Math.min(...lines.map(line => line.x));
    const output = [];
    let previousLine;
    let previousWasBullet = false;

    for (const line of lines) {
        const isIndentedListLine = line.x > leftEdge + 8 && line.x < leftEdge + 20;
        if (isIndentedListLine) {
            if (previousWasBullet && previousLine.endX > pageWidth - 75) {
                output[output.length - 1] += ` ${line.text}`;
            } else {
                output.push(`- ${line.text}`);
            }
            previousWasBullet = true;
        } else {
            output.push(formatLine(line.text));
            previousWasBullet = false;
        }
        previousLine = line;
    }

    return output;
};

const extractPdfLinks = async (inputPath) => {
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const buffer = await fs.readFile(inputPath);
    const loadingTask = getDocument({ data: new Uint8Array(buffer) });

    try {
        const pdf = await loadingTask.promise;
        const links = new Set();
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            const page = await pdf.getPage(pageNumber);
            const annotations = await page.getAnnotations();
            for (const annotation of annotations) {
                if (typeof annotation.url === 'string' && /^(https?:|mailto:)/i.test(annotation.url)) {
                    links.add(annotation.url);
                }
            }
            page.cleanup();
        }
        return [...links];
    } finally {
        await loadingTask.destroy();
    }
};

const convertPdfToMarkdown = async (inputPath) => {
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const buffer = await fs.readFile(inputPath);
    const loadingTask = getDocument({ data: new Uint8Array(buffer) });

    try {
        const pdf = await loadingTask.promise;
        const pages = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            const page = await pdf.getPage(pageNumber);
            const { items } = await page.getTextContent();
            const pageWidth = page.getViewport({ scale: 1 }).width;
            const lines = groupIntoLines(items, pageWidth);
            const markdownLines = formatPageLines(lines, pageWidth);
        const annotations = await page.getAnnotations();
        const links = annotations
            .map(annotation => annotation.url)
            .filter(url => typeof url === 'string' && /^(https?:|mailto:)/i.test(url));

            if (links.length) {
                markdownLines.push('', '### Links', ...links.map(url => `- <${url}>`));
            }
            if (markdownLines.length) pages.push(markdownLines.join('\n'));
            page.cleanup();
        }

        if (!pages.length) {
            throw new Error('PDF has no selectable text. Scanned PDFs need OCR.');
        }

        return pages.join('\n\n---\n\n') + '\n';
    } finally {
        await loadingTask.destroy();
    }
};

const convertWithDocling = (inputPath, outputPath) => {
    const pythonScript = path.join(__dirname, 'pdf_to_markdown_docling.py');
    const localPython = process.platform === 'win32'
        ? path.join(__dirname, '.venv', 'Scripts', 'python.exe')
        : path.join(__dirname, '.venv', 'bin', 'python');
    const pythonCommand = process.env.PYTHON
        || (fs.existsSync(localPython) ? localPython : (process.platform === 'win32' ? 'py' : 'python3'));
    const pythonArgs = process.platform === 'win32' && !process.env.PYTHON && pythonCommand === 'py' ? ['-3'] : [];
    const result = spawnSync(pythonCommand, [...pythonArgs, pythonScript, inputPath, outputPath], {
        stdio: 'inherit',
        windowsHide: true
    });

    if (result.error) {
        throw new Error(`Cannot start Python (${pythonCommand}). Install Python 3.10+ and Docling first.`);
    }
    if (result.status !== 0) {
        throw new Error(`Docling conversion failed with exit code ${result.status ?? 'unknown'}.`);
    }
};

(async () => {
    const args = process.argv.slice(2);
    const engineIndex = args.indexOf('--engine');
    const engine = engineIndex >= 0 ? args[engineIndex + 1] : 'pdfjs';
    if (engineIndex >= 0) args.splice(engineIndex, 2);

    const inputPath = args[0];
    const outputPath = args[1]
        ? path.resolve(args[1])
        : inputPath && path.join(path.dirname(path.resolve(inputPath)), `${path.parse(inputPath).name}.md`);

    if (!inputPath || args.length > 2 || !['pdfjs', 'docling'].includes(engine)) {
        console.error('Usage: node pdf-to-markdown.js <input.pdf> [output.md] [--engine pdfjs|docling]');
        process.exitCode = 1;
        return;
    }

    try {
        await fs.ensureDir(path.dirname(outputPath));
        if (engine === 'docling') {
            convertWithDocling(path.resolve(inputPath), outputPath);
            const links = await extractPdfLinks(path.resolve(inputPath));
            if (links.length) {
                await fs.appendFile(outputPath, `\n\n## Links\n${[...new Set(links)].map(url => `- <${url}>`).join('\n')}\n`, 'utf8');
            }
        } else {
            const markdown = await convertPdfToMarkdown(path.resolve(inputPath));
            await fs.writeFile(outputPath, markdown, 'utf8');
        }
        console.log(`Markdown created: ${outputPath}`);
    } catch (error) {
        console.error('Error converting PDF:', error.message);
        process.exitCode = 1;
    }
})();
