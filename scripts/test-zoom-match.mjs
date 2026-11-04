import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const refDir = path.join(rootDir, 'ref-90');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2'
};

function createStaticServer(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        let reqPath = decodeURIComponent(req.url.split('?')[0]);
        if (reqPath.endsWith('/')) reqPath += 'index.html';
        else if (!path.extname(reqPath)) reqPath += '/index.html';

        const filePath = path.join(distDir, reqPath);
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath).toLowerCase();
          res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
          fs.createReadStream(filePath).pipe(res);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found');
        }
      } catch (e) {
        res.writeHead(500);
        res.end(e.message);
      }
    });

    server.listen(port, () => resolve(server));
    server.on('error', reject);
  });
}

const VIEWPORTS = [
  { w: 1366, h: 768, name: '1366x768' },
  { w: 1440, h: 900, name: '1440x900' },
  { w: 1536, h: 730, name: '1536x730' },
  { w: 1920, h: 1080, name: '1920x1080' }
];

async function run() {
  const PORT = 54351;
  const server = await createStaticServer(PORT);
  const refData = JSON.parse(fs.readFileSync(path.join(refDir, 'measurements.json'), 'utf8'));

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  console.log('\n--- Comparing Plain 100% Zoom against ref-90 Measurements ---');

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: 1.0 // PLAIN 100% ZOOM
    });
    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const live = await page.evaluate(() => {
      const getBBox = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { width: r.width, height: r.height, top: r.top, left: r.left };
      };

      const logo = getBBox('.brand-logo-link');
      const navLink = getBBox('.desktop-nav .nav-link span');
      const headline = getBBox('.hero-headline');
      const cube = getBBox('#cube-scene-wrapper') || getBBox('.cube-viewport') || getBBox('#stage-cube-col');
      const card = getBBox('.stage-card');
      const container = getBBox('.container');
      const pill = getBBox('#journey-progress-rail');

      return {
        navLogoWidth: logo ? logo.width : null,
        navTextHeight: navLink ? navLink.height : null,
        heroHeadlineHeight: headline ? headline.height : null,
        cubeWidth: cube ? cube.width : null,
        projectCardWidth: card ? card.width : null,
        containerWidth: container ? container.width : null,
        stagePillHeight: pill ? pill.height : null
      };
    });

    const ref = refData[vp.name];
    console.log(`\nViewport ${vp.name}:`);
    for (const key of Object.keys(live)) {
      const diff = Math.abs(live[key] - ref[key]);
      const pass = diff <= 2;
      console.log(`  ${key}: live=${live[key]?.toFixed(2)}, ref=${ref[key]?.toFixed(2)}, diff=${diff.toFixed(2)}px -> ${pass ? 'PASS' : 'FAIL'}`);
    }

    await context.close();
  }

  await browser.close();
  server.close();
}

run().catch(console.error);

