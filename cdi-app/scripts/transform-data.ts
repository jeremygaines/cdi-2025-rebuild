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
    description: `Development finance is likely the first policy area that comes to mind when considering how countries help to promote development beyond their borders. It remains an important source of assistance for many developing countries. The OECD finds that aid has been the largest and most reliable source of finance for the least developed fragile states over the past decade. In 1969, the Pearson Commission on International Development proposed that rich countries should spend 0.7 percent of their gross national product (GNP) on foreign aid (later defined as "official development assistance," or ODA, by the OECD's Development Assistance Committee). This 0.7 percent target was adopted by the UN in 1970, and in 1993, gross national income (GNI) replaced GNP as the measure. More than 50 years after it was set, only a handful of countries are meeting this target.\n\nQuantity is not all that matters in development finance. How it is provided can have a significant impact on development results, as acknowledged by donors in a series of High Level Fora on Aid Effectiveness. These fora contributed to establishing key principles for improving the effectiveness of development cooperation. Today, ownership, focus on results, inclusive development partnerships, and transparency and mutual accountability are standard criteria which donors and recipients use to implement development assistance interventions. These criteria were agreed upon by 160 countries, including new and emerging cooperation providers.`
  },
  'investment': {
    name: 'Investment',
    shortName: 'Investment',
    color: 'rgb(68, 195, 255)',   // light blue #44C3FF
    group: 'exchange',
    description: `Foreign direct investment is the largest source of external financing for many developing countries. Foreign investment can contribute to the development of infrastructure, housing, transport, energy supply, and many other areas. Major economies' policies can support or impede private investment beyond their borders and impact the wellbeing of many developing country citizens. The quantity of investment is not the only consideration—it is important that measures are in place to safeguard the environment and the general welfare of those affected by the investment.\n\nDomestic regulation also impacts international financial flows and their potential to facilitate crime, corruption, and tax evasion, which can inhibit development and undermine confidence. States have legal duties to screen, trace, freeze, seize, and return illicit wealth, and to detect, prevent, and punish foreign bribery. This supports the integrity of investment, public accountability, and revenue raising in developing countries.`
  },
  'migration': {
    name: 'Migration',
    shortName: 'Migration',
    color: 'rgb(0, 129, 214)',    // blue #0081D6
    group: 'exchange',
    description: `In 2016, all 193 UN member states agreed that protecting refugees is a responsibility which much be borne more equitably. In spite of this, hosting of the world's currently 35-million large refugee population has remained widely uneven. But in addition to the humanitarian imperative to provide shelter for those forced to flee their homes, international worker mobility is also a source of economic opportunities, both for host countries as well as countries of origin. Migration can broaden people's opportunities to earn higher incomes, access knowledge, gain valuable skills, and even to increase the knowledge base in their home countries. What's more, in 2022, migrant workers from low- and middle-income countries are estimated to have collectively sent remittances worth over $630 billion, helping to increase incomes and smooth consumption in their countries of origin. This flow exceeds official aid by a factor of three and is similar to levels of FDI.\n\nCountries differ widely on their policies for accepting and integrating migrants and refugees. The stronger the opportunities for migrants to integrate into their host societies, and the better their rights are protected, the more they can enjoy the opportunities available to them and contribute to the societies in which they live.`
  },
  'trade': {
    name: 'Trade',
    shortName: 'Trade',
    color: 'rgb(29, 74, 184)',    // navy #1D4AB8
    group: 'exchange',
    description: `The policies of major economics have a significant impact on the trading prospects of developing countries. Trade is an important pathway to prosperity as it provides opportunities to develop dynamic export sectors, tap into global supply chains, attract investment, create jobs, and reduce poverty. In 2022, trade constituted 50 percent of the GDP of least developed countries. Yet many goods for which developing countries have a relative production advantage, such as agricultural goods or textiles, still face tariffs and other trade barriers. Also, trade in services is becoming increasingly important for development, but administrative barriers remain which restrict trade flows in services.`
  },
  'environment': {
    name: 'Environment',
    shortName: 'Environment',
    color: 'rgb(255, 193, 39)',   // yellow/gold #FFC127
    group: 'global',
    description: `A healthy environment and global climate are global public goods, benefitting all but with few incentives to protect them.\n\nWhile wealthy countries bear the most responsibility for climate change, its impacts will be felt disproportionately in poor countries. The World Bank estimates that climate change could push an additional 100 million people into extreme poverty by 2030. Limiting greenhouse gas emissions, in production and consumption, is therefore crucial in promoting development. The removal of fossil fuel production and consumption subsidies, and the introduction of carbon pricing, could play a major role in such a transition.\n\nMany of the world's poor depend heavily on their surrounding environment to meet their daily needs. Countries can help safeguard biodiversity by committing to international conventions. Global fish stocks are also overexploited. Fishing subsidies provided by major economies result in overfishing, which negatively impacts biodiversity and the livelihoods of communities dependent on these resources.`
  },
  'health': {
    name: 'Health',
    shortName: 'Health',
    color: 'rgb(255, 157, 58)',   // orange #FF9D3A
    group: 'global',
    description: `The global COVID-19 pandemic brought into sharp focus the transboundary nature of disease outbreaks, the importance of spillovers of domestic policy decisions, and the need for international collaboration. While the international dimension of health is particularly visible during global crises such as COVID-19, "peacetime" policies also matter for development. For example, the risks posed by growing antimicrobial resistance, an "endemic" problem, also threaten human health beyond domestic borders.`
  },
  'security': {
    name: 'Security',
    shortName: 'Security',
    color: 'rgb(241, 100, 0)',    // red-orange #F16400
    group: 'global',
    description: `Security and development are closely interlinked. War and political violence devastate government infrastructure and public resources, and harm civilians and their homes and livelihoods. War decimates public capacities and political institutions and devastates citizens' lives. This causal link also works in reverse: poverty and institutional weakness make it easier for both challengers and incumbents to gain support for political violence and war. It is unsurprising that fragile and conflict-afflicted states are the most behind on the SDGs.\n\nWe measure a country's commitment to global security by focusing on three subcomponents: contributions to international peacekeeping efforts, participation in international security treaties, and avoiding damaging arms sales.`
  },
  'technology': {
    name: 'Technology',
    shortName: 'Technology',
    color: 'rgb(204, 85, 0)',     // dark orange #CC5500
    group: 'global',
    description: `Technology is a critical factor in economic and human development, and not just for the poor. It can reduce the price of goods and services, making them more accessible to all. Advances in medicines, sustainable energy, and agricultural productivity raise the quality of life worldwide. The largest global economies can play a major role in both new knowledge creation and its diffusion worldwide.\n\nGovernments can contribute to global innovation and technological development through direct funding or through incentives to stimulate the private sector. They can encourage technology diffusion through international academic collaboration, or by opening the doors to foreign students to allow them to gain new knowledge and skills, and address gender inequalities by admitting more female students. But governments can also impede diffusion through excessively restrictive intellectual property right (IPR) terms within their foreign trade and investment agreements, which limit developing countries' access to vital technologies.`
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

// Map indicator names to their parent subcomponent
const INDICATOR_TO_SUBCOMPONENT: Record<string, string> = {
  // Development Finance Quality indicators
  'Multilateral Support': 'development-finance-quality',
  'Poverty Focus': 'development-finance-quality',
  'Fragility Focus': 'development-finance-quality',
  'Fragility focus': 'development-finance-quality',
  'Tied Status': 'development-finance-quality',
  'Transparency': 'development-finance-quality',
  'Country Ownership': 'development-finance-quality',

  // Financial Secrecy indicators (Investment)
  'Banking Secrecy': 'financial-secrecy',
  'Country by Country Reporting': 'financial-secrecy',
  'Public Statistics': 'financial-secrecy',
  'Anti-Money Laundering': 'financial-secrecy',
  'Automatic Exchange of Information': 'financial-secrecy',
  'Bilateral Treaties': 'financial-secrecy',
  'International Legal Cooperation': 'financial-secrecy',
  'Beneficial Ownership': 'financial-secrecy',

  // Greenhouse Gas Emissions indicators (Environment)
  'Emissions (excluding LULUCF)': 'greenhouse-gas-emissions',
  'NDC Ambition': 'greenhouse-gas-emissions',
  'Emissions from LULUCF': 'greenhouse-gas-emissions',
  'Emissions from Trade': 'greenhouse-gas-emissions',

  // Fossil Fuel Production indicators (Environment)
  'Oil Production': 'fossil-fuel-production',
  'Gas Production': 'fossil-fuel-production',
  'Coal Production': 'fossil-fuel-production',

  // Fossil Fuel Support indicators (Environment)
  'Support to Oil': 'fossil-fuel-support',
  'Support to Gas': 'fossil-fuel-support',
  'Support to Coal': 'fossil-fuel-support',
  'Support to Electricity': 'fossil-fuel-support',

  // Antimicrobial Resistance indicators (Health)
  'Antibiotic Consumption in Humans': 'antimicrobial-resistance',
  'Antibiotic Consumption in Livestock Animals': 'antimicrobial-resistance',
  'AMR Governance': 'antimicrobial-resistance',

  // Vaccination Coverage indicators (Health)
  'Measles Vaccine (MCV2) Coverage': 'vaccination-coverage',
  'Diphtheria, Tetanus Toxoid, and Pertussis Vaccine (DTP3) Coverage': 'vaccination-coverage',

  // Export Restrictions indicators (Health)
  'Duration of Export Restrictions': 'export-restrictions-on-food-and-health',
  'Number of Products Covered': 'export-restrictions-on-food-and-health',

  // Peacekeeping Contributions indicators (Security)
  'Financial Contributions to UN DPO': 'peacekeeping-contributions',
  'UN Troop Contributions': 'peacekeeping-contributions',
  'Non-UN Troop Contributions': 'peacekeeping-contributions',

  // Arms Trade indicators (Security)
  'Arms Trade Volume': 'arms-trade',
  'Conflict Potential of Arms Exports': 'arms-trade',
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
    const trimmedName = name.trim();
    // Find which subcomponent this indicator belongs to
    const subcomponentId = INDICATOR_TO_SUBCOMPONENT[trimmedName] || '';
    // Find which component the subcomponent belongs to
    let componentId = '';
    if (subcomponentId) {
      const subcomp = subcomponents.find(s => s.id === subcomponentId);
      if (subcomp) {
        componentId = subcomp.componentId;
      }
    }
    return {
      id: toMachineId(trimmedName),
      name: trimmedName,
      subcomponentId,
      componentId,
      unit: 'score',
      description: `Placeholder description for ${trimmedName}.`,
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
