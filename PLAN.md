# CDI React App Rebuild Plan

## Overview

This document outlines the plan to rebuild the Commitment to Development Index (CDI) as a standalone React application. The new app will be a static site that can be hosted on Vercel or Cloudflare Pages, loading data from JSON files rather than a Drupal database.

---

## 1. Tech Stack

| Category | Technology | Rationale |
|----------|------------|-----------|
| Framework | React 18 | Modern, familiar, excellent ecosystem |
| Build Tool | Vite | Fast dev server, optimized builds, simpler than CRA |
| Routing | React Router v6 | Standard for React SPAs |
| Styling | Tailwind CSS | Utility-first, easy to match existing design |
| Language | TypeScript | Type safety, better DX, self-documenting |
| State | React Context + hooks | Simple enough for this app, no Redux needed |
| Deployment | Vercel/Cloudflare Pages | Static hosting with CDN |

---

## 2. Data Architecture

### 2.1 Data Hierarchy

The CDI has a 4-level hierarchy:

```
Country
  └── Component (8 total: Development Finance, Investment, Migration, Trade, Environment, Health, Security, Technology)
        └── Subcomponent (2-6 per component, ~40 total)
              └── Indicator (1-8 per subcomponent, ~65 total)
```

### 2.2 Current CSV Files

| File | Contents | Structure |
|------|----------|-----------|
| `components.csv` | Country scores for each component | Country, ISO, Raw/Adjusted scores for CDI + 8 components |
| `subcomponents.csv` | Country scores for each subcomponent | Country, ISO, CDI scores + ~40 subcomponent scores |
| `indicators.csv` | Country scores + missing data flags for ~65 indicators | Country, ISO, scores with "missing data" flag columns |
| `indicators_ffs.csv` | Alternative indicator data (TBD purpose) | Similar structure |
| `indicators_na_solution.csv` | Alternative indicator data (TBD purpose) | Similar structure |

### 2.3 Data Transformation

We'll convert CSVs to JSON at build time. Structure:

```typescript
// /public/data/countries.json
{
  "countries": [
    {
      "id": "SWE",
      "name": "Sweden",
      "score": 100,
      "scoreAdjusted": 96.85,
      "rank": 1,
      "rankAdjusted": 2,
      "excluded": false,
      "components": {
        "development-finance": { "score": 98.11, "scoreAdjusted": 100, "rank": 2, "rankAdjusted": 1 },
        // ... other components
      }
    }
  ]
}

// /public/data/components.json
{
  "components": [
    {
      "id": "development-finance",
      "name": "Development Finance",
      "shortName": "Dev Finance",
      "color": "#1B8A8A",  // teal
      "group": "exchange",
      "subcomponents": ["development-finance-quality", "development-finance-quantity"]
    }
  ]
}

// /public/data/subcomponents.json
{
  "subcomponents": [
    {
      "id": "development-finance-quality",
      "name": "Development Finance Quality",
      "componentId": "development-finance",
      "indicators": ["tied-status", "transparency", "multilateral-support", ...]
    }
  ]
}

// /public/data/indicators.json
{
  "indicators": [
    {
      "id": "tied-status",
      "name": "Tied Status",
      "subcomponentId": "development-finance-quality",
      "unit": "score",
      "lowerIsBetter": false
    }
  ]
}

// /public/data/country-scores.json
// Full matrix of all country scores at all levels (for detail pages)
```

---

## 3. Component Color Scheme

From the existing app, the 8 components use these colors (grouped):

**Development Finance Group:**
- Development Finance: `#1B8A8A` (teal)

**Exchange Group:**
- Investment: `#4A7FC1` (blue)
- Migration: `#6B5CA5` (purple)
- Trade: `#2B4970` (navy)

**Global Public Goods Group:**
- Environment: `#E59C39` (orange/gold)
- Health: `#C45C26` (burnt orange)
- Security: `#8B4513` (brown)
- Technology: `#A0522D` (sienna)

---

## 4. Page Structure & Routes

### 4.1 Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `HomePage` | Main ranking table |
| `/component/:componentId` | `ComponentPage` | Component detail with rankings |
| `/component/:componentId/:subcomponentId` | `SubcomponentPage` | Subcomponent detail |
| `/component/:componentId/:subcomponentId/:indicatorId` | `IndicatorPage` | Indicator detail |
| `/country/:countryId` | `CountryReportPage` | Country profile |
| `/country/:countryId/:componentId` | `CountryComponentPage` | Country's component detail |
| `/indicators` | `IndicatorIndexPage` | Full indicator listing |
| `*` | `NotFoundPage` | 404 page |

