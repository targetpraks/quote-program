// Dev-only Playwright config for the Quorum regression suite.
// The app is a single static index.html; these settings just serve it and
// point it at the local PocketBase (127.0.0.1:8090) it already uses.
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,              // one backend, one session at a time
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'node tests/server.js',
    url: 'http://127.0.0.1:4173/index.html',
    reuseExistingServer: true,
    timeout: 15_000
  },
  projects: [
    // read-only: log in, navigate, assert. Never writes to the backend.
    { name: 'read', testIgnore: '**/*.writes.spec.js' },
    // writes: creates records through the UI/REST, cleans up after itself.
    { name: 'writes', testMatch: '**/*.writes.spec.js' }
  ]
});
