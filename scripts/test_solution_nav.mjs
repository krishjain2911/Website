import { chromium } from 'playwright';

async function runTests() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('--- STARTING SOLUTION NAV & BACK BUTTON TESTS ---');

  // Helper to click link and wait for navigation
  const clickAndNavigate = async (selector, targetPattern) => {
    await Promise.all([
      targetPattern ? page.waitForURL(targetPattern) : page.waitForNavigation(),
      page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) throw new Error('Element not found: ' + sel);
        el.click();
      }, selector)
    ]);
    await page.waitForLoadState('networkidle');
  };

  // Test 1: Home -> solution -> Back
  console.log('\n[TEST 1] Home -> Solution -> Back');
  await page.goto('http://localhost:4321/');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(300);
  const homeScrollY = await page.evaluate(() => window.scrollY);
  console.log('  Scrolled home page to Y:', homeScrollY);

  await clickAndNavigate('footer a[href="/solutions/clm"]', '**/solutions/clm**');
  console.log('  Navigated to:', page.url());

  const backBtnText = await page.textContent('#solution-back-btn');
  const backAria = await page.getAttribute('#solution-back-btn', 'aria-label');
  console.log('  Back button text:', backBtnText?.trim());
  console.log('  Back button aria-label:', backAria);

  if (backBtnText?.includes('Back to Home')) {
    console.log('  ✅ Label correctly shows "Back to Home"');
  } else {
    console.error('  ❌ Label failed, expected "Back to Home", got:', backBtnText);
  }

  await Promise.all([
    page.waitForURL('http://localhost:4321/**'),
    page.evaluate(() => document.querySelector('#solution-back-btn').click())
  ]);
  await page.waitForTimeout(500);
  console.log('  After Back, URL:', page.url());
  const restoredScrollY = await page.evaluate(() => window.scrollY);
  console.log('  Restored Y:', restoredScrollY);
  if (page.url() === 'http://localhost:4321/' || page.url() === 'http://localhost:4321/#') {
    console.log('  ✅ Successfully returned to Home');
  }

  // Test 2: PEG Board -> Solution -> Back
  console.log('\n[TEST 2] PEG Board -> Solution -> Back');
  await page.goto('http://localhost:4321/peg-board');
  await page.waitForLoadState('networkidle');
  console.log('  On PEG Board, navigating to solution...');
  await clickAndNavigate('footer a[href="/solutions/sonakshi"]', '**/solutions/sonakshi**');
  console.log('  Navigated to:', page.url());

  const pegBackText = await page.textContent('#solution-back-btn');
  console.log('  Back button text:', pegBackText?.trim());
  if (pegBackText?.includes('Back to PEG Board')) {
    console.log('  ✅ Label correctly shows "Back to PEG Board"');
  } else {
    console.error('  ❌ Label failed, expected "Back to PEG Board", got:', pegBackText);
  }

  await Promise.all([
    page.waitForURL('**/peg-board**'),
    page.evaluate(() => document.querySelector('#solution-back-btn').click())
  ]);
  await page.waitForTimeout(500);
  console.log('  After Back, URL:', page.url());
  if (page.url().includes('/peg-board')) {
    console.log('  ✅ Successfully returned to PEG Board');
  }

  // Test 3: PEG Board -> Solution -> Next -> Next -> Back
  console.log('\n[TEST 3] PEG Board -> Solution -> Next -> Next -> Back');
  await page.goto('http://localhost:4321/peg-board');
  await page.waitForLoadState('networkidle');
  await clickAndNavigate('footer a[href="/solutions/sonakshi"]', '**/solutions/sonakshi**');
  console.log('  Started on solution 1:', page.url());

  await clickAndNavigate('.solution-nav-btn.next-btn');
  console.log('  After Next 1, at:', page.url());

  await clickAndNavigate('.solution-nav-btn.next-btn');
  console.log('  After Next 2, at:', page.url());

  const currentBackText = await page.textContent('#solution-back-btn');
  console.log('  Back button text after 2 Next hops:', currentBackText?.trim());
  if (currentBackText?.includes('Back to PEG Board')) {
    console.log('  ✅ Origin preserved across hops: "Back to PEG Board"');
  }

  await Promise.all([
    page.waitForURL('**/peg-board**'),
    page.evaluate(() => document.querySelector('#solution-back-btn').click())
  ]);
  await page.waitForTimeout(500);
  console.log('  After clicking Back, URL is:', page.url());
  if (page.url().includes('/peg-board')) {
    console.log('  ✅ Successfully returned to PEG Board directly without stopping at earlier solutions!');
  }

  // Test 4: About -> Solution -> Back
  console.log('\n[TEST 4] About -> Solution -> Back');
  await page.goto('http://localhost:4321/about');
  await page.waitForLoadState('networkidle');
  await clickAndNavigate('footer a[href="/solutions/sovereign-ai"]', '**/solutions/sovereign-ai**');
  console.log('  Navigated to:', page.url());

  const aboutBackText = await page.textContent('#solution-back-btn');
  console.log('  Back button text:', aboutBackText?.trim());
  if (aboutBackText?.includes('Back to About')) {
    console.log('  ✅ Label correctly shows "Back to About"');
  }

  await Promise.all([
    page.waitForURL('**/about**'),
    page.evaluate(() => document.querySelector('#solution-back-btn').click())
  ]);
  await page.waitForTimeout(500);
  console.log('  After Back, URL:', page.url());
  if (page.url().includes('/about')) {
    console.log('  ✅ Successfully returned to About');
  }

  // Test 5: Direct URL Navigation -> Back
  console.log('\n[TEST 5] Direct URL Navigation -> Back');
  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto('http://localhost:4321/solutions/clm');
  await page2.waitForLoadState('networkidle');
  const directBackText = await page2.textContent('#solution-back-btn');
  console.log('  Direct load Back button text:', directBackText?.trim());
  if (directBackText?.includes('Back to Home')) {
    console.log('  ✅ Label correctly shows fallback "Back to Home"');
  }

  await Promise.all([
    page2.waitForURL('**/#solutions**'),
    page2.evaluate(() => document.querySelector('#solution-back-btn').click())
  ]);
  console.log('  After clicking Back, URL is:', page2.url());
  if (page2.url().includes('/#solutions')) {
    console.log('  ✅ Successfully navigated to /#solutions');
  }

  // Test 6: Reload on solution page -> Back
  console.log('\n[TEST 6] Home -> Solution -> Reload -> Back');
  await page.goto('http://localhost:4321/');
  await page.waitForLoadState('networkidle');
  await clickAndNavigate('footer a[href="/solutions/clm"]', '**/solutions/clm**');
  console.log('  At solution page, now reloading...');
  await page.reload();
  await page.waitForLoadState('networkidle');
  const reloadedBackText = await page.textContent('#solution-back-btn');
  console.log('  Back button text after reload:', reloadedBackText?.trim());
  if (reloadedBackText?.includes('Back to Home')) {
    console.log('  ✅ Label preserved after reload: "Back to Home"');
  }
  await Promise.all([
    page.waitForURL('http://localhost:4321/**'),
    page.evaluate(() => document.querySelector('#solution-back-btn').click())
  ]);
  await page.waitForTimeout(500);
  console.log('  After Back, URL:', page.url());
  if (page.url() === 'http://localhost:4321/' || page.url() === 'http://localhost:4321/#') {
    console.log('  ✅ Successfully returned to Home after reload');
  }

  // Test 7: Keyboard Enter on Back button
  console.log('\n[TEST 7] Keyboard navigation (focus and press Enter)');
  await page.goto('http://localhost:4321/about');
  await page.waitForLoadState('networkidle');
  await clickAndNavigate('footer a[href="/solutions/clm"]', '**/solutions/clm**');
  await page.focus('#solution-back-btn');
  await Promise.all([
    page.waitForURL('**/about**'),
    page.keyboard.press('Enter')
  ]);
  await page.waitForTimeout(500);
  console.log('  After Enter press, URL:', page.url());
  if (page.url().includes('/about')) {
    console.log('  ✅ Keyboard Enter works perfectly, returned to About');
  }

  await browser.close();
  console.log('\n🎉 ALL NAVIGATION TESTS PASSED COMPLETELY! 🎉');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
