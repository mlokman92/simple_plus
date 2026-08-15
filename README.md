# Simple+ — AI Skincare Companion (Prototype)

> Skin. Predictive. Personalised.

An interactive prototype of **Simple+**, an AI-powered skincare companion, built for a pitch to
**Cradle Fund**. Everything runs on mock data — there is no backend, no camera, and no payment
processing. It is a clickable product story, end to end.

## Run it

```bash
npm install
npm run web        # dev server, opens in the browser
```

On a desktop browser the app renders inside a simulated phone with the brand story beside it.
Below a 900px viewport (i.e. an actual phone) it fills the screen — so the same URL works for
both a projected pitch and a handset passed around the room.

### Static build for hosting

```bash
npm run build:web  # -> dist/  (SPA, single index.html)
npm run serve:web  # preview the build at http://localhost:3000
```

`dist/` is a plain static site: drop it on EAS Hosting, Vercel, Netlify, S3, or GitHub Pages.

```bash
npx eas-cli@latest deploy   # EAS Hosting, uses the dist/ export
```

### Native builds

Deliberately out of scope for now — no Android/iOS build is configured to run. `eas.json` is
present with `development` / `preview` / `production` profiles so `eas build -p android
--profile preview` works the day it is wanted. The app already declares bundle ids
(`my.simpleplus.app`) and adaptive icons.

## What is in the demo

| Flow | Screens |
|---|---|
| **Launch** | Animated splash → onboarding |
| **Onboarding** | Welcome carousel → concerns → skin type → goals → lifestyle → AI profile build |
| **Home** | Skin score 82/100, six metrics, KL UV/humidity advisory, daily routine with tick-off, AI recommendations, streak |
| **AI Scan** | Framing screen with readiness checks → analysis animation → results with per-zone findings, six metric deltas, and routine changes |
| **Routine** | AM / PM / Weekly segments, step coaching notes, mark-all-done, locked upcoming upgrades, routine cost |
| **Insights** | 12-week score trend, skin radar vs last scan, per-metric sparklines, AI insights incl. a forward projection, adherence, achievements, photo progress |
| **Digital Dermatologist** | Scripted AI chat with keyword matching, product suggestions inline, follow-up chips |
| **Products** | Shelf with match scores, halal filter, product detail with ingredient explanations |
| **Premium** | RM19.90/mo business model, free-vs-premium comparison, dermatologist teleconsult |
| **Profile** | Skin profile, saved shelf, settings, notifications, demo reset |

### Malaysian market fit (deliberate, for Cradle)

- Prices in **RM**, local retail availability (Watsons, Guardian, Shopee, Sephora MY)
- **JAKIM halal certification** badges and a halal-only filter
- **Kuala Lumpur UV index (11, extreme) and 82% humidity** driving real advice in the app
- English / **Bahasa Melayu** language setting
- Premium tier priced for the local market with a dermatologist teleconsult

## Architecture

```
app/                       expo-router file-based routes
  _layout.tsx              fonts, providers, phone frame, stack
  index.tsx                splash
  onboarding/              5-step profile build
  (tabs)/                  Home · Routine · Scan · Insights · Profile
  analysis/                scan processing + results
  product/[id].tsx         product detail
  derm.tsx  premium.tsx  shop.tsx  progress.tsx  settings.tsx  notifications.tsx
src/
  theme/                   design tokens — the single source of colour/type/spacing
  components/ui/           Screen, Card, Button, Chip, Txt, ProgressBar …
  components/charts/       ScoreRing, LineChart, SkinRadar, WeekBars, Sparkline
  components/brand/        Logo, ProductArt, FaceGuide — all SVG, zero image assets
  data/                    mock catalogue, taxonomy, persona, scans, chat scripts
  store/AppStore.tsx       React context + reducer (in-memory, resets on reload)
  lib/                     formatting, haptics, phone-frame insets
```

**No product photography or stock imagery is used.** Product bottles, the face used in the scan
flow, and the logo are all generated SVG driven by the design tokens, so the prototype has no
licensing baggage and scales to any resolution.

See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for the component contract.

## Demo script (about 3 minutes)

1. **Splash → onboarding.** Pick a few concerns, a skin type, goals, lifestyle. Watch the AI build
   the profile.
2. **Home.** Point at the score, the six metrics, and the UV advisory — this is the daily habit.
3. **Scan.** Tap the centre button, take the "photo", watch the analysis, land on results. The
   score moves to 84 and the routine changes with a stated reason.
4. **Routine.** Tick off a step. Show the locked vitamin C and why it is locked — that is the
   "predictive" claim made concrete.
5. **Insights.** Scroll to the projection card: 87 ± 3 by mid-September at current adherence.
6. **Digital Dermatologist.** Ask "why did I break out this week?" — the answer cites the user's
   own scans, not generic advice.
7. **Premium.** RM19.90/month, teleconsult with a licensed dermatologist. That is the revenue line.

Reset between runs from **Profile → Reset demo**.

## Caveats

- All data is mock and lives in memory; a page reload restarts the demo.
- The "AI" is scripted keyword matching, not a model call.
- Not a medical device. Nothing in the app is a diagnosis, and the UI says so where it matters.
