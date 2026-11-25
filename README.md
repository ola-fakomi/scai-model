# SCAI – STEM Connect Attendee Index

Submission for the Technical Assistant role at Payaza Africa.

SCAI scores every event attendee from 0 to 100 across five weighted pillars:

```
SCAI = 0.10P + 0.15E + 0.25N + 0.30M + 0.20F
```

P: Presence · E: Engagement · N: Networking · M: Matching (30%, largest) · F: Follow-through

## Local setup

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # run 23 unit tests
npm run build      # production build
```

## Routes

| Route | Description |
|---|---|
| `/` | Redirects to `/brief` |
| `/brief` | Case study – Brief tab |
| `/solution` | Case study – Solution tab |
| `/prototype` | Case study – Prototype tab |
| `/demo` | Interactive demo (redirects to attendee view) |
| `/demo/attendee` | Attendee phone view (use "Act as" picker) |
| `/demo/staff` | Staff tools: door, segments, note-taker, usher |
| `/demo/organizer` | Organizer scoreboard |
| `/deck` | 10-slide PDF pitch deck |

## Project structure

```
lib/
  types.ts         Domain types and config constants
  scoring.ts       Pure scoring engine (dr, percentile, SCAI, KPIs, betweenness)
  scoring.test.ts  Vitest unit tests (23 tests)
  tags.ts          Tag assignment with mixing rule
  seed.ts          Seeded sample data (mulberry32, seed 20261122)
  store.ts         Zustand demo store (persisted to localStorage)
  luma.ts          LumaClient interface + MockLumaClient
components/
  TabLayout.tsx    Site header + tabs + Download PDF button
  Diagram1.tsx     Event → pillar data flow diagram
  Diagram2.tsx     Deployment timeline diagram
  demo/DemoShell.tsx  Demo controls: role switcher, simulate, reset
```

## Deploy to Vercel

```bash
npx vercel --prod
```

No environment variables needed (Tier 1 — browser-only).

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Zustand (persisted localStorage state)
- qrcode.react, Recharts, Lucide icons
- Vitest unit tests
