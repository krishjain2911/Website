import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  await page.setContent(`
    <html>
      <body style="background: white; padding: 20px; display: flex; gap: 20px;">
        <div style="background: white; border: 1px solid #ccc; padding: 10px;">
          <h3>pill-square-64.webp</h3>
          <img src="http://localhost:4321/brand/pill-square-64.webp" width="64" height="64" />
        </div>
        <div style="background: #222; border: 1px solid #ccc; padding: 10px; color: white;">
          <h3>pill-square-64.webp (dark)</h3>
          <img src="http://localhost:4321/brand/pill-square-64.webp" width="64" height="64" />
        </div>
        <div style="background: white; border: 1px solid #ccc; padding: 10px;">
          <h3>rhsp-logo.png</h3>
          <img src="http://localhost:4321/brand/rhsp-logo.png" width="64" height="64" />
        </div>
        <div style="background: white; border: 1px solid #ccc; padding: 10px;">
          <h3>rhsp-icon.svg</h3>
          <img src="http://localhost:4321/brand/rhsp-icon.svg" width="64" height="64" />
        </div>
      </body>
    </html>
  `);
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scripts/compare-cubes.png' });
  console.log('Saved scripts/compare-cubes.png');
  await browser.close();
})();
