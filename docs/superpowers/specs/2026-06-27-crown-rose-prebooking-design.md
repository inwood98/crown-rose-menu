# Crown Rose Pre-Booking App — Design

Date: 2026-06-27 (revised)

## Purpose
A client-side React app for a family birthday meal at the BA Crown Rose pub.
**Each guest** logs their own name and menu choices on their own phone; the
**organiser (admin)** collects everyone into a guest list and emails the whole
order to the pub. No backend; deployable to GitHub Pages.

## Decisions (from brainstorming)
- **Roles:** Guest (logs their own order) and Admin/organiser (collects + emails pub).
- **Input model:** each guest fills the form on their own phone, then sends the
  organiser a link/code. No server — picks are packed into the link/code.
- **Per-guest selection:** free pick from the whole menu (no fixed course structure).
- **Menu:** full menu including drinks; dietary tags + filter; dark mode.
- **Persistence:** guest draft persists on the guest's device; the roster persists
  on the organiser's device.

## Stack
React 18 + Vite + TypeScript, plain CSS. No router lib — hash-based routing. No
network calls. `vite.config.ts` sets `base` for GitHub project-pages hosting.

## Routing (URL hash)
- `#` (default) → **Guest** screen.
- `#admin` → **Admin** screen (organiser bookmarks this).
- `#g=<payload>` → **Import** prompt ("Add <name>'s order?") → adds to roster → `#admin`.

## Data model
- `Order` = `Record<skuKey, qty>` (unchanged; references the hard-coded menu).
- `GuestEntry` = `{ id, name, order, addedAt }` — one diner in the roster.
- Share payload = `{ n: name, o: order }`, JSON → URL-safe base64, carried in the
  link (`#g=…`) or as a copyable code. Decoded via the existing SKU lookup.

## Storage (localStorage keys)
- `crown-rose-guest-v1` → guest's own draft `{ name, order }`.
- `crown-rose-admin-v1` → `{ guests: GuestEntry[], pubEmail: string }`.
- `crown-rose-theme` → `'light' | 'dark'` (shared by both screens).

## Components
- `App` — parses the hash, owns theme, routes to the right view.
- `GuestView` — name field + full menu (FilterBar, MenuItemRow, steppers) +
  `MyOrderPanel`.
- `MyOrderPanel` — guest's running order + total; "Create my order" produces a
  share link and copy-code to send the organiser.
- `AdminView` — roster (each guest + items + subtotal, grand total), an import box
  (paste link/code), pub-email field, and **Email the pub** (mailto) + Download
  JSON + Copy all.
- `ImportPrompt` — shows a decoded incoming order with "Add to my guest list".
- Reused: `FilterBar`, `MenuItemRow`, `QuantityStepper`, `ThemeToggle`, `dietary`.

## Export / email
- **Email the pub** — `mailto:<pubEmail>` with subject + body = full roster text.
  (Copy all + Download JSON provided as fallback for long orders / mailto limits.)
- **Download JSON** — `{ pub, guests[], grandTotal, timestamp }`.

## Validation
Guest: name required + at least one item before "Create my order".
Admin: pub email must look valid before "Email the pub" enables.

## Styling
Green/gold pub palette via CSS custom properties; dark mode; mobile-first.

## Out of scope
Real-time multi-device sync, backend, auth, payments, real reservations.
