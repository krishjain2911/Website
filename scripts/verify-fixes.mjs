import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const refDir = path.join(rootDir, 'ref-90');
const outDir = path.join(rootDir, 'final-100');
const artifactDir = path.resolve('C:/Users/msi/.gemini/antigravity/brain/8f1454a9-2515-439e-82f8-a418871b80b4/final-100');

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });

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

async function main() {
  const PORT = 54352;
  const server = await createStaticServer(PORT);
  console.log(`[Verify] Server listening on http://localhost:${PORT}`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const finalMeasurements = {};
  const fitAudits = {};

  for (const vp of VIEWPORTS) {
    console.log(`\n=== Testing & Capturing ${vp.name} (Plain 100% Zoom: ${vp.w}x${vp.h} @ 1.0 dsf) ===`);
    const context = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: 1.0
    });
    const page = await context.newPage();

    const saveScreenshot = async (name) => {
      const fileName = `${name}-${vp.name}.png`;
      const p1 = path.join(outDir, fileName);
      const p2 = path.join(artifactDir, fileName);
      const buf = await page.screenshot();
      fs.writeFileSync(p1, buf);
      fs.writeFileSync(p2, buf);
      console.log(`  Saved ${fileName}`);
    };

    // 1. Homepage: Hero
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await saveScreenshot('hero');

    // Measure elements
    const measurements = await page.evaluate(() => {
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
    finalMeasurements[vp.name] = measurements;

    // 2. Journey Stops 1 to 6
    const pins = await page.$$('.road-pin-marker');
    for (let i = 0; i < 6; i++) {
      if (pins[i]) {
        await pins[i].scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        await saveScreenshot(`journey-stop-${i + 1}`);
      }
    }

    // 3. PEG Section: Plan, Engineer, Gen-AI
    const tabPlan = await page.$('#tab-peg-plan');
    if (tabPlan) {
      await tabPlan.scrollIntoViewIfNeeded();
      await tabPlan.click();
      await page.waitForTimeout(400);
      await saveScreenshot('peg-plan');
    }

    const tabEngineer = await page.$('#tab-peg-engineer');
    if (tabEngineer) {
      await tabEngineer.click();
      await page.waitForTimeout(400);
      await saveScreenshot('peg-engineer');
    }

    const tabGenAI = await page.$('#tab-peg-genai');
    if (tabGenAI) {
      await tabGenAI.click();
      await page.waitForTimeout(400);
      await saveScreenshot('peg-genai');
    }

    // Audit Screen Fit for PEG panels (especially on 768 and 730 heights)
    const fitCheck = await page.evaluate(() => {
      const vh = window.innerHeight;
      const stage = document.querySelector('.peg-solutions-stage');
      const sRect = stage ? stage.getBoundingClientRect() : null;

      const checkPanel = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          top: r.top,
          bottom: r.bottom,
          height: r.height,
          fitsInViewport: r.bottom <= vh && r.top >= 0,
          bottomClearance: vh - r.bottom
        };
      };

      return {
        viewportHeight: vh,
        stageRect: sRect ? { top: sRect.top, bottom: sRect.bottom, height: sRect.height } : null,
        planFit: checkPanel('#stage-panel-plan'),
        engineerFit: checkPanel('#stage-panel-engineer'),
        genAiFit: checkPanel('#stage-panel-genai')
      };
    });
    fitAudits[vp.name] = fitCheck;
    console.log(`  Fit check for ${vp.name}:`, JSON.stringify(fitCheck, null, 2));

    // 4. Solution Page: /solutions/clm
    await page.goto(`http://localhost:${PORT}/solutions/clm`, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await saveScreenshot('solution-top');

    const solutionStage = await page.$('#stage-01');
    if (solutionStage) {
      await solutionStage.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await saveScreenshot('solution-stage');
    }

    // 5. About Page: /about
    await page.goto(`http://localhost:${PORT}/about`, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    await saveScreenshot('about');

    await context.close();
  }

  fs.writeFileSync(path.join(outDir, 'final-measurements.json'), JSON.stringify(finalMeasurements, null, 2));
  fs.writeFileSync(path.join(artifactDir, 'final-measurements.json'), JSON.stringify(finalMeasurements, null, 2));
  fs.writeFileSync(path.join(outDir, 'fit-audits.json'), JSON.stringify(fitAudits, null, 2));
  fs.writeFileSync(path.join(artifactDir, 'fit-audits.json'), JSON.stringify(fitAudits, null, 2));

  await browser.close();
  server.close();

  console.log('\n[Verify] All screenshots and audit data captured successfully!');
}

main().catch((err) => {
  console.error('[Verify] Error:', err);
  process.exit(1);
});

