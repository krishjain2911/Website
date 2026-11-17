import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:4321/');

  // Scroll to approach journey so the rail becomes visible
  const journey = await page.$('#approach-journey');
  if (journey) await journey.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const activeDotStyles = await page.evaluate(() => {
    const rail = document.querySelector('#journey-progress-rail');
    const activeDot = rail?.querySelector('.rail-dot.is-active, .rail-dot.is-current');
    const cube = activeDot?.querySelector('.rail-cube, .peg-marker-cube');
    const dotPassed = activeDot?.querySelector('.dot-passed, .dot-inner');
    const markerBox = activeDot?.querySelector('.rail-marker-box, .peg-slot');

    return {
      railVisible: rail?.classList.contains('is-visible'),
      activeDotHtml: activeDot?.outerHTML,
      activeDotBackground: activeDot ? window.getComputedStyle(activeDot).backgroundColor : null,
      markerBoxBackground: markerBox ? window.getComputedStyle(markerBox).backgroundColor : null,
      cubeBackground: cube ? window.getComputedStyle(cube).backgroundColor : null,
      cubeDisplay: cube ? window.getComputedStyle(cube).display : null,
      cubeSrc: cube ? cube.getAttribute('src') : null,
      dotPassedDisplay: dotPassed ? window.getComputedStyle(dotPassed).display : null,
      dotPassedBackground: dotPassed ? window.getComputedStyle(dotPassed).backgroundColor : null
    };
  });

  console.log('Home Page Active Dot Styles:', activeDotStyles);

  // Now check Solution page
  await page.goto('http://localhost:4321/solutions/clm');
  const stage = await page.$('#stage-01');
  if (stage) await stage.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const solutionDotStyles = await page.evaluate(() => {
    const rail = document.querySelector('#journey-progress-rail');
    const activeDot = rail?.querySelector('.rail-dot.is-active, .rail-dot.is-current');
    const cube = activeDot?.querySelector('.rail-cube, .peg-marker-cube');
    const dotPassed = activeDot?.querySelector('.dot-passed, .dot-inner');
    const markerBox = activeDot?.querySelector('.rail-marker-box, .peg-slot');

    return {
      railVisible: rail?.classList.contains('is-visible'),
      activeDotHtml: activeDot?.outerHTML,
      activeDotBackground: activeDot ? window.getComputedStyle(activeDot).backgroundColor : null,
      markerBoxBackground: markerBox ? window.getComputedStyle(markerBox).backgroundColor : null,
      cubeBackground: cube ? window.getComputedStyle(cube).backgroundColor : null,
      cubeDisplay: cube ? window.getComputedStyle(cube).display : null,
      cubeSrc: cube ? cube.getAttribute('src') : null,
      dotPassedDisplay: dotPassed ? window.getComputedStyle(dotPassed).display : null,
      dotPassedBackground: dotPassed ? window.getComputedStyle(dotPassed).backgroundColor : null
    };
  });

  console.log('Solution Page Active Dot Styles:', solutionDotStyles);

  await browser.close();
})();
