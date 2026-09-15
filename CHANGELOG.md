# Changelog

## v2.5.0 — 2026-09-15 (brand-wide visibility for requesters — duplicate prevention)

### Added
- **Brand scope toggle on the requester workspace.** *My requests* now carries two scopes: **My requests** (your own, unchanged) and **<Brand> — all** (every request in flight across your brand, e.g. "Papa Pasta — all"). A requester can see what colleagues have already asked for before raising a duplicate; their own rows are tagged *(you)* so they stay identifiable in the combined list.
- **Duplicate-check search** on the brand view — instant free-text search across ref, requester, venture, department and line items, with a no-match state. The panel hint states the intent: *"Duplicate check — search by item before raising a new request."*
- **Requested by filter** in the brand scope (replaces the redundant Brand dropdown, since the scope already fixes the brand).
- **Duplicate-check prompt in the New request modal** — for requesters, the subtitle points at their brand's register first, keeping duplication prevention inside the workflow.

### Notes
- UI-only change; server rules already allow any authenticated staff member to read requests. No schema change.
- Brand is derived from `qp_users.venture`; *All Ventures* users fall back to a group-wide register labelled "Group — all".
- Verified E2E: Nadia (Papa Pasta) — own 4, brand 5; search "oven" → 1 row, "shelving" → 2, clear restores all 5; Requested-by=Sipho → 1. Thabo (TLF) brand scope shows TLF only (3 rows) with no cross-brand leakage. Buyer desk + approval desk regression-tested on the same build.

## v2.4.0 — 2026-09-15 (vendors tagged by brand + brand filter)

### Added
- **Vendors are tagged by brand.** `q_vendors` gains a `brands` field (JSON array). A vendor can supply several brands (e.g. Kitchenline CC → Infinity Brands + Papa Pasta); vendors with no tags stay group-wide and appear under every filter.
- **Brand filter chips on the Vendors page.** All / one chip per entity with live counts — click a brand to see exactly who supplies it. Matches the catalog chip design language.
- **Tagging in the UI.** *Add vendor* now captures Brands supplied (multi-select); existing vendors get a *Brands* button on each row to tag/untag at any time (manager + purchaser; Remove stays manager-only).
- **Brand-aware vendor suggestions in the quote form.** When a buyer attaches a quote, the vendor name field now suggests only vendors tagged to that request's brand (+ group-wide), with a hint line showing the count — the buyer no longer retypes names or picks from the whole list.

### Notes
- Schema: one new field `q_vendors.brands` (migration `1789481500_updated_q_vendors.js`); REST rules unchanged.
- Existing vendors were backfilled from their quote history: Caterwise → Papa Pasta; Kitchenline CC + ProResto → Infinity Brands, Papa Pasta; Mushroom Guru → The Local Farmer; Maio Holdings left group-wide.
- Row actions are role-gated: Brands/Blacklist = manager + purchaser, Remove = manager. (Previously the Blacklist button showed for every role, including requesters who can't write.)
- Empty state on a brand with no tagged vendors: "No vendors tagged to this brand yet — tag one, or add a new vendor."
- Verified end-to-end (manager + purchaser + requester roles): chip filtering per brand, tag save/revert server-side, vendor create with brands, row delete gate, quote-form suggestions for Papa Pasta & The Local Farmer, empty states.

## v2.3.0 — 2026-09-15 (role spaces — each desk gets its own workspace)

### Added
- **Requester workspace — *My requests*.** A requester now lands on a dedicated home: every request they raised, end to end (sourcing → approval → PO), with live counters (in sourcing / awaiting approval / approved-ordered / POs issued), status chips, and Brand + Department filter dropdowns. A *How it works* panel explains the flow. Previously requesters landed on an approval-style dashboard built for managers.
- **Buyer workspace — *Buyer desk*.** The purchaser's *Pipeline* is replaced by an active workspace: counters by stage (to source / awaiting approval / approved — raise the PO / ordered), stage-named status chips, and **Brand + Requester filter dropdowns**. Row actions are stage-aware — *Attach 3 quotes* / *Capture quote n/3* → *Awaiting approval* → *Review & raise PO* → *Open*. The approved-with-PO-outstanding queue is a first-class view (chip *Ready to order*).
- **Manager — *After your approval* panel** on the approval desk: approved requests awaiting a PO (ref, awarded vendor, total) plus a recent ordered/rejected strip — the manager can see the hand-off continue after they sign.
- **Purchase-order register filters** — Brand + Requester dropdowns, plus stat cards (PO count, committed spend, brands ordering) that respect the filter.

### Changed
- Every role now lands on **its own home view** on sign-in: manager → approval desk, purchaser → buyer desk, requester → my requests. Previously all roles landed on the same dashboard.
- Navigation is role-shaped: *All requests* and *Alerts* hide for requesters; the *Pipeline* item is gone (superseded by *Buyer desk*).
- Chip-bar helper generalised (`chipsHtml`) so each space renders its own status vocabulary and handler.

### Notes
- No schema change — ships on the existing PocketBase collections.
- Verified end-to-end against the live server with all three roles (requester Nadia + Thabo, buyer, manager): home views, chips, brand/requester filters, stage-aware buttons, approve → *Generate PO* hand-off, and requester order scoping.

## v2.2.0 — 2026-09-15 (status filters on the registers)

### Added
- **Status filter chips on the request registers.** *All requests* and the purchaser *Pipeline* now carry a chip bar — All / Quoting / Pending / Approved / Rejected / Ordered — with live per-status counts and one-click filtering. Counts respect role scoping (a requester's chips count only their own requests).
- **Empty states with a clear-filter escape** when a status has no records ("No rejected requests — clear filter").
- **Status badge column in the purchaser pipeline** — the queue previously showed only progress counts; status is now explicit per row, and the view title/scope reflects it ("Request pipeline", full lifecycle rather than only the open subset).

### Notes
- Filter scope: persists across a detail-view round-trip (open a request → back keeps the chip); resets to All when switching between register views.
- Uses the existing catalog chip design language — no new styles.

## v2.1.0 — 2026-09-15 (entity-scoped catalog + manager capture)

### Added
- **Entity-scoped item catalog.** `q_catalog` gains a `venture` field; every item now belongs to an entity. The catalog page shows filter chips (All / one per entity) with per-entity counts, and the table carries an Entity column. Items without a venture remain group-wide and appear under every filter.
- **Catalog CRUD in the UI.** Add item (manager + purchaser) codes new items directly to the selected entity's list; Remove (manager) deletes. Entity, unit, spec, GL code/group and est. price capture. Server-side rules unchanged: create = manager/purchaser, delete = manager.
- **Entity-aware request lines.** The new-purchase-request form filters the item suggestion list by the selected venture — requesters pick from their entity's inventory (a hint shows the list size per entity). Free-text lines still allowed.

### Fixed
- **Manager can capture quotes and raise POs** (buyer-perspective gap): managers now see *Add quote* while a request is quoting, and *Generate PO* once approved — previously these were purchaser-only and looked like missing permissions when signed in as manager.

### Notes
- Items without a `venture` value show as `—` and are treated as group-wide (visible under every chip).
- Requires the `q_catalog.venture` migration (`1789469400_updated_q_catalog.js` in the local PocketBase) — the published static app expects the field to exist when saving items.

## Consolidation — 2026-09-15 (single app)

- One version: the hardened build is now `index.html` at the repo root (moved from `v2/index.html`). The original static v1 build was removed from the tree — recoverable in git history (commit `0aa8538`).
- One URL: <https://targetpraks.github.io/quote-program/> serves the app; the `/v2/` path is gone.

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