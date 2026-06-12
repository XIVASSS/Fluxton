# fluxton · EV Depot Management Dashboard

A depot management dashboard for EV charging operators. Monitor charger health, track active sessions, triage faults, and review 7-day usage — built as a **Next.js (App Router) + TypeScript** SPA with a mock API, pure selector transforms, and tab-based information hierarchy.

> **Part A design document:** [`DESIGN.md`](./DESIGN.md) — component structure, data model, layout rationale, edge cases, and requirement traceability.

---

## What this project demonstrates

This submission is structured around what the assessment weights most heavily:

| Weight | Where to look |
|--------|---------------|
| **Component architecture** | `DepotDashboard` shell, tab views, list/detail split — [`DESIGN.md` § A1](./DESIGN.md#a1-component-structure) |
| **Data transformation** | `src/lib/selectors.ts` — summaries, chart buckets, fault filters, P = V × I |
| **Information hierarchy** | Overview → problems first; Chargers tab for drill-down — [`DESIGN.md` § A3](./DESIGN.md#a3-layout--information-hierarchy) |
| **Edge cases** | Four mock scenarios + empty states in every view — [Demo scenarios](#demo-scenarios-edge-cases) |
| **Code clarity** | One-way data flow, memoised derivations, domain types in `src/lib/types.ts` |

Visual styling (dark canvas, motion, asymmetrical widgets) supports usability but is not the primary evaluation target.

---

## Requirements

- **Node.js 18.18+** (developed on Node 22)
- **npm** (or compatible package manager)

---

## Getting started

```bash
# Clone the repository, then:
npm install
npm run dev
```

Open the URL printed in the terminal (default **http://localhost:3000**).

If port 3000 is in use:

```bash
npm run dev -- -p 3005
```

### Production build

```bash
npm run build    # compile + typecheck
npm run start    # serve production build
npm run lint     # Next.js ESLint (if configured)
```

---

## Application overview

### Tabs

| Tab | Purpose |
|-----|---------|
| **Overview** | Depot KPIs, needs-attention list (faulted/offline only), efficiency gauge, usage preview |
| **Chargers** | Filterable fleet list + embedded detail panel (desktop split; mobile drawer) |
| **Usage** | Full 7-day dual-axis chart — sessions (bars) + energy kWh (line/area) |
| **Faults** | Filterable fault log with combining filters and live result count |

### Navigation

- **Header tab bar** and **left icon rail** both switch tabs.
- Tab state syncs to the URL: `?tab=overview|chargers|usage|faults` (default tab omits param).
- Clicking Overview KPI tiles, needs-attention rows, or fault log rows deep-links into the relevant tab/charger.

### Time filter (Overview KPIs)

Header pills: **Today · 24h · 7 days · 30 days**.

- **Status counts** (total, faulted, offline, etc.) always reflect **current** charger state.
- **Energy, session count, and fault count** on Overview tiles recalculate for the selected window.

---

## Demo scenarios (edge cases)

There is **no real backend**. Data is served by a Next.js API route backed by a deterministic generator.

Switch scenarios from the **Demo dataset** dropdown in the header, or via URL:

| URL | Scenario ID | What it exercises |
|-----|-------------|-------------------|
| `/` | `default` | Healthy depot — 12 bays, mixed statuses, live sessions, one zero-session day in the chart |
| `?scenario=empty` | `empty` | **No chargers** — meaningful empty state on every tab |
| `?scenario=all-faulted` | `all-faulted` | **All chargers faulted** — summary + overview reflect total failure |
| `?scenario=no-faults` | `no-faults` | Chargers present, **zero fault history** — detail panel and fault log stay graceful |

Combine with tabs, e.g.:

```
?scenario=all-faulted&tab=chargers
?scenario=empty&tab=faults
```

### Direct API access

```bash
curl "http://localhost:3000/api/depot?scenario=empty" | jq '.chargers | length'
# → 0
```

Supported `scenario` values: `default`, `empty`, `all-faulted`, `no-faults`.

---

## Feature checklist (Part B requirements)

### Charger overview ✅

- [x] All chargers with current status (available, charging, faulted, offline)
- [x] Status visually distinct via **color + iconography** (`StatusDot`, `StatusBadge`, row accents) — not text alone
- [x] Faulted/offline units sort to top (`STATUS_PRIORITY`)
- [x] Click row → detail panel; list remains visible on desktop (`ChargersTab` split layout)

### Charger detail panel ✅

- [x] Active session: output voltage, output current, power (**P = V × I**), session energy, duration (live tick)
- [x] Last **3 faults** with timestamp and type
- [x] Idle state with last completed session summary
- [x] Offline state with **last seen** timestamp
- [x] Empty fault history — explicit copy, not a broken section

### Depot summary ✅

- [x] Total chargers, active sessions, faulted count, offline count (via status breakdown + tiles)
- [x] Total energy delivered in selected time window (kWh)
- [x] Active sessions **right now** (independent of time filter)
- [x] Summary **recalculates** when time filter changes

### Usage chart ✅

- [x] Bar + line/area on **one chart**, dual Y axes (sessions left, kWh right)
- [x] Hover tooltip with exact session count and energy
- [x] All **7 calendar days** present; zero-session days show as zero

### Fault log ✅

- [x] Table columns: charger ID/label, fault type, severity, timestamp
- [x] Filter by charger (dropdown)
- [x] Filter by fault type (**multiselect** toggle pills)
- [x] Filter by date range (from / to, both optional)
- [x] Filters **combine with AND** semantics
- [x] Live fault count for current filter selection
- [x] Clear no-results state (not a blank table)

### Edge cases ✅

| Case | Verified via |
|------|--------------|
| Depot with no chargers | `?scenario=empty` |
| All chargers faulted simultaneously | `?scenario=all-faulted` |
| Charger with no fault history | `?scenario=no-faults` → open any charger detail |
| Chart day with zero sessions | `?scenario=default` — inspect Usage tab day with 0 bar |
| Fault log filters → no matches | Apply narrow type + date filters on Faults tab |

---

## Mock data structure

### Domain types

Defined in [`src/lib/types.ts`](./src/lib/types.ts):

```ts
Charger {
  id: string                    // e.g. "CHG-A1"
  label: string                 // e.g. "Bay A1"
  connectorType: "CCS2" | "CHAdeMO" | "Type2" | "GBT"
  maxPowerKw: number
  status: "available" | "charging" | "faulted" | "offline"
  lastSeenAt: string            // ISO 8601 heartbeat / last seen
  activeSessionId?: string      // set while charging
}

Session {
  id: string
  chargerId: string
  startedAt: string             // ISO 8601
  endedAt?: string              // absent => session still live
  outputVoltageV: number        // instantaneous V
  outputCurrentA: number        // instantaneous A
  energyDeliveredKwh: number    // cumulative kWh this session
}

Fault {
  id: string
  chargerId: string
  type: FaultType               // GroundFault, OverTemperature, …
  severity: "low" | "medium" | "high" | "critical"
  timestamp: string             // ISO 8601
  message: string               // operator-facing description
}

DepotData {
  depotId: string
  depotName: string
  chargers: Charger[]
  sessions: Session[]
  faults: Fault[]
}
```

### Generator

[`src/lib/mock/generate.ts`](./src/lib/mock/generate.ts) builds a **12-bay fleet** (`FLEET` constant) mixing DC fast (CCS2, CHAdeMO, GBT) and AC (Type2) units.

**Electrical realism:**

| Connector family | Voltage | Current | Typical session |
|------------------|---------|---------|-----------------|
| DC fast | 400–920 V | 80–350 A | 25–70 min, ~5–90 kWh |
| AC Type2 | 230–415 V | 16–32 A | 60–180 min |

- **Seeded randomness** (mulberry32) — same scenario renders identically across reloads.
- **Timestamps relative to now** — "today", rolling windows, and the 7-day chart stay current.
- **Power never stored** — UI derives `P = V × I / 1000` kW in `sessionPowerKw()`.
- **One empty chart day** baked into default generation (`emptyDayOffsets`).

Scenario registry: [`src/lib/mock/index.ts`](./src/lib/mock/index.ts).

---

## Data flow

```
GET /api/depot?scenario=
        │
        ▼
  useDepotData()          ← fetch boundary (loading / error states)
        │
        ▼
  DepotDashboard          ← UI state: tab, selection, filters, time range
        │
        ├── getDepotSummary(data, timeRangeId)
        ├── getUsageSeries(sessions, 7)
        ├── getChargerDetail(charger, sessions, faults)
        ├── filterFaults(faults, faultFilters)
        └── sortChargersByPriority(chargers, STATUS_PRIORITY)
        │
        ▼
  Tab components          ← presentational; events bubble up
```

All transforms live in [`src/lib/selectors.ts`](./src/lib/selectors.ts). Components should not aggregate raw arrays inline.

---

## Project layout

```
.
├── DESIGN.md                      Part A design document
├── README.md                      This file
├── public/                        Static assets
└── src/
    ├── app/
    │   ├── api/depot/route.ts     Mock API (?scenario=)
    │   ├── layout.tsx             Fonts, global dawn-glow canvas
    │   ├── page.tsx               Renders DepotDashboard
    │   └── globals.css            Design tokens (@theme), surfaces, glow
    ├── components/
    │   ├── DepotDashboard.tsx     App shell, state owner, URL sync
    │   ├── IconRail.tsx           Fixed icon navigation (lg+)
    │   ├── AppHeader.tsx          Welcome, KPI pill, tabs, time filter
    │   ├── tabs/
    │   │   ├── OverviewTab.tsx    KPIs, needs-attention, previews
    │   │   ├── ChargersTab.tsx    List/detail split + mobile drawer
    │   │   ├── UsageTab.tsx       Full usage chart
    │   │   └── FaultsTab.tsx      Fault log wrapper
    │   ├── ChargerListRow.tsx     Compact charger row
    │   ├── ChargerDetailPanel.tsx Active / idle / faulted / offline views
    │   ├── UsageChart.tsx         Recharts dual-axis 7-day chart
    │   ├── FaultLog.tsx           Filters + table + empty states
    │   ├── motion/                AnimatedCard, TabPanel, etc.
    │   ├── overview/              Network map, pipeline, Mytasky-style widgets
    │   └── ui/                    StatusBadge, EmptyState, icons, …
    ├── hooks/
    │   └── useDepotData.ts        Fetch hook
    └── lib/
        ├── types.ts               Domain model
        ├── selectors.ts           ★ All data transformation
        ├── constants.ts           Status metadata, fault labels, sort priority
        ├── time.ts                Time ranges + day bucketing
        ├── format.ts              kWh, duration, relative time helpers
        ├── dashboard-tabs.ts      Tab IDs + URL helpers
        └── mock/
            ├── generate.ts        Deterministic depot generator
            └── index.ts           Named scenarios
```

---

## Key implementation notes

### Status encoding

Each status maps to color **and** icon in [`src/lib/constants.ts`](./src/lib/constants.ts) + [`StatusBadge.tsx`](./src/components/ui/StatusBadge.tsx):

| Status | Color signal | Icon |
|--------|--------------|------|
| Available | Neutral grey | Plug |
| Charging | Lime green (pulsing dot) | Bolt |
| Faulted | Red | Alert triangle |
| Offline | Salmon / amber | Power off |

### Charger detail state machine

`ChargerDetailPanel` branches on:

1. **Active session exists** → live metrics grid
2. **`status === "offline"`** → last seen + stale messaging
3. **`status === "faulted"`** → prominent fault banner + context
4. **Else (available/idle)** → last completed session or "no sessions recorded"

`RecentFaults` always renders; shows up to 3 entries or friendly empty copy.

### Fault filter semantics

```ts
// src/lib/selectors.ts
filterFaults(faults, {
  chargerId: "all" | "<id>",
  types: [],           // empty = all types allowed
  from: null | "YYYY-MM-DD",
  to: null | "YYYY-MM-DD",
})
```

Filters **narrow** the set (AND). Clearing filters restores full log.

### URL state

| Param | Values | Default |
|-------|--------|---------|
| `tab` | `overview`, `chargers`, `usage`, `faults` | `overview` (omitted) |
| `scenario` | `default`, `empty`, `all-faulted`, `no-faults` | `default` (omitted) |

Updated via `history.replaceState` — no full page reload.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS v4 (`@theme` tokens in `globals.css`) |
| Charts | Recharts 2 (`ComposedChart`, dual Y axes) |
| Icons | lucide-react + custom SVG status icons |
| Motion | framer-motion (tab transitions, micro-interactions only) |
| Fonts | Plus Jakarta Sans (UI headings), Inter (numerics) via `next/font` |

---

## Repository contents (submission checklist)

- [x] Full source code
- [x] Part A design document — [`DESIGN.md`](./DESIGN.md)
- [x] README with setup, run instructions, mock data description — this file
- [x] Mock data generator with realistic charger, session, and fault data — `src/lib/mock/`

---

## Suggested review path

For a quick code review aligned with assessment criteria:

1. Read [`DESIGN.md`](./DESIGN.md) § A1–A3 (10 min)
2. Skim [`src/lib/selectors.ts`](./src/lib/selectors.ts) — all transforms (10 min)
3. Walk `?scenario=default` → Overview → click needs-attention row → Chargers detail (5 min)
4. Switch `?scenario=empty` and `?scenario=all-faulted` — confirm empty/failure states (5 min)
5. Faults tab — apply combined filters until no results (3 min)
6. Usage tab — confirm 7 days including a zero bar (2 min)

---

## License

Private assessment submission for fluxton. All rights reserved unless otherwise agreed with the assessor.
