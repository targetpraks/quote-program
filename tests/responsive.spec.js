const { test, expect } = require('@playwright/test');
const { ACCOUNTS, watchErrors, login, navFor, visit } = require('./helpers');

// v2.8.0 fixed a pre-existing horizontal overflow at <=960px. Lock it down:
// the page must never scroll sideways at any supported width — cards scroll inside.
for (const width of [420, 780, 1440]) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = watchErrors(page);
    await login(page, ACCOUNTS[0]); // manager sees every destination

    for (const v of await navFor(page)) {
      await visit(page, v);
      const over = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over, `view "${v}" overflows by ${over}px at ${width}px`).toBeLessThanOrEqual(1);
    }
    expect(errors()).toEqual([]);
  });
}
