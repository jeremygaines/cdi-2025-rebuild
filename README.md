# Commitment to Development Index (CDI)

This repository is a not-yet-complete standalone rebuild of the Commitment to Development Index interactive tool, which is currently embedded in CGD's Drupal CMS. The new version will be a static React app that can be deployed independently to platforms like Vercel or Cloudflare Pages.

## Getting Started

```bash
npm install
npm run dev
```

The dev server starts at [http://localhost:5173](http://localhost:5173).

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run transform-data` | Regenerate JSON data files from source CSVs |
| `npm run lint` | Run ESLint |

## Tech Stack

- **React 19** with TypeScript
- **Vite** for builds and dev server
- **Tailwind CSS v4** for styling
- **React Router v7** for client-side routing
- **Papa Parse** for CSV-to-JSON data transformation

## How the App Works

### Data Pipeline

Source data lives in `/source-data` as CSV files (`components.csv`, `subcomponents.csv`, `indicators.csv`) and word documents. Data pipeline coming later

### Data Hierarchy

The CDI scores follow a four-level hierarchy:

```
Country
  └── Component (8: Dev Finance, Investment, Migration, Trade, Environment, Health, Security, Technology)
        └── Subcomponent (~42 total)
              └── Indicator (~69 total)
```

Each country has both a raw score and an income-adjusted score (which accounts for what's expected given a country's GNI per capita), with separate rankings for each.

### Pages and Routing

| Route | Page |
|-------|------|
| `/` | Main ranking table with all countries |
| `/component/:componentId` | Component detail with country rankings |
| `/component/:componentId/:subId` | Subcomponent detail |
| `/component/:componentId/:subId/:indicatorId` | Indicator detail |
| `/country/:countryId` | Country report with full breakdown |
| `/country/:countryId/:componentId` | Country-specific component detail |
| `/indicators` | Full indicator index |

### Key Features

- **Sortable ranking table** with expandable country rows
- **Income-adjusted toggle** to switch between raw and income-adjusted scores and rankings
- **Country group filters** (EU, OECD, G7, G20, BRICS+, income-based groups, etc.)
- **Component/subcomponent/indicator drill-down** pages with ranked country lists
- **Country report pages** with narrative text and score breakdowns
- **Score bar visualizations** with median markers

## Project Structure

```
├── public/data/           # Generated JSON data files (loaded at runtime)
├── scripts/               # Data transformation scripts (CSV/DOCX → JSON)
├── source-data/           # Raw CSV and Word document source files
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/        # ErrorBoundary, Loading
│   │   ├── drawer/        # Detail drawer panel
│   │   ├── filters/       # FilterBar (group select, adjusted toggle)
│   │   ├── layout/        # Header, Hero, PageLayout, AboutBar
│   │   ├── modals/        # Help modal
│   │   ├── table/         # RankingTable, ComponentRankingTable
│   │   └── visualization/ # ScoreBar
│   ├── context/           # React Context providers (Data, Filters)
│   ├── content/           # Static content (help text)
│   ├── pages/             # Route-level page components
│   └── types/             # TypeScript type definitions
├── docs/                  # Planning documents and reference materials
└── claude.md              # AI assistant project context
```

## Updating Data

**To update CDI scores:** replace the CSV files in `/source-data` and run `npm run transform-data` to regenerate the JSON.

**To update country report text:** update the Word documents in `/source-data/country report word docs` and run `npx tsx scripts/parse-country-reports.ts`.

## Deployment

```bash
npm run build
```

This produces a `dist/` folder containing a fully static site. Deploy it to Vercel, Cloudflare Pages, Netlify, or any static hosting provider. A `vercel.json` is included to handle client-side routing rewrites.
