# Quorum regression suite

Playwright tests for the single-file app. Dev-only: the app itself has **no build step** and no
runtime dependency (`package.json` exists purely for this suite).

## Prerequisites

- PocketBase 0.40.x on `http://127.0.0.1:8090` with the collections and test accounts in `CLAUDE.md`.
- `npm install` and `npx playwright install chromium` (once).

## Running

```bash
npm test           # read-only project — safe against live data
npm run test:writes  # writes, then cleans up (realtime probe, budget CRUD)
npm run test:all     # both
```

A zero-dependency static server (`tests/server.js`) is started automatically on
`http://127.0.0.1:4173` and serves the repo root, so the app talks to PocketBase exactly as it does
in production.

## What is covered

| File | Project | Covers |
| --- | --- | --- |
| `smoke-views.spec.js` | read | All five test accounts: every sidebar destination renders a heading with no error panel and **zero console/page errors**; detail round-trip; new-request modal open/Escape. |
| `interactions.spec.js` | read | Status chip counts vs rows, global search filter/restore, comparison matrix + print sheet, CSV export on every register (manager) and the buyer desk (purchaser), and that the requests CSV mirrors the register on screen. |
| `helpers.spec.js` | read | Money invariants through the `window.__q` handle: `money`, VAT-inclusive ÷1.15 at 2dp, `esc()` covering `& < > " '`, quantity/price validation, RFC 4180 CSV quoting, case-insensitive search. |
| `responsive.spec.js` | read | No horizontal page overflow at 420 / 780 / 1440px on any destination (cards scroll internally). |
| `features.spec.js` | read | Budgets view (rows, meters, totals, role gating), approval-desk budget impact, estimate-vs-ceiling hint and its validation, detail budget strip, spend report breakdowns/audit flags/CSV. |
| `realtime.writes.spec.js` | writes | A write from another session reaches an open register; the detail view gets the refresh pill instead of a re-render. Patches a budget with its own value — no data changes. |
| `budgets.writes.spec.js` | writes | Manager add → edit → remove a ceiling through the UI, plus proof a purchaser's direct write is refused. Uses period `2099-01` and purges it before and after. |

## Conventions

- Console-error assertions allow-list only external infrastructure noise (fonts, the PocketBase CDN).
- Money assertions are **locale-agnostic** (digits only): `en-ZA` grouping differs between Chromium
  builds — headless Playwright renders `R 120 000,00`, the desktop build `R 120,000.00`.
- Anything that writes must clean up after itself, even on failure.
