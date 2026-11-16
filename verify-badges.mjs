import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });

  const viewports = [
    { name: '1440px', width: 1440, height: 900 },
    { name: '390px', width: 390, height: 844 }
  ];

  const themes = ['dark', 'light'];
  const results = {};

  for (const theme of themes) {
    results[theme] = {};
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      });
      await context.addInitScript((t) => {
        document.documentElement.setAttribute('data-theme', t);
        localStorage.setItem('theme', t);
      }, theme);

      const page = await context.newPage();

      // Test Homepage (PegSolutions)
      await page.goto('http://localhost:4322/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      // 1. Pillar indicator "P" beside "Plan with foresight."
      const pillarP = await page.evaluate(() => {
        const el = document.querySelector('#stage-panel-plan .pillar-indicator');
        if (!el) return null;
        const style = window.getComputedStyle(el);
        return {
          text: el.textContent.trim(),
          color: style.color,
          backgroundColor: style.backgroundColor
        };
      });

      // 2. Tab pills P, E, G
      const tabBadges = await page.evaluate(() => {
        const p = document.querySelector('#tab-peg-plan .tab-badge');
        const e = document.querySelector('#tab-peg-engineer .tab-badge');
        const g = document.querySelector('#tab-peg-genai .tab-badge');
        const getInfo = (el) => {
          if (!el) return null;
          const s = window.getComputedStyle(el);
          return { text: el.textContent.trim(), color: s.color, backgroundColor: s.backgroundColor };
        };
        return { P: getInfo(p), E: getInfo(e), G: getInfo(g) };
      });

      // 3. Standalone blue text: .highlight-plan ("Plan")
      const standaloneBlue = await page.evaluate(() => {
        const el = document.querySelector('.highlight-plan');
        if (!el) return null;
        const s = window.getComputedStyle(el);
        return { text: el.textContent.trim(), color: s.color };
      });

      // Test /solutions page
      await page.goto('http://localhost:4322/solutions/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const solutionsBadges = await page.evaluate(() => {
        const badges = Array.from(document.querySelectorAll('.group-badge')).map(el => {
          const s = window.getComputedStyle(el);
          return { text: el.textContent.trim(), color: s.color, backgroundColor: s.backgroundColor };
        });
        const planEyebrow = document.querySelector('.group-eyebrow');
        const eyebrowStyle = planEyebrow ? window.getComputedStyle(planEyebrow).color : null;
        return { badges, eyebrowColor: eyebrowStyle };
      });

      // Test /about page
      await page.goto('http://localhost:4322/about/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const apolloSteps = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.apollo-step-num')).map(el => {
          const s = window.getComputedStyle(el);
          return { text: el.textContent.trim(), color: s.color, backgroundColor: s.backgroundColor };
        });
      });

      results[theme][vp.name] = {
        pillarP,
        tabBadges,
        standaloneBlue,
        solutionsBadges,
        apolloSteps
      };

      await context.close();
    }
  }

  await browser.close();
  console.log('RESULTS_OUTPUT_START');
  console.log(JSON.stringify(results, null, 2));
  console.log('RESULTS_OUTPUT_END');
}

run().catch(console.error);
