// Manager CRUD against q_budgets, through the UI. Cleans up after itself so a
// failed run never leaves a stray ceiling in the data.
const { test, expect } = require('@playwright/test');
const { ACCOUNTS, watchErrors, login, visit } = require('./helpers');

const PB = 'http://127.0.0.1:8090';
const TEST_PERIOD = '2099-01';

async function purgeTestBudgets(page) {
  const H = {
    'Content-Type': 'application/json',
    Authorization: await page.evaluate(() => pb.authStore.token)
  };
  const list = await (await fetch(`${PB}/api/collections/q_budgets/records?perPage=100&filter=period%3D%22${TEST_PERIOD}%22`, { headers: H })).json();
  for (const b of (list.items || [])) {
    await fetch(`${PB}/api/collections/q_budgets/records/${b.id}`, { method: 'DELETE', headers: H });
  }
  // return how many are LEFT, not how many were found
  const after = await (await fetch(`${PB}/api/collections/q_budgets/records?perPage=100&filter=period%3D%22${TEST_PERIOD}%22`, { headers: H })).json();
  return (after.items || []).length;
}

test('manager can add, edit and remove a ceiling', async ({ page }) => {
  const errors = watchErrors(page);
  page.on('dialog', d => d.accept()); // confirm() for delete
  await login(page, ACCOUNTS[0]);
  await visit(page, 'budgets');
  await purgeTestBudgets(page);

  // add
  await page.locator('#main button', { hasText: 'Add budget' }).click();
  await page.waitForSelector('#bgAmount');
  await page.selectOption('#bgVenture', 'Papa Pasta');
  await page.selectOption('#bgDept', 'Operations');
  await page.fill('#bgPeriod', TEST_PERIOD);
  await page.fill('#bgAmount', '1000');
  await page.fill('#bgGroup', 'TEST-GL');
  await page.click('#bgSubmit');
  await expect(page.locator('.modal')).toHaveCount(0);

  await page.locator('#budChips .chip[data-v="all"]').click();
  const row = page.locator('#main tbody tr', { hasText: 'TEST-GL' }); // GL group identifies the row (no period column: the view is period-scoped)
  await expect(row).toBeVisible();
  expect(await row.innerText()).toContain('Papa Pasta');

  // edit
  await row.locator('button', { hasText: 'Edit' }).click();
  await page.fill('#bgAmount', '2500');
  await page.click('#bgSubmit');
  await expect(page.locator('.modal')).toHaveCount(0);
  const edited = page.locator('#main tbody tr', { hasText: 'TEST-GL' });
  await expect(edited).toBeVisible();
  expect((await edited.innerText()).replace(/\D/g, ''), 'row shows 2 500').toContain('250000');

  // remove
  await edited.locator('button', { hasText: 'Remove' }).click();
  await expect(page.locator('#main tbody tr', { hasText: 'TEST-GL' })).toHaveCount(0);

  expect(await purgeTestBudgets(page), 'nothing left behind').toBe(0);
  expect(errors()).toEqual([]);
});

test('a budget write is refused without the right role', async ({ page }) => {
  // Shirley is a purchaser: the UI must not offer the write, and the API
  // must refuse it if called directly (rules are the real gate).
  const errors = watchErrors(page);
  await login(page, ACCOUNTS[1]);
  await visit(page, 'budgets');
  await expect(page.locator('#main button', { hasText: 'Add budget' })).toHaveCount(0);

  const H = {
    'Content-Type': 'application/json',
    Authorization: await page.evaluate(() => pb.authStore.token)
  };
  const res = await fetch(`${PB}/api/collections/q_budgets/records`, {
    method: 'POST', headers: H,
    body: JSON.stringify({ venture: 'Papa Pasta', department: 'Operations', period: TEST_PERIOD, amount: 1 })
  });
  expect([400, 403, 404]).toContain(res.status);
  if (res.ok) { // if the rules do allow it, clean up rather than leave debris
    const rec = await res.json();
    await fetch(`${PB}/api/collections/q_budgets/records/${rec.id}`, { method: 'DELETE', headers: H });
  }
  expect(errors()).toEqual([]);
});
