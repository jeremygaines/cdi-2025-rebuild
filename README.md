# Commitment to Development Index (CDI) App

A standalone React application for the Center for Global Development's Commitment to Development Index - an annual ranking of countries based on their policies that support international development.

## Overview

The CDI ranks several dozen countries on how their policies contribute to development beyond their borders. The index comprises one master score based on seven main components (Development Finance, Investment, Migration, Trade, Environment, Health, Security, and Technology), which are themselves based on numerous sub-indicators.

This is a complete rebuild of the legacy Vue app that was previously hosted on CGD's Drupal server. The new version is a standalone static site that can be deployed to modern hosting platforms like Vercel or Cloudflare Pages.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling
- **React Router** - Client-side routing
- **Papa Parse** - CSV parsing
- **Mammoth** - Word document parsing

## Project Structure

```
cdi-app/
├── public/
│   └── data/                      # Generated JSON data files
│       ├── cdi-data.json         # Main CDI scores and metadata
│       ├── country-groups.json   # Country groupings
│       └── country-reports.json  # Country report text content
├── scripts/
│   ├── transform-data.ts         # CSV → JSON transformation script
│   └── parse-country-reports.ts  # Word docs → JSON parser
├── src/
│   ├── components/               # Reusable React components
│   │   ├── common/              # Generic UI components
│   │   ├── filters/             # Filter controls
│   │   ├── layout/              # Layout components (Header, Hero)
│   │   ├── modals/              # Modal dialogs
│   │   ├── table/               # Table and ranking components
│   │   └── visualization/       # Charts and score bars
│   ├── context/                 # React Context providers
│   │   ├── DataContext.tsx     # Data loading and access
│   │   └── FilterContext.tsx   # Filter state management
│   ├── content/                 # Static content
│   │   └── helpContent.ts      # Help modal content
│   ├── pages/                   # Page components (routes)
│   │   ├── HomePage.tsx        # Main ranking table
│   │   ├── ComponentPage.tsx   # Component detail pages
│   │   ├── SubcomponentPage.tsx # Subcomponent detail pages
│   │   ├── CountryReportPage.tsx # Country detail pages
│   │   └── ...
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx                  # Main app component with routes
│   ├── index.css               # Global styles and Tailwind config
│   └── main.tsx                # App entry point
└── package.json
```

## Data Architecture

### Three-Level Hierarchy

The CDI uses a hierarchical data structure:

1. **Components** (8 total)
   - Development Finance, Investment, Migration, Trade, Environment, Health, Security, Technology
   - Each has a color, group classification, and description

2. **Subcomponents** (42 total)
   - Examples: "Development Finance Quality", "Tariff Average", "Vaccination Coverage"
   - Each has a subtitle, description, and weight within its parent component

3. **Indicators** (69 total)
   - Examples: "DTP3 Coverage", "Measles Vaccine Coverage"
   - The most granular level of measurement
   - Linked to parent subcomponents

### Data Sources

#### CSV Files (in `/data` directory)
- `components.csv` - Country scores for each component
- `subcomponents.csv` - Country scores for each subcomponent
- `indicators.csv` - Country scores for each indicator

#### Word Documents (in `/data/country report word docs`)
- One `.docx` file per country containing narrative text
- Includes overall assessment and component-specific analysis

### Generated JSON Files

The build process transforms source data into optimized JSON:

```json
// cdi-data.json structure
{
  "year": 2025,
  "countries": [
    {
      "id": "SWE",
      "name": "Sweden",
      "score": 85.2,
      "scoreAdjusted": 83.1,
      "rank": 1,
      "rankAdjusted": 3,
      "components": {
        "health": {
          "score": 92.5,
          "rank": 1,
          "subcomponents": {
            "vaccination-coverage": {
              "score": 95.0,
              "rank": 2,
              "indicators": {
                "dtp3-coverage": { "score": 98.0, "rank": 1 }
              }
            }
          }
        }
      }
    }
  ],
  "components": [...],
  "subcomponents": [...],
  "indicators": [...]
}
```

## Key Features

### Main Ranking Table
- Sortable columns for overall score and each component
- Expandable country rows showing overview text
- Country group filtering (EU, OECD, G7, etc.)
- Income-adjusted scoring toggle
- Sticky table header

### Component Pages
- Component description and metadata
- Ranked country list for that component
- Subcomponent sidebar (clickable to subcomponent pages)
- Country detail drawer with component-specific bars
- Navigation between components

### Subcomponent Pages
- Full description and weighting information
- Ranked country list with score bars and median markers
- Component navigation tabs
- Related subcomponents sidebar

### Country Report Pages
- Overall country assessment
- Expandable component sections showing:
  - Component scores and rankings
  - Subcomponent bars with scores
  - Indented indicator bars under subcomponents
