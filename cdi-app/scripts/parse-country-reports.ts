import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';

const COUNTRY_REPORTS_DIR = '/Users/jeremygaines/Code/cdi2/data/country report word docs';
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'data');
const OUTPUT_FILE = 'country-reports.json';

// Component names as they appear in the documents
const COMPONENT_NAMES = [
  'Development Finance',
  'Investment',
  'Migration',
  'Trade',
  'Environment',
  'Health',
  'Security',
  'Technology'
];

interface CountryReport {
  countryCode: string;
  countryName: string;
  overall: string;
  components: {
    [key: string]: string; // key is lowercase component name, value is HTML content
  };
}

function toMachineId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function parseDocxFile(filePath: string): Promise<CountryReport | null> {
  try {
    // Convert docx to HTML
    const result = await mammoth.convertToHtml({ path: filePath });
    const html = result.value;

    // Extract country code from filename (e.g., "USA.docx" -> "USA")
    const countryCode = path.basename(filePath, '.docx');

    // Parse the HTML to extract sections
    // Split by h1/h2 headers
    const sections: { [key: string]: string } = {};
    let countryName = '';

    // Use regex to split content by headers while keeping them
    const headerPattern = /<h[12]>(.*?)<\/h[12]>/gi;
    const parts = html.split(headerPattern);

    // parts will be: [content before first header, header1, content1, header2, content2, ...]
    let currentHeader = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();

      if (i === 0) {
        // Skip any content before the first header
        continue;
      }

      if (i % 2 === 1) {
        // This is a header
        currentHeader = part;

        // First header should be the country name
        if (!countryName && i === 1) {
          countryName = currentHeader;
        }
      } else {
        // This is content following a header
        if (currentHeader && part) {
          sections[currentHeader] = part;
        }
      }
    }

    // Build the report object
    const report: CountryReport = {
      countryCode,
      countryName: countryName || countryCode,
      overall: sections['Overall'] || '',
      components: {}
    };

    // Extract component sections
    for (const componentName of COMPONENT_NAMES) {
      const componentId = toMachineId(componentName);
      report.components[componentId] = sections[componentName] || '';
    }

    return report;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

async function main() {
  console.log('Starting country report parsing...');

  // Get all .docx files
  const files = fs.readdirSync(COUNTRY_REPORTS_DIR)
    .filter(f => f.endsWith('.docx'))
    .sort();

  console.log(`Found ${files.length} country report documents`);

  const reports: CountryReport[] = [];

  // Parse each file
  for (const file of files) {
    const filePath = path.join(COUNTRY_REPORTS_DIR, file);
    console.log(`Parsing ${file}...`);

    const report = await parseDocxFile(filePath);
    if (report) {
      reports.push(report);
    }
  }

  // Create a map of country code to report for easier lookup
  const reportMap: { [countryCode: string]: CountryReport } = {};
  reports.forEach(report => {
    reportMap[report.countryCode] = report;
  });

  // Write to JSON file
  const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE);
  fs.writeFileSync(outputPath, JSON.stringify(reportMap, null, 2));

  console.log(`\nWritten: ${outputPath}`);
  console.log(`Total country reports: ${reports.length}`);

  // Show a sample
  if (reports.length > 0) {
    const sample = reports[0];
    console.log(`\nSample (${sample.countryCode}):`);
    console.log(`  Country: ${sample.countryName}`);
    console.log(`  Overall length: ${sample.overall.length} chars`);
    console.log(`  Components with content: ${Object.keys(sample.components).filter(k => sample.components[k]).length}`);
  }
}

main().catch(console.error);
