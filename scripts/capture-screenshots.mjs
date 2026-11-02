import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DIST = path.resolve('dist');
const OUT_DIR = path.resolve('scratch-screenshots');
fs.mkdirSync(OUT_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  else if (!path.extname(reqPath)) reqPath += '/index.html';
  const filePath = path.join(DIST, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(4321, () => {
  console.log('Static preview server running on port 4321');

  const configs = [
    { name: 'about-1440-light', width: 1440, height: 2600, theme: 'light' },
    { name: 'about-1440-dark', width: 1440, height: 2600, theme: 'dark' },
    { name: 'about-390-light', width: 390, height: 3400, theme: 'light' },
    { name: 'about-390-dark', width: 390, height: 3400, theme: 'dark' },
  ];

  for (const cfg of configs) {
    const outPath = path.join(OUT_DIR, `${cfg.name}.png`);
    const themeArg = cfg.theme === 'dark' ? '--force-dark-mode' : '';
    const cmd = `"${CHROME}" --headless=new --screenshot="${outPath}" --window-size=${cfg.width},${cfg.height} ${themeArg} --hide-scrollbars http://localhost:4321/about`;
    try {
      console.log(`Capturing ${cfg.name}...`);
      execSync(cmd, { stdio: 'ignore' });
      console.log(`Saved ${cfg.name}.png`);
    } catch (e) {
      console.error(`Failed ${cfg.name}:`, e.message);
    }
  }

  server.close();
  console.log('All screenshots captured successfully.');
});

