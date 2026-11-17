import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const baselineDir = path.resolve('tests/visual-rail/baselines');

async function compareImages(img1Path, img2Buffer) {
  if (!fs.existsSync(img1Path)) {
    return { pass: false, error: `Baseline image not found: ${img1Path}` };
  }
  const baseline = await sharp(img1Path).raw().toBuffer({ resolveWithObject: true });
  const actual = await sharp(img2Buffer).raw().toBuffer({ resolveWithObject: true });

  if (baseline.info.width !== actual.info.width || baseline.info.height !== actual.info.height) {
    return {
      pass: false,
      error: `Dimension mismatch: baseline (${baseline.info.width}x${baseline.info.height}) vs actual (${actual.info.width}x${actual.info.height})`
    };
  }

  const bData = baseline.data;
  const aData = actual.data;
  const totalPixels = baseline.info.width * baseline.info.height;
  let diffPixels = 0;

  for (let i = 0; i < bData.length; i += baseline.info.channels) {
    let diff = 0;
    for (let c = 0; c < baseline.info.channels; c++) {
      diff += Math.abs(bData[i + c] - aData[i + c]);
    }
    if (diff > 15) {
      diffPixels++;
    }
  }

  const diffRatio = diffPixels / totalPixels;
  const pass = diffRatio <= 0.005; // Less than 0.5% threshold for subpixel rendering
  return { pass, diffPixels, totalPixels, diffRatio: (diffRatio * 100).toFixed(3) + '%' };
}

(async () => {
  console.log('--- RUNNING JOURNEY RAIL VISUAL REGRESSION SUITE ---');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: '1536', width: 1536, height: 900 },
    { name: '1024', width: 1024, height: 768 },
    { name: '375', width: 375, height: 667 }
  ];

  const themes = ['light', 'dark'];
  let passedCount = 0;
  let totalTests = 0;
  const failures = [];

  for (const vp of viewports) {
    for (const theme of themes) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });

      await page.addStyleTag({
        content: `*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }`
      });

      // 1. Home: Stage 1
      await page.goto('http://localhost:4321/');
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      const stop0 = await page.$('#journey-stop-0');
      if (stop0) await stop0.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);

      const rail = await page.$('#journey-progress-rail');
      const filenameS1 = `home-stage1-${theme}-${vp.name}.png`;
      const s1Buf = (vp.width >= 900 && rail)
        ? await rail.screenshot({ animations: 'disabled' })
        : await page.screenshot({ animations: 'disabled', clip: { x: 275, y: 100, width: 100, height: 400 } });
      totalTests++;
      const res1 = await compareImages(path.join(baselineDir, filenameS1), s1Buf);
      if (res1.pass) {
        passedCount++;
        console.log(`[PASS] Home Stage 1 (${theme}, ${vp.name}px) - diff: ${res1.diffRatio}`);
      } else {
        failures.push({ test: `Home Stage 1 (${theme}, ${vp.name}px)`, error: res1.error || res1.diffRatio });
        console.error(`[FAIL] Home Stage 1 (${theme}, ${vp.name}px) - ${res1.error || res1.diffRatio}`);
      }

      // 2. Home: Stage 3
      const stop2 = await page.$('#journey-stop-2');
      if (stop2) await stop2.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      const filenameS3 = `home-stage3-${theme}-${vp.name}.png`;
      const s3Buf = (vp.width >= 900 && rail)
        ? await rail.screenshot({ animations: 'disabled' })
        : await page.screenshot({ animations: 'disabled', clip: { x: 275, y: 100, width: 100, height: 400 } });
      totalTests++;
      const res3 = await compareImages(path.join(baselineDir, filenameS3), s3Buf);
      if (res3.pass) {
        passedCount++;
        console.log(`[PASS] Home Stage 3 (${theme}, ${vp.name}px) - diff: ${res3.diffRatio}`);
      } else {
        failures.push({ test: `Home Stage 3 (${theme}, ${vp.name}px)`, error: res3.error || res3.diffRatio });
        console.error(`[FAIL] Home Stage 3 (${theme}, ${vp.name}px) - ${res3.error || res3.diffRatio}`);
      }

      // 3. Home: Stage 6
      const stop5 = await page.$('#journey-stop-5');
      if (stop5) await stop5.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      const filenameS6 = `home-stage6-${theme}-${vp.name}.png`;
      const s6Buf = (vp.width >= 900 && rail)
        ? await rail.screenshot({ animations: 'disabled' })
        : await page.screenshot({ animations: 'disabled', clip: { x: 275, y: 100, width: 100, height: 400 } });
      totalTests++;
      const res6 = await compareImages(path.join(baselineDir, filenameS6), s6Buf);
      if (res6.pass) {
        passedCount++;
        console.log(`[PASS] Home Stage 6 (${theme}, ${vp.name}px) - diff: ${res6.diffRatio}`);
      } else {
        failures.push({ test: `Home Stage 6 (${theme}, ${vp.name}px)`, error: res6.error || res6.diffRatio });
        console.error(`[FAIL] Home Stage 6 (${theme}, ${vp.name}px) - ${res6.error || res6.diffRatio}`);
      }

      // 4. Solution CLM
      await page.goto('http://localhost:4321/solutions/clm');
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      const stage1 = await page.$('#stage-01');
      if (stage1) await stage1.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const solRail = await page.$('#journey-progress-rail');
      const filenameSol = `solution-clm-${theme}-${vp.name}.png`;
      const solBuf = (vp.width >= 900 && solRail)
        ? await solRail.screenshot({ animations: 'disabled' })
        : await page.screenshot({ animations: 'disabled', clip: { x: 275, y: 100, width: 100, height: 400 } });
      totalTests++;
      const resSol = await compareImages(path.join(baselineDir, filenameSol), solBuf);
      if (resSol.pass) {
        passedCount++;
        console.log(`[PASS] Solution CLM (${theme}, ${vp.name}px) - diff: ${resSol.diffRatio}`);
      } else {
        failures.push({ test: `Solution CLM (${theme}, ${vp.name}px)`, error: resSol.error || resSol.diffRatio });
        console.error(`[FAIL] Solution CLM (${theme}, ${vp.name}px) - ${resSol.error || resSol.diffRatio}`);
      }

      await page.close();
    }
  }

  await browser.close();

  console.log(`\nResults: ${passedCount} / ${totalTests} visual regression tests passed.`);
  if (failures.length > 0) {
    console.error('Failures:', failures);
    process.exit(1);
  }
})();
