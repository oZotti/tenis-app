# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Web tool that helps runners decide whether a specific shoe is worth buying, based on their profile (weight, use type, weekly mileage, price range, injury history). Produces a **purchase verdict**, not a medical diagnosis — always includes a disclaimer to validate with a professional. Runs 100% in the browser; no data is ever sent to a server (privacy/LGPD).

See `visao-projeto-tenis.md` for the full product vision, decision criteria, and roadmap.

## Commands

```bash
npm run dev      # start dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build locally
```

## Stack

- **React 19** + **Vite 6** — no router yet; single-page app
- **Tailwind v4** via `@tailwindcss/vite` plugin — configured in `vite.config.js`, activated with `@import "tailwindcss"` in `src/index.css`. No `tailwind.config.js` needed.
- No backend, no database, no auth.

## Architecture

The app is intentionally minimal at this stage. `src/App.jsx` is the single component and the right place to add all Phase 1 logic before splitting into separate files.

**Build phases (do not skip ahead):**
1. ✅ Landing screen (done)
2. Questionnaire + verdict engine — questions about the runner's profile, a named shoe field, rule-based scoring across versatility / cost-benefit / durability, and a result screen with verdict + disclaimer
3. Shoe inventory + manual mileage tracking
4. Strava integration

## Key constraints

- **No server-side code.** All logic lives in the browser.
- **Verdict is not a medical diagnosis.** Every result screen must include a disclaimer recommending professional validation.
- **Portuguese only.** All UI copy is in Brazilian Portuguese.
- **One phase at a time.** Do not implement Phase 2+ features while Phase 1 is incomplete.
