import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const outDir = 'C:\\Users\\msi\\.gemini\\antigravity\\brain\\100fbb57-961e-4de5-9258-63e6256335fc\\screenshots\\stage-rail';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const viewports = [
  { width: 1536, height: 900, name: '1536' },
  { width: 1280, height: 800, name: '1280' },
  { width: 1024, height: 768, name: '1024' },
  { width: 768, height: 1024, name: '768' },
  { width: 375, height: 812, name: '375' }
];

const themes = ['light', 'dark'];

async function capture() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  for (const theme of themes) {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      });
      const page = await context.newPage();

      // Set theme
      await page.addInitScript((th) => {
        document.documentElement.setAttribute('data-theme', th);
        localStorage.setItem('rhsp:theme', th);
      }, theme);

      // --- 1. HOME APPROACH RAIL ---
      await page.goto('http://localhost:4321/');
      await page.waitForLoadState('networkidle');

      // Scroll into approach journey
      const approachEl = await page.$('#approach');
      if (approachEl) {
        await approachEl.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);

        // Check rail metrics if desktop
        if (vp.width >= 900) {
          const railInfo = await page.evaluate(() => {
            const rail = document.getElementById('journey-progress-rail');
            if (!rail) return null;
            const rRect = rail.getBoundingClientRect();
            const dots = Array.from(rail.querySelectorAll('.rail-dot')).map(d => {
              const rect = d.getBoundingClientRect();
              const marker = d.querySelector('.rail-marker-box')?.getBoundingClientRect();
              return {
                dotCenter: rect.left + rect.width / 2,
                markerCenter: marker ? marker.left + marker.width / 2 : 0,
                boxWidth: rect.width,
                boxHeight: rect.height
              };
            });
            const line = rail.querySelector('.rail-connecting-line')?.getBoundingClientRect();
            return {
              visible: window.getComputedStyle(rail).display !== 'none' && window.getComputedStyle(rail).opacity !== '0',
              rect: rRect,
              lineCenter: line ? line.left + line.width / 2 : 0,
              dots: dots
            };
          });
          console.log(`[Home ${theme} ${vp.name}px] Rail visible:`, railInfo?.visible);
          if (railInfo && railInfo.dots.length > 0) {
            const firstCenter = railInfo.dots[0].dotCenter;
            const allAligned = railInfo.dots.every(d => Math.abs(d.dotCenter - firstCenter) < 0.5);
            console.log(`  All markers aligned on single vertical axis:`, allAligned, `(X = ${firstCenter})`);
          }
        } else {
          const isHidden = await page.evaluate(() => {
            const rail = document.getElementById('journey-progress-rail');
            return !rail || window.getComputedStyle(rail).display === 'none';
          });
          console.log(`[Home ${theme} ${vp.name}px] Rail hidden on mobile (< 900px):`, isHidden);
        }

        const homeFile = path.join(outDir, `home-rail-${theme}-${vp.name}.png`);
        await page.screenshot({ path: homeFile });
        console.log(`  Saved screenshot: ${homeFile}`);
      }

      // --- 2. SOLUTION PAGE RAIL ---
      await page.goto('http://localhost:4321/solutions/clm');
      await page.waitForLoadState('networkidle');

      // Scroll into stage 2 or 3
      const stage2El = await page.$('#stage-02');
      if (stage2El) {
        await stage2El.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);

        if (vp.width >= 900) {
          const railInfo = await page.evaluate(() => {
            const rail = document.getElementById('journey-progress-rail');
            if (!rail) return null;
            const rRect = rail.getBoundingClientRect();
            const dots = Array.from(rail.querySelectorAll('.rail-dot')).map(d => {
              const rect = d.getBoundingClientRect();
              const marker = d.querySelector('.rail-marker-box')?.getBoundingClientRect();
              return {
                dotCenter: rect.left + rect.width / 2,
                markerCenter: marker ? marker.left + marker.width / 2 : 0,
                boxWidth: rect.width,
                boxHeight: rect.height
              };
            });
            const line = rail.querySelector('.rail-connecting-line')?.getBoundingClientRect();
            const text = document.getElementById('rail-indicator-text')?.textContent;
            return {
              visible: window.getComputedStyle(rail).display !== 'none' && window.getComputedStyle(rail).opacity !== '0',
              rect: rRect,
              lineCenter: line ? line.left + line.width / 2 : 0,
              indicator: text,
              dots: dots
            };
          });
          console.log(`[Solution ${theme} ${vp.name}px] Rail visible:`, railInfo?.visible, `Indicator:`, railInfo?.indicator);
          if (railInfo && railInfo.dots.length > 0) {
            const firstCenter = railInfo.dots[0].dotCenter;
            const allAligned = railInfo.dots.every(d => Math.abs(d.dotCenter - firstCenter) < 0.5);
            console.log(`  All markers aligned on single vertical axis:`, allAligned, `(X = ${firstCenter})`);
          }
        } else {
          const isHidden = await page.evaluate(() => {
            const rail = document.getElementById('journey-progress-rail');
            return !rail || window.getComputedStyle(rail).display === 'none';
          });
          console.log(`[Solution ${theme} ${vp.name}px] Rail hidden on mobile (< 900px):`, isHidden);
        }

        const solFile = path.join(outDir, `solution-rail-${theme}-${vp.name}.png`);
        await page.screenshot({ path: solFile });
        console.log(`  Saved screenshot: ${solFile}`);
      }

      await context.close();
    }
  }

  await browser.close();
  console.log('--- ALL SCREENSHOTS CAPTURED ---');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});

