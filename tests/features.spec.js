const { test, expect } = require('@playwright/test');
const { ACCOUNTS, watchErrors, login, visit } = require('./helpers');

const manager = ACCOUNTS[0];
const PURSED = '2026-09'; // seeded budget period

test('budgets view renders ceilings, committed spend and meters', async ({ page }) => {
  const errors = watchErrors(page);
  await login(page, manager);
  await visit(page, 'budgets');

  // current month has no ceilings seeded — the empty state must say so
  await expect(page.locator('#main .empty')).toBeVisible();

  await page.locator(`#budChips .chip[data-v="${PURSED}"]`).click();
  await expect(page.locator('#main tbody tr')).toHaveCount(3);
  await expect(page.locator('.bar-fill')).toHaveCount(3);

  const text = await page.locator('#main tbody').innerText();
  expect(text).toContain('Papa Pasta');
  expect(text).toContain('Operations');
  expect(text.replace(/\D/g, ''), 'the R120 000 ceiling is on screen').toContain('120000');

  // stat cards add up: budget = committed + remaining
  const stats = await page.locator('#main .stat .n').allInnerTexts();
  const num = s => Number(s.replace(/[^\d.-]/g, ''));
  const [budget, committed, , remaining] = stats.map(num);
  expect(committed + remaining).toBeCloseTo(budget, 1);

  // purchaser may read budgets but must not get edit affordances
  await page.evaluate(() => { pb.authStore.clear(); });
  await login(page, ACCOUNTS[1]);
  await visit(page, 'budgets');
  await page.locator(`#budChips .chip[data-v="${PURSED}"]`).click();
  await expect(page.locator('#main button', { hasText: 'Add budget' })).toHaveCount(0);
  await expect(page.locator('#main button', { hasText: 'Edit' })).toHaveCount(0);
  expect(errors()).toEqual([]);
});

test('approval desk shows the budget impact of every pending award', async ({ page }) => {
  const errors = watchErrors(page);
  await login(page, manager);
  await visit(page, 'dash');
  await expect(page.locator('#main h3', { hasText: 'Budget impact' })).toBeVisible();
  const rows = page.locator('#main .panel', { has: page.locator('h3', { hasText: 'Budget impact' }) }).locator('tbody tr');
  expect(await rows.count()).toBeGreaterThan(0);
  const text = await page.locator('#main').innerText();
  // either matched to a ceiling or explicitly reported as unmatched — never silent
  expect(text).toMatch(/within budget|over by|No budget set/);
  expect(errors()).toEqual([]);
});

test('new request form checks the estimate against the ceiling', async ({ page }) => {
  const errors = watchErrors(page);
  await login(page, manager);
  await visit(page, 'dash');
  await page.locator('#main button', { hasText: 'New purchase request' }).first().click();
  await page.waitForSelector('#bHint');

  await page.selectOption('#nVenture', 'Papa Pasta');
  await page.selectOption('#nDept', 'Operations');
  await page.fill('#nNeeded', `${PURSED}-15`);
  await page.dispatchEvent('#nNeeded', 'change');

  const hint = page.locator('#bHint');
  await expect(hint).toContainText('free of');
  await expect(hint).not.toHaveClass(/warn/);

  await page.fill('#nEst', '999999');
  await expect(hint).toContainText('exceeds it by');
  await expect(hint).toHaveClass(/warn/);

  // the field is a number input, so non-numeric text cannot even be typed —
  // what it will accept (a negative) must be rejected by the app's own guard
  await expect(page.locator('#nEst')).toHaveAttribute('type', 'number');
  const before = await page.evaluate(() => REQUESTS.length);
  await page.fill('#nLines .li', 'Validation probe item');
  await page.fill('#nEst', '-5');
  await page.click('#nSubmit');
  await expect(page.locator('#nFormErr')).toContainText('Estimated total');
  await expect(page.locator('.modal')).toBeVisible(); // blocked, not silently accepted
  expect(await page.evaluate(() => REQUESTS.length), 'nothing was written').toBe(before);

  await page.keyboard.press('Escape');
  await expect(page.locator('.modal')).toHaveCount(0);
  expect(errors()).toEqual([]);
});

test('detail view carries the matching budget strip', async ({ page }) => {
  const errors = watchErrors(page);
  await login(page, manager);
  const pbId = await page.evaluate(() => {
    const r = REQUESTS.find(x => findBudget(x));
    return r ? r.pbId : null;
  });
  if (pbId) {
    await page.evaluate(id => go('detail', id), pbId);
    await page.waitForSelector('.crumbs', { timeout: 15_000 });
    const text = await page.locator('#main').innerText();
    expect(text).toMatch(/Budget · \d{4}-\d{2}/);
    expect(text).toContain('Committed');
  }
  expect(errors()).toEqual([]);
});

test('spend report aggregates awards and flags exceptions', async ({ page }) => {
  const errors = watchErrors(page);
  await login(page, manager);
  await visit(page, 'reports');
  await page.locator('#repChips .chip', { hasText: 'All time' }).click();

  // every breakdown panel renders
  for (const h of ['By brand', 'By department', 'By vendor', 'By month', 'Audit flags']) {
    await expect(page.locator('#main h3', { hasText: h })).toBeVisible();
  }

  const stats = await page.locator('#main .stat .n').allInnerTexts();
  const awarded = Number(stats[0].replace(/[^\d.]/g, ''));
  expect(awarded).toBeGreaterThan(0);
  expect(Number(stats[1])).toBeGreaterThanOrEqual(0);

  // share columns must sum to ~100% across brands
  const shares = await page.evaluate(() => {
    const panel = [...document.querySelectorAll('#main .panel')]
      .find(p => p.querySelector('h3')?.textContent === 'By brand');
    return [...panel.querySelectorAll('tbody tr')]
      .map(tr => parseFloat(tr.lastElementChild.innerText));
  });
  const sum = shares.reduce((a, b) => a + b, 0);
  expect(sum).toBeGreaterThan(99);
  expect(sum).toBeLessThan(101);

  // CSV export of the report
  await page.evaluate(() => {
    window.__dl = [];
    window.download = (name, content, type) => window.__dl.push({ name, content, type });
  });
  await page.locator('#main button', { hasText: 'Export CSV' }).first().click();
  const csv = await page.evaluate(() => window.__dl[0] || null);
  expect(csv).toBeTruthy();
  expect(csv.name).toMatch(/^spend-report-/);
  expect(csv.content).toContain('Section,Name,Awards,Value (R),Share %');
  expect(errors()).toEqual([]);
});
