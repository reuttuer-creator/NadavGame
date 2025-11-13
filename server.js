// Simple HTTP server for testing locally
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`📥 ${req.method} ${req.url}`);

    // Default to index.html
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                console.log(`❌ File not found: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                console.log(`❌ Server error: ${error.code}`);
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            console.log(`✅ Serving: ${filePath}`);
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║   🎮 Dice Evasion Game - Local Server   ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log('');
    console.log(`🚀 Server running at: http://localhost:${PORT}/`);
    console.log('');
    console.log('📝 Available pages:');
    console.log(`   • Main Game:        http://localhost:${PORT}/`);
    console.log(`   • Version Check:    http://localhost:${PORT}/test-version.html`);
    console.log('');
    console.log('⚙️  Press Ctrl+C to stop the server');
    console.log('');
});

