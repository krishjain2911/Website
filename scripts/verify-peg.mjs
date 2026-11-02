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

server.listen(4322, async () => {
  console.log('Static preview server on 4322');

  const runTest = async (width, height, isDark, label) => {
    const port = 9330 + (isDark ? 1 : 0) + (width === 390 ? 2 : 0);
    const args = [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--window-size=${width},${height}`,
      '--hide-scrollbars'
    ];
    if (isDark) {
      args.push('--force-dark-mode');
    }
    args.push('http://localhost:4322/#peg-cube');

    const chrome = spawn(CHROME, args);
    await new Promise((r) => setTimeout(r, 2000));

    try {
      const tList = await fetch(`http://localhost:${port}/json/list`).then((r) => r.json());
      const ws = new WebSocket(tList[0].webSocketDebuggerUrl);

      let id = 1;
      const send = (method, params = {}) =>
        new Promise((resolve, reject) => {
          const curId = id++;
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

      // Scroll to peg-cube section
      await send('Runtime.evaluate', {
        expression: `
          const el = document.getElementById('peg-cube');
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        `
      });
      await new Promise((r) => setTimeout(r, 600));

      // Test Plan Card interactions & heights
      const metrics = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const planCard = document.getElementById('peg-card-plan');
            const engCard = document.getElementById('peg-card-engineer');
            const genaiCard = document.getElementById('peg-card-genai');
            const planBox = planCard ? planCard.getBoundingClientRect() : null;

            // Check Plan font sizes
            const texts = planCard ? Array.from(planCard.querySelectorAll('h4, p, button, span')) : [];
            const fontSizes = texts.map(t => {
              const fs = window.getComputedStyle(t).fontSize;
              return { tag: t.tagName, class: t.className, fs: parseFloat(fs) };
            });
            const sub14 = fontSizes.filter(f => f.fs < 13.9);

            return {
              planHeight: planBox ? planBox.height : 0,
              sub14Count: sub14.length,
              sub14Details: sub14
            };
          })()
        `,
        returnByValue: true
      });

      console.log(`[${label}] Plan metrics:`, JSON.stringify(metrics.result?.value));

      // Capture screenshot of Plan panel
      const clipPlan = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const el = document.getElementById('peg-cube');
            const rect = el.getBoundingClientRect();
            return { x: rect.left, y: rect.top, width: rect.width, height: rect.height, scale: 1 };
          })()
        `,
        returnByValue: true
      });

      if (clipPlan.result?.value) {
        const snapPlan = await send('Page.captureScreenshot', {
          format: 'png',
          clip: { ...clipPlan.result.value, scale: 1 }
        });
        fs.writeFileSync(path.join(ARTIFACT_DIR, `peg-plan-${label}.png`), Buffer.from(snapPlan.data, 'base64'));
        console.log(`Saved peg-plan-${label}.png`);
      }

      // Switch to Engineer tab
      await send('Runtime.evaluate', {
        expression: `
          const btn = document.getElementById('tab-peg-engineer');
          if (btn) btn.click();
        `
      });
      await new Promise((r) => setTimeout(r, 1200)); // wait for spoke animation

      // Capture screenshot of Engineer panel
      const clipEng = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const el = document.getElementById('peg-cube');
            const rect = el.getBoundingClientRect();
            return { x: rect.left, y: rect.top, width: rect.width, height: rect.height, scale: 1 };
          })()
        `,
        returnByValue: true
      });

      if (clipEng.result?.value) {
        const snapEng = await send('Page.captureScreenshot', {
          format: 'png',
          clip: { ...clipEng.result.value, scale: 1 }
        });
        fs.writeFileSync(path.join(ARTIFACT_DIR, `peg-engineer-${label}.png`), Buffer.from(snapEng.data, 'base64'));
        console.log(`Saved peg-engineer-${label}.png`);
      }

      // Switch to Gen-AI tab
      await send('Runtime.evaluate', {
        expression: `
          const btn = document.getElementById('tab-peg-genai');
          if (btn) btn.click();
        `
      });
      await new Promise((r) => setTimeout(r, 1200));

      // Capture screenshot of Gen-AI panel
      const clipGenAI = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const el = document.getElementById('peg-cube');
            const rect = el.getBoundingClientRect();
            return { x: rect.left, y: rect.top, width: rect.width, height: rect.height, scale: 1 };
          })()
        `,
        returnByValue: true
      });

      if (clipGenAI.result?.value) {
        const snapGenAI = await send('Page.captureScreenshot', {
          format: 'png',
          clip: { ...clipGenAI.result.value, scale: 1 }
        });
        fs.writeFileSync(path.join(ARTIFACT_DIR, `peg-genai-${label}.png`), Buffer.from(snapGenAI.data, 'base64'));
        console.log(`Saved peg-genai-${label}.png`);
      }

      ws.close();
    } catch (err) {
      console.error(`Error during ${label}:`, err);
    } finally {
      chrome.kill();
    }
  };

  await runTest(1440, 1600, false, '1440-light');
  await runTest(1440, 1600, true, '1440-dark');
  await runTest(390, 1800, false, '390-light');
  await runTest(390, 1800, true, '390-dark');

  console.log('All PEG tests & captures completed.');
  server.close();
  process.exit(0);
});

