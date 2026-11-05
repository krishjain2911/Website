import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const beforeDir = path.join(rootDir, 'before-screenshots');
const afterDir = path.join(rootDir, 'after-screenshots');

async function compareImages() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const pairs = [
    {
      name: 'Mobile 390x844 Light',
      before: path.join(beforeDir, 'before-board-390x844-light.png'),
      after: path.join(afterDir, 'after-board-390x844-light.png')
    },
    {
      name: 'Desktop 1536x730 Light',
      before: path.join(beforeDir, 'before-board-1536x730-light.png'),
      after: path.join(afterDir, 'after-board-1536x730-light.png')
    }
  ];

  console.log('\n--- Image Diff Comparison Results ---');

  for (const pair of pairs) {
    if (!fs.existsSync(pair.before) || !fs.existsSync(pair.after)) {
      console.log(`[SKIP] Missing image for ${pair.name}`);
      continue;
    }

    const b64Before = fs.readFileSync(pair.before).toString('base64');
    const b64After = fs.readFileSync(pair.after).toString('base64');

    const result = await page.evaluate(async ({ b64Before, b64After }) => {
      function loadImage(b64) {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = 'data:image/png;base64,' + b64;
        });
      }

      const imgA = await loadImage(b64Before);
      const imgB = await loadImage(b64After);

      const w = Math.min(imgA.width, imgB.width);
      const h = Math.min(imgA.height, imgB.height);

      const canvasA = document.createElement('canvas');
      canvasA.width = w; canvasA.height = h;
      const ctxA = canvasA.getContext('2d');
      ctxA.drawImage(imgA, 0, 0);
      const dataA = ctxA.getImageData(0, 0, w, h).data;

      const canvasB = document.createElement('canvas');
      canvasB.width = w; canvasB.height = h;
      const ctxB = canvasB.getContext('2d');
      ctxB.drawImage(imgB, 0, 0);
      const dataB = ctxB.getImageData(0, 0, w, h).data;

      let diffCount = 0;
      const totalPixels = w * h;

      for (let i = 0; i < dataA.length; i += 4) {
        const dr = Math.abs(dataA[i] - dataB[i]);
        const dg = Math.abs(dataA[i + 1] - dataB[i + 1]);
        const db = Math.abs(dataA[i + 2] - dataB[i + 2]);
        if (dr > 10 || dg > 10 || db > 10) {
          diffCount++;
        }
      }

      const matchPercent = ((totalPixels - diffCount) / totalPixels) * 100;
      return { totalPixels, diffCount, matchPercent: matchPercent.toFixed(2), w, h };
    }, { b64Before, b64After });

    console.log(`${pair.name} (${result.w}x${result.h}): ${result.matchPercent}% visual match (${result.diffCount} diff pixels / ${result.totalPixels})`);
  }

  await browser.close();
}

compareImages().catch(console.error);
