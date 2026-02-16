# CLAUDE.md — CDI Rebuild

## What This Project Is

A standalone React rebuild of the Center for Global Development's Commitment to Development Index (CDI). The CDI ranks ~40 countries on how their policies affect international development, across 8 components. This app was previously a Vue app embedded in CGD's Drupal CMS; it is being rebuilt as a static site deployable to Vercel/Cloudflare Pages.

**Status:** Work in progress. Core pages and data pipeline exist but the app is not yet complete.

## Tech Stack

- React 19 + TypeScript
- Vite (with `@` path alias → `./src`)
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin)
- React Router v7
- Papa Parse (CSV parsing in build scripts)
- Mammoth (Word doc parsing in build scripts)

## Project Layout

```
/                          ← repo root (also the app root)
├── src/                   ← React application source
│   ├── components/        ← reusable UI (common/, drawer/, filters/, layout/, modals/, table/, visualization/)
│   ├── context/           ← DataContext.tsx (loads all data), FilterContext.tsx (group filter + adjusted toggle)
│   ├── pages/             ← route-level components (HomePage, ComponentPage, SubcomponentPage, etc.)
│   ├── types/index.ts     ← all TypeScript interfaces
│   ├── App.tsx            ← BrowserRouter + Routes
│   └── main.tsx           ← entry point
├── public/data/           ← generated JSON files loaded at runtime (do NOT edit by hand)
├── scripts/               ← build-time data transformation (CSV/DOCX → JSON)
├── source-data/           ← raw CSVs and Word docs (the authoritative data source)
├── docs/                  ← planning docs and reference screenshots
└── vercel.json            ← rewrite rules for client-side routing
```

## Data Architecture

### Hierarchy (4 levels)

Country → Component (8) → Subcomponent (~42) → Indicator (~69)

### Key data files

| Runtime JSON (public/data/) | Generated from | Script |
|---|---|---|
| `cdi-data.json` | `source-data/components.csv`, `subcomponents.csv`, `indicators.csv` | `scripts/transform-data.ts` |
| `country-groups.json` | Hardcoded in transform script | `scripts/transform-data.ts` |
| `country-reports.json` | `source-data/country report word docs/*.docx` | `scripts/parse-country-reports.ts` |
| `blurbs.json` | `source-data/blurbs.docx` | `scripts/parse-blurbs.ts` |

To regenerate data: `npm run transform-data` (for CSVs) or `npx tsx scripts/parse-country-reports.ts` (for reports).

### Core types (src/types/index.ts)

- `Country` — id (ISO code), name, score, scoreAdjusted, rank, rankAdjusted, components (nested Record)
- `Component` — id (slug like "development-finance"), name, shortName, color, group, subcomponents[]
- `Subcomponent` — id, name, componentId, indicators[]
- `Indicator` — id, name, subcomponentId, componentId
- `CDIData` — the top-level shape: countries[], components[], subcomponents[], indicators[], countryGroups[], year
- `CountryReport` — countryCode, countryName, overall (HTML string), components (Record of HTML strings)
- `Blurbs` / `ComponentBlurb` / `SubcomponentBlurb` — descriptive text for components/subcomponents/indicators

### Two scoring modes

Every country has **raw** scores/rankings and **income-adjusted** scores/rankings. The `showAdjusted` toggle in FilterContext switches between them throughout the app.

## Routes

| Path | Page | Purpose |
|---|---|---|
| `/` | HomePage | Main ranking table |
| `/component/:componentId` | ComponentPage | Component detail + country rankings |
| `/component/:componentId/:subcomponentId` | SubcomponentPage | Subcomponent detail |
| `/component/:componentId/:subcomponentId/:indicatorId` | IndicatorPage | Indicator detail |
| `/indicators` | IndicatorIndexPage | Full indicator listing |
| `/country/:countryId` | CountryReportPage | Country profile |
| `/country/:countryId/:componentId` | CountryComponentPage | Country + component detail |

## State Management

- **DataContext** — loads `cdi-data.json`, `country-groups.json`, `country-reports.json`, and `blurbs.json` on mount. Provides getter functions (`getCountry`, `getComponent`, etc.).
- **FilterContext** — manages `selectedGroupId` (country group filter) and `showAdjusted` (income-adjusted toggle). These filters apply across all pages.

## The 8 Components

Development Finance, Investment, Migration, Trade, Environment, Health, Security, Technology. Each has a distinct color defined in the data. They are grouped into three categories: finance, exchange, and global.

## Development Commands

- `npm run dev` — Vite dev server (localhost:5173)
- `npm run build` — TypeScript check + Vite production build
- `npm run transform-data` — regenerate JSON from source CSVs
- `npm run lint` — ESLint

## Conventions

- Path alias: use `@/` for imports from `src/` (e.g., `import { DataProvider } from '@/context/DataContext'`)
- Component IDs are kebab-case slugs (e.g., `"development-finance"`, `"vaccination-coverage"`)
- Country IDs are 3-letter ISO codes (e.g., `"SWE"`, `"USA"`)
- Styling uses Tailwind utility classes; component colors come from the data
- The app is fully static — no backend, no API calls except fetching local JSON files
