// Writes to the local PocketBase: these tests PATCH a budget record with its
// own current value (no data changes) purely to make the server emit an event.
const { test, expect } = require('@playwright/test');
const { ACCOUNTS, watchErrors, login } = require('./helpers');

const PB = 'http://127.0.0.1:8090';
const authHeaders = async page => ({
  'Content-Type': 'application/json',
  Authorization: await page.evaluate(() => pb.authStore.token)
});

async function touchBudget(page) {
  const H = await authHeaders(page);
  const list = await (await fetch(PB + '/api/collections/q_budgets/records?perPage=1', { headers: H })).json();
  expect(list.items && list.items.length, 'a budget exists to touch').toBeTruthy();
  const res = await fetch(PB + `/api/collections/q_budgets/records/${list.items[0].id}`, {
    method: 'PATCH', headers: H,
    body: JSON.stringify({ amount: list.items[0].amount }) // same value → event, no data change
  });
  expect(res.status).toBe(200);
}

test('an open register refreshes itself when another session writes', async ({ page }) => {
  const errors = watchErrors(page);
  await login(page, ACCOUNTS[0]);
  await page.waitForSelector('#liveInd.live', { timeout: 20_000 });
  const before = await page.evaluate(() => LIVE_SYNCED && LIVE_SYNCED.getTime());
  expect(before, 'live sync clock is running').toBeTruthy();

  await touchBudget(page);

  await expect.poll(() => page.evaluate(() => LIVE_SYNCED && LIVE_SYNCED.getTime()), {
    timeout: 20_000, intervals: [250]
  }).toBeGreaterThan(before);

  await expect(page.locator('#liveInd')).toContainText(/Live/);
  expect(errors(), 'no console/page errors while streaming').toEqual([]);
});

test('the detail view gets a refresh pill instead of being re-rendered', async ({ page }) => {
  const errors = watchErrors(page);
  await login(page, ACCOUNTS[0]);
  const pbId = await page.evaluate(() => REQUESTS[0] && REQUESTS[0].pbId);
  await page.evaluate(id => go('detail', id), pbId);
  await page.waitForSelector('.crumbs', { timeout: 15_000 });
  await page.waitForSelector('#liveInd.live', { timeout: 20_000 });

  await touchBudget(page);

  const pill = page.locator('#liveUpdatePill');
  await expect(pill, 'refresh pill appears rather than a disruptive re-render').toBeVisible({ timeout: 20_000 });
  await expect(page.locator('.crumbs'), 'the user is still on the same detail view').toBeVisible();

  await pill.click();
  await expect(page.locator('#liveUpdatePill')).toHaveCount(0);
  expect(errors()).toEqual([]);
});
