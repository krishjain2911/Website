import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:4321/');

  const files = [
    '/brand/pill-square-64.webp',
    '/brand/pill-square-128.webp',
    '/brand/rhsp-logo.png',
    '/brand/rhsp-icon.svg'
  ];

  const results = await page.evaluate(async (fileList) => {
    const data = {};
    for (const file of fileList) {
      const img = new Image();
      img.src = file;
      await new Promise(r => img.onload = r);
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 64;
      canvas.height = img.height || 64;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      // Sample 4 corners (0,0), (width-1,0), (0,height-1), (width-1,height-1)
      const p1 = ctx.getImageData(0, 0, 1, 1).data;
      const p2 = ctx.getImageData(canvas.width - 1, 0, 1, 1).data;
      const p3 = ctx.getImageData(0, canvas.height - 1, 1, 1).data;
      const p4 = ctx.getImageData(canvas.width - 1, canvas.height - 1, 1, 1).data;
      data[file] = {
        size: `${canvas.width}x${canvas.height}`,
        topLeft: Array.from(p1),
        topRight: Array.from(p2),
        bottomLeft: Array.from(p3),
        bottomRight: Array.from(p4)
      };
    }
    return data;
  }, files);

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
