import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:4321/');

  // Scroll to approach section
  const section = await page.$('#approach');
  if (section) await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const dots = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('#journey-progress-rail .rail-dot')).map((d, i) => {
      const dotInner = d.querySelector('.dot-inner');
      const cube = d.querySelector('.rail-cube');
      const box = d.querySelector('.rail-marker-box');
      return {
        index: i,
        classes: d.className,
        dotWidth: d.offsetWidth,
        dotHeight: d.offsetHeight,
        boxWidth: box?.offsetWidth,
        boxHeight: box?.offsetHeight,
        innerComputedWidth: dotInner ? window.getComputedStyle(dotInner).width : null,
        innerComputedHeight: dotInner ? window.getComputedStyle(dotInner).height : null,
        innerDisplay: dotInner ? window.getComputedStyle(dotInner).display : null,
        innerBg: dotInner ? window.getComputedStyle(dotInner).backgroundColor : null,
        cubeDisplay: cube ? window.getComputedStyle(cube).display : null,
        cubeWidth: cube?.offsetWidth,
        cubeHeight: cube?.offsetHeight
      };
    });
  });
  console.log('Home dots:', JSON.stringify(dots, null, 2));

  const trackInfo = await page.evaluate(() => {
    const track = document.querySelector('#journey-progress-rail .rail-dots-track');
    const chip = document.querySelector('#journey-progress-rail .rail-indicator');
    return {
      trackWidth: track ? window.getComputedStyle(track).width : null,
      trackBorderRadius: track ? window.getComputedStyle(track).borderRadius : null,
      chipText: chip?.textContent,
      chipWidth: chip ? window.getComputedStyle(chip).width : null
    };
  });
  console.log('Home track info:', trackInfo);

  await browser.close();
})();
