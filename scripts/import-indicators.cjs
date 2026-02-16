const fs = require('fs');
const path = require('path');

// Read the CSV
const csvPath = path.join(__dirname, '../../data/indicators.csv');
const jsonPath = path.join(__dirname, '../public/data/cdi-data.json');

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
const cdiData = JSON.parse(jsonContent);

// Parse CSV
const lines = csvContent.split('\n').filter(line => line.trim());
const headers = parseCSVLine(lines[0]);

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Build indicator name to ID mapping from the existing indicators array
const indicatorNameToId = {};
const indicatorIdToInfo = {};

for (const ind of cdiData.indicators) {
  indicatorNameToId[ind.name.toLowerCase()] = ind.id;
  indicatorIdToInfo[ind.id] = ind;
}

// Find which columns are indicators (not "missing data" columns)
const indicatorColumns = [];
for (let i = 2; i < headers.length; i++) {
  const header = headers[i];
  if (!header.toLowerCase().includes('missing data') &&
      header !== 'year' &&
      header !== 'Raw: CDI' &&
      header !== 'Inc.Adj: CDI') {
    // Find the matching indicator ID
    const normalizedName = header.toLowerCase().trim();
    let indicatorId = indicatorNameToId[normalizedName];

    // Try some alternate mappings if exact match fails
    if (!indicatorId) {
      // Try to match by converting to kebab-case
      const kebabCase = header.toLowerCase()
        .replace(/[&]/g, '')
        .replace(/[,()]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      for (const ind of cdiData.indicators) {
        if (ind.id === kebabCase || ind.id.includes(kebabCase) || kebabCase.includes(ind.id)) {
          indicatorId = ind.id;
          break;
        }
      }
    }

    if (indicatorId) {
      indicatorColumns.push({
        columnIndex: i,
        missingDataIndex: i + 1,
        header: header,
        indicatorId: indicatorId,
        info: indicatorIdToInfo[indicatorId]
      });
    } else {
      console.log(`Warning: No indicator ID found for column "${header}"`);
    }
  }
}

console.log(`Found ${indicatorColumns.length} indicator columns`);

// Parse country data
const countryData = {};
for (let i = 1; i < lines.length; i++) {
  const values = parseCSVLine(lines[i]);
  const countryName = values[0];
  const iso = values[1];

  if (!iso) continue;

  countryData[iso] = {
    name: countryName,
    indicators: {}
  };

  for (const col of indicatorColumns) {
    const rawValue = values[col.columnIndex];
    const missingDataRaw = values[col.missingDataIndex];

    const score = rawValue === 'N/A' ? null : parseFloat(rawValue);
    const missingData = missingDataRaw === '1' || rawValue === 'N/A';

    countryData[iso].indicators[col.indicatorId] = {
      score: score !== null && !isNaN(score) ? score : 0,
      missingData: missingData
    };
  }
}

console.log(`Parsed data for ${Object.keys(countryData).length} countries`);

// Calculate ranks for each indicator
for (const col of indicatorColumns) {
  const indicatorId = col.indicatorId;
  const lowerIsBetter = col.info?.lowerIsBetter || false;

  // Get all countries with valid scores for this indicator
  const countryScores = [];
  for (const [iso, data] of Object.entries(countryData)) {
    const indData = data.indicators[indicatorId];
    if (indData && !indData.missingData && indData.score !== null) {
      countryScores.push({ iso, score: indData.score });
    }
  }

  // Sort by score (descending for higher is better, ascending for lower is better)
  countryScores.sort((a, b) => {
    if (lowerIsBetter) {
      return a.score - b.score;
    } else {
      return b.score - a.score;
    }
  });

  // Assign ranks
  let rank = 1;
  for (let i = 0; i < countryScores.length; i++) {
    const { iso } = countryScores[i];
    countryData[iso].indicators[indicatorId].rank = rank;
    rank++;
  }

  // Countries with missing data get no rank (or a high rank)
  for (const [iso, data] of Object.entries(countryData)) {
    const indData = data.indicators[indicatorId];
    if (indData && (indData.missingData || indData.rank === undefined)) {
      indData.rank = 999;
    }
  }
}

// Now update the cdi-data.json with indicator data
for (const country of cdiData.countries) {
  const iso = country.id;
  const countryIndicators = countryData[iso];

  if (!countryIndicators) {
    console.log(`Warning: No indicator data for country ${iso}`);
    continue;
  }

  // For each indicator, find which subcomponent it belongs to and add it
  for (const [indicatorId, indData] of Object.entries(countryIndicators.indicators)) {
    const indicatorInfo = indicatorIdToInfo[indicatorId];
    if (!indicatorInfo) continue;

    const componentId = indicatorInfo.componentId;
    const subcomponentId = indicatorInfo.subcomponentId;

    if (!componentId || !subcomponentId) {
      // Some indicators don't have a subcomponent - skip for now
      continue;
    }

    // Make sure the nested structure exists
    if (!country.components[componentId]) continue;
    if (!country.components[componentId].subcomponents) continue;
    if (!country.components[componentId].subcomponents[subcomponentId]) continue;
    if (!country.components[componentId].subcomponents[subcomponentId].indicators) {
      country.components[componentId].subcomponents[subcomponentId].indicators = {};
    }

    country.components[componentId].subcomponents[subcomponentId].indicators[indicatorId] = {
      score: indData.score,
      rank: indData.rank,
      missingData: indData.missingData
    };
  }
}

// Write updated JSON
fs.writeFileSync(jsonPath, JSON.stringify(cdiData, null, 2));
console.log('Updated cdi-data.json with indicator data');

// Print summary
let totalIndicators = 0;
for (const country of cdiData.countries) {
  for (const compId of Object.keys(country.components)) {
    const comp = country.components[compId];
    for (const subId of Object.keys(comp.subcomponents || {})) {
      const sub = comp.subcomponents[subId];
      totalIndicators += Object.keys(sub.indicators || {}).length;
    }
  }
}
console.log(`Total indicator entries added: ${totalIndicators}`);
