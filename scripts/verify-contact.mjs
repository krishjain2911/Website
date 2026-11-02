import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const DIST = path.resolve('dist');
const ARTIFACT_DIR = path.resolve('C:/Users/msi/.gemini/antigravity/brain/1be0c466-010c-46b9-94c3-e8d9f3259da5/screenshots');

fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

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

server.listen(4323, async () => {
  console.log('Static preview server on 4323');

  const configs = [
    { name: 'contact-1440-light', width: 1440, height: 1000, isDark: false },
    { name: 'contact-1440-dark', width: 1440, height: 1000, isDark: true },
    { name: 'contact-390-light', width: 390, height: 1100, isDark: false },
    { name: 'contact-390-dark', width: 390, height: 1100, isDark: true },
  ];

  for (let idx = 0; idx < configs.length; idx++) {
    const { name, width, height, isDark } = configs[idx];
    const port = 9440 + idx;
    const args = [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--window-size=${width},${height}`,
      '--hide-scrollbars'
    ];
    if (isDark) {
      args.push('--force-dark-mode');
    }
    args.push('http://localhost:4323/#contact');

    const chrome = spawn(CHROME, args);
    await new Promise((r) => setTimeout(r, 2000));

    try {
      const tList = await fetch(`http://localhost:${port}/json/list`).then((r) => r.json());
      const ws = new WebSocket(tList[0].webSocketDebuggerUrl);

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

      await new Promise((r) => (ws.onopen = r));
      await send('Page.enable');
      await send('DOM.enable');

      await send('Page.navigate', { url: 'http://localhost:4323/' });
      await new Promise((r) => setTimeout(r, 2500));

      if (isDark) {
        await send('Emulation.setEmulatedMedia', {
          media: 'screen',
          features: [{ name: 'prefers-color-scheme', value: 'dark' }]
        });
        await send('Runtime.evaluate', {
          expression: `document.documentElement.setAttribute('data-theme', 'dark');`
        });
      } else {
        await send('Emulation.setEmulatedMedia', {
          media: 'screen',
          features: [{ name: 'prefers-color-scheme', value: 'light' }]
        });
        await send('Runtime.evaluate', {
          expression: `document.documentElement.setAttribute('data-theme', 'light');`
        });
      }

      // Scroll to contact section
      await send('Runtime.evaluate', {
        expression: `
          const el = document.getElementById('contact');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
        `
      });
      await new Promise((r) => setTimeout(r, 600));

      // Measure layout shift & bounding box
      const evalResult = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const contactSec = document.getElementById('contact');
            const box = contactSec ? contactSec.getBoundingClientRect() : null;
            const cube = document.querySelector('.contact-cube-wrapper');
            const cubeBox = cube ? cube.getBoundingClientRect() : null;
            const headline = document.getElementById('contact-heading');
            const headBox = headline ? headline.getBoundingClientRect() : null;

            return {
              contactBox: box ? { x: box.left, y: box.top, width: box.width, height: box.height } : null,
              cubeBox: cubeBox ? { x: cubeBox.left, y: cubeBox.top, width: cubeBox.width, height: cubeBox.height } : null,
              headBox: headBox ? { x: headBox.left, y: headBox.top, width: headBox.width, height: headBox.height } : null,
            };
          })()
        `,
        returnByValue: true
      });

      console.log(`[${name}] Elements layout:`, JSON.stringify(evalResult.result?.value));

      // Capture contact section screenshot
      const clipRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const el = document.getElementById('contact');
            const rect = el.getBoundingClientRect();
            return { x: Math.max(0, rect.left), y: Math.max(0, rect.top), width: rect.width, height: rect.height, scale: 1 };
          })()
        `,
        returnByValue: true
      });

      if (clipRes.result?.value) {
        const snap = await send('Page.captureScreenshot', {
          format: 'png',
          clip: { ...clipRes.result.value, scale: 1 }
        });
        const outName = `${name}.png`;
        fs.writeFileSync(path.join(ARTIFACT_DIR, outName), Buffer.from(snap.data, 'base64'));
        console.log(`Saved ${outName}`);
      }

      // If dark mode, also capture close-up zoom of cube
      if (isDark) {
        const cubeClip = await send('Runtime.evaluate', {
          expression: `
            (() => {
              const el = document.querySelector('.contact-cube-wrapper');
              if (!el) return null;
              const rect = el.getBoundingClientRect();
              return { x: Math.max(0, rect.left - 20), y: Math.max(0, rect.top - 20), width: rect.width + 40, height: rect.height + 40, scale: 1 };
            })()
          `,
          returnByValue: true
        });

        if (cubeClip.result?.value) {
          const snapZoom = await send('Page.captureScreenshot', {
            format: 'png',
            clip: { ...cubeClip.result.value, scale: 1 }
          });
          const zoomName = `${name}-zoom.png`;
          fs.writeFileSync(path.join(ARTIFACT_DIR, zoomName), Buffer.from(snapZoom.data, 'base64'));
          console.log(`Saved ${zoomName}`);
        }
      }

      ws.close();
    } catch (e) {
      console.error(`Error testing ${name}:`, e);
    } finally {
      chrome.kill();
    }
  }

  server.close();
  console.log('Done verifying contact section.');
});