### 4.2 Page Descriptions

#### Home Page (`/`)
- Hero banner with CDI logo, title, year (2025)
- Filter bar: Country group dropdown, Income-adjusted toggle, "How CDI Works" button
- Main ranking table:
  - Columns: Rank, Score, Country, + 8 component columns
  - Each component column shows score + mini progress bar
  - Rows sorted by rank (or adjusted rank when toggled)
  - Click country name → Country report page
  - Click component header → Component page
  - Click component cell → Expand drawer with country's component breakdown

#### Component Page (`/component/:componentId`)
- Hero banner
- Component description (placeholder for now)
- Rankings table showing all countries for this component
- Shows subcomponent breakdown when row selected
- Previous/Next component navigation

#### Country Report Page (`/country/:countryId`)
- Hero banner
- Country header with flag and navigation between countries
- Component tabs showing scores in each
- Overall score visualization
- Expandable sections for each component

#### Subcomponent & Indicator Pages
- Similar structure to component page
- Shows country rankings for that specific subcomponent/indicator
- Breadcrumb navigation back up the hierarchy

---

## 5. Component Architecture

### 5.1 Folder Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   └── PageLayout.tsx
│   ├── table/
│   │   ├── RankingTable.tsx
│   │   ├── TableHeader.tsx
│   │   ├── TableRow.tsx
│   │   ├── CountryCell.tsx
│   │   └── ComponentCell.tsx
│   ├── filters/
│   │   ├── FilterBar.tsx
│   │   ├── CountryGroupSelect.tsx
│   │   └── AdjustedToggle.tsx
│   ├── visualization/
│   │   ├── ScoreBar.tsx
│   │   ├── RankBadge.tsx
│   │   └── ComponentCard.tsx
│   ├── country-report/
│   │   ├── CountryHeader.tsx
│   │   ├── ComponentTabs.tsx
│   │   ├── OverallScore.tsx
│   │   └── ComponentBreakdown.tsx
│   ├── drawer/
│   │   ├── DetailDrawer.tsx
│   │   └── DrawerContent.tsx
│   └── common/
│       ├── InfoIcon.tsx
│       ├── Tooltip.tsx
│       ├── Loading.tsx
│       └── Breadcrumb.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── ComponentPage.tsx
│   ├── SubcomponentPage.tsx
│   ├── IndicatorPage.tsx
│   ├── CountryReportPage.tsx
│   ├── CountryComponentPage.tsx
│   ├── IndicatorIndexPage.tsx
│   └── NotFoundPage.tsx
├── hooks/
│   ├── useData.ts
│   ├── useFilters.ts
│   ├── useRankings.ts
│   └── useUrlParams.ts
├── context/
│   ├── DataContext.tsx
│   └── FilterContext.tsx
├── types/
│   ├── country.ts
│   ├── component.ts
│   ├── subcomponent.ts
│   └── indicator.ts
├── utils/
│   ├── rankings.ts
│   ├── formatting.ts
│   └── colors.ts
├── data/
│   └── transform.ts  (CSV → JSON transformation script)
├── App.tsx
├── main.tsx
└── index.css
```

### 5.2 Key Components

#### `RankingTable`
The main table component used across multiple pages. Props:
- `data`: Array of ranked items (countries)
- `columns`: Column configuration
- `onRowClick`: Handler for row selection
- `onHeaderClick`: Handler for sorting/navigation
- `showAdjusted`: Whether to show adjusted scores
- `selectedGroup`: Country filter group

#### `ScoreBar`
Visual progress bar showing a score (0-100). Props:
- `score`: Number
- `color`: Hex color for the bar
- `showValue`: Whether to display the numeric value
- `size`: 'sm' | 'md' | 'lg'

#### `DetailDrawer`
Slide-out panel showing detailed breakdown. Props:
- `isOpen`: Boolean
- `onClose`: Handler
- `country`: Selected country data
- `component`: Selected component (optional)

#### `FilterBar`
Filter controls for the table. Props:
- `countryGroups`: Available filter groups
- `selectedGroup`: Current selection
- `onGroupChange`: Handler
- `showAdjusted`: Current toggle state
- `onAdjustedChange`: Handler

---

## 6. State Management

### 6.1 Global State (Context)

```typescript
// DataContext - loaded once, immutable
interface DataContextType {
  countries: Country[];
  components: Component[];
  subcomponents: Subcomponent[];
  indicators: Indicator[];
  countryGroups: CountryGroup[];
  loading: boolean;
  error: Error | null;
}

