const { test, expect } = require('@playwright/test');
const { ACCOUNTS, watchErrors, login } = require('./helpers');

// Pure-helper invariants, asserted in the page through the window.__q handle.
// These are the rules every money surface in the app depends on:
// VAT-inclusive lines normalise ÷1.15 at 2dp, escaping covers all five
// characters, quantities/prices are validated, CSV cells quote per RFC 4180.
test('money, VAT, escaping and CSV invariants hold', async ({ page }) => {
  const errors = watchErrors(page);
  await login(page, ACCOUNTS[0]);

  const out = await page.evaluate(() => {
    const q = window.__q;
    const incl = { prices: [{ i: 0, p: 115, vat: 'incl' }], delivery: 0 };
    const excl = { prices: [{ i: 0, p: 100, vat: 'excl' }], delivery: 10 };
    const lines = [{ item: 'Widget', qty: '2' }];
    const tIncl = q.quoteTotalV2(incl, lines);
    const tExcl = q.quoteTotalV2(excl, lines);
    return {
      money: q.money(1234.5),
      moneyNan: q.money(null),
      escXss: q.esc('<img src=x onerror="alert(1)">'),
      escQuote: q.esc(`O'Brien & "Co" <>`),
      rateIncl: q.rateExcl(incl, 0),
      rateExcl: q.rateExcl(excl, 0),
      totalIncl: tIncl.total,
      totalExcl: tExcl.total,
      complete: tIncl.complete && tIncl.allVat,
      qtyZero: q.validateQty('0'),
      qtyOk: q.validateQty('2'),
      qtyNaN: q.validateQty('abc'),
      priceNeg: q.validatePrice('-1'),
      priceOk: q.validatePrice('10'),
      csv: q.csvRow(['a,b', 'say "hi"', 'plain']),
      search: q.matchesGlobalSearch(
        { id: 'RQ-2026-0001', requester: 'Nadia', venture: 'Papa Pasta', department: 'Ops', notes: '', lines: [{ item: 'Sawdust briquettes' }] },
        'sawdust'
      )
    };
  });

  // money: "R " prefix, two decimals, digits survive
  // en-ZA renders with a decimal comma — assert shape, not the separator
  expect(out.money).toMatch(/^R [\d\s.,]+\d{2}$/);
  expect(out.money.replace(/\D/g, '')).toBe('123450');
  expect(out.moneyNan).toMatch(/^R 0[.,]00$/);

  // VAT-inclusive 115.00 on qty 2 normalises to 100.00/unit → 200.00 total
  expect(out.rateIncl).toBe(100);
  expect(Math.abs(out.totalIncl - 200)).toBeLessThan(0.01);
  expect(out.complete).toBe(true);
  // VAT-exclusive 100.00 + R10 delivery on qty 2 → 210.00
  expect(out.rateExcl).toBe(100);
  expect(Math.abs(out.totalExcl - 210)).toBeLessThan(0.01);

  // escaping covers & < > " ' — no raw tag can reach the DOM
  expect(out.escXss).not.toContain('<');
  expect(out.escXss).toContain('&lt;');
  expect(out.escQuote).toBe(`O&#39;Brien &amp; &quot;Co&quot; &lt;&gt;`);

  // validation
  expect(out.qtyZero).toBeTruthy();
  expect(out.qtyOk).toBeNull();
  expect(out.qtyNaN).toBeTruthy();
  expect(out.priceNeg).toBeTruthy();
  expect(out.priceOk).toBeNull();

  // RFC 4180 quoting
  expect(out.csv).toBe('"a,b","say ""hi""",plain');

  // search is case-insensitive across line items
  expect(out.search).toBe(true);
  expect(errors()).toEqual([]);
});
