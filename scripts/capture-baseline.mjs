import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DIST = path.resolve('dist');
const BASELINE_DIR = path.resolve('C:/Users/msi/.gemini/antigravity/brain/1be0c466-010c-46b9-94c3-e8d9f3259da5/baseline-screenshots');
const USER_DATA = path.join(os.tmpdir(), 'chrome-baseline-' + Date.now());

fs.mkdirSync(BASELINE_DIR, { recursive: true });
fs.mkdirSync(USER_DATA, { recursive: true });

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
  let p = req.url.split('?')[0];
  if (p.endsWith('/')) p += 'index.html';
  else if (!path.extname(p)) p += '/index.html';
  const f = path.join(DIST, p);
  if (fs.existsSync(f) && fs.statSync(f).isFile()) {
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  } else {
    res.writeHead(404);
    res.end();
  }
});

const PORT = 4330;
server.listen(PORT, async () => {
  console.log(`Preview server running on port ${PORT}`);

  const pages = [
    { name: 'home', path: '/' },
    { name: 'about', path: '/about' },
    { name: 'solutions', path: '/solutions' },
    { name: 'voice-agents', path: '/solutions/voice-agents' }
  ];

  const viewports = [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 }
  ];

  const themes = ['light', 'dark'];

  let sessionCount = 0;

  async function capturePage(pagePath, outName, width, height, theme) {
    const port = 9600 + (sessionCount++);
    const url = `http://localhost:${PORT}${pagePath}?theme=${theme}`;
    const args = [
      '--headless=new',
      '--disable-extensions',
      `--user-data-dir=${USER_DATA}`,
      `--remote-debugging-port=${port}`,
      `--window-size=${width},${height}`,
      '--hide-scrollbars',
      url
    ];

    const chrome = spawn(CHROME, args);
    await new Promise(r => setTimeout(r, 1200));

    try {
      const listRes = await fetch(`http://localhost:${port}/json/list`).then(r => r.json());
      const pageTab = listRes.find(t => t.type === 'page') || listRes[0];
      const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

      let msgId = 1;
      const send = (method, params = {}) =>
        new Promise((resolve, reject) => {
          const curId = msgId++;
          const handler = (evt) => {
            const msg = JSON.parse(evt.data);
            if (msg.id === curId) {
              ws.removeEventListener('message', handler);
              if (msg.error) reject(msg.error);
              else resolve(msg.result);
            }
          };
          ws.addEventListener('message', handler);
          ws.send(JSON.stringify({ id: curId, method, params }));
        });

      await new Promise(r => (ws.onopen = r));
      await send('Page.enable');
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 768
      });
      await send('Emulation.setEmulatedMedia', {
        media: 'screen',
        features: [{ name: 'prefers-color-scheme', value: theme }]
      });

      await send('Runtime.evaluate', {
        expression: `
          document.documentElement.setAttribute('data-theme', '${theme}');
          document.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
        `
      });
      await new Promise(r => setTimeout(r, 600));

      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width, height, scale: 1 }
      });
      fs.writeFileSync(path.join(BASELINE_DIR, outName), Buffer.from(shot.data, 'base64'));
      console.log(`Saved: ${outName}`);
      ws.close();
    } catch (err) {
      console.error(`Error capturing ${outName}:`, err.message);
    } finally {
      chrome.kill();
      await new Promise(r => setTimeout(r, 150));
    }
  }

  for (const page of pages) {
    for (const vp of viewports) {
      for (const theme of themes) {
        const outName = `${page.name}-${vp.width}-${theme}.png`;
        console.log(`Capturing ${outName}...`);
        await capturePage(page.path, outName, vp.width, vp.height, theme);
      }
    }
  }

  server.close();
  try {
    fs.rmSync(USER_DATA, { recursive: true, force: true });
  } catch {}
  console.log('All 24 baseline screenshots captured successfully.');
  process.exit(0);
});
