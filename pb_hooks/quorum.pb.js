/// <reference path="../pb_data/types.d.ts" />
// Quorum v2 hooks — PocketBase 0.40.3. File MUST be named *.pb.js to load (plain .js is silently ignored).
// JSVM gotchas encoded here (proven 2026-09-15):
//   (1) module-level function declarations are NOT visible inside hook callbacks — inline helpers;
//   (2) record.get() on JSON fields returns a per-character array — read via getString() + JSON.parse;
//   (3) request-phase guards = onRecordCreateRequest / onRecordUpdateRequest; post-persist = onRecordAfterCreateSuccess.
// SANITIZED REPO COPY: the live deployment wires the Zoho Cliq notify via env vars
//   QUORUM_CLIQ_MCP_URL / QUORUM_CLIQ_NOTIFY_EMAIL. If unset, the notify step is skipped —
//   guards and the 3-quote flip still run.
console.log("[quorum] hooks v2 loading — guards: outbox-dup, request-po-dup; automation: quote-flip, cliq-notify(env-gated)")

// 1) Outbox duplicate guard — exactly one outbox row per PO number (throw blocks with 400)
onRecordCreateRequest((e) => {
  const po = e.record.getString("po_number")
  if (po) {
    const dupe = e.app.findRecordsByFilter("q_outbox", "po_number = {:po}", "", 1, 0, { po: po })
    if (dupe.length > 0) {
      console.log("[quorum] outbox dup blocked:", po)
      throw new BadRequestError("Quorum: outbox already has " + po + " — duplicate PO push blocked.")
    }
  }
  e.next()
}, "q_outbox")

// 2) Request po_number uniqueness guard — a PO number may never sit on two requests
onRecordUpdateRequest((e) => {
  const po = e.record.getString("po_number")
  if (po) {
    const dupe = e.app.findRecordsByFilter(
      "qp_requests", "po_number = {:po} && id != {:id}", "", 1, 0, { po: po, id: e.record.id })
    if (dupe.length > 0) {
      console.log("[quorum] request po_number dup blocked:", po)
      throw new BadRequestError("Quorum: " + po + " is already assigned to another request — duplicate blocked.")
    }
  }
  e.next()
}, "qp_requests")

// 3) Quote attached → server-side audit append + automatic 3-quote flip to pending.
//    Single writer: the client no longer patches the request on quote upload.
onRecordAfterCreateSuccess((e) => {
  try {
    const quote = e.record
    const reqId = quote.getString("request")
    if (!reqId) return
    const req = e.app.findRecordById("qp_requests", reqId)
    const count = e.app.findRecordsByFilter("qp_quotes", "request = {:rid}", "", 100, 0, { rid: reqId }).length
    const vendor = quote.getString("vendor") || "vendor"
    const by = quote.getString("uploaded_by") || "Purchaser"
    const now = new Date().toISOString()
    let prev = []
    try {
      const s = req.getString("audit")
      if (typeof s === "string" && s.trim()) {
        const p = JSON.parse(s)
        if (Array.isArray(p)) prev = p.filter((x) => x && typeof x === "object")
      }
    } catch (err2) { prev = [] }
    const attach = { ts: now, actor: by, action: "Quote attached — " + vendor, note: count + "/3" }
    if (count >= 3 && req.getString("status") === "quoting") {
      req.set("audit", [{ ts: now, actor: "System", action: "3 quotes — submitted for approval", note: "" }, attach].concat(prev))
      req.set("status", "pending")
      console.log("[quorum] 3-quote flip -> pending for", reqId, "(", count, "quotes )")
    } else {
      req.set("audit", [attach].concat(prev))
      console.log("[quorum] quote audit appended to", reqId, "(", count + "/3 )")
    }
    e.app.save(req)
  } catch (err) {
    console.log("[quorum] quote-flip hook error:", String(err))
  }
}, "qp_quotes")

// 4) PO outbox created → notify via Zoho Cliq (env-gated; skipped when not configured)
onRecordAfterCreateSuccess((e) => {
  const rec = e.record
  const po = rec.getString('po_number') || ''
  const ref = rec.getString('request_ref') || ''
  if (!po) return
  const cliqUrl = $os.getenv("QUORUM_CLIQ_MCP_URL") || ""
  const cliqTo = $os.getenv("QUORUM_CLIQ_NOTIFY_EMAIL") || ""
  if (!cliqUrl || !cliqTo) {
    console.log("[quorum] Cliq notify skipped for", po, "(QUORUM_CLIQ_MCP_URL / QUORUM_CLIQ_NOTIFY_EMAIL unset)")
    return
  }
  const res = $http.send({
    url: cliqUrl,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'tools/call',
      params: { name: 'ZohoCliq_send_message_to_user', arguments: {
        path_variables: { EMAIL_ID: cliqTo },
        body: { text: 'Quorum: ' + po + ' generated (' + ref + '). Outbox status: manual - awaiting Zoho Inventory link.' }
      }}
    })
  })
  console.log("[quorum] Cliq notify for", po, "-> HTTP", (res && res.statusCode) || "?")
}, 'q_outbox')