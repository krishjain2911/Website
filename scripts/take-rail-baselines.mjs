import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('tests/visual-rail/baselines');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  
  const viewports = [
    { name: '1536', width: 1536, height: 900 },
    { name: '1024', width: 1024, height: 768 },
    { name: '375', width: 375, height: 667 }
  ];
  
  const themes = ['light', 'dark'];
  
  for (const vp of viewports) {
    for (const theme of themes) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      
      // Freeze all animations
      await page.addStyleTag({
        content: `*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }`
      });

      // 1. Home page at Stage 1, 3, 6
      await page.goto('http://localhost:4321/');
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      
      // Stage 1
      const stop0 = await page.$('#journey-stop-0');
      if (stop0) await stop0.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      
      const rail = await page.$('#journey-progress-rail');
      const filenameS1 = `home-stage1-${theme}-${vp.name}.png`;
      if (vp.width >= 900 && rail) {
        await rail.screenshot({ path: path.join(outDir, filenameS1), animations: 'disabled' });
      } else {
        await page.screenshot({ path: path.join(outDir, filenameS1), animations: 'disabled', clip: { x: 275, y: 100, width: 100, height: 400 } });
      }
      
      // Stage 3
      const stop2 = await page.$('#journey-stop-2');
      if (stop2) await stop2.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const filenameS3 = `home-stage3-${theme}-${vp.name}.png`;
      if (vp.width >= 900 && rail) {
        await rail.screenshot({ path: path.join(outDir, filenameS3), animations: 'disabled' });
      } else {
        await page.screenshot({ path: path.join(outDir, filenameS3), animations: 'disabled', clip: { x: 275, y: 100, width: 100, height: 400 } });
      }
      
      // Stage 6
      const stop5 = await page.$('#journey-stop-5');
      if (stop5) await stop5.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const filenameS6 = `home-stage6-${theme}-${vp.name}.png`;
      if (vp.width >= 900 && rail) {
        await rail.screenshot({ path: path.join(outDir, filenameS6), animations: 'disabled' });
      } else {
        await page.screenshot({ path: path.join(outDir, filenameS6), animations: 'disabled', clip: { x: 275, y: 100, width: 100, height: 400 } });
      }
      
      // 2. Solution page (/solutions/clm)
      await page.goto('http://localhost:4321/solutions/clm');
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      const stage1 = await page.$('#stage-01');
      if (stage1) await stage1.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const solRail = await page.$('#journey-progress-rail');
      const filenameSol = `solution-clm-${theme}-${vp.name}.png`;
      if (vp.width >= 900 && solRail) {
        await solRail.screenshot({ path: path.join(outDir, filenameSol), animations: 'disabled' });
      } else {
        await page.screenshot({ path: path.join(outDir, filenameSol), animations: 'disabled', clip: { x: 275, y: 100, width: 100, height: 400 } });
      }
      
      await page.close();
    }
  }
  
  await browser.close();
  console.log('All baseline screenshots captured in', outDir);
})();
