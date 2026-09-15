# Quorum (quote-program) — procurement desk

Single-file app: `index.html` (~1350 lines). PocketBase 0.40.x backend on `http://127.0.0.1:8090`.

## Critical rules
- **Only the FIRST `<script>` block executes** (opens ~line 205). The file historically carried a duplicate script block that dies at parse (top-level const redeclaration). Check which block is live before editing.
- `PB_URL` is hardcoded `http://127.0.0.1:8090`. Repo copy uses an `OWNER_EMAIL` placeholder; the local canonical copy holds the live email. **Never commit a live email address.**
- `pb_hooks/*.pb.js` — plain `.js` is silently ignored. Hook names are PB 0.40.3: `onRecordCreateRequest`, `onRecordUpdateRequest`, `onRecordAfterCreateSuccess`.
- Prices shape is `[{i, p, vat}]` — ALWAYS read via `priceOf(q,i)`. Direct `q.prices[i]` returns objects.
- Refs (`RQ-`/`PO-`/`TND-`) are NOT unique. Key everything on `pbId`.
- `esc()` escapes `& < > "` only. Every user-supplied value interpolated into a template literal MUST go through `esc()`.
- VAT-exclusive math uses `rateExcl()` (÷1.15, 2dp) — never raw division.

## Conventions
- UK English. Currency `R 1,234.00` (en-ZA).
- Design: existing CSS variables (--display, --gold, tone classes). Do not restyle; match.
- No build step, no framework, no bundler. Plain ES in one script block.
- Changelog: append a version section at the TOP of `CHANGELOG.md`.

## Test accounts (qp_users collection, NOT PocketBase users)
- manager@papapasta.co.za / Manager#2026
- shirley@infinitybrands.co.za / Purchase#2026
- nadia@papapasta.co.za / Request#2026
- thabo@thelocalfarmer.co.za / Request#2026
- rickymaio+buyer@gmail.com / Buyer#2026

Superuser (API only): ricky@infinitybrands.co.za / QuoteDesk#2026
