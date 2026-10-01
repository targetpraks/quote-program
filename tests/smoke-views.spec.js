const { test, expect } = require('@playwright/test');
const { ACCOUNTS, watchErrors, login, navFor, visit } = require('./helpers');

for (const acct of ACCOUNTS) {
  test(`smoke: ${acct.role} ${acct.email} — every sidebar destination renders clean`, async ({ page }) => {
    const errors = watchErrors(page);
    await login(page, acct);

    const views = await navFor(page);
    expect(views.length, 'sidebar has destinations').toBeGreaterThan(0);

    for (const v of views) {
      await visit(page, v);
      const h2 = ((await page.locator('#main h2').first().textContent()) || '').trim();
      expect(h2, `view "${v}" has a heading`).not.toBe('');
      await expect(page.locator('.error-panel'), `view "${v}" shows no error panel`).toHaveCount(0);
    }
    expect(errors(), 'zero console/page errors across all views').toEqual([]);
  });

  test(`smoke: ${acct.role} ${acct.email} — detail round-trip and request modal`, async ({ page }) => {
    const errors = watchErrors(page);
    await login(page, acct);

    const views = await navFor(page);
    const reg = views.find(v => ['dash', 'buyerdesk', 'myreq', 'requests', 'orders'].includes(v));
    await visit(page, reg);

    // scope to row buttons — the chip bar has buttons with the same labels
    const open = page.locator('#main tbody button').filter({
      hasText: /^(Open|Review|Capture quote|Attach 3 quotes|Review & raise PO|Awaiting approval)/
    }).first();
    if (await open.count()) {
      await open.click();
      await page.waitForSelector('.crumbs', { timeout: 15_000 });
      await expect(page.locator('#main h2')).toContainText(/(RQ|TND)-\d{4}-\d+/);
      await page.click('.crumbs');
      await page.waitForSelector('#main h2', { timeout: 15_000 });
    }

    const newBtn = page.locator('#main button', { hasText: 'New request' }).first();
    if (await newBtn.count()) {
      await newBtn.click();
      await page.waitForSelector('.modal', { timeout: 5000 });
      await expect(page.locator('#nLines')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('.modal')).toHaveCount(0);
    }
    expect(errors()).toEqual([]);
  });
}