// FilterContext - user-controlled
interface FilterContextType {
  selectedGroup: string;
  setSelectedGroup: (id: string) => void;
  showAdjusted: boolean;
  setShowAdjusted: (show: boolean) => void;
}
```

### 6.2 URL State

The filter state should sync with URL parameters for shareability:
- `?group=5` - Selected country group
- `?adjusted=true` - Income-adjusted mode

---

## 7. Functionality Details

### 7.1 Income-Adjusted Rankings Toggle

When enabled:
- Table shows `scoreAdjusted` instead of `score`
- Rankings recalculated based on adjusted scores
- Some UI features may be disabled (per original app behavior)

### 7.2 Country Group Filtering

Available groups (from original app - will need exact list):
- All Countries (default)
- OECD
- Non-OECD
- G7
- G20
- EU
- etc.

### 7.3 Sorting

- Default sort: By rank (ascending)
- Click column header to sort by that column
- Toggle between ascending/descending

### 7.4 Tied Rankings

Countries with identical scores show asterisk (*) and same rank number.

### 7.5 Excluded Countries

Israel and Russia appear grayed out with special handling (excluded from rankings but still displayed).

---

## 8. Styling Approach

### 8.1 Design System

Match the existing CDI design:
- **Header**: Dark teal/green (`#1B5E5E` area)
- **Hero**: Full-width banner with CDI logo
- **Table**: Alternating row colors, component-colored headers
- **Progress bars**: Colored by component group
- **Typography**: Clean sans-serif (likely system fonts or similar to PT Sans)

### 8.2 Responsive Breakpoints

```css
/* Mobile first */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

### 8.3 Mobile Considerations

- Table becomes card-based layout on mobile
- Drawer takes full width
- Simplified header/navigation
- Touch-friendly tap targets

---

## 9. Build & Deployment

### 9.1 Build Process

1. **Data transformation**: Script converts CSVs to JSON
2. **Vite build**: Compiles React app
3. **Output**: Static files ready for CDN hosting

### 9.2 Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "npm run transform-data && vite build",
    "transform-data": "ts-node src/data/transform.ts",
    "preview": "vite preview"
  }
}
```

### 9.3 Deployment

- **Vercel**: Connect GitHub repo, auto-deploys on push
- **Cloudflare Pages**: Similar workflow
- No server-side code needed

---

## 10. Implementation Phases

### Phase 1: Project Setup & Data
1. Initialize Vite + React + TypeScript project
2. Set up Tailwind CSS
3. Create data transformation script (CSV → JSON)
4. Define TypeScript types for all data structures
5. Set up data loading with Context

### Phase 2: Core Layout & Navigation
1. Create page layout components (Header, Footer, Hero)
2. Set up React Router with all routes
3. Create placeholder pages
4. Implement breadcrumb navigation

### Phase 3: Main Ranking Table
1. Build RankingTable component
2. Implement ScoreBar visualization
3. Add column sorting
4. Implement country group filtering
5. Add income-adjusted toggle
6. Style to match original design

### Phase 4: Detail Drawer
1. Create slide-out drawer component
2. Implement component breakdown view
3. Add subcomponent/indicator details
4. Navigation within drawer

### Phase 5: Component Pages
1. Component detail page with rankings
2. Subcomponent detail page
3. Indicator detail page
4. Previous/Next navigation

### Phase 6: Country Report Pages
1. Country profile page
2. Country header with navigation
3. Component tabs
4. Score visualizations
5. Country component detail page

### Phase 7: Polish & Mobile
1. Responsive design implementation
2. Mobile table layout (card-based)
3. Touch interactions
4. Loading states
5. Error handling
6. 404 page

### Phase 8: Final Touches
1. Print styles
2. Meta tags for social sharing
3. Performance optimization
4. Accessibility review
5. Browser testing

---

## 11. Placeholder Content Needed

The following content is not in the CSVs and will use placeholder text:

1. **Component descriptions**: 1-2 paragraph explanations of each component
2. **Subcomponent descriptions**: Brief explanations
3. **Indicator descriptions**: What each indicator measures
4. **Methodology text**: "How the CDI Works" content
5. **About section**: About the CDI/CGD
6. **Hero slider text**: Rotating key findings
7. **Info tooltips**: Explanatory tooltips throughout
8. **Country group definitions**: Which countries are in each group

