# Changelog

## v2.0.0 — 2026-09-15 (Quorum hardening)

Product name ratified as **Quorum**; repo stays `quote-program`.

### Fixed
- **Mis-award root cause eliminated:** every detail view and action (`approve()`, `makePO()`, reject, quote attach, exports) now resolves records by the PocketBase record id — duplicate `RQ-`/`TND-` refs can no longer act on the wrong request. Proven live with a duplicate-ref pair still in the data: the old ref-keyed lookup demonstrably resolved the wrong record; the pbId path approved the intended one.
- **Ref/PO generators** dedupe against live values (loop until unused) — count+1 collisions after deletes are gone.
- **Dead script tail removed:** the file was a double-document concatenation whose second copy died at parse; truncated to a single valid document (one app shell, all views verified unchanged).
- **Money invariants:** all money surfaces (comparison matrix, PO totals, Zoho payload, CSV) are VAT-exclusive; VAT-inclusive quotes normalise ÷1.15 with 2dp rounding; bids without a VAT status never rank.
- **Hooks never loaded:** the original hook file was named `quorum.js` — PocketBase only loads `pb_hooks/*.pb.js` — and used hook names that don't exist in 0.40.3 (`onRecordAfterCreateRequest`). The Cliq notify had been a silent no-op its entire life; now proven firing (HTTP 200).

### Added / Enhanced
- **Server-side enforcement** (`pb_hooks/quorum.pb.js`): quote-attach audit append + automatic 3rd-quote flip to *pending*; outbox duplicate-PO guard; request `po_number` uniqueness guard (both 400 on collision).
- Back navigation on every sub-view (origin-aware breadcrumb).
- Requester scoping: requesters see only their own requests and orders.
- Create-user form no longer ships a default password.
- Visible UI strings renamed to Quorum (masthead, login, exports, backup filename).

### PocketBase JSVM notes
- Hook files MUST end in `.pb.js`.
- Valid 0.40.x names: `onRecordCreateRequest`, `onRecordUpdateRequest` (request-phase guards), `onRecordAfterCreateSuccess` (post-persist).
- Module-level `function` declarations are not visible inside hook callbacks — inline helpers.
- JSON record fields marshal as per-character arrays via `record.get()` — read via `getString()` + `JSON.parse`.
- Cliq endpoint is env-gated in this repo copy (`QUORUM_CLIQ_MCP_URL`), sanitized for public publication.

## v1 — original build

Static single-file app (root `index.html`), localStorage persistence, role switcher. See git history.