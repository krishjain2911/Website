import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const failuresDir = path.join(rootDir, 'scratch', 'layout-failures');

fs.mkdirSync(failuresDir, { recursive: true });

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
  { width: 1920, height: 1080, name: '1920x1080' },
  { width: 1536, height: 864, name: '1536x864' },
  { width: 1440, height: 900, name: '1440x900' },
  { width: 1366, height: 768, name: '1366x768' },
  { width: 1280, height: 720, name: '1280x720' },
  { width: 1280, height: 650, name: '1280x650' },
  { width: 1024, height: 768, name: '1024x768' },
  { width: 768, height: 1024, name: '768x1024' },
  { width: 414, height: 896, name: '414x896' },
  { width: 390, height: 844, name: '390x844' },
  { width: 360, height: 640, name: '360x640' },
  { width: 844, height: 390, name: '844x390' },
  { width: 1280, height: 720, dpr: 1.5, name: '1280x720@150%' },
  { width: 1280, height: 720, dpr: 2.0, name: '1280x720@200%' }
];

async function runAudit() {
  const PORT = 4349;
  const server = await createStaticServer(PORT);
  console.log(`[LayoutAudit] Server listening on http://localhost:${PORT}`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const failures = [];
  let checksRun = 0;

  try {
    for (const vp of VIEWPORTS) {
      process.stdout.write(`  Auditing ${vp.name.padEnd(16)} ... `);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.dpr || 1
      });
      const page = await context.newPage();

      // 1. Audit Home Page (/)
      await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(150);

      // Check horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1.5;
      });
      checksRun++;
      if (hasHorizontalScroll) {
        failures.push({ vp: vp.name, page: '/', error: 'Horizontal page scroll detected' });
        await page.screenshot({ path: path.join(failuresDir, `hscroll-home-${vp.name}.png`) });
      }

      // Check PEG Section Collisions across 4 phases
      const pegInfo = await page.evaluate(() => {
        const el = document.getElementById('peg-solutions-track');
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          top: rect.top + window.scrollY,
          height: el.offsetHeight
        };
      });

      if (pegInfo && vp.width >= 900 && vp.height >= 640) {
        const phases = [
          { name: 'Phase 0 (Intro)', offset: 30 },
          { name: 'Phase 1 (Plan)', offset: pegInfo.height * 0.28 },
          { name: 'Phase 2 (Engineer)', offset: pegInfo.height * 0.55 },
          { name: 'Phase 3 (Gen-AI)', offset: pegInfo.height * 0.85 }
        ];

        for (const phase of phases) {
          checksRun++;
          await page.evaluate((y) => window.scrollTo(0, y), pegInfo.top + phase.offset);
          await page.waitForTimeout(80);

          const collisions = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('[data-layout]'));
            const rects = [];

            for (const el of elements) {
              const tag = el.getAttribute('data-layout');
              const style = window.getComputedStyle(el);
              const opacity = parseFloat(style.opacity);
              const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && opacity > 0.15;
              const r = el.getBoundingClientRect();

              if (isVisible && r.width > 5 && r.height > 5) {
                if (r.bottom > 0 && r.top < window.innerHeight) {
                  rects.push({ tag, el, rect: { top: r.top, left: r.left, right: r.right, bottom: r.bottom } });
                }
              }
            }

            const overlaps = [];
            for (let i = 0; i < rects.length; i++) {
              for (let j = i + 1; j < rects.length; j++) {
                const a = rects[i];
                const b = rects[j];

                // Ignore parent-child relationships
                if (a.el.contains(b.el) || b.el.contains(a.el)) continue;

                // Check strict bounding collision with 4px threshold
                const xOverlap = Math.max(0, Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left));
                const yOverlap = Math.max(0, Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top));

                if (xOverlap > 4 && yOverlap > 4) {
                  overlaps.push(`${a.tag} collided with ${b.tag} (${Math.round(xOverlap)}x${Math.round(yOverlap)}px)`);
                }
              }
            }
            return overlaps;
          });

          if (collisions.length > 0) {
            const shotName = `collision-${vp.name}-${phase.name.replace(/[^a-z0-9]/gi, '_')}.png`;
            await page.screenshot({ path: path.join(failuresDir, shotName) });
            failures.push({
              vp: vp.name,
              page: `/?phase=${phase.name}`,
              error: collisions.join('; '),
              screenshot: shotName
            });
          }
        }
      }

      // Assert Approach Journey: Guide cube stacking (elementFromPoint) and mobile road gutter
      const approachResult = await page.evaluate(async () => {
        const stage = document.getElementById('approach-journey-stage');
        if (!stage) return { ok: true, skipped: true };

        const isDesktop = window.innerWidth >= 900;
        const cubeId = isDesktop ? 'guide-cube-desktop' : 'guide-cube-mobile';
        const cube = document.getElementById(cubeId);
        if (!cube) return { ok: false, error: `Guide cube #${cubeId} not found` };

        const stops = Array.from(document.querySelectorAll('.journey-stop'));
        if (stops.length === 0) return { ok: false, error: 'No journey stops found' };

        // Test each stop
        for (let i = 0; i < stops.length; i++) {
          const stop = stops[i];
          const pin = stop.querySelector('.road-pin-marker');
          if (pin) {
            pin.scrollIntoView({ block: 'center', behavior: 'instant' });
          } else {
            stop.scrollIntoView({ block: 'center', behavior: 'instant' });
          }

          // Allow scrollStory & lerp animation to smoothly converge cube onto pin
          for (let f = 0; f < 35; f++) {
            window.dispatchEvent(new Event('scroll'));
            await new Promise((r) => requestAnimationFrame(r));
          }

          const rect = cube.getBoundingClientRect();
          if (rect.width < 5 || rect.height < 5) {
            return { ok: false, error: `Stop ${i}: Guide cube has invalid size (${rect.width}x${rect.height}px)` };
          }

          const cx = Math.round(rect.left + rect.width / 2);
          const cy = Math.round(rect.top + rect.height / 2);
          const topEl = document.elementFromPoint(cx, cy);

          if (!topEl || (!cube.contains(topEl) && topEl !== cube)) {
            return {
              ok: false,
              error: `Stop ${i}: elementFromPoint at cube center returned <${topEl?.tagName} class="${topEl?.className}"> instead of cube`
            };
          }

          // On mobile, assert cards do not intersect the 56px road gutter
          if (!isDesktop) {
            const stageRect = stage.getBoundingClientRect();
            const gutterRight = stageRect.left + 56;
            const cards = Array.from(document.querySelectorAll('.stop-content-card'));
            for (const card of cards) {
              const cRect = card.getBoundingClientRect();
              if (cRect.left < gutterRight - 1) {
                return {
                  ok: false,
                  error: `Stop ${i}: Card #${card.id} intersects 56px road gutter (card.left=${Math.round(cRect.left)}px < gutterRight=${Math.round(gutterRight)}px)`
                };
              }
            }
          }
        }

        return { ok: true };
      });

      checksRun++;
      if (!approachResult.ok && !approachResult.skipped) {
        const shotName = `approach-audit-fail-${vp.name}.png`;
        await page.screenshot({ path: path.join(failuresDir, shotName) });
        failures.push({
          vp: vp.name,
          page: '/#approach',
          error: approachResult.error,
          screenshot: shotName
        });
      }

      // Assert PEG cube visibility and elementFromPoint on mobile viewports
      const mobileViewports = ['360x640', '390x844', '414x896', '844x390'];
      if (mobileViewports.includes(vp.name)) {
        checksRun++;
        const cubeResult = await page.evaluate(() => {
          const cubeSection = document.getElementById('solutions');
          const cube = document.getElementById('cube-scene-wrapper');
          if (!cubeSection || !cube) return { ok: false, error: 'Cube or #solutions element not found' };

          // Scroll cube into view centered
          cube.scrollIntoView({ block: 'center', behavior: 'instant' });
          const rect = cube.getBoundingClientRect();
          const style = window.getComputedStyle(cube);
          const opacity = parseFloat(style.opacity);
          const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && opacity > 0;

          if (!isVisible) return { ok: false, error: `Cube is not visible (display: ${style.display}, visibility: ${style.visibility}, opacity: ${opacity})` };
          if (rect.width < 10 || rect.height < 10) return { ok: false, error: `Cube has zero or tiny size (${rect.width}x${rect.height}px)` };

          // Assert inside viewport when section is in view
          const inViewport = rect.top >= 0 && rect.bottom <= window.innerHeight && rect.left >= 0 && rect.right <= window.innerWidth;
          if (!inViewport) return { ok: false, error: `Cube not inside viewport (top: ${Math.round(rect.top)}, bottom: ${Math.round(rect.bottom)}, vh: ${window.innerHeight})` };

          // Assert document.elementFromPoint at its centre returns the cube (or element inside cube)
          const cx = Math.round(rect.left + rect.width / 2);
          const cy = Math.round(rect.top + rect.height / 2);
          const topEl = document.elementFromPoint(cx, cy);
          if (!topEl || (!cube.contains(topEl) && topEl !== cube)) {
            return { ok: false, error: `elementFromPoint at center returned <${topEl?.tagName} class="${topEl?.className}"> instead of cube` };
          }

          return { ok: true };
        });

        if (!cubeResult.ok) {
          const shotName = `mobile-cube-fail-${vp.name}.png`;
          await page.screenshot({ path: path.join(failuresDir, shotName) });
          failures.push({
            vp: vp.name,
            page: '/#solutions',
            error: cubeResult.error,
            screenshot: shotName
          });
        }
      }

      // 2. Audit About Page (/about)
      await page.goto(`http://localhost:${PORT}/about`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(100);

      const aboutHScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1.5;
      });
      checksRun++;
      if (aboutHScroll) {
        failures.push({ vp: vp.name, page: '/about', error: 'Horizontal page scroll on /about' });
        await page.screenshot({ path: path.join(failuresDir, `hscroll-about-${vp.name}.png`) });
      }

      // 3. Audit Solution Detail (/solutions/sonakshi)
      await page.goto(`http://localhost:${PORT}/solutions/sonakshi`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(100);

      const sonakshiHScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1.5;
      });
      checksRun++;
      if (sonakshiHScroll) {
        failures.push({ vp: vp.name, page: '/solutions/sonakshi', error: 'Horizontal page scroll on /solutions/sonakshi' });
        await page.screenshot({ path: path.join(failuresDir, `hscroll-sonakshi-${vp.name}.png`) });
      }

      await context.close();
      console.log('✓');
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\n======================================================`);
  console.log(` Layout Audit Completed: ${checksRun} checks across ${VIEWPORTS.length} viewports`);
  console.log(`======================================================`);

  if (failures.length > 0) {
    console.error(`\n[FAIL] Found ${failures.length} layout issue(s):`);
    failures.forEach((f, idx) => {
      console.error(` ${idx + 1}. [${f.vp}] ${f.page}: ${f.error}`);
    });
    fs.writeFileSync(path.join(failuresDir, 'failures.json'), JSON.stringify(failures, null, 2));
    process.exit(1);
  } else {
    console.log(`\n[PASS] 0 layout collisions, 0 horizontal overflows detected across all tested viewports!`);
    process.exit(0);
  }
}

runAudit().catch((err) => {
  console.error('[LayoutAudit Error]:', err);
  process.exit(1);
});
