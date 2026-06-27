# BA Crown Rose — Pre-Booking App

A small client-side React app for organising a group meal at the BA Crown Rose pub
from its June 2026 menu. Each **guest** logs their own choices on their own phone;
the **organiser** collects everyone into one list and emails it to the pub. No
backend, no accounts — everything stays in the browser.

## How it works

1. **Guests** open the link, type their name, and freely pick anything from the full
   menu. They tap **Create my order** and get a share **link + code** to send the
   organiser (WhatsApp, text, etc.).
2. The **organiser** opens the **Organiser** view (the link, plus `#admin`).
   Clicking a guest's link — or pasting their code — adds them to the **guest list**.
3. The organiser sees every guest with their items, per-guest subtotals and a table
   total, enters the pub's email, and taps **Email the pub** (also **Copy all** /
   **Download JSON**).

Because there is no server, each guest's order is packed into their link/code, so
nothing leaves the device until the organiser emails the pub.

## Features

- Full menu (starters & sharing, mains, lunchtime, sides, desserts, drinks) with
  per-size variants.
- Quantity steppers — order anything in any amount, no fixed course limits.
- Dietary tags (🌱 vegetarian, ♻️ vegan, GF non-gluten-containing) with filters and search.
- Per-guest order + share link/code; organiser roster with import, edit and totals.
- Email the pub via a pre-filled `mailto`, with copy/JSON fallbacks.
- Guest draft and organiser roster persist in `localStorage` across sessions.
- Light/dark mode and a mobile-friendly layout.

> Dietary tags are a best-effort guide derived from the menu. Food is prepared in
> kitchens where all allergens may be present — confirm allergens with the pub.

## URLs / routes

- `#` — guest entry (the link you share with everyone).
- `#admin` — organiser view (bookmark this).
- `#g=<code>` — a guest's shared order; opens an "Add to guest list" prompt.

## Local development

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build
```

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and deploys.

The workflow sets Vite's `base` to `/<repo-name>/` automatically so assets resolve
on a project Pages URL. For a user/organisation Pages site (served from the root),
build with `BASE_PATH=/ npm run build` instead.

## Tech

React 18 + Vite + TypeScript, plain CSS. No external/network calls.
