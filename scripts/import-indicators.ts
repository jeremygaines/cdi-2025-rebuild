import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.resolve(__dirname, '../../data/indicators.csv');
const CDI_DATA_PATH = path.resolve(__dirname, '../public/data/cdi-data.json');

// Build name-to-ID mapping from indicator definitions in cdi-data.json
function buildNameToIdMap(indicators: any[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const ind of indicators) {
    map[ind.name.toLowerCase()] = ind.id;
  }
  return map;
}

// Build indicator ID -> { componentId, subcomponentId } lookup
function buildIndicatorLocationMap(data: any): Record<string, { componentId: string; subcomponentId: string }> {
  const map: Record<string, { componentId: string; subcomponentId: string }> = {};

  // Build subcomponent -> component lookup
  const subToComp: Record<string, string> = {};
  for (const comp of data.components) {
    for (const subId of comp.subcomponents) {
      subToComp[subId] = comp.id;
    }
  }

  for (const ind of data.indicators) {
    // Case 1: indicator has a subcomponentId set
    if (ind.subcomponentId) {
      const compId = subToComp[ind.subcomponentId];
      if (compId) {
        map[ind.id] = { componentId: compId, subcomponentId: ind.subcomponentId };
        continue;
      }
    }

    // Case 2: indicator ID matches a subcomponent ID (indicator IS the subcomponent)
    if (subToComp[ind.id]) {
      map[ind.id] = { componentId: subToComp[ind.id], subcomponentId: ind.id };
      continue;
    }

    // Case 3: indicator is listed in a subcomponent's indicators array
    for (const sub of data.subcomponents) {
      if (sub.indicators.includes(ind.id)) {
        map[ind.id] = { componentId: subToComp[sub.id], subcomponentId: sub.id };
        break;
      }
    }

    // Case 4: indicator has componentId set directly
    if (!map[ind.id] && ind.componentId) {
      // Try to find the subcomponent that should contain it
      const sub = data.subcomponents.find((s: any) => s.componentId === ind.componentId && s.id === ind.id);
      if (sub) {
        map[ind.id] = { componentId: ind.componentId, subcomponentId: sub.id };
      }
    }
  }

  return map;
}

function main() {
  const cdiData = JSON.parse(fs.readFileSync(CDI_DATA_PATH, 'utf-8'));
  const nameToId = buildNameToIdMap(cdiData.indicators);
  const locationMap = buildIndicatorLocationMap(cdiData);

  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
  const rows = parsed.data as Record<string, string>[];

  // Get all score column names (not missing data, not meta)
  const headers = parsed.meta.fields || [];
  const scoreColumns = headers.filter(h =>
    !h.includes('missing data') &&
    h !== 'Country' && h !== 'ISO' && h !== 'year' &&
    !h.startsWith('Raw:') && !h.startsWith('Inc.Adj:')
  );

  // Map CSV column names to indicator IDs
  const columnToId: Record<string, string> = {};
  const unmapped: string[] = [];
  for (const col of scoreColumns) {
    const id = nameToId[col.toLowerCase()];
    if (id) {
      columnToId[col] = id;
    } else {
      unmapped.push(col);
    }
  }

  if (unmapped.length > 0) {
    console.log(`Warning: ${unmapped.length} columns could not be mapped:`);
    unmapped.forEach(c => console.log(`  "${c}"`));
  }

  console.log(`Mapped ${Object.keys(columnToId).length} columns to indicator IDs`);

  // For each indicator, collect all country scores to compute ranks
  const indicatorScores: Record<string, { iso: string; score: number; missingData: boolean }[]> = {};

  for (const col of scoreColumns) {
    const indId = columnToId[col];
    if (!indId) continue;
    const missingCol = `${col} missing data`;

    indicatorScores[indId] = [];

    for (const row of rows) {
      const iso = row['ISO'];
      const rawScore = row[col];
      const rawMissing = row[missingCol];
      const missingData = rawMissing === '1' || rawScore === 'N/A';
      const score = missingData ? 0 : parseFloat(rawScore) || 0;

      indicatorScores[indId].push({ iso, score, missingData });
    }
  }

  // Compute ranks for each indicator (rank by score descending, ties get same rank)
  const indicatorRanks: Record<string, Record<string, { score: number; rank: number; missingData: boolean }>> = {};

  for (const [indId, scores] of Object.entries(indicatorScores)) {
    // Sort non-missing by score descending
    const nonMissing = scores.filter(s => !s.missingData).sort((a, b) => b.score - a.score);
    const rankMap: Record<string, { score: number; rank: number; missingData: boolean }> = {};

    let rank = 1;
    for (let i = 0; i < nonMissing.length; i++) {
      // Handle ties: if same score as previous, same rank
      if (i > 0 && nonMissing[i].score === nonMissing[i - 1].score) {
        rankMap[nonMissing[i].iso] = { score: nonMissing[i].score, rank: rankMap[nonMissing[i - 1].iso].rank, missingData: false };
      } else {
        rankMap[nonMissing[i].iso] = { score: nonMissing[i].score, rank, missingData: false };
      }
      rank++;
    }

    // Missing data entries get rank 0
    for (const s of scores.filter(s => s.missingData)) {
      rankMap[s.iso] = { score: 0, rank: 0, missingData: true };
    }

    indicatorRanks[indId] = rankMap;
  }

  // Now populate cdi-data.json countries
  let populated = 0;
  for (const country of cdiData.countries) {
    for (const [indId, ranks] of Object.entries(indicatorRanks)) {
      const loc = locationMap[indId];
      if (!loc) continue;

      const countryData = ranks[country.id];
      if (!countryData) continue;

      const comp = country.components[loc.componentId];
      if (!comp) continue;

      const sub = comp.subcomponents[loc.subcomponentId];
      if (!sub) continue;

      if (!sub.indicators) sub.indicators = {};
      sub.indicators[indId] = {
        score: countryData.score,
        rank: countryData.rank,
        missingData: countryData.missingData,
      };
      populated++;
    }
  }

  fs.writeFileSync(CDI_DATA_PATH, JSON.stringify(cdiData, null, 2));

  console.log(`Populated ${populated} indicator scores across ${cdiData.countries.length} countries`);

  // Verify: check one country
  const swe = cdiData.countries.find((c: any) => c.id === 'SWE');
  if (swe) {
    const devFinQual = swe.components['development-finance']?.subcomponents['development-finance-quality']?.indicators;
    console.log('\nVerification - Sweden Dev Finance Quality indicators:');
    console.log(JSON.stringify(devFinQual, null, 2));
  }

  // Report any indicators that didn't get placed
  const placedIds = new Set(Object.keys(indicatorRanks).filter(id => locationMap[id]));
  const unplacedIds = Object.keys(indicatorRanks).filter(id => !locationMap[id]);
  if (unplacedIds.length > 0) {
    console.log(`\nWarning: ${unplacedIds.length} indicators had no location in the hierarchy:`);
    unplacedIds.forEach(id => console.log(`  ${id}`));
  }
}

main();
