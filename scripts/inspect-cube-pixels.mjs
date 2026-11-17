import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:4321/');

  const analysis = await page.evaluate(async () => {
    const img = new Image();
    img.src = '/brand/pill-square-64.webp';
    await new Promise(r => img.onload = r);
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, 64, 64).data;
    // Let's count colors and find bounding box of non-transparent pixels
    let minX = 64, maxX = 0, minY = 64, maxY = 0;
    const colors = [];
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const idx = (y * 64 + x) * 4;
        const r = imgData[idx];
        const g = imgData[idx + 1];
        const b = imgData[idx + 2];
        const a = imgData[idx + 3];
        if (a > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Check pixels at (minX, minY), (maxX, minY), etc.
    const getPixel = (x, y) => {
      const idx = (y * 64 + x) * 4;
      return [imgData[idx], imgData[idx+1], imgData[idx+2], imgData[idx+3]];
    };

    return {
      bounds: { minX, maxX, minY, maxY, width: maxX - minX + 1, height: maxY - minY + 1 },
      cornersOfBox: [
        getPixel(minX, minY),
        getPixel(maxX, minY),
        getPixel(minX, maxY),
        getPixel(maxX, maxY)
      ],
      sampleEdges: [
        getPixel(minX + 2, minY + 2),
        getPixel(minX + 10, minY),
        getPixel(minX, minY + 10)
      ]
    };
  });

  console.log(JSON.stringify(analysis, null, 2));
  await browser.close();
})();