---

## 12. Decisions Made

The following decisions were made during planning:

1. **Country groups**: Skip for prototype. Use a simple "All Countries" default filter. Fill in proper groups later.

2. **Excluded countries**: Remove Israel and Russia entirely from the data. Do not display them.

3. **Alternative indicator files**: Ignore `indicators_ffs.csv` and `indicators_na_solution.csv`. Only use the main three CSVs.

4. **Related content section**: Skip for prototype. Omit the blog posts section at the bottom.

5. **Year display**: Show 2025 (the year in the data). Handle historical data later if needed.

6. **"How CDI Works" button**: Include as placeholder - can link to external CGD page or show simple modal.

7. **Analytics**: Skip for prototype. Can add later.

8. **CGD branding**: Include basic header with CGD logo linking to main site, but keep navigation minimal.

---

## 13. Success Criteria

The prototype will be considered complete when:

- [ ] All routes are functional and navigable
- [ ] Main ranking table displays all 38 countries with correct scores
- [ ] Income-adjusted toggle works correctly
- [ ] Country group filtering works
- [ ] Clicking components/countries navigates to detail pages
- [ ] Detail drawer opens with component breakdown
- [ ] Country report page shows country profile
- [ ] App is responsive on mobile devices
- [ ] App builds and deploys successfully to Vercel/Cloudflare
- [ ] Visual design reasonably matches the original

---

## Appendix A: Component/Subcomponent/Indicator Hierarchy

Based on the CSV column headers:

```
Development Finance
├── Development Finance Quality
│   ├── Tied Status
│   ├── Transparency
│   ├── Multilateral Support
│   ├── Country Ownership
│   ├── Poverty Focus
│   └── Fragility Focus
└── Development Finance Quantity
    └── Development Finance Quantity

Investment
├── Financial Secrecy
│   ├── Banking Secrecy
│   ├── Country by Country Reporting
│   ├── Public Statistics
│   ├── Anti-Money Laundering
│   ├── Automatic Exchange of Information
│   ├── Bilateral Treaties
│   ├── International Legal Cooperation
│   └── Beneficial Ownership
├── Business & Human Rights
├── Natural Resources
├── Anti-corruption
├── Investment Agreements
└── Corporate Tax Rate Alignment

Migration
├── Migrant Inflow
├── Female Immigrants
├── Refugee Hosting
├── International Migration Conventions
└── Integration Policies

Trade
├── Tariff Average
├── Tariff Peaks
├── Agricultural Subsidies
├── Trade Logistics (Customs + Infrastructure)
└── Services Trade Restrictiveness

Environment
├── Greenhouse Gas Emissions
│   ├── Emissions (excluding LULUCF)
│   ├── NDC Ambition
│   ├── Emissions from LULUCF
│   └── Emissions from Trade
├── Fossil Fuel Production
│   ├── Oil Production
│   ├── Gas Production
│   └── Coal Production
├── Fossil Fuel Support
│   ├── Support to Oil
│   ├── Support to Gas
│   ├── Support to Coal
│   └── Support to Electricity
├── Carbon Pricing
├── Fishing Subsidies
└── International Environmental Conventions

Health
├── Antimicrobial Resistance
│   ├── Antibiotic Consumption in Humans
│   ├── Antibiotic Consumption in Livestock Animals
│   └── AMR Governance
├── Vaccination Coverage
│   ├── Measles Vaccine (MCV2) Coverage
│   └── DTP3 Coverage
├── Pandemic Preparedness
├── Treaties
├── Export Restrictions on Food and Health
│   ├── Duration of Export Restrictions
│   └── Number of Products Covered
└── Tobacco Supply Chains

Security
├── Peacekeeping Contributions
│   ├── Financial Contributions to UN DPO
│   ├── UN Troop Contributions
│   └── Non-UN Troop Contributions
├── Female Peacekeepers
├── Sea Lanes Protection
├── Arms Trade
│   ├── Arms Trade Volume
│   └── Conflict Potential of Arms Exports
└── International Security Conventions

Technology
├── Government Support
├── Tax Incentives
├── Foreign Students
├── Female Students
├── Research Collaboration
└── Intellectual Property Rights
```

---

*Plan created: January 12, 2026*
