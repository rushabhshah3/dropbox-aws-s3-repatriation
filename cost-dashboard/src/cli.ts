// Command-line cost calculator. Same engine as the dashboard.
//   npm run calc                         reference workload (500 PB)
//   npm run calc -- --preset startup
//   npm run calc -- --storedTB 20000 --discountPct 25
//   npm run calc -- --csv                export 36-month timeline to CSV
//   npm run calc -- --json               dump raw simulation JSON
import { DEFAULTS, Inputs, PRESETS, withPreset } from './engine/inputs';
import { S1, sensitivity, summarise } from './engine/model';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Pocket Ledger CLI - Dropbox Magic Pocket Cost Model

Usage:
  npm run calc -- [options]

Options:
  --preset <id>       Load preset: ${PRESETS.map((p) => p.id).join(', ')}
  --csv               Output 36-month timeline in CSV format
  --json              Output full summary metrics in JSON format
  --help, -h          Show this help message

Workload Overrides:
  --storedTB <num>       Usable data size in TB (e.g. 500000)
  --growthPct <num>      Monthly growth rate % (e.g. 3)
  --discountPct <num>    Enterprise cloud discount % (e.g. 30)
  --hotPct <num>         Hot data percentage (e.g. 30)
  --egressPct <num>      Monthly egress percentage (e.g. 2)
  --driveTB <num>        Hard drive capacity in TB (e.g. 24)
  --drivePerTB <num>     Drive price $/TB (e.g. 30)
`);
  process.exit(0);
}

const asCsv = args.includes('--csv');
const asJson = args.includes('--json');
const filterArgs = args.filter((a) => a !== '--csv' && a !== '--json');

let inputs: Inputs = { ...DEFAULTS };
for (let k = 0; k < filterArgs.length; k++) {
  const a = filterArgs[k];
  if (a === '--preset') inputs = withPreset(filterArgs[++k]);
  else if (a.startsWith('--')) {
    const key = a.slice(2) as keyof Inputs;
    if (!(key in DEFAULTS)) { console.error(`unknown input: ${key}`); process.exit(1); }
    const raw = filterArgs[++k];
    (inputs as unknown as Record<string, unknown>)[key] =
      typeof DEFAULTS[key] === 'number' ? Number(raw) : typeof DEFAULTS[key] === 'boolean' ? raw === 'true' : raw;
  }
}

const s = summarise(inputs);

if (asJson) {
  console.log(JSON.stringify(s, null, 2));
  process.exit(0);
}

if (asCsv) {
  console.log('Month,Usable_TB,AWS_Monthly,GCP_Monthly,OnPrem_Monthly,AWS_Cumulative,GCP_Cumulative,OnPrem_Cumulative,Hardware_Bought,Installed_Raw_TB');
  for (const r of s.rows) {
    console.log([
      r.month,
      r.tb.toFixed(1),
      r.aws.toFixed(2),
      r.gcp.toFixed(2),
      r.onprem.toFixed(2),
      r.awsCum.toFixed(2),
      r.gcpCum.toFixed(2),
      r.onpremCum.toFixed(2),
      r.hardwareBought.toFixed(2),
      r.installedRawTB.toFixed(1),
    ].join(','));
  }
  process.exit(0);
}

const $ = (n: number) => (Math.abs(n) >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${Math.round(n).toLocaleString('en-US')}`);
const size = (tb: number) => (tb >= 1000 ? `${(tb / 1000).toFixed(tb >= 10_000 ? 0 : 1)} PB` : `${tb.toFixed(0)} TB`);

const s = summarise(inputs);
console.log(`\nWorkload: ${size(inputs.storedTB)} usable, +${inputs.growthPct}%/month, ${inputs.horizonMonths} months, ${inputs.priceYear} prices, ${inputs.discountPct}% cloud discount`);
console.log(`Presets available: ${PRESETS.map((p) => p.id).join(', ')}\n`);

console.log('Monthly cost at month 0');
const pad = (t: string, n = 14) => t.padStart(n);
console.log(['', 'AWS S3', 'Google Cloud', 'Azure Blob', 'On-prem'].map((t, k) => (k ? pad(t) : t.padEnd(14))).join(''));
const line = (label: string, a: number, g: number, az: number, o: number | string) =>
  console.log(label.padEnd(14) + pad($(a)) + pad($(g)) + pad($(az)) + pad(typeof o === 'number' ? $(o) : o));
line('Total', s.cloud.aws.total, s.cloud.gcp.total, s.cloud.azure.total, s.onprem.total);
line('  storage', s.cloud.aws.storage, s.cloud.gcp.storage, s.cloud.azure.storage, '');
line('  egress', s.cloud.aws.egress, s.cloud.gcp.egress, s.cloud.azure.egress, '');

console.log(`\nFleet: ${s.fleet.drives.toLocaleString()} drives, ${s.fleet.servers} servers, ${s.fleet.racks} racks, ${s.fleet.kW.toFixed(0)} kW, ${s.fleet.fte.toFixed(1)} FTE, capex ${$(s.fleet.capex)}`);
console.log(`Sustainability (ESG): ${Math.round(s.fleet.annualKWh).toLocaleString()} kWh/yr, ~${Math.round(s.fleet.annualCo2Tons).toLocaleString()} metric tons CO2e/yr (PUE ${inputs.pue})`);
console.log(`\nBreak-even scale: ${s.breakEvenTB ? size(s.breakEvenTB) : 'not reached below 2 EB'}`);
console.log(`Payback (cumulative): ${s.payback === null ? 'not within horizon' : `month ${s.payback}`}`);
console.log(`${inputs.horizonMonths}-month total: AWS ${$(s.horizon.aws)}, GCP ${$(s.horizon.gcp)}, on-prem ${$(s.horizon.onprem)}, saving ${$(s.horizon.saving)}`);

console.log('\nSensitivity of the saving (largest first)');
for (const r of sensitivity(inputs).slice(0, 5)) console.log(`  ${r.label.padEnd(28)} ${$(r.lowSaving).padStart(10)} → ${$(r.highSaving).padStart(10)}`);

const annualCloud = s.cloud[s.cheapestCloud].total * 12 / 1e6;
const annualOnprem = s.onprem.total * 12 / 1e6;
console.log(`\nS-1 check (annual, $M): model cloud ${annualCloud.toFixed(1)} vs S-1 cloud cut ${S1.cloudCut2016}; model on-prem ${annualOnprem.toFixed(1)} vs S-1 own-DC added ${S1.ownDcAdded2016}; model net ${(annualCloud - annualOnprem).toFixed(1)} vs S-1 net ${S1.net2016}\n`);
