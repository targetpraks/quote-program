---
version: alpha
name: Quorum
description: Midnight navy desk with a warm brass accent — high-contrast, instrument-panel calm for a procurement approval desk.
colors:
  # surfaces (lifted 2026-09-15: pre-v2.8 near-black canvas measured 0.005 luminance;
  # operators read the UI as "too dark" — these values lift ~3x while keeping contrast high)
  canvas: "#1B2438"
  surface: "#232F4D"
  surface-sunken: "#1F2A44"
  surface-raised: "#2A3757"
  rule: "#3A4A72"
  rule-soft: "#31406A"
  # text
  ink: "#EEF3FC"
  ink-muted: "#ADBBD8"
  ink-faint: "#92A0C0"
  nav-label: "#C3CDE4"
  sec-label: "#A5B2CE"
  ink-inverse: "#1A1305"
  # accent — brass
  primary: "#E3C078"
  gold: "#E3C078"
  gold-deep: "#C9A254"
  gold-bright: "#EBCB8B"
  # semantic
  green: "#58C895"
  red: "#F6A19D"
  amber: "#E2A852"
  blue: "#9FBEF6"
  teal: "#5FC6C8"
  violet: "#B8ACF4"
typography:
  display:
    fontFamily: Fraunces
    fontSize: 30px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "0.01em"
  h1:
    fontFamily: Fraunces
    fontSize: 26px
    fontWeight: 600
    lineHeight: 1.2
  h3:
    fontFamily: Inter
    fontSize: 14.5px
    fontWeight: 600
    lineHeight: 1.4
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Inter
    fontSize: 12.5px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.3
  kicker:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.18em"
  table-head:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.12em"
  num:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
  stat-num:
    fontFamily: JetBrains Mono
    fontSize: 26px
    fontWeight: 600
    lineHeight: 1.2
rounded:
  sm: 7px
  md: 9px
  lg: 14px
  pill: 999px
spacing:
  xs: 6px
  sm: 10px
  md: 14px
  lg: 20px
  xl: 26px
  xxl: 34px
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink-inverse}"
    rounded: "{rounded.md}"
    padding: 10px
  button-primary-hover:
    backgroundColor: "{colors.gold-bright}"
    textColor: "{colors.ink-inverse}"
    rounded: "{rounded.md}"
    padding: 10px
  button-secondary:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.sm}"
    padding: 6px
  button-approve:
    backgroundColor: "{colors.green}"
    textColor: "{colors.ink-inverse}"
    rounded: "{rounded.sm}"
    padding: 6px
  button-reject:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.red}"
    rounded: "{rounded.sm}"
    padding: 6px
  nav-item:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.nav-label}"
    rounded: "{rounded.sm}"
    padding: 9px
  nav-item-active:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 9px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 20px
  input:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 9px
  badge-pending:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.gold}"
    rounded: "{rounded.pill}"
    padding: 3px
  badge-approved:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.green}"
    rounded: "{rounded.pill}"
    padding: 3px
  badge-rejected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.red}"
    rounded: "{rounded.pill}"
    padding: 3px
  badge-ordered:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.blue}"
    rounded: "{rounded.pill}"
    padding: 3px
  badge-quoting:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.amber}"
    rounded: "{rounded.pill}"
    padding: 3px
  badge-catalog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.teal}"
    rounded: "{rounded.pill}"
    padding: 3px
  badge-admin:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.violet}"
    rounded: "{rounded.pill}"
    padding: 3px
  page:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
  divider:
    backgroundColor: "{colors.rule}"
    height: 1px
  divider-soft:
    backgroundColor: "{colors.rule-soft}"
    height: 1px
  text-faint:
    textColor: "{colors.ink-faint}"
    typography: "{typography.body-sm}"
  nav-section-label:
    textColor: "{colors.sec-label}"
    typography: "{typography.table-head}"
  link:
    textColor: "{colors.gold-deep}"
    typography: "{typography.body-md}"
---

## Overview

Quorum is the group purchasing desk: a tender register where departments raise requests, purchasers
attach three quotes, and managers award from a line-by-line comparison matrix. The people using it are
buyers and approvers doing focused, repetitive work with money on the line. The interface should feel
like a well-lit instrument panel: calm, precise, and quietly premium — never dim, never decorative.

The identity is a midnight-navy desk with a warm brass accent. Navy carries structure (surfaces, rules,
navigation); brass marks the single path forward (the primary action, the recommended vendor, the
amount that matters). Colour is never decoration here — every hue means something.

**v2.8 palette lift (2026-09-15).** The original build sat on a near-black canvas (`#0B0F1A`,
luminance 0.005). Operators read it as "too dark" for all-day use. The v2.8 surfaces lift the canvas
to `#1B2438` (luminance 0.018, ~3x) and the panel to `#232F4D` — enough to distinguish surfaces
without losing the high-contrast character the desk depends on. Text and accent contrast ratios
**improved** in the process; see the Do's and Don'ts for measured figures.

## Colors

- **Canvas (`#1B2438`)** — the page ground. Deep navy, lifted from near-black so surface separation
  reads at a glance.
- **Surface (`#232F4D`)** — panels, cards, tables. The primary reading surface; `ink` sits at 11.9:1.
- **Surface-sunken (`#1F2A44`)** — sidebar, inputs, quote cards, code payloads. Recedes behind the
  main surface; carries `nav-label` at 8.9:1.
