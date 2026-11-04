import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const outDir = path.join(rootDir, 'final-peg-verify');

fs.mkdirSync(outDir, { recursive: true });

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

async function run() {
  const port = 4179;
  const server = await createStaticServer(port);
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const viewports = [
    { width: 1440, height: 900, name: '1440x900' },
    { width: 1920, height: 1080, name: '1920x1080' }
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const pegTrack = await page.$('#peg-solutions-track');
    const trackBox = await pegTrack.boundingBox();
    const trackTop = trackBox.y + (await page.evaluate(() => window.scrollY));

    console.log(`\n=== [${vp.name}] PEG Behavior Verification ===`);
    console.log(`Track top: ${trackTop}`);

    // 1. Phase 0: Intro (Cube Centered, Eyebrow strictly above Heading)
    await page.evaluate((top) => window.scrollTo(0, top), trackTop);
    await page.waitForTimeout(600);

    const introHeaderBoxes = await page.evaluate(() => {
      const eyebrow = document.querySelector('.intro-eyebrow');
      const headline = document.querySelector('.intro-headline');
      const subline = document.querySelector('.intro-subline');
      const ebRect = eyebrow ? eyebrow.getBoundingClientRect() : null;
      const hlRect = headline ? headline.getBoundingClientRect() : null;
      const slRect = subline ? subline.getBoundingClientRect() : null;
      return {
        eyebrowBottom: ebRect ? ebRect.bottom : 0,
        headlineTop: hlRect ? hlRect.top : 0,
        headlineBottom: hlRect ? hlRect.bottom : 0,
        sublineTop: slRect ? slRect.top : 0,
        isEyebrowAboveHeadline: ebRect && hlRect ? ebRect.bottom <= hlRect.top + 2 : false
      };
    });
    console.log(`[${vp.name}] Intro layout check (Eyebrow above Headline):`, introHeaderBoxes);

    await page.screenshot({ path: path.join(outDir, `${vp.name}-01-intro-centered.png`) });

    // 2. Further scroll: Transition into Plan Stop
    // Scroll by ~introDist (e.g. 240px)
    await page.evaluate((top) => window.scrollTo(0, top + 260), trackTop);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, `${vp.name}-02-plan-settled.png`) });

    // 3. Scroll into Engineer Stop
    await page.evaluate((top) => window.scrollTo(0, top + 520), trackTop);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, `${vp.name}-03-engineer-stop.png`) });

    // 4. Scroll into Gen-AI Stop
    await page.evaluate((top) => window.scrollTo(0, top + 780), trackTop);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, `${vp.name}-04-genai-stop.png`) });

    // 5. Scroll BACK UP to Intro
    await page.evaluate((top) => window.scrollTo(0, top), trackTop);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, `${vp.name}-05-scrolled-back-to-intro.png`) });

    // Check Stage Pill presence in #solutions
    const pillCheck = await page.evaluate(() => {
      const section = document.getElementById('solutions');
      const stagePill = section ? section.querySelector('.journey-progress-rail, .rail-indicator, [data-stage]') : null;
      const textMatch = section && section.innerText.includes('STAGE 1 / 6');
      return {
        hasPillElement: !!stagePill,
        hasStageText: textMatch
      };
    });
    console.log(`[${vp.name}] Stage pill in #solutions:`, pillCheck);

    await context.close();
  }

  await browser.close();
  server.close();
  console.log('All verification captures completed!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

