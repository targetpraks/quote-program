# Quote Program

Three-quote procurement approval for the ventures. Departments raise purchase requests, purchasers attach 3 vendor quotes (docs + line prices), the program compares vendors line-by-line with totals, and the manager approves from a dashboard. Approved requests become POs with a Zoho Inventory-ready payload.

## Flow

1. **Request** (department) — line items, venture, needed-by → `RQ-YYYY-NNNN`, status *Quoting*
2. **Quotes** (purchaser) — attach 3 vendor quotes with per-line prices, delivery, lead time; status flips to *Pending approval* on the third
3. **Approve** (manager) — approval desk shows the comparison matrix; approve any vendor (recommended = lowest total, ◆) or reject with reason
4. **Order** (purchaser) — generate `PO-YYYY-NNNN`, export the Zoho Inventory payload (JSON) or CSV

## Run

Static single-page app — open `index.html` or serve via GitHub Pages. Data persists in browser localStorage; Settings → Export/Import full JSON backup.

## Roles (v1)

Role switcher, no auth: **Manager** (approval desk) · **Purchaser** (sourcing + PO generation) · **Requester** (department).

Zoho direct push (OAuth, purchase-order scope) is Phase 2 — payloads are export-ready now.