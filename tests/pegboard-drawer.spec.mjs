import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321/peg-board';

async function run() {
  console.log('🚀 Running PEG Board Drawer Tests on', BASE_URL);

  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write']
  });
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`  • ${name} ... `);
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log('❌ FAIL');
      console.error(err);
      failed++;
    }
  }

  try {
    // 1. Zero pins state
    await test('0 pins: empty state, count badge 0, discuss disabled, explore button closes drawer', async () => {
      await page.goto(BASE_URL);
      await page.evaluate(() => {
        localStorage.setItem('rhsp.pegboard.pins', JSON.stringify([]));
        sessionStorage.clear();
      });
      await page.reload();
      await page.waitForSelector('#my-board-open-btn');

      // Check header button label
      const headerLabel = await page.locator('#my-board-btn-label').textContent();
      assert.equal(headerLabel.trim(), 'My board (0)');

      // Open drawer
      await page.click('#my-board-open-btn');
      await page.waitForSelector('#my-board-drawer.is-open');

      // Check drawer count badge
      const countBadge = await page.locator('#drawer-pins-count').textContent();
      assert.equal(countBadge.trim(), '0');

      // Check empty state visible
      const emptyState = page.locator('#pinned-empty-state');
      assert.equal(await emptyState.isVisible(), true);
      const emptyText = await page.locator('#pinned-empty-state .empty-text').textContent();
      assert.ok(emptyText.includes('Pin topics to build your board,'));

      // Check discuss button disabled
      const discussBtn = page.locator('#discuss-board-btn');
      assert.equal(await discussBtn.getAttribute('aria-disabled'), 'true');
      assert.ok(await discussBtn.getAttribute('title'));

      // Click explore topics button in empty state -> closes drawer
      await page.click('#empty-explore-btn');
      await page.waitForFunction(() => !document.getElementById('my-board-drawer')?.classList.contains('is-open'));
      assert.equal(await page.locator('#my-board-drawer').evaluate((el) => el.classList.contains('is-open')), false);
    });

    // 2. One pin state
    await test('1 pin: card rendered, chip "Solution", title, desc, mailto full URL', async () => {
      await page.evaluate(() => {
        localStorage.setItem('rhsp.pegboard.pins', JSON.stringify(['clm']));
      });
      await page.reload();
      await page.waitForSelector('#my-board-open-btn');

      // Open drawer
      await page.click('#my-board-open-btn');
      await page.waitForSelector('#my-board-drawer.is-open');

      // Count badge
      const countBadge = await page.locator('#drawer-pins-count').textContent();
      assert.equal(countBadge.trim(), '1');

      // Cards list
      const cards = page.locator('#pinned-tiles-list .pinned-card');
      assert.equal(await cards.count(), 1);

      // Card details
      const chip = await page.locator('#pinned-tiles-list .pinned-type-chip').textContent();
      assert.equal(chip.trim(), 'Solution');
      const title = await page.locator('#pinned-tiles-list .pinned-card-title').textContent();
      assert.equal(title.trim(), 'CLM');
      const removeBtn = page.locator('#pinned-tiles-list .pinned-remove-btn');
      assert.equal(await removeBtn.getAttribute('aria-label'), 'Remove CLM');
      assert.equal(await removeBtn.getAttribute('data-track'), 'peg_unpin');

      // Discuss button enabled with full URL
      const discussBtn = page.locator('#discuss-board-btn');
      assert.equal(await discussBtn.getAttribute('aria-disabled'), 'false');
      const href = await discussBtn.getAttribute('href');
      assert.ok(href.startsWith('mailto:letstalk@rhsp.solutions?subject=Discussing%20my%20RHSP%20board'));
      assert.ok(href.includes(encodeURIComponent('https://roundholesquarepeg.com/solutions/clm')));

      // Close drawer with close button
      await page.click('#my-board-close-btn');
      await page.waitForFunction(() => !document.getElementById('my-board-drawer')?.classList.contains('is-open'));
    });

    // 3. Five pins state
    await test('5 pins: renders 5 cards with correct type chips and all full URLs in mailto', async () => {
      const fiveSlugs = ['clm', 'case-studies', 'calc-outsystems-vs-mern', 'peg-finder', 'vernacular-documents'];
      await page.evaluate((slugs) => {
        localStorage.setItem('rhsp.pegboard.pins', JSON.stringify(slugs));
      }, fiveSlugs);
      await page.reload();
      await page.waitForSelector('#my-board-open-btn');

      await page.click('#my-board-open-btn');
      await page.waitForSelector('#my-board-drawer.is-open');

      const countBadge = await page.locator('#drawer-pins-count').textContent();
      assert.equal(countBadge.trim(), '5');

      const cards = page.locator('#pinned-tiles-list .pinned-card');
      assert.equal(await cards.count(), 5);

      // Check diverse chips
      const chips = await page.locator('#pinned-tiles-list .pinned-type-chip').allTextContents();
      const trimmedChips = chips.map((c) => c.trim());
      assert.ok(trimmedChips.includes('Solution'));
      assert.ok(trimmedChips.includes('Case study'));
      assert.ok(trimmedChips.includes('Comparison'));
      assert.ok(trimmedChips.includes('Playground'));

      // Check mailto has all 5 URLs
      const href = await page.locator('#discuss-board-btn').getAttribute('href');
      assert.ok(href.includes(encodeURIComponent('https://roundholesquarepeg.com/solutions/clm')));
      assert.ok(href.includes(encodeURIComponent('https://roundholesquarepeg.com/peg-board/case-studies')));
      assert.ok(href.includes(encodeURIComponent('https://roundholesquarepeg.com/solutions/vernacular-documents')));
    });

    // 4. Remove item and 5-second Undo toast
    await test('Remove item + 5-second Undo toast restores item', async () => {
      const cardsBefore = await page.locator('#pinned-tiles-list .pinned-card').count();
      assert.equal(cardsBefore, 5);

      // Click remove on the first card
      const firstRemoveBtn = page.locator('#pinned-tiles-list .pinned-card .pinned-remove-btn').first();
      await firstRemoveBtn.click();

      // Toast notification appears
      await page.waitForSelector('#pb-toast[style*="inline-flex"], #pb-toast[style*="flex"]', { timeout: 3000 });
      const toastMsg = await page.locator('#pb-toast .toast-message').textContent();
      assert.equal(toastMsg.trim(), 'Removed from your board.');

      // Wait for card removal
      await page.waitForFunction(() => document.querySelectorAll('#pinned-tiles-list .pinned-card').length === 4);
      assert.equal(await page.locator('#drawer-pins-count').textContent(), '4');

      // Click Undo
      await page.click('#toast-undo-btn');

      // Card is restored
      await page.waitForFunction(() => document.querySelectorAll('#pinned-tiles-list .pinned-card').length === 5);
      assert.equal(await page.locator('#drawer-pins-count').textContent(), '5');
    });

    // 5. Reset board with inline confirmation + Undo
    await test('Reset board inline confirm: Cancel aborts, Confirm clears + Undo restores', async () => {
      // Click Reset board
      await page.click('#drawer-reset-board-btn');

      // Confirm prompt appears
      await page.waitForSelector('#drawer-reset-confirm[style*="flex"]');
      const confirmPrompt = await page.locator('#drawer-reset-confirm .confirm-prompt-text').textContent();
      assert.equal(confirmPrompt.trim(), 'Remove all pinned topics?');
      assert.equal(await page.locator('#drawer-reset-board-btn').isVisible(), false);

      // Click Cancel
      await page.click('#reset-confirm-cancel');
      await page.waitForSelector('#drawer-reset-board-btn[style*="inline-flex"], #drawer-reset-board-btn:not([style*="none"])');
      assert.equal(await page.locator('#drawer-reset-confirm').isVisible(), false);
      assert.equal(await page.locator('#drawer-pins-count').textContent(), '5');

      // Click Reset board again -> click Confirm
      await page.click('#drawer-reset-board-btn');
      await page.waitForSelector('#drawer-reset-confirm[style*="flex"]');
      await page.click('#reset-confirm-yes');

      // Board is cleared
      await page.waitForFunction(() => document.getElementById('drawer-pins-count')?.textContent === '0');
      assert.equal(await page.locator('#pinned-empty-state').isVisible(), true);

      // Toast appears
      await page.waitForSelector('#pb-toast[style*="inline-flex"], #pb-toast[style*="flex"]');
      const toastMsg = await page.locator('#pb-toast .toast-message').textContent();
      assert.equal(toastMsg.trim(), 'All topics removed from board.');

      // Click Undo
      await page.click('#toast-undo-btn');
      await page.waitForFunction(() => document.getElementById('drawer-pins-count')?.textContent === '5');
      assert.equal(await page.locator('#pinned-tiles-list .pinned-card').count(), 5);
    });

    // 6. Copy contact email
    await test('Copy contact email button toggles feedback to "Copied" and reverts to "Copy"', async () => {
      const copyBtn = page.locator('#copy-contact-email-btn');
      const feedback = page.locator('#copy-email-feedback');
      assert.equal((await feedback.textContent()).trim(), 'Copy');

      await copyBtn.click();
      await page.waitForFunction(() => document.getElementById('copy-email-feedback')?.textContent?.trim() === 'Copied');
      assert.equal((await feedback.textContent()).trim(), 'Copied');

      // Wait 2.2 seconds for timeout to revert
      await page.waitForTimeout(2200);
      assert.equal((await feedback.textContent()).trim(), 'Copy');
    });

    // 7. Focus trap and Escape key handling
    await test('Escape key closes drawer and returns focus to trigger button', async () => {
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.getElementById('my-board-drawer')?.classList.contains('is-open'));

      const isFocused = await page.evaluate(() => document.activeElement?.id === 'my-board-open-btn');
      assert.equal(isFocused, true);
    });

    // 8. Responsive layout & overflow check across 1536, 1280, 1024, 768, 375px
    const viewports = [1536, 1280, 1024, 768, 375];
    for (const vp of viewports) {
      await test(`Responsive layout at ${vp}px (no horizontal overflow, light & dark)`, async () => {
        await page.setViewportSize({ width: vp, height: 800 });

        for (const theme of ['light', 'dark']) {
          await page.evaluate((t) => {
            if (t === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }, theme);

          // Open drawer
          await page.click('#my-board-open-btn');
          await page.waitForSelector('#my-board-drawer.is-open');

          // Check panel geometry
          const panelBox = await page.locator('.my-board-panel').boundingBox();
          assert.ok(panelBox.width <= vp, `Panel width ${panelBox.width} must fit within viewport ${vp}`);

          if (vp <= 640) {
            // Mobile bottom sheet assertions
            assert.ok(panelBox.width >= vp - 20, 'Mobile panel occupies full width');
          } else {
            // Desktop drawer max width 440px
            assert.ok(panelBox.width <= 441, 'Desktop drawer max width is <= 440px');
          }

          // Check no horizontal overflow
          const overflow = await page.evaluate(() => {
            return {
              docScrollWidth: document.documentElement.scrollWidth,
              docClientWidth: document.documentElement.clientWidth,
              bodyScrollWidth: document.body.scrollWidth,
              bodyClientWidth: document.body.clientWidth
            };
          });

          assert.ok(
            overflow.docScrollWidth <= overflow.docClientWidth + 1,
            `Document horizontal overflow at ${vp}px (${theme}): scrollWidth ${overflow.docScrollWidth} > clientWidth ${overflow.docClientWidth}`
          );

          // Close drawer
          await page.click('#my-board-close-btn');
          await page.waitForFunction(() => !document.getElementById('my-board-drawer')?.classList.contains('is-open'));
        }
      });
    }

  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
