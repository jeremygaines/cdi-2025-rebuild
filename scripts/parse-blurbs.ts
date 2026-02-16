import mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCX_PATH = path.resolve(__dirname, '../../data/blurbs.docx');
const CDI_DATA_PATH = path.resolve(__dirname, '../public/data/cdi-data.json');
const OUTPUT_PATH = path.resolve(__dirname, '../public/data/blurbs.json');

// Build name-to-ID lookup from existing data
function buildNameToIdMap(cdiData: any): Record<string, string> {
  const map: Record<string, string> = {};

  for (const c of cdiData.components) {
    map[normalize(c.name)] = c.id;
  }
  for (const s of cdiData.subcomponents) {
    map[normalize(s.name)] = s.id;
  }
  for (const i of cdiData.indicators) {
    map[normalize(i.name)] = i.id;
  }

  return map;
}

function normalize(name: string): string {
  return name.toLowerCase().replace(/&amp;/g, '&').replace(/[^\w\s]/g, '').trim();
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/&/g, 'and')
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

async function main() {
  const cdiData = JSON.parse(fs.readFileSync(CDI_DATA_PATH, 'utf-8'));
  const nameToId = buildNameToIdMap(cdiData);

  const result = await mammoth.convertToHtml({ path: DOCX_PATH });
  const html = result.value;

  // Split on heading tags, keeping the delimiters
  const parts = html.split(/(<h[123]>.*?<\/h[123]>)/);

  interface BlurbEntry {
    name: string;
    id: string;
    level: 'component' | 'subcomponent' | 'indicator';
    componentId?: string;
    subcomponentId?: string;
    description: string;
  }

  const blurbs: BlurbEntry[] = [];
  let currentComponent = '';
  let currentSubcomponent = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const headingMatch = part.match(/<h([123])>(.*?)<\/h[123]>/);

    if (headingMatch) {
      const level = parseInt(headingMatch[1]);
      const name = headingMatch[2];
      const plainName = stripHtmlTags(name);
      const normalizedName = normalize(plainName);

      // Get the content after this heading (until the next heading)
      const content = (parts[i + 1] || '').trim();

      // Look up ID from existing data, fall back to slugifying the name
      const id = nameToId[normalizedName] || slugify(plainName);

      if (level === 1) {
        currentComponent = id;
        currentSubcomponent = '';
        blurbs.push({
          name: plainName,
          id,
          level: 'component',
          description: content,
        });
      } else if (level === 2) {
        currentSubcomponent = id;
        blurbs.push({
          name: plainName,
          id,
          level: 'subcomponent',
          componentId: currentComponent,
          description: content,
        });
      } else if (level === 3) {
        blurbs.push({
          name: plainName,
          id,
          level: 'indicator',
          componentId: currentComponent,
          subcomponentId: currentSubcomponent,
          description: content,
        });
      }
    }
  }

  // Structure as nested JSON
  const output: Record<string, any> = {};

  for (const blurb of blurbs) {
    if (blurb.level === 'component') {
      output[blurb.id] = {
        name: blurb.name,
        description: blurb.description,
        subcomponents: {},
      };
    } else if (blurb.level === 'subcomponent' && blurb.componentId) {
      if (!output[blurb.componentId]) continue;
      output[blurb.componentId].subcomponents[blurb.id] = {
        name: blurb.name,
        description: blurb.description,
        indicators: {},
      };
    } else if (blurb.level === 'indicator' && blurb.componentId && blurb.subcomponentId) {
      if (!output[blurb.componentId]?.subcomponents?.[blurb.subcomponentId]) continue;
      output[blurb.componentId].subcomponents[blurb.subcomponentId].indicators[blurb.id] = {
        name: blurb.name,
        description: blurb.description,
      };
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  // Print summary
  let componentCount = 0, subCount = 0, indCount = 0;
  for (const comp of Object.values(output) as any[]) {
    componentCount++;
    for (const sub of Object.values(comp.subcomponents) as any[]) {
      subCount++;
      indCount += Object.keys(sub.indicators).length;
    }
  }
  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`  ${componentCount} components, ${subCount} subcomponents, ${indCount} indicators`);

  // Report any unmatched names (where we fell back to slugify)
  const allIds = new Set([
    ...cdiData.components.map((c: any) => c.id),
    ...cdiData.subcomponents.map((s: any) => s.id),
    ...cdiData.indicators.map((i: any) => i.id),
  ]);
  const unmatched = blurbs.filter(b => !allIds.has(b.id));
  if (unmatched.length > 0) {
    console.log(`\nWarning: ${unmatched.length} heading(s) did not match an existing ID:`);
    for (const b of unmatched) {
      console.log(`  "${b.name}" -> generated id: "${b.id}"`);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
