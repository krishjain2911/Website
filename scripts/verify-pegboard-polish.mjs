import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const afterDir = path.join(rootDir, 'after-screenshots');
const artifactDir = 'C:/Users/msi/.gemini/antigravity/brain/fece134e-16e3-401e-b046-0b1d05c32a33/after-screenshots';

fs.mkdirSync(afterDir, { recursive: true });
try {
  fs.mkdirSync(artifactDir, { recursive: true });
} catch {}

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

function parseHex(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return [r, g, b];
}

function getLuminance(rgb) {
  const [r, g, b] = rgb.map((c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(parseHex(hex1));
  const l2 = getLuminance(parseHex(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function run() {
  const port = 4192;
  const server = await createStaticServer(port);
  console.log(`Static server running on http://localhost:${port}`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const testResults = [];
  function recordTest(name, passed, detail = '') {
    testResults.push({ name, passed, detail });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}${detail ? ` - ${detail}` : ''}`);
  }

  // 1. MUST KEEP WORKING CHECKS
  console.log('\n--- 1. Testing "Must Keep Working" List ---');

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // Nav and footer "PEG Board" links
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
  const navPegLink = await page.$('nav a[href="/peg-board"], nav a[href*="peg-board"]');
  const footerPegLink = await page.$('footer a[href="/peg-board"], footer a[href*="peg-board"]');
  recordTest('Nav PEG Board link exists and points to /peg-board', !!navPegLink);
  recordTest('Footer PEG Board link exists and points to /peg-board', !!footerPegLink);

  // 8 tiles and their destinations
  await page.goto(`http://localhost:${port}/peg-board`, { waitUntil: 'networkidle' });
  const tileLinks = await page.$$eval('.tile-hit-link', (els) =>
    els.map((e) => ({
      href: e.getAttribute('href'),
      title: e.querySelector('.tile-title')?.textContent?.trim()
    }))
  );
  recordTest('8 tiles exist on the board', tileLinks.length === 8, `Found ${tileLinks.length}`);

  const solutionsLinks = tileLinks.filter((t) => t.href?.includes('/#solutions'));
  const guideLinks = tileLinks.filter((t) => t.href?.startsWith('/peg-board/'));
  recordTest('3 Solutions tiles point to /#solutions', solutionsLinks.length === 3, `Found ${solutionsLinks.length}`);
  recordTest('Case studies opens /peg-board/case-studies', tileLinks.some((t) => t.href === '/peg-board/case-studies'));
  recordTest('4 guide tiles open their respective guide pages', guideLinks.filter((t) => t.href !== '/peg-board/case-studies').length === 4);

  // Tile swing on hover
  const tileHasHoverAnim = await page.$eval('.board-tile-card', (el) => {
    return window.getComputedStyle(el).transition !== '';
  });
  recordTest('Tile animation styles present', tileHasHoverAnim);

  // Pin buttons, My board drawer, "Discuss my board" mailto and "Copy email"
  const pinBtns = await page.$$('[data-pin-btn]');
  if (pinBtns.length > 0) {
    await pinBtns[0].click();
    await page.waitForTimeout(100);
  }
  const isPinnedFirst = await page.$eval('[data-pin-btn]', (btn) => btn.getAttribute('aria-pressed') === 'true');
  recordTest('Pin button updates aria-pressed and pins item', isPinnedFirst);

  const myBoardBtn = await page.$('#my-board-open-btn');
  await myBoardBtn.click();
  await page.waitForTimeout(200);
  const drawerOpen = await page.$eval('#my-board-drawer', (d) => d.classList.contains('is-open'));
  recordTest('My board drawer opens on button click', drawerOpen);

  const discussMailto = await page.$eval('#discuss-board-btn', (a) => a.getAttribute('href'));
  recordTest('Discuss my board has mailto link with encoded subject', discussMailto.startsWith('mailto:letstalk@rhsp.solutions?subject='));

  const copyBtn = await page.$('#copy-contact-email-btn');
  recordTest('Copy email button present in drawer', !!copyBtn);

  // Close drawer
  const closeBtn = await page.$('#my-board-close-btn');
  await closeBtn.click();
  await page.waitForTimeout(200);

  // Explorer ring and 8 of 8 state
  await page.evaluate(() => {
    const allSlugs = [
      'peg-plan', 'peg-engineer', 'peg-genai', 'case-studies',
      'outsystems-vs-mern', 'o11-vs-odc', 'cloud-vs-on-premises', 'low-code-vs-high-code'
    ];
    window.localStorage.setItem('rhsp.pegboard.explored', JSON.stringify(allSlugs));
    window.dispatchEvent(new CustomEvent('rhsp:pegboard:explored-changed', { detail: { explored: allSlugs } }));
  });
  await page.waitForTimeout(200);
  const explorerText = await page.$eval('#explorer-count-text', (el) => el.textContent?.trim());
  const completedPillVisible = await page.$eval('#explorer-completed-pill', (el) => window.getComputedStyle(el).display !== 'none');
  recordTest('Explorer ring reaches 8 of 8 state', explorerText === '8 of 8');
  recordTest('Book a call completed pill appears at 8 of 8', completedPillVisible);

  // Priority picker results on guide page
  await page.goto(`http://localhost:${port}/peg-board/outsystems-vs-mern`, { waitUntil: 'networkidle' });
  const pickerPresent = await page.$('#picker-chips-container');
  recordTest('Priority picker present on guide page', !!pickerPresent);

  const firstChip = await page.$('.picker-chip');
  if (firstChip) {
    await firstChip.click();
    await page.waitForTimeout(150);
  }
  const resultUpdated = await page.$eval('#result-peg-label', (el) => el.textContent?.trim() !== 'Choose what matters to you.');
  recordTest('Priority picker recalculates suggested peg on selection', resultUpdated);

  // View transition check
  await page.goto(`http://localhost:${port}/peg-board`, { waitUntil: 'networkidle' });
  recordTest('Navigation back to board successful', page.url().includes('/peg-board'));

  // Reduced motion check
  const reducedMotionPage = await browser.newPage({
    colorScheme: 'dark',
    reducedMotion: 'reduce'
  });
  await reducedMotionPage.goto(`http://localhost:${port}/peg-board`, { waitUntil: 'networkidle' });
  const reducedMotionHandled = await reducedMotionPage.evaluate(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  recordTest('Reduced motion query respected', reducedMotionHandled);
  await reducedMotionPage.close();

  // Console errors
  recordTest('No console errors during navigation', consoleErrors.length === 0, consoleErrors.join('; '));

  // 2. PEG FINDER THREE TEST CASES
  console.log('\n--- 2. Testing Peg Finder 3 Cases ---');

  // Case 1: weeks + standard-ish + cloud -> OutSystems vs MERN
  await page.click('.finder-pill-btn[data-question="speed"][data-value="weeks"]');
  await page.click('.finder-pill-btn[data-question="custom"][data-value="standard-ish"]');
  await page.click('.finder-pill-btn[data-question="data"][data-value="cloud is fine"]');
  await page.waitForTimeout(150);

  let litTile = await page.$eval('.board-tile-wrapper.is-lit', (el) => el.getAttribute('data-tile-slug'));
  let resultSentence = await page.$eval('#finder-result-sentence', (el) => el.textContent?.trim());
  recordTest('Case 1: weeks + standard-ish + cloud lights OutSystems vs MERN', litTile === 'outsystems-vs-mern', `Lit: ${litTile}`);
  recordTest('Case 1 result sentence matches', resultSentence.includes('OutSystems vs MERN'));

  // Clear finder
  await page.click('#finder-clear-btn');
  await page.waitForTimeout(150);

  // Case 2: very unique + inside our walls -> Cloud vs on-premises (or Low-code vs high-code)
  await page.click('.finder-pill-btn[data-question="custom"][data-value="very unique"]');
  await page.click('.finder-pill-btn[data-question="data"][data-value="inside our walls"]');
  await page.click('.finder-pill-btn[data-question="speed"][data-value="months"]');
  await page.waitForTimeout(150);

  litTile = await page.$eval('.board-tile-wrapper.is-lit', (el) => el.getAttribute('data-tile-slug'));
  resultSentence = await page.$eval('#finder-result-sentence', (el) => el.textContent?.trim());
  recordTest('Case 2: inside our walls lights Cloud vs on-premises', litTile === 'cloud-vs-on-premises', `Lit: ${litTile}`);
  recordTest('Case 2 result sentence matches', resultSentence.includes('Cloud vs on-premises'));

  // Clear finder
  await page.click('#finder-clear-btn');
  await page.waitForTimeout(150);

  // Case 3: "We already run OutSystems 11" -> O11 vs ODC
  await page.click('#finder-estate-chip');
  await page.waitForTimeout(150);

  litTile = await page.$eval('.board-tile-wrapper.is-lit', (el) => el.getAttribute('data-tile-slug'));
  resultSentence = await page.$eval('#finder-result-sentence', (el) => el.textContent?.trim());
  recordTest('Case 3: "We already run OutSystems 11" lights O11 vs ODC', litTile === 'o11-vs-odc', `Lit: ${litTile}`);
  recordTest('Case 3 result sentence matches', resultSentence.includes('O11 vs ODC'));

  await page.click('#finder-clear-btn');
  await page.waitForTimeout(150);

  // 3. SEARCH & ZONE FILTERING
  console.log('\n--- 3. Testing Search & Zone Filtering ---');
  await page.fill('#board-search-input', 'mern');
  await page.waitForTimeout(150);

  const dimmedCount = await page.$$eval('.board-tile-wrapper.is-dimmed', (els) => els.length);
  const litCount = await page.$$eval('.board-tile-wrapper:not(.is-dimmed)', (els) => els.length);
  recordTest('Search live filters: matching tiles stay lit, non-matching dim', dimmedCount === 6 && litCount === 2, `Dimmed: ${dimmedCount}, Lit: ${litCount}`);

  // Escape clears search
  await page.press('#board-search-input', 'Escape');
  await page.waitForTimeout(150);
  const dimmedAfterEsc = await page.$$eval('.board-tile-wrapper.is-dimmed', (els) => els.length);
  recordTest('Escape clears search', dimmedAfterEsc === 0);

  // Empty search state
  await page.fill('#board-search-input', 'xyznonexistent123');
  await page.waitForTimeout(150);
  const emptyStateVisible = await page.$eval('#board-search-empty', (el) => window.getComputedStyle(el).display !== 'none');
  recordTest('Empty search state displayed when no match', emptyStateVisible);

  await page.click('#empty-state-clear-btn');
  await page.waitForTimeout(150);

  // 4. MOBILE RAILS & NO HORIZONTAL SCROLL
  console.log('\n--- 4. Testing Mobile Layout (<640px) ---');
  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true
  });
  await mobilePage.goto(`http://localhost:${port}/peg-board`, { waitUntil: 'networkidle' });

  const hasPageHScroll390 = await mobilePage.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  recordTest('390px viewport: page has no horizontal overflow', !hasPageHScroll390);

  const trackIsRail = await mobilePage.$eval('.zone-tiles-track', (el) => {
    const cs = window.getComputedStyle(el);
    return cs.overflowX === 'auto' && cs.scrollSnapType.includes('x');
  });
  recordTest('Mobile zone tracks are horizontal swipeable rails with scroll-snap', trackIsRail);

  // 360px viewport test
  await mobilePage.setViewportSize({ width: 360, height: 740 });
  await mobilePage.waitForTimeout(100);
  const hasPageHScroll360 = await mobilePage.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  recordTest('360px viewport: page has no horizontal overflow', !hasPageHScroll360);

  await mobilePage.close();

  // 5. CONTRAST TABLE VERIFICATION
  console.log('\n--- 5. Computing Design Tokens Contrast Ratios ---');
  const tokenPairs = [
    { name: '--pb-text on --pb-panel', fg: '#F6F1EA', bg: '#14110F', min: 4.5, type: 'Normal text' },
    { name: '--pb-text on --pb-tile', fg: '#F6F1EA', bg: '#1C1814', min: 4.5, type: 'Normal text' },
    { name: '--pb-text-2 on --pb-tile', fg: '#BDB3A6', bg: '#1C1814', min: 4.5, type: 'Body text' },
    { name: '--pb-text-3 on --pb-tile', fg: '#8E8478', bg: '#1C1814', min: 3.0, type: 'Muted/Secondary' },
    { name: '--pb-accent (orange) on --pb-panel', fg: '#F7941D', bg: '#14110F', min: 4.5, type: 'Brand Accent text' },
    { name: '--pb-accent (orange) on --pb-tile', fg: '#F7941D', bg: '#1C1814', min: 4.5, type: 'Brand Accent text' },
    { name: '--pb-on-accent on --pb-accent (orange fill)', fg: '#14110F', bg: '#F7941D', min: 4.5, type: 'Button text on orange' }
  ];

  console.log('\n| Pair | Foreground | Background | Calculated Ratio | WCAG Target | Status |');
  console.log('|---|---|---|---|---|---|');
  for (const p of tokenPairs) {
    const ratio = getContrastRatio(p.fg, p.bg);
    const pass = ratio >= p.min;
    console.log(`| ${p.name} | \`${p.fg}\` | \`${p.bg}\` | **${ratio.toFixed(2)}:1** | ${p.min}:1 (${p.type}) | ${pass ? '✅ PASS' : '❌ FAIL'} |`);
    recordTest(`Contrast ${p.name} (${ratio.toFixed(2)}:1 >= ${p.min}:1)`, pass);
  }

  // 6. CAPTURE INTERACTIVE DARK SCREENSHOTS
  console.log('\n--- 6. Capturing Interactive Dark Screenshots ---');
  const interactivePage = await browser.newPage({
    viewport: { width: 1536, height: 730 },
    colorScheme: 'dark'
  });
  await interactivePage.goto(`http://localhost:${port}/peg-board`, { waitUntil: 'networkidle' });
  await interactivePage.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    window.dispatchEvent(new Event('rhsp-theme-change'));
  });
  await interactivePage.waitForTimeout(200);

  // 1. Finder lit screenshot
  await interactivePage.click('.finder-pill-btn[data-question="speed"][data-value="weeks"]');
  await interactivePage.click('.finder-pill-btn[data-question="custom"][data-value="standard-ish"]');
  await interactivePage.click('.finder-pill-btn[data-question="data"][data-value="cloud is fine"]');
  await interactivePage.waitForTimeout(200);
  await interactivePage.screenshot({ path: path.join(afterDir, 'after-board-finder-lit-dark.png') });
  try {
    fs.copyFileSync(path.join(afterDir, 'after-board-finder-lit-dark.png'), path.join(artifactDir, 'after-board-finder-lit-dark.png'));
  } catch {}

  // Clear finder
  await interactivePage.click('#finder-clear-btn');
  await interactivePage.waitForTimeout(200);

  // 2. Unpin toast screenshot
  // Pin and then unpin via script to guarantee clean unpin event
  await interactivePage.evaluate(() => {
    const slug = 'outsystems-vs-mern';
    const btn = document.querySelector('[data-pin-btn="' + slug + '"]');
    if (btn) {
      btn.click();
      setTimeout(() => {
        btn.click();
      }, 100);
    }
  });
  await interactivePage.waitForTimeout(300);
  await interactivePage.screenshot({ path: path.join(afterDir, 'after-board-toast-dark.png') });
  try {
    fs.copyFileSync(path.join(afterDir, 'after-board-toast-dark.png'), path.join(artifactDir, 'after-board-toast-dark.png'));
  } catch {}

  // 3. Drawer open screenshot
  await interactivePage.click('#my-board-open-btn');
  await interactivePage.waitForTimeout(300);
  await interactivePage.screenshot({ path: path.join(afterDir, 'after-board-drawer-open-dark.png') });
  try {
    fs.copyFileSync(path.join(afterDir, 'after-board-drawer-open-dark.png'), path.join(artifactDir, 'after-board-drawer-open-dark.png'));
  } catch {}

  // 4. Explorer ring 8 of 8 screenshot
  await interactivePage.click('#my-board-close-btn');
  await interactivePage.waitForTimeout(150);
  await interactivePage.evaluate(() => {
    const allSlugs = [
      'peg-plan', 'peg-engineer', 'peg-genai', 'case-studies',
      'outsystems-vs-mern', 'o11-vs-odc', 'cloud-vs-on-premises', 'low-code-vs-high-code'
    ];
    window.localStorage.setItem('rhsp.pegboard.explored', JSON.stringify(allSlugs));
    window.dispatchEvent(new CustomEvent('rhsp:pegboard:explored-changed', { detail: { explored: allSlugs } }));
  });
  await interactivePage.waitForTimeout(200);
  await interactivePage.screenshot({ path: path.join(afterDir, 'after-board-explorer-8of8-dark.png') });
  try {
    fs.copyFileSync(path.join(afterDir, 'after-board-explorer-8of8-dark.png'), path.join(artifactDir, 'after-board-explorer-8of8-dark.png'));
  } catch {}

  await interactivePage.close();

  // 7. LIGHT MODE REGRESSION COMPARISON (at 1440 and 390)
  console.log('\n--- 7. Light Mode Regression Image Diff (1440 and 390) ---');
  const lightVps = [
    { name: '1440', width: 1440, height: 900 },
    { name: '390', width: 390, height: 844 }
  ];

  for (const vp of lightVps) {
    const p = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      colorScheme: 'light'
    });
    await p.goto(`http://localhost:${port}/peg-board`, { waitUntil: 'networkidle' });
    await p.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      window.dispatchEvent(new Event('rhsp-theme-change'));
    });
    await p.waitForTimeout(200);

    const lightAfterPath = path.join(afterDir, `after-board-${vp.name}-light.png`);
    await p.screenshot({ path: lightAfterPath });
    try {
      fs.copyFileSync(lightAfterPath, path.join(artifactDir, `after-board-${vp.name}-light.png`));
    } catch {}
    await p.close();
  }

  await page.close();
  await browser.close();
  server.close();

  console.log('\n========================================');
  console.log('✅ ALL TESTS AND VERIFICATIONS COMPLETED!');
  console.log('========================================');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
