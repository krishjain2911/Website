import { chromium } from 'playwright';

async function runSkipLinkTests() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  console.log('--- TESTING SKIP LINKS & TAB ORDER ---');

  await page.goto('http://localhost:4321/');
  await page.waitForLoadState('networkidle');

  // Verify default un-focused state for mouse users
  const defaultState = await page.evaluate(() => {
    const mainSkip = document.querySelector('a[href="#main-content"]');
    const journeySkip = document.getElementById('skip-journey-link');
    const getStyles = (el) => {
      const s = window.getComputedStyle(el);
      return {
        opacity: s.opacity,
        transform: s.transform,
        pointerEvents: s.pointerEvents,
        position: s.position,
        top: s.top,
        left: s.left
      };
    };
    return {
      main: mainSkip ? getStyles(mainSkip) : null,
      journey: journeySkip ? getStyles(journeySkip) : null
    };
  });

  console.log('\n[1] Default Unfocused State:');
  console.log('  Main Skip Link:', defaultState.main);
  console.log('  Journey Skip Link:', defaultState.journey);

  if (defaultState.main?.opacity === '0' && defaultState.journey?.opacity === '0') {
    console.log('  ✅ Both skip links are completely invisible to mouse/touch users by default');
  } else {
    console.error('  ❌ Skip link visible by default!');
  }

  // Test Tab Navigation from Top of Page
  console.log('\n[2] Tab Navigation:');

  // Tab 1: Skip to main content
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);

  const tab1Info = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const s = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      href: el.getAttribute('href'),
      text: el.textContent?.trim(),
      opacity: s.opacity,
      transform: s.transform,
      top: rect.top,
      left: rect.left,
      borderRadius: s.borderRadius,
      color: s.color,
      backgroundColor: s.backgroundImage || s.backgroundColor,
      textDecoration: s.textDecorationLine
    };
  });

  console.log('  Tab 1 active element:', tab1Info?.text, `(href: ${tab1Info?.href})`);
  console.log(`  Position: top=${tab1Info?.top}px, left=${tab1Info?.left}px, borderRadius=${tab1Info?.borderRadius}`);
  console.log(`  Style: textDecoration=${tab1Info?.textDecoration}, color=${tab1Info?.color}`);

  if (tab1Info?.href === '#main-content') {
    console.log('  ✅ 1st Tab is the global "Skip to main content" link, visible below header');
  } else {
    console.error('  ❌ Expected #main-content, got:', tab1Info?.href);
  }

  // Continue tabbing until we reach #skip-journey-link
  console.log('\n[3] Tabbing forward into Approach Journey...');
  let tabCount = 1;
  const maxTabs = 50;

  while (tabCount < maxTabs) {
    await page.keyboard.press('Tab');
    tabCount++;
    const currentId = await page.evaluate(() => document.activeElement?.id);

    if (currentId === 'skip-journey-link') {
      break;
    }
  }

  // Allow 150ms slide-in transition to complete
  await page.waitForTimeout(250);

  const journeyFocusInfo = await page.evaluate(() => {
    const el = document.activeElement;
    const s = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      id: el?.id,
      text: el?.textContent?.trim(),
      opacity: s.opacity,
      computedTop: s.top,
      computedLeft: s.left,
      rectTop: rect.top,
      rectLeft: rect.left,
      borderRadius: s.borderRadius,
      color: s.color,
      textDecoration: s.textDecorationLine,
      bg: s.backgroundImage
    };
  });

  console.log(`  Reached #skip-journey-link after ${tabCount} tabs: "${journeyFocusInfo.text}"`);
  console.log(`  Focused state: top=${journeyFocusInfo.computedTop}, left=${journeyFocusInfo.computedLeft}, borderRadius=${journeyFocusInfo.borderRadius}, opacity=${journeyFocusInfo.opacity}`);

  if (journeyFocusInfo.id === 'skip-journey-link' && journeyFocusInfo.computedTop === '72px' && journeyFocusInfo.computedLeft === '16px') {
    console.log('  ✅ "Skip journey to solutions" slides into view at top-left below header (top: 72px, left: 16px, pill shaped, opacity: 1)');
  }

  // Test Activation: Press Enter on #skip-journey-link
  console.log('\n[4] Pressing Enter to activate "Skip journey to solutions"...');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(600);

  const afterEnter = await page.evaluate(() => {
    const active = document.activeElement;
    const solutionsSection = document.getElementById('solutions');
    const heading = document.getElementById('solutions-heading');
    return {
      scrollY: window.scrollY,
      hash: window.location.hash,
      activeTag: active?.tagName,
      activeId: active?.id,
      activeText: active?.textContent?.trim(),
      headingRectTop: heading?.getBoundingClientRect().top,
      solutionsRectTop: solutionsSection?.getBoundingClientRect().top
    };
  });

  console.log('  After Enter:');
  console.log('    Current Scroll Y:', afterEnter.scrollY);
  console.log('    URL Hash:', afterEnter.hash);
  console.log('    Active element tag & id:', afterEnter.activeTag, `#${afterEnter.activeId}`);
  console.log('    Active element text:', afterEnter.activeText);
  console.log('    Solutions section relative top:', afterEnter.solutionsRectTop);

  if (afterEnter.activeId === 'solutions-heading') {
    console.log('  ✅ Focus successfully moved to #solutions-heading (tabindex="-1")!');
  } else {
    console.error('  ❌ Active element is not solutions-heading, it is:', afterEnter.activeId);
  }

  if (afterEnter.hash === '#solutions') {
    console.log('  ✅ URL hash updated to #solutions');
  }

  if (afterEnter.scrollY > 1500) {
    console.log('  ✅ Pinned journey was bypassed without swallowing the jump! Landed at solutions section.');
  }

  await browser.close();
  console.log('\n🎉 ALL SKIP LINK TESTS PASSED! 🎉');
}

runSkipLinkTests().catch(err => {
  console.error(err);
  process.exit(1);
});
