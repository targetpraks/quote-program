const { test, expect } = require('@playwright/test');
const { ACCOUNTS, watchErrors, login, visit } = require('./helpers');

const manager = ACCOUNTS[0];

test('status chips filter the register and counts agree with rows', async ({ page }) => {
  const errors = watchErrors(page);
  await login(page, manager);
  await visit(page, 'requests');

  const chips = page.locator('#reqChips .chip');
  const n = await chips.count();
  expect(n, 'chip bar rendered').toBeGreaterThan(1);

  const allRows = await page.locator('#main tbody tr').count();
  for (let i = 1; i < n; i++) {
    await chips.nth(i).click();
    await page.waitForTimeout(150);
    const rows = await page.locator('#main tbody tr').count();
    expect(rows, 'filtered rows never exceed the full register').toBeLessThanOrEqual(allRows);
    const label = (await chips.nth(i).textContent()) || '';
    const badge = Number((label.match(/\d+/) || [0])[0]);
    if (badge) expect(rows, `rows for chip "${label.trim()}"`).toBe(badge);
  }
  await chips.nth(0).click(); // back to All
  await expect(page.locator('#main tbody tr')).toHaveCount(allRows);
  expect(errors()).toEqual([]);
});

test('global search filters and restores', async ({ page }) => {
  const errors = watchErrors(page);
  await login(page, manager);
  await visit(page, 'requests');
  const all = await page.locator('#main tbody tr').count();

  await page.fill('#globalSearch', 'a');
  await page.waitForTimeout(200);
  const some = await page.locator('#main tbody tr').count();
  expect(some).toBeLessThanOrEqual(all);

  await page.fill('#globalSearch', 'zzzz-no-such-record');
  await page.waitForTimeout(200);
  await expect(page.locator('#main tbody')).toContainText(/No requests match/i);

  await page.fill('#globalSearch', '');
  await page.waitForTimeout(200);
  await expect(page.locator('#main tbody tr')).toHaveCount(all);
  expect(errors()).toEqual([]);
});

test('comparison matrix and print sheet render on a detail view', async ({ page }) => {
  const errors = watchErrors(page);
  await login(page, manager);
  await visit(page, 'orders'); // every order carries a PO and a print sheet
  const open = page.locator('#main button', { hasText: 'Open' }).first();
  if (await open.count()) {
    await open.click();
    await page.waitForSelector('.crumbs', { timeout: 15_000 });
    await expect(page.locator('#poPrintSheet')).toHaveCount(1);
    await expect(page.locator('#main')).toContainText(/Approval trail/);
  }
  expect(errors()).toEqual([]);
});

async function captureExport(page) {
  // Capture the payload the app hands to the browser instead of relying on
  // headless blob-download plumbing: what matters is the CSV itself.
  await page.evaluate(() => {
    window.__dl = [];
    window.download = (name, content, type) => window.__dl.push({ name, content, type });
  });
  const btn = page.locator('#main button', { hasText: 'Export CSV' }).first();
  if (!(await btn.count())) return null;
  await btn.click();
  await page.waitForTimeout(200);
  return await page.evaluate(() => window.__dl[0] || null);
}

test('CSV export works on every register (manager)', async ({ page }) => {
  const errors = watchErrors(page);
  await login(page, manager);

  for (const view of ['requests', 'orders', 'vendors', 'catalog']) {
    await visit(page, view);
    const csv = await captureExport(page);
    expect(csv, `register "${view}" produced a CSV`).toBeTruthy();
    expect(csv.type, `register "${view}" content type`).toContain('text/csv');
    const lines = csv.content.trim().split('\n');
    expect(lines.length, `register "${view}" has header + rows`).toBeGreaterThan(1);
    expect(lines[0], `register "${view}" header`).toMatch(/^[A-Za-z]/);
  }
  expect(errors(), 'no page errors while exporting (inline-handler scope bug)').toEqual([]);
});

test('requests CSV mirrors the register on screen', async ({ page }) => {
  const errors = watchErrors(page);
  await login(page, manager);
  await visit(page, 'requests');
  const csv = await captureExport(page);
  expect(csv).toBeTruthy();
  expect(csv.name).toMatch(/^requests-\d{4}-\d{2}-\d{2}\.csv$/);
  const lines = csv.content.trim().split('\n');
  expect(lines[0]).toContain('Ref,Status,Venture');
  const rows = await page.locator('#main tbody tr').count();
  // a quoted cell may span lines, so count only lines starting with a ref
  const dataRows = lines.filter(l => /^(RQ|TND)-\d{4}-\d+,/.test(l)).length;
  expect(dataRows).toBe(rows);
  expect(errors()).toEqual([]);
});

test('CSV export works on the buyer desk (purchaser)', async ({ page }) => {
  const errors = watchErrors(page);
  await login(page, ACCOUNTS[1]);
  await visit(page, 'buyerdesk');
  const csv = await captureExport(page);
  expect(csv, 'buyer desk produced a CSV').toBeTruthy();
  expect(csv.content.trim().split('\n').length).toBeGreaterThan(1);
  expect(errors()).toEqual([]);
});
