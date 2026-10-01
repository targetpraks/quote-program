# Quorum (quote-program)

**Quorum** — the group purchasing desk. Departments raise purchase requests, purchasers run a 3-quote tender, managers award from a line-by-line comparison matrix, and awards become POs with a Zoho Inventory-ready payload. The SA "3 written quotations" rule, digitised with a defensible audit trail.

The app is a single file — `index.html`: the hardened PocketBase-backed build with real staff auth (requester / purchaser / manager), server-side 3-quote flip, duplicate-PO guards, VAT-normalised exports, back navigation, requester scoping. Live (renders): <https://targetpraks.github.io/quote-program/>.

**v2.9.0 (2026-10-01) — live desk, budgets, spend report, regression suite.** Registers now **stream**: PocketBase realtime subscriptions refresh every open view within a second or two of another role acting (with a `● Live` indicator and a *refresh* pill instead of a re-render wherever you are reading or typing). The previously unused `q_budgets` collection becomes real control — monthly ceilings per brand · department with committed/pending/remaining meters, a **budget impact panel** on the approval desk, a ceiling strip on the detail view, and an estimated-total field on the request form that checks itself against what is free. A **spend report** breaks awarded money down by brand, department, vendor and month and flags awards made above the lowest bid or on fewer than three quotes. And the project gains its first **automated regression suite** (29 Playwright tests, read + writes), which found and fixed a real bug on its first run: every register's *Export CSV* button threw `base is not defined` and produced no file.

**v2.8.1 (2026-09-15) — dashboard register alignment.** The "After your approval" panel's recent-orders block was rendering as a header-less table whose four cells collided with the five-column header above it (status pills appearing under "Venture", PO references under "Awarded vendor", an empty money column). It now carries its own **Ref · Status · PO · brand** header, and reference IDs no longer wrap mid-token.

**v2.8.0 (2026-09-15) — design system and interface lift.** The interface is now documented as a formal design system in **`DESIGN.md`** (Google's DESIGN.md spec: tokens + rationale, lint-clean; Tailwind and DTCG exports committed as `tailwind.theme.json` / `tokens.json`). The canvas lifts out of near-black (`#0B0F1A` → `#1B2438`, ~3.7x luminance) into a lit midnight navy, and contrast improves as it does: faint metadata text moves 2.92:1 → 5.05:1, primary ink 11.9:1, every badge ≥4.68:1. A pre-existing horizontal overflow at ≤960px (which clipped the action column of every register on tablets) is fixed — panels now scroll inside their card. The build version shows in the sidebar.

**v2.7.0 (2026-09-15) — hardening and reporting.** Escaping is complete (`esc()` now covers `'`, and every interpolation of record data goes through it), loads no longer fail silently, expired sessions route cleanly back to login, quantity/price/file inputs are validated before use, and a Content-Security-Policy is in force. On top of that: CSV export on every register (filter-aware, VAT-exclusive, Excel-clean), global search across requests, a print-ready purchase order, and distinct empty/error states.

*(History: `index.html` is this single version since 2026-09-15 — it replaced the original static v1 build, which remains recoverable in git history.)*

## Run instructions

Quorum needs a local **PocketBase 0.40.x** backend:

1. Start PocketBase: `./pocketbase serve --http=127.0.0.1:8090`
2. Create the collections: `qp_users`, `qp_requests`, `qp_quotes`, `q_vendors`, `q_catalog`, `q_outbox`, `q_notifications`, `q_budgets` (schema per the PRD; `qp_requests.audit` and `qp_quotes.prices` are JSON fields).
3. Copy `pb_hooks/quorum.pb.js` into your server's `pb_hooks/` directory — **the `.pb.js` extension is required**; plain `.js` hook files are silently ignored (this bit us once).
4. Open `index.html` — `PB_URL` is hardcoded to `http://127.0.0.1:8090`; repoint it if your backend lives elsewhere.

**GitHub Pages caveat:** the Pages-hosted copy renders, but it cannot reach a backend from the public site — `PB_URL` points at localhost **by design** (this desk is tailnet/internal-only; there is no public ingress). Run it locally against your own PocketBase for a working app.

## Regression tests

The app needs no build step, but it has a dev-only Playwright suite (`package.json`, `playwright.config.js`, `tests/`):

1. PocketBase running on `127.0.0.1:8090` with the test accounts from `CLAUDE.md`.
2. `npm install` once, then `npx playwright install chromium`.
3. `npm test` — read-only: log in as all five accounts, visit every destination, assert zero console errors, chip/search/detail/CSV flows, money invariants, and no horizontal overflow at 420/780/1440px.
4. `npm run test:writes` — mutates a little (realtime probe, manager budget CRUD) and cleans up after itself. Not run by default for that reason.

The suite spins up its own static server on `127.0.0.1:4173`; nothing else is required. See `tests/README.md`.

## Server-side enforcement (`pb_hooks/quorum.pb.js`)

- **Quote attached** → audit entry appended to the parent request + automatic flip to *pending approval* on the 3rd quote (the client no longer writes this — single writer, no lost-update races).
- **Duplicate-PO guards** → creating an outbox row with an existing PO number, or assigning a `po_number` already held by another request, both fail with a 400.
- **Cliq notify (optional)** → on outbox create, a Zoho Cliq DM fires via env vars `QUORUM_CLIQ_MCP_URL` / `QUORUM_CLIQ_NOTIFY_EMAIL`. This repo copy is **sanitized** (no endpoint baked in); if the env vars are unset the notify step is skipped silently — guards and the flip still run.

Known JSVM gotchas encoded in the hook file: module-level `function` declarations are NOT visible inside hook callbacks (inline helpers), and JSON record fields marshal as per-character arrays via `record.get()` (read via `getString()` + `JSON.parse`).

## Zoho Inventory

Direct push (OAuth, `purchaseorders.CREATE` scope) is Phase 2. Until then every approved PO exports a paste-ready payload — the **Zoho JSON** button, the **CSV** export, and the server-side `q_outbox` push queue all carry VAT-exclusive line rates (VAT-inclusive quotes are normalised ÷1.15 and rounded to 2dp).