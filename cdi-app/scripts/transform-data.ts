/**
 * Data transformation script
 * Converts CSV files to JSON format for the CDI app
 *
 * Run with: npx tsx scripts/transform-data.ts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const DATA_DIR = path.join(__dirname, '../../data');
const OUTPUT_DIR = path.join(__dirname, '../public/data');

// Countries to exclude
const EXCLUDED_COUNTRIES = ['ISR', 'RUS'];

// Component definitions with colors and metadata - extracted from live CDI site
const COMPONENT_DEFINITIONS: Record<string, { name: string; shortName: string; color: string; group: string; description: string }> = {
  'development-finance': {
    name: 'Development Finance',
    shortName: 'Development Finance',
    color: 'rgb(146, 101, 171)',  // purple #9265AB
    group: 'finance',
    description: 'Measures the quantity and quality of aid and other development finance.'
  },
  'investment': {
    name: 'Investment',
    shortName: 'Investment',
    color: 'rgb(68, 195, 255)',   // light blue #44C3FF
    group: 'exchange',
    description: 'Evaluates policies affecting investment in developing countries.'
  },
  'migration': {
    name: 'Migration',
    shortName: 'Migration',
    color: 'rgb(0, 129, 214)',    // blue #0081D6
    group: 'exchange',
    description: 'Assesses policies on immigration and integration of migrants.'
  },
  'trade': {
    name: 'Trade',
    shortName: 'Trade',
    color: 'rgb(29, 74, 184)',    // navy #1D4AB8
    group: 'exchange',
    description: 'Examines trade policies and their impact on developing countries.'
  },
  'environment': {
    name: 'Environment',
    shortName: 'Environment',
    color: 'rgb(255, 193, 39)',   // yellow/gold #FFC127
    group: 'global',
    description: 'Measures environmental policies and climate change mitigation efforts.'
  },
  'health': {
    name: 'Health',
    shortName: 'Health',
    color: 'rgb(255, 157, 58)',   // orange #FF9D3A
    group: 'global',
    description: 'Evaluates contributions to global health.'
  },
  'security': {
    name: 'Security',
    shortName: 'Security',
    color: 'rgb(241, 100, 0)',    // red-orange #F16400
    group: 'global',
    description: 'Assesses contributions to international peace and security.'
  },
  'technology': {
    name: 'Technology',
    shortName: 'Technology',
    color: 'rgb(204, 85, 0)',     // dark orange #CC5500
    group: 'global',
    description: 'Measures policies supporting technology transfer and innovation.'
  }
};

// Map CSV column names to component IDs
const COMPONENT_NAME_MAP: Record<string, string> = {
  'Development Finance': 'development-finance',
  'Investment': 'investment',
  'Migration': 'migration',
  'Trade': 'trade',
  'Environment': 'environment',
  'Health': 'health',
  'Security': 'security',
  'Technology': 'technology'
};

// Map subcomponent names to their parent component
const SUBCOMPONENT_TO_COMPONENT: Record<string, string> = {
  'Development Finance Quality': 'development-finance',
  'Development Finance Quantity': 'development-finance',
  'Financial Secrecy': 'investment',
  'Business & Human Rights': 'investment',
  'Natural Resources': 'investment',
  'Anti-corruption': 'investment',
  'Investment Agreements': 'investment',
  'Corporate Tax Rate Alignment': 'investment',
  'Migrant Inflow': 'migration',
  'Female Immigrants': 'migration',
  'Refugee Hosting': 'migration',
  'International Migration Conventions': 'migration',
  'Integration Policies': 'migration',
  'Tariff Average': 'trade',
  'Tariff Peaks': 'trade',
  'Agricultural Subsidies': 'trade',
  'Trade Logistics': 'trade',
  'Services Trade Restrictiveness': 'trade',
  'Greenhouse Gas Emissions': 'environment',
  'NDC Ambition': 'environment',
  'Fossil Fuel Production': 'environment',
  'Fossil Fuel Support': 'environment',
  'Carbon Pricing': 'environment',
  'Fishing subsidies': 'environment',
  'International Environmental Conventions': 'environment',
  'Antimicrobial Resistance': 'health',
  'Vaccination Coverage': 'health',
  'Pandemic Preparedness': 'health',
  'Treaties': 'health',
  'Export Restrictions on Food and Health': 'health',
  'Tobacco Supply Chains': 'health',
  'Peacekeeping Contributions': 'security',
  'Female Peacekeepers': 'security',
  'Sea Lanes Protection': 'security',
  'Arms Trade': 'security',
  'International Security Conventions': 'security',
  'Government Support': 'technology',
  'Tax Incentives': 'technology',
  'Foreign Students': 'technology',
  'Female Students': 'technology',
  'Research Collaboration': 'technology',
  'Intellectual Property Rights': 'technology'
};

// Helper to create machine-readable ID from name
function toMachineId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

// Parse CSV file
function parseCSV(filename: string): Record<string, string>[] {
  const filepath = path.join(DATA_DIR, filename);
  const content = fs.readFileSync(filepath, 'utf-8');
  const result = Papa.parse(content, { header: true, skipEmptyLines: true });
  return result.data as Record<string, string>[];
}

// Calculate ranks for an array of scores (higher is better by default)
function calculateRanks(items: { id: string; score: number }[]): Map<string, { rank: number; isTied: boolean }> {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  const ranks = new Map<string, { rank: number; isTied: boolean }>();

  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const prevItem = sorted[i - 1];
    const nextItem = sorted[i + 1];

    // Check if tied with adjacent items
    const isTied =
      (prevItem && prevItem.score === item.score) ||
      (nextItem && nextItem.score === item.score);

    // If not tied with previous, update rank
    if (!prevItem || prevItem.score !== item.score) {
      currentRank = i + 1;
    }

    ranks.set(item.id, { rank: currentRank, isTied });
  }

  return ranks;
}

function main() {
  console.log('Starting data transformation...');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Parse CSV files
  const componentsData = parseCSV('components.csv');
  const subcomponentsData = parseCSV('subcomponents.csv');
  const indicatorsData = parseCSV('indicators.csv');

  // Filter out excluded countries
  const filteredComponents = componentsData.filter(
    row => row.ISO && !EXCLUDED_COUNTRIES.includes(row.ISO)
  );
  const filteredSubcomponents = subcomponentsData.filter(
    row => row.ISO && !EXCLUDED_COUNTRIES.includes(row.ISO)
  );
  const filteredIndicators = indicatorsData.filter(
    row => row.ISO && !EXCLUDED_COUNTRIES.includes(row.ISO)
  );

  console.log(`Processing ${filteredComponents.length} countries...`);

  // Build country data with overall scores
  const overallScores = filteredComponents.map(row => ({
    id: row.ISO,
    score: parseFloat(row['Raw: CDI']) || 0
  }));
  const overallRanks = calculateRanks(overallScores);

  const overallAdjustedScores = filteredComponents.map(row => ({
    id: row.ISO,
    score: parseFloat(row['Inc.Adj: CDI']) || 0
  }));
  const overallAdjustedRanks = calculateRanks(overallAdjustedScores);

  // Calculate ranks per component
  const componentRanks: Record<string, Map<string, { rank: number; isTied: boolean }>> = {};
  const componentAdjustedRanks: Record<string, Map<string, { rank: number; isTied: boolean }>> = {};

  for (const [displayName, componentId] of Object.entries(COMPONENT_NAME_MAP)) {
    const scores = filteredComponents.map(row => ({
      id: row.ISO,
      score: parseFloat(row[`Raw: ${displayName}`]) || 0
    }));
    componentRanks[componentId] = calculateRanks(scores);

    const adjustedScores = filteredComponents.map(row => ({
      id: row.ISO,
      score: parseFloat(row[`Inc.Adj: ${displayName}`]) || 0
    }));
    componentAdjustedRanks[componentId] = calculateRanks(adjustedScores);
  }

  // Calculate ranks per subcomponent
  const subcomponentRanks: Record<string, Map<string, { rank: number; isTied: boolean }>> = {};
  const subcomponentNames = Object.keys(SUBCOMPONENT_TO_COMPONENT);

  for (const subName of subcomponentNames) {
    const subId = toMachineId(subName);
    const scores = filteredSubcomponents
      .filter(row => row[subName] !== undefined && row[subName] !== '')
      .map(row => ({
        id: row.ISO,
        score: parseFloat(row[subName]) || 0
      }));
    if (scores.length > 0) {
      subcomponentRanks[subId] = calculateRanks(scores);
    }
  }

  // Build countries array
  const countries = filteredComponents.map(row => {
    const iso = row.ISO;
    const subRow = filteredSubcomponents.find(s => s.ISO === iso);

    // Build component scores
    const components: Record<string, any> = {};

    for (const [displayName, componentId] of Object.entries(COMPONENT_NAME_MAP)) {
      const score = parseFloat(row[`Raw: ${displayName}`]) || 0;
      const scoreAdjusted = parseFloat(row[`Inc.Adj: ${displayName}`]) || 0;
      const rankInfo = componentRanks[componentId]?.get(iso) || { rank: 0, isTied: false };
      const rankAdjustedInfo = componentAdjustedRanks[componentId]?.get(iso) || { rank: 0, isTied: false };

      // Build subcomponent scores for this component
      const subcomponents: Record<string, any> = {};

      for (const [subName, parentId] of Object.entries(SUBCOMPONENT_TO_COMPONENT)) {
        if (parentId === componentId && subRow) {
          const subId = toMachineId(subName);
          const subScore = parseFloat(subRow[subName]) || 0;
          const subRankInfo = subcomponentRanks[subId]?.get(iso) || { rank: 0, isTied: false };

          subcomponents[subId] = {
            score: subScore,
            rank: subRankInfo.rank,
            isTied: subRankInfo.isTied,
            indicators: {} // Will be filled in later if needed
          };
        }
      }

      components[componentId] = {
        score,
        scoreAdjusted,
        rank: rankInfo.rank,
        rankAdjusted: rankAdjustedInfo.rank,
        isTied: rankInfo.isTied,
        isTiedAdjusted: rankAdjustedInfo.isTied,
        subcomponents
      };
    }

    const overallRankInfo = overallRanks.get(iso) || { rank: 0, isTied: false };
    const overallAdjustedRankInfo = overallAdjustedRanks.get(iso) || { rank: 0, isTied: false };

    return {
      id: iso,
      name: row.Country,
      score: parseFloat(row['Raw: CDI']) || 0,
      scoreAdjusted: parseFloat(row['Inc.Adj: CDI']) || 0,
      rank: overallRankInfo.rank,
      rankAdjusted: overallAdjustedRankInfo.rank,
      isTied: overallRankInfo.isTied,
      isTiedAdjusted: overallAdjustedRankInfo.isTied,
      components
    };
  });

  // Sort by rank
  countries.sort((a, b) => a.rank - b.rank);

  // Build components array
  const components = Object.entries(COMPONENT_DEFINITIONS).map(([id, def]) => {
    const subcomponentIds = Object.entries(SUBCOMPONENT_TO_COMPONENT)
      .filter(([_, componentId]) => componentId === id)
      .map(([name, _]) => toMachineId(name));

    return {
      id,
      name: def.name,
      shortName: def.shortName,
      color: def.color,
      group: def.group,
      description: def.description,
      subcomponents: subcomponentIds
    };
  });

  // Build subcomponents array
  const subcomponents = Object.entries(SUBCOMPONENT_TO_COMPONENT).map(([name, componentId]) => ({
    id: toMachineId(name),
    name: name.trim(),
    componentId,
    description: `Placeholder description for ${name}.`,
    indicators: [] // Would need indicator mapping
  }));

  // Build indicators array (from column headers in indicators.csv)
  const indicatorColumns = Object.keys(indicatorsData[0] || {})
    .filter(col =>
      !col.includes('missing data') &&
      !['Country', 'ISO', 'Raw: CDI', 'Inc.Adj: CDI', 'year'].includes(col)
    );

  const indicators = indicatorColumns.map(name => {
    // Find which subcomponent this indicator belongs to
    // For now, we'll leave this as a placeholder
    return {
      id: toMachineId(name),
      name: name.trim(),
      subcomponentId: '', // Would need proper mapping
      componentId: '',
      unit: 'score',
      description: `Placeholder description for ${name}.`,
      lowerIsBetter: false
    };
  });

  // Simple country groups placeholder
  const countryGroups = [
    {
      id: 'all',
      name: 'All Countries',
      countryIds: countries.map(c => c.id)
    }
  ];

  // Build final data structure
  const cdiData = {
    countries,
    components,
    subcomponents,
    indicators,
    countryGroups,
    year: 2025
  };

  // Write output
  const outputPath = path.join(OUTPUT_DIR, 'cdi-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(cdiData, null, 2));
  console.log(`Written: ${outputPath}`);

  // Also write a summary
  console.log('\nSummary:');
  console.log(`- Countries: ${countries.length}`);
  console.log(`- Components: ${components.length}`);
  console.log(`- Subcomponents: ${subcomponents.length}`);
  console.log(`- Indicators: ${indicators.length}`);
  console.log('\nData transformation complete!');
}

main();
