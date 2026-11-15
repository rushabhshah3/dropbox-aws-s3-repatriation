// Command-line cost calculator. Same engine as the dashboard.
//   npm run calc                         reference workload (500 PB)
//   npm run calc -- --preset startup
//   npm run calc -- --storedTB 20000 --discountPct 25
import { DEFAULTS, Inputs, PRESETS, withPreset } from './engine/inputs';
import { S1, sensitivity, summarise } from './engine/model';

const args = process.argv.slice(2);
let inputs: Inputs = { ...DEFAULTS };
for (let k = 0; k < args.length; k++) {
  const a = args[k];
  if (a === '--preset') inputs = withPreset(args[++k]);
  else if (a.startsWith('--')) {
    const key = a.slice(2) as keyof Inputs;
    if (!(key in DEFAULTS)) { console.error(`unknown input: ${key}`); process.exit(1); }
    const raw = args[++k];
    (inputs as unknown as Record<string, unknown>)[key] =
      typeof DEFAULTS[key] === 'number' ? Number(raw) : typeof DEFAULTS[key] === 'boolean' ? raw === 'true' : raw;
  }
}

const $ = (n: number) => (Math.abs(n) >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${Math.round(n).toLocaleString('en-US')}`);
const size = (tb: number) => (tb >= 1000 ? `${(tb / 1000).toFixed(tb >= 10_000 ? 0 : 1)} PB` : `${tb.toFixed(0)} TB`);

const s = summarise(inputs);
console.log(`\nWorkload: ${size(inputs.storedTB)} usable, +${inputs.growthPct}%/month, ${inputs.horizonMonths} months, ${inputs.priceYear} prices, ${inputs.discountPct}% cloud discount`);
console.log(`Presets available: ${PRESETS.map((p) => p.id).join(', ')}\n`);

console.log('Monthly cost at month 0');
const pad = (t: string, n = 14) => t.padStart(n);
console.log(['', 'AWS', 'Google Cloud', 'On-prem'].map((t, k) => (k ? pad(t) : t.padEnd(14))).join(''));
const line = (label: string, a: number, g: number, o: number | string) =>
  console.log(label.padEnd(14) + pad($(a)) + pad($(g)) + pad(typeof o === 'number' ? $(o) : o));
line('Total', s.cloud.aws.total, s.cloud.gcp.total, s.onprem.total);
line('  storage', s.cloud.aws.storage, s.cloud.gcp.storage, '');
line('  egress', s.cloud.aws.egress, s.cloud.gcp.egress, '');
line('  compute', s.cloud.aws.compute, s.cloud.gcp.compute, s.onprem.compute);

console.log(`\nFleet: ${s.fleet.drives.toLocaleString()} drives, ${s.fleet.servers} storage servers, ${s.fleet.computeServers} compute servers, ${s.fleet.racks} racks, ${s.fleet.kW.toFixed(0)} kW, ${s.fleet.fte.toFixed(1)} FTE, capex ${$(s.fleet.capex)}`);
console.log(`\nBreak-even scale: ${s.breakEvenTB ? size(s.breakEvenTB) : 'not reached below 2 EB'}`);
console.log(`Payback (cumulative): ${s.payback === null ? 'not within horizon' : `month ${s.payback}`}`);
console.log(`${inputs.horizonMonths}-month total: AWS ${$(s.horizon.aws)}, GCP ${$(s.horizon.gcp)}, on-prem ${$(s.horizon.onprem)}, saving ${$(s.horizon.saving)}`);

console.log('\nSensitivity of the saving (largest first)');
for (const r of sensitivity(inputs).slice(0, 5)) console.log(`  ${r.label.padEnd(28)} ${$(r.lowSaving).padStart(10)} → ${$(r.highSaving).padStart(10)}`);

const annualCloud = s.cloud[s.cheapestCloud].total * 12 / 1e6;
const annualOnprem = s.onprem.total * 12 / 1e6;
console.log(`\nS-1 check (annual, $M): model cloud ${annualCloud.toFixed(1)} vs S-1 cloud cut ${S1.cloudCut2016}; model on-prem ${annualOnprem.toFixed(1)} vs S-1 own-DC added ${S1.ownDcAdded2016}; model net ${(annualCloud - annualOnprem).toFixed(1)} vs S-1 net ${S1.net2016}\n`);
