import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const artifactDir = path.resolve('C:/Users/msi/.gemini/antigravity/brain/8f1454a9-2515-439e-82f8-a418871b80b4');
const contactSheetDir = path.join(artifactDir, 'contact-sheets');
fs.mkdirSync(contactSheetDir, { recursive: true });

const refDir = path.join(artifactDir, 'ref-90');
const finalDir = path.join(artifactDir, 'final-100');

const COMPARISONS = [
  { name: 'hero-1440x900', label: 'Homepage Hero (1440x900)' },
  { name: 'peg-plan-1440x900', label: 'PEG Stage: Plan (1440x900)' },
  { name: 'peg-engineer-1440x900', label: 'PEG Stage: Engineer (1440x900)' },
  { name: 'peg-genai-1440x900', label: 'PEG Stage: Gen-AI (1440x900)' },
  { name: 'peg-genai-1536x730', label: 'PEG Stage: Gen-AI Centered & Fit (1536x730)' },
  { name: 'peg-genai-1366x768', label: 'PEG Stage: Gen-AI Centered & Fit (1366x768)' },
  { name: 'journey-stop-1-1440x900', label: 'Approach Journey: Stop 1 (1440x900)' },
  { name: 'solution-top-1440x900', label: 'Solution CLM: Top View (1440x900)' },
  { name: 'solution-stage-1440x900', label: 'Solution CLM: Stage 1 Panel (1440x900)' },
  { name: 'about-1440x900', label: 'About Page (1440x900)' }
];

async function generate() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  for (const item of COMPARISONS) {
    const refFile = path.join(refDir, `${item.name}.png`);
    const finalFile = path.join(finalDir, `${item.name}.png`);

    if (!fs.existsSync(refFile) || !fs.existsSync(finalFile)) {
      console.log(`Skipping ${item.name}, file missing`);
      continue;
    }

    const refB64 = fs.readFileSync(refFile).toString('base64');
    const finalB64 = fs.readFileSync(finalFile).toString('base64');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          body { background: #0E0E0E; color: #FFF; padding: 24px; }
          .header { text-align: center; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: 700; color: #FFF; margin-bottom: 6px; }
          .sub { font-size: 14px; color: #888; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
          .card { background: #181818; border-radius: 12px; overflow: hidden; border: 1px solid #282828; }
          .card-header { padding: 12px 16px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; display: flex; justify-content: space-between; }
          .tag-ref { color: #5B8FE0; }
          .tag-final { color: #34D399; }
          .img-wrap { width: 100%; overflow: hidden; background: #000; }
          img { width: 100%; display: block; height: auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${item.label}</div>
          <div class="sub">Left: Reference at 90% Browser Zoom (ref-90) | Right: Plain 100% Zoom with zoom:0.9 (final-100)</div>
        </div>
        <div class="grid">
          <div class="card">
            <div class="card-header">
              <span>BEFORE: 90% Reference</span>
              <span class="tag-ref">REF-90 (0.9 Scale)</span>
            </div>
            <div class="img-wrap">
              <img src="data:image/png;base64,${refB64}" />
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <span>AFTER: 100% Zoom</span>
              <span class="tag-final">FINAL-100 (1.0 Scale)</span>
            </div>
            <div class="img-wrap">
              <img src="data:image/png;base64,${finalB64}" />
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const page = await browser.newPage({ viewport: { width: 1920, height: 1120 } });
    await page.setContent(html);
    await page.waitForTimeout(200);

    const outPath = path.join(contactSheetDir, `contact-${item.name}.png`);
    await page.screenshot({ path: outPath, fullPage: true });
    await page.close();
    console.log(`Generated contact sheet: contact-${item.name}.png`);
  }

  await browser.close();
  console.log('All contact sheets created successfully!');
}

generate().catch(console.error);

