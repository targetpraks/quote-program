# Changelog

## v2.7.0 — 2026-09-15 (hardening + reporting, search and print)

### Fixed (hardening)
- **XSS: every user- and server-supplied value is now escaped before it reaches the DOM.** `esc()` escaped `& < > "` but **not `'`** — and several template literals interpolated raw record data (request notes, line items and specs, vendor names, catalog specs, audit notes, requester names). All interpolation sites now go through `esc()` and the escaper covers the single quote (`&#39;`). Verified by injecting `<img src=x onerror=…>` into a request note and re-rendering: the handler did not fire and no raw tag reached the DOM.
- **Silent failures surfaced.** Loads that failed behind `catch(()=>{})` rendered an empty list indistinguishable from "no data". User-facing loads now surface a failure toast with a retry affordance, and the app keeps working when the backend is unreachable.
- **Write failures explained, session expiry handled.** A new `handleWriteErr()` inspects the failure — an expired or invalid session (401/403, or the confusing 404 that a stale token produces on write) routes the user cleanly back to the login screen with a "session expired" message instead of a dead-end error; every other failure reports its actual cause. In-flight buttons re-enable so a failed action is retryable.
- **PocketBase auto-cancellation controlled.** Concurrent loads to the same collection silently cancelled each other, so a fast view switch could leave a blank register. Data loads use explicit request keys so a legitimate load is never cancelled by a sibling request.
- **Numeric input validation.** Quantities and prices are validated on input *and* on submit: negatives, zero quantities, NaN and non-finite values are rejected with an inline message rather than silently clamped. The DOM is never trusted.
- **Quote file upload validated before transfer.** Type (PDF/JPG/PNG/DOCX/XLS/XLSX) and size (10 MB cap) are checked client-side with a clear message; a rejected file is never uploaded.
- **Duplicate-PO and reference-generation races closed.** Reference generators dedupe against existing values, and submit buttons disable while a write is in flight, so a double-click can no longer mint a colliding reference.
- **Content-Security-Policy added** — `default-src 'self'`, scripts limited to self plus the PocketBase CDN, styles to self plus Google Fonts, connections to the PocketBase origin. Verified the app still loads and functions under the policy.
- **Dead duplicate definitions removed.** Two top-level declarations were defined twice (`toast`, `views.settings`); JavaScript keeps only the last, so the earlier copies were dead weight that silently shadowed edits. Removed, and all remaining declarations verified unique at top level.

### Added (reporting, search, print)
- **CSV export on every register** — All requests, Purchase orders, Vendors and Catalog, each respecting the active filter chips. Money is written VAT-exclusive using the existing `rateExcl` helper (÷1.15, 2dp — no floating-point artifacts); fields containing commas, quotes or newlines are properly quoted per RFC 4180 so Excel opens them cleanly.
- **Global search in the top bar** — instant client-side search across reference, requester, brand, department and line items, with a no-match state and clear-on-view-change. A typed search is reflected in the filter count so it is obvious why a list is short.
- **Print-ready purchase order** — a "Print PO" action on any ordered request renders a dedicated print sheet (Quorum letterhead, PO number, reference, vendor, line items, VAT-exclusive totals and the approval trail) under `@media print`; the on-screen interface is untouched.
- **Empty and error states** — every register distinguishes "nothing here yet" from "nothing matches your filter" from "the load failed", each with its own copy and next action.

### Changed
- **Export totals now always agree with the screen.** The requests and orders CSVs gated their money column on the strict VAT-status check used for *ranking*, which left legacy rows (bids predating the VAT field) with a rendered total on screen but a blank cell in the export. The export now mirrors what the register displays, falling back to the arithmetic minimum when the strict figure is unavailable. Verified across all POs: screen and CSV agree to the cent.

### Notes
- No schema change, no collection or server-rule changes. Single-file release; no new dependencies, no build step.
- Accessibility pass: real labels on inputs and icon-only buttons, modals operable by keyboard (Esc closes, focus trapped, focus returns to the trigger), toasts announced via `aria-live`, visible focus rings. Visual design unchanged.
- Verified E2E against the live PocketBase backend as all three roles (manager / purchaser / requester): every view loads with zero console errors in all 30 role × view combinations; search filters 12 → 2 → empty state and restores; the XSS payload does not execute; quantity/price/file validation rejects bad input with the right message; CSV rows for all five purchase orders match their on-screen totals.

## v2.6.0 — 2026-09-15 (sidebar reorganisation + colour system)

### Changed
- **Sidebar is now grouped, not a flat list.** Four labelled sections — *Workspace* (your role's desk), *Registers* (all requests, orders), *Master data* (vendors, catalog), *Admin* (alerts, staff, settings) — so destinations are found by intent, not by reading every label.
- **One colour per destination, applied consistently.** Each nav item carries a tone (gold / blue / green / teal / amber / violet) that paints its icon, its hover edge, its active pill, and its count badge; section labels echo their group's tone with a dot and rule. Colour now encodes *where you are*, not decoration.
- **Contrast raised across the sidebar.** Inactive labels move from muted grey to brighter slate (measured 8.5:1 on the panel, up from ~3:1); section labels 6.3:1; badges are solid-tone pills with dark text (7.3–11.2:1). Every sidebar text element clears WCAG AA at its size.
- **Account block reworked** — name, role chip colour-coded to the role (manager gold / purchaser blue / requester green), email, then Sign out; spacing fixed and email truncation handled on narrow widths.
- **New request CTA in the sidebar** — the primary action is always one click away, above the nav (the top-bar button remains).
- **Empty count badges hide** instead of rendering as stray dashes, so a badge always means "there is something here".
- **Narrow screens reflow cleanly** — the bar wraps (brand + account row one, scrollable nav row two) and form grids stack, removing a pre-existing horizontal overflow at ≤960px (verified 0 overflowing elements at 780px).

### Notes
- Presentation-only release: no schema change, no collection or server-rule changes.
- Verified live as all three roles (manager / purchaser / requester): grouped sections render per role, tone classes applied, badges correct, active state follows the view, CTA opens the new-request modal, every nav destination loads, mobile wrap verified at 780px with zero horizontal overflow.

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