- **Surface-raised (`#2A3757`)** — hover and active states. The only "forward" surface step.
- **Gold (`#E3C078`)** — the brass. Primary actions, recommended vendor, active nav tone, money
  emphasis. On the panel it measures 7.62:1 — safe for text, not just borders.
- **Gold-deep (`#C9A254`)** — pressed states, link rest state on canvas (6.47:1), gradient foot.
- **Green (`#58C895`)** — approval, success, blacklist-clear. **Red (`#F6A19D`)** — rejection,
  destructive, expired. **Amber (`#E2A852`)** — quoting, work-in-progress. **Blue (`#9FBEF6`)** —
  ordered, registers. **Teal (`#5FC6C8`)** — catalog. **Violet (`#B8ACF4`)** — admin.
- **Ink (`#EEF3FC`)** primary text, **muted (`#ADBBD8`)** secondary, **faint (`#92A0C0`)** tertiary
  metadata. All three clear 4.6:1 on every surface — faint included, because metadata here is often
  the thing being audited.

Every semantic hue doubles as its own badge tint (16% hue over surface) with the hue as text, so every
status pill measures ≥4.6:1 without exception.

## Typography

Three families, each with one job:

- **Fraunces** (display serif) — the wordmark, page titles, modal titles. Signals the desk's
  seriousness without shouting.
- **Inter** (body sans) — everything a person reads in sentences. 14px base, 12.5px for table
  secondary text.
- **JetBrains Mono** — figures, references, column heads, kickers. Tabular figures keep money columns
  aligned to the cent, which is the whole point of a comparison matrix. Use `font-variant-numeric:
  tabular-nums`.
- Nav labels (13.5px/500) and section labels (10px, letterspaced, uppercase) — the sidebar's own
  scale; section labels are never used inside content.

## Layout

- **App shell:** fixed 236px sidebar + fluid main, capped at 1240px and centred.
- **Breakpoint at 960px:** the sidebar becomes a wrapped top bar (brand + account on row one,
  scrollable nav on row two), stat cards drop to two columns, and every form grid collapses to one
  column.
- **Spacing scale** (`xs`–`xxl`) governs padding and gaps; panels use `lg` (20px) internal padding,
  stat cards 16/18px, table cells 12/14px.
- Money and reference columns are always right-aligned or tabular — never ragged.

## Elevation & Depth

Depth is expressed with **surface steps and rules, not shadows.** The ladder is canvas → surface →
surface-sunken, with `surface-raised` for interactive lift. A 1px `rule-soft` border separates
sibling surfaces; `rule` marks a heavier boundary (below table heads, around modals).

Two exceptions carry real shadow: the toast (floating above all content) and the primary button on
the sidebar CTA. Modals sit on a `rgba(5,8,15,.72)` scrim — a scrim that darkens the room rather than
adding light.

## Shapes

- Cards, panels, modals: `lg` (14px), modals 16px.
- Buttons and inputs: `md` (9px); small buttons and chips `sm` (7px) or pill.
- Status badges, chips, counts: full pills (999px). Pills are reserved for *classification* — if it
  is not a status, a filter, or a count, it does not get a pill shape.

## Components

- **`button-primary`** — brass fill, ink-inverse text, one per region. Never two primary buttons
  competing in the same panel.
- **`button-secondary` / ghost** — transparent with a rule border; hover raises border and text.
- **`button-approve`** — green fill for the decisive award action. **`button-reject`** — red text on
  surface with a red-tinted border; destructive actions never get a filled button.
- **`nav-item`** — sunken surface, `nav-label` text, a 2px tone edge on hover/active. Each destination
  owns one tone (gold/blue/green/teal/amber/violet) applied consistently to icon, edge, active pill,
  and count badge — colour encodes *where you are*.
- **`card` / panel** — surface with a `rule-soft` border, 14px radius, header row with an optional
  hint.
- **`input`** — sunken fill, `rule` border, gold border on focus, visible focus ring
  (`:focus-visible`, 2px gold, 2px offset) preserved everywhere.
- **Badges** — pill, hue-as-text on a 16% tint of the same hue. `pending` gold, `approved` green,
  `rejected` red, `ordered` blue, `quoting` amber.

## Do's and Don'ts

- **Do keep the canvas above luminance 0.015.** Below that, surface separation disappears and
  operators read the desk as "switched off". v2.8 measures 0.018.
- **Do verify every text/background pair at ≥4.5:1.** The v2.8 token set measures: ink 11.9:1, muted
  6.9:1, faint 5.1:1 (worst-case surface), gold 7.6:1, every badge ≥4.6:1, every count pill ≥8.1:1.
- **Do let brass mark exactly one thing per region** — the next action. If two brass elements compete,
  one is wrong.
- **Don't fill destructive actions.** Rejection is red *text*, not a red button — a filled red button
  in an approval flow invites mis-clicks on the most consequential action in the app.
- **Don't introduce a seventh tone.** Six tones, six destinations; a new colour means a new
  destination, not a new decoration.
- **Don't use shadows for hierarchy.** Surface steps and rules only; shadows mean "floating above
  everything" and are reserved for toasts.
- **Don't lower `faint` below 4.6:1** for aesthetics. Metadata (dates, notes, specs) is frequently what
  gets audited months later.
