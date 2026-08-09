// PDF Tools Server — handles PDF→Word and PDF→Image conversions
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const PORT = process.env.PORT || 4000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Clean up old files every hour
setInterval(() => {
  const now = Date.now();
  fs.readdirSync(UPLOAD_DIR).forEach(f => {
    const fp = path.join(UPLOAD_DIR, f);
    if (now - fs.statSync(fp).mtimeMs > 3600000) fs.unlinkSync(fp);
  });
}, 3600000);

const server = http.createServer((req, res) => {
  // API routes
  if (req.method === 'POST' && req.url === '/api/ai') {
    return handleAI(req, res);
  }
  if (req.method === 'POST' && req.url === '/api/to-word') {
    return handleConvert(req, res, 'word');
  }
  if (req.method === 'POST' && req.url === '/api/to-image') {
    return handleConvert(req, res, 'image');
  }

  // Static file server (for dev — use nginx/Vercel in prod)
  let filePath = path.join(__dirname, '..', 'public', req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
      res.end(data);
    }
  });
});

function handleConvert(req, res, type) {
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    const buffer = Buffer.concat(chunks);
    // Parse multipart boundary
    const contentType = req.headers['content-type'];
    const boundaryMatch = contentType.match(/boundary=(.+)/);
    if (!boundaryMatch) { res.writeHead(400); res.end('No boundary'); return; }
    const boundary = boundaryMatch[1].replace(/^["']|["']$/g, '');

    // Find file part between boundaries
    const bufStr = buffer.toString('binary');
    const boundaryDelim = '--' + boundary;
    const parts = bufStr.split(boundaryDelim);
    const filePart = parts.find(p => p.includes('filename='));
    if (!filePart) { res.writeHead(400); res.end('No file'); return; }

    // Extract binary data after headers
    const headerEnd = filePart.indexOf('\r\n\r\n');
    if (headerEnd === -1) { res.writeHead(400); res.end('Bad format'); return; }
    let fileData = filePart.slice(headerEnd + 4);
    // Trim trailing \r\n and any remaining boundary markers
    fileData = fileData.replace(/\r\n--\r\n$/, '').replace(/\r\n$/, '');
    const fileBuffer = Buffer.from(fileData, 'binary');

    const id = crypto.randomBytes(8).toString('hex');
    const inPath = path.join(UPLOAD_DIR, `${id}.pdf`);
    fs.writeFileSync(inPath, fileBuffer);

    try {
      if (type === 'word') {
        const outPath = path.join(UPLOAD_DIR, `${id}.docx`);
        execSync(`python3 "${path.join(__dirname, 'convert.py')}" word "${inPath}" "${outPath}"`, { timeout: 30000 });
        if (!fs.existsSync(outPath)) throw new Error('Word file not created');
        const data = fs.readFileSync(outPath);
        res.writeHead(200, { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        res.end(data);
        fs.unlinkSync(inPath); fs.unlinkSync(outPath);
      } else {
        const outDir = path.join(UPLOAD_DIR, id);
        fs.mkdirSync(outDir);
        execSync(`python3 "${path.join(__dirname, 'convert.py')}" image "${inPath}" "${outDir}"`, { timeout: 30000 });
        execSync(`cd "${UPLOAD_DIR}" && zip -r ${id}.zip ${id}`, { timeout: 10000 });
        const zipPath = path.join(UPLOAD_DIR, `${id}.zip`);
        const data = fs.readFileSync(zipPath);
        res.writeHead(200, { 'Content-Type': 'application/zip' });
        res.end(data);
        fs.unlinkSync(inPath); fs.unlinkSync(zipPath);
        fs.rmSync(outDir, { recursive: true });
      }
    } catch(e) {
      console.error('Convert error:', e.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Conversion failed: ${e.message}`);
    }
  });
}

// AI endpoint: receives text, calls DeepSeek, returns result. PDF files never uploaded.
function handleAI(req, res) {
  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', async () => {
    try {
      const { text, mode, question } = JSON.parse(Buffer.concat(chunks).toString());
      if (!text || text.length < 10) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Text too short' }));
      }

      // Truncate to avoid token limits (DeepSeek 128K context)
      const maxChars = 80000;
      const truncated = text.length > maxChars ? text.slice(0, maxChars) + '\n...(truncated)' : text;

      let prompt;
      if (mode === 'summarize') {
        prompt = `Summarize the following document in 3-5 bullet points. Be concise. Language: same as the document.\n\n${truncated}`;
      } else {
        prompt = `Answer the following question based on the document content. Be concise and accurate. If the answer is not in the document, say so.\n\nDocument:\n${truncated}\n\nQuestion: ${question}`;
      }

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-0c59dcb722394742afc6877efd2b7bec'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const result = data.choices[0].message.content;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ result }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  });
}

server.listen(PORT, () => {
  console.log(`\n  📄 PDF Tools Server`);
  console.log(`  ──────────────────`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  API: POST /api/to-word, POST /api/to-image\n`);
});
