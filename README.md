# Quorum (quote-program)

**Quorum** — the group purchasing desk. Departments raise purchase requests, purchasers run a 3-quote tender, managers award from a line-by-line comparison matrix, and awards become POs with a Zoho Inventory-ready payload. The SA "3 written quotations" rule, digitised with a defensible audit trail.

The app is a single file — `index.html`: the hardened PocketBase-backed build with real staff auth (requester / purchaser / manager), server-side 3-quote flip, duplicate-PO guards, VAT-normalised exports, back navigation, requester scoping. Live (renders): <https://targetpraks.github.io/quote-program/>.

**v2.7.0 (2026-09-15) — hardening and reporting.** Escaping is complete (`esc()` now covers `'`, and every interpolation of record data goes through it), loads no longer fail silently, expired sessions route cleanly back to login, quantity/price/file inputs are validated before use, and a Content-Security-Policy is in force. On top of that: CSV export on every register (filter-aware, VAT-exclusive, Excel-clean), global search across requests, a print-ready purchase order, and distinct empty/error states.

*(History: `index.html` is this single version since 2026-09-15 — it replaced the original static v1 build, which remains recoverable in git history.)*

## Run instructions

Quorum needs a local **PocketBase 0.40.x** backend:

1. Start PocketBase: `./pocketbase serve --http=127.0.0.1:8090`
2. Create the collections: `qp_users`, `qp_requests`, `qp_quotes`, `q_vendors`, `q_catalog`, `q_outbox`, `q_notifications`, `q_budgets` (schema per the PRD; `qp_requests.audit` and `qp_quotes.prices` are JSON fields).
3. Copy `pb_hooks/quorum.pb.js` into your server's `pb_hooks/` directory — **the `.pb.js` extension is required**; plain `.js` hook files are silently ignored (this bit us once).
4. Open `index.html` — `PB_URL` is hardcoded to `http://127.0.0.1:8090`; repoint it if your backend lives elsewhere.

**GitHub Pages caveat:** the Pages-hosted copy renders, but it cannot reach a backend from the public site — `PB_URL` points at localhost **by design** (this desk is tailnet/internal-only; there is no public ingress). Run it locally against your own PocketBase for a working app.

## Server-side enforcement (`pb_hooks/quorum.pb.js`)

- **Quote attached** → audit entry appended to the parent request + automatic flip to *pending approval* on the 3rd quote (the client no longer writes this — single writer, no lost-update races).
- **Duplicate-PO guards** → creating an outbox row with an existing PO number, or assigning a `po_number` already held by another request, both fail with a 400.
- **Cliq notify (optional)** → on outbox create, a Zoho Cliq DM fires via env vars `QUORUM_CLIQ_MCP_URL` / `QUORUM_CLIQ_NOTIFY_EMAIL`. This repo copy is **sanitized** (no endpoint baked in); if the env vars are unset the notify step is skipped silently — guards and the flip still run.

Known JSVM gotchas encoded in the hook file: module-level `function` declarations are NOT visible inside hook callbacks (inline helpers), and JSON record fields marshal as per-character arrays via `record.get()` (read via `getString()` + `JSON.parse`).

## Zoho Inventory

Direct push (OAuth, `purchaseorders.CREATE` scope) is Phase 2. Until then every approved PO exports a paste-ready payload — the **Zoho JSON** button, the **CSV** export, and the server-side `q_outbox` push queue all carry VAT-exclusive line rates (VAT-inclusive quotes are normalised ÷1.15 and rounded to 2dp).