- Income-adjusted results section
- Navigation between countries

## Scripts

### Data Transformation
```bash
npm run build
```

This runs `scripts/transform-data.ts` which:
1. Reads CSV files from `/data`
2. Parses country scores, components, subcomponents, and indicators
3. Merges data into unified structure
4. Outputs JSON to `public/data/cdi-data.json`

### Country Reports Parsing
```bash
npx tsx scripts/parse-country-reports.ts
```

Parses Word documents and creates `country-reports.json` with:
- Overall country assessment text (HTML)
- Component-specific analysis text (HTML)
- Preserves formatting (links, italics, subscripts)

## Development

### Setup
```bash
npm install
npm run dev
```

### Key Commands
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production (includes data transformation)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check

### Working with Data

**To update CDI scores:**
1. Replace CSV files in `/data` directory
2. Run `npm run build` to regenerate JSON

**To update country report text:**
1. Update Word documents in `/data/country report word docs`
2. Run `npx tsx scripts/parse-country-reports.ts`
3. Rebuild the app

**To update component/subcomponent descriptions:**
- Edit `COMPONENT_DEFINITIONS` and `SUBCOMPONENT_DESCRIPTIONS` in `scripts/transform-data.ts`
- Rebuild to regenerate JSON

## Component Colors

Colors are extracted from the live CDI site and defined in multiple places for consistency:

```typescript
// Development Finance: rgb(146, 101, 171) - purple
// Investment: rgb(68, 195, 255) - light blue
// Migration: rgb(0, 129, 214) - blue
// Trade: rgb(29, 74, 184) - navy
// Environment: rgb(255, 193, 39) - yellow/gold
// Health: rgb(255, 157, 58) - orange
// Security: rgb(241, 100, 0) - red-orange
// Technology: rgb(204, 85, 0) - dark orange
```

Each component also has a darker "header color" variant used in navigation tabs.

## Context Providers

### DataContext
Loads and provides access to all CDI data:
- Countries, components, subcomponents, indicators
- Country reports text
- Getter functions: `getCountry()`, `getComponent()`, `getCountryReport()`, etc.

### FilterContext
Manages filter state:
- `selectedGroupId` - Currently selected country group
- `showAdjusted` - Toggle between regular and income-adjusted scores

## Routing

```
/                                    → HomePage (main ranking table)
/component/:componentId              → ComponentPage
/component/:componentId/:subId       → SubcomponentPage
/country/:countryId                  → CountryReportPage
```

## Design System

### Colors
- **Primary (teal)**: `#006970` - Used for links, buttons, active states
- **Text**: `#73706f` (headings), `#5e6666` (percentages)
- **Backgrounds**: `#f0ece7` (beige), `#f5f3ee` (light tan)

### Typography
- Font: Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif
- Headings use lighter font weights
- Uppercase tracking for labels and tabs

### Components
- Ranking tables with alternating row colors (opacity-based on component colors)
- Score bars with median markers
- White pill-shaped rank badges
- Expandable sections with smooth transitions
- Sticky headers for better navigation

## Building for Production

```bash
npm run build
```

This creates a `dist` folder with:
- Optimized, minified JavaScript and CSS
- Pre-generated JSON data files
- Static assets

The output is a fully static site that can be deployed to:
- Vercel
- Cloudflare Pages
- Netlify
- GitHub Pages
- Any static hosting service

## Key Implementation Details

### Income-Adjusted Scores
Countries are scored both on absolute performance and relative to their income level. The income-adjusted scores account for what's expected given a country's GNI per capita.

### Country Groups
Predefined groups allow filtering the main table:
- All Countries
- EU member states
- OECD countries
- G7, G20
- BRICS+
- Income-based groups (High income, Upper-middle income, etc.)

### Score Calculations
- Component scores: Average/weighted combination of subcomponent scores
- Overall score: Weighted combination of component scores
- Rankings: Calculated separately for regular and income-adjusted scores
- Tied ranks: Multiple countries can share the same rank

### Data Integrity
- Excluded countries (ISR, RUS) are filtered during data transformation
- Missing data is explicitly tracked with `missingData: true` flags
- Zero scores vs. missing data are distinguished

## Browser Support

The app uses modern web features and is tested on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus visible states
- Sufficient color contrast

## Future Enhancements

Potential areas for expansion:
- Add indicator-level pages (currently only 3 levels implemented)
- Interactive data visualizations and charts
- Export functionality (PDF reports, CSV downloads)
- Comparison tool (side-by-side country comparison)
- Historical data and trend analysis
- Mobile-optimized layouts
- Search functionality
- Print-friendly styles

## License

© Center for Global Development

## Support

For questions or issues, contact the CGD development team or file an issue at the project repository.
