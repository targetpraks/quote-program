// Shared helpers: test accounts, login, console-error watching.
// Test accounts come from CLAUDE.md (qp_users collection, NOT PocketBase users).
const ACCOUNTS = [
  { role: 'manager',   email: 'manager@papapasta.co.za',       pass: 'Manager#2026' },
  { role: 'purchaser', email: 'shirley@infinitybrands.co.za', pass: 'Purchase#2026' },
  { role: 'requester', email: 'nadia@papapasta.co.za',        pass: 'Request#2026' },
  { role: 'requester', email: 'thabo@thelocalfarmer.co.za',   pass: 'Request#2026' },
  { role: 'buyer',     email: 'rickymaio+buyer@gmail.com',    pass: 'Buyer#2026' }
];

// External assets (Google Fonts, PocketBase CDN) may be unreachable offline —
// those failures are infrastructure, not app errors, so they are allow-listed.
const IGNORED = [
  /Failed to load resource/i,
  /net::ERR_/i,
  /fonts\.(googleapis|gstatic)\.com/i,
  /cdn\.jsdelivr\.net/i
];

function watchErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (IGNORED.some(re => re.test(text))) return;
    errors.push('console: ' + text);
  });
  return () => errors;
}

async function login(page, acct) {
  await page.goto('/index.html');
  await page.fill('#liEmail', acct.email);
  await page.fill('#liPass', acct.pass);
  await page.click('#liBtn');
  await page.waitForSelector('.nav-btn', { timeout: 15_000 });
}

// Destinations this role actually sees in the sidebar.
async function navFor(page) {
  return await page.$$eval('.nav-btn', bs => bs.map(b => b.dataset.v));
}

// Visit one sidebar destination and wait for its heading.
async function visit(page, view) {
  await page.click(`.nav-btn[data-v="${view}"]`);
  await page.waitForSelector('#main h2', { timeout: 15_000 });
  await page.waitForTimeout(350); // async views (vendors/catalog/alerts) settle
}

module.exports = { ACCOUNTS, watchErrors, login, navFor, visit };
