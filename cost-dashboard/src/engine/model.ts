// The cost model. Formulas are documented in docs/week3/model.md.
import { Inputs } from './inputs';
import { CloudPrices, PRICES_2015, PRICES_2026, tiered } from './prices';

const GB_PER_TB = 1000;
const HOURS_PER_MONTH = 730;

export type CloudKey = 'aws' | 'gcp';

export interface CloudBill {
  storage: number; requests: number; retrieval: number; egress: number;
  discount: number; total: number;
}

export interface OnPremBill {
  drives: number; servers: number; racks: number;   // amortised hardware
  colocation: number; energy: number; replacement: number;
  bandwidth: number; staff: number; build: number;
  total: number;
}

export interface Fleet { rawTB: number; drives: number; servers: number; racks: number; kW: number; fte: number; capex: number }

export const prices = (i: Inputs) => (i.priceYear === '2015' ? PRICES_2015 : PRICES_2026);

/** Monthly cloud bill for `tb` of usable data. */
export function cloudBill(tb: number, i: Inputs, p: CloudPrices): CloudBill {
  const gb = tb * GB_PER_TB;
  const hot = i.hotPct / 100;
  const warm = i.warmPct / 100;
  const cold = Math.max(0, 1 - hot - warm);

  const storage = tiered(gb * hot, p.hotTiers) + gb * warm * p.warm + gb * cold * p.cold;

  const writtenGB = gb * (i.growthPct / 100);
  const writes = (writtenGB * 1000) / i.avgObjectMB;
  const reads = writes * i.readWrite;
  const requests = (writes / 1000) * p.writePer1k + (reads / 1000) * p.readPer1k;

  const readOutGB = gb * (i.egressPct / 100);
  const fromCold = readOutGB * (1 - i.readsFromHotPct / 100);
  const warmShareOfNonHot = warm + cold > 0 ? warm / (warm + cold) : 0;
  const retrieval = fromCold * warmShareOfNonHot * p.warmRetrieval + fromCold * (1 - warmShareOfNonHot) * p.coldRetrieval;

  const egress = tiered(readOutGB, p.egressTiers);

  const gross = storage + requests + retrieval + egress;
  const discount = gross * (i.discountPct / 100);
  return { storage, requests, retrieval, egress, discount, total: gross - discount };
}

/** Hardware needed to hold `tb` of usable data. */
export function fleetFor(tb: number, i: Inputs): Fleet {
  const rawTB = (tb * i.redundancy) / (i.fillPct / 100);
  const drives = Math.max(1, Math.ceil(rawTB / i.driveTB));
  const servers = Math.max(1, Math.ceil(drives / i.drivesPerServer));
  const racks = Math.max(1, Math.ceil(servers / i.serversPerRack));
  const kW = (drives * i.driveTB * i.wattsPerTB + servers * i.serverWatts) / 1000;
  const fte = i.baseFTE + rawTB / 1000 / i.pbPerFTE;
  const capex = drives * i.driveTB * i.drivePerTB + servers * i.serverCost + racks * i.rackCost;
  return { rawTB, drives, servers, racks, kW, fte, capex };
}

/** Monthly cost of running a given fleet (excludes hardware and build). */
export function runningCost(f: Fleet, tbServed: number, i: Inputs) {
  const colocation = f.kW * i.coloPerKW;
  const energy = f.kW * HOURS_PER_MONTH * i.pue * i.kWhPrice;
  const replacement = ((f.drives * i.afrPct) / 100 / 12) * i.driveTB * i.drivePerTB;
  const egressGB = tbServed * GB_PER_TB * (i.egressPct / 100);
  const avgMbps = (egressGB * 8000) / (30 * 86_400);
  const bandwidth = avgMbps * i.peakFactor * i.transitPerMbps;
  const staff = (f.fte * i.salary) / 12;
  return { colocation, energy, replacement, bandwidth, staff };
}

export const buildCost = (i: Inputs) => i.buildEngineers * i.buildYears * i.salary;

/** Steady-state monthly on-prem cost (hardware amortised, build spread over the horizon). */
export function onPremBill(tb: number, i: Inputs): OnPremBill {
  const f = fleetFor(tb, i);
  const months = i.amortYears * 12;
  const drives = (f.drives * i.driveTB * i.drivePerTB) / months;
  const servers = (f.servers * i.serverCost) / months;
  const racks = (f.racks * i.rackCost) / months;
  const run = runningCost(f, tb, i);
  const build = buildCost(i) / i.horizonMonths;
  const total = drives + servers + racks + run.colocation + run.energy + run.replacement + run.bandwidth + run.staff + build;
  return { drives, servers, racks, ...run, build, total };
}

export interface ScalePoint { tb: number; aws: number; gcp: number; onprem: number }

/** Monthly cost of each option across a log range of scales. */
export function scaleCurve(i: Inputs, fromTB = 1, toTB = 2_000_000, steps = 120): ScalePoint[] {
  const ps = prices(i);
  const out: ScalePoint[] = [];
  const a = Math.log10(fromTB), b = Math.log10(toTB);
  for (let k = 0; k <= steps; k++) {
    const tb = 10 ** (a + ((b - a) * k) / steps);
    out.push({ tb, aws: cloudBill(tb, i, ps.aws).total, gcp: cloudBill(tb, i, ps.gcp).total, onprem: onPremBill(tb, i).total });
  }
  return out;
}

/** Smallest usable TB at which on-prem is cheaper than the cheaper cloud. null if never within range. */
export function breakEvenTB(i: Inputs, toTB = 2_000_000): number | null {
  const ps = prices(i);
  const gap = (tb: number) => onPremBill(tb, i).total - Math.min(cloudBill(tb, i, ps.aws).total, cloudBill(tb, i, ps.gcp).total);
  // find first sign change on a log grid, then bisect
  let lo = 1, prevGap = gap(lo);
  if (prevGap < 0) return lo;
  for (let k = 1; k <= 400; k++) {
    const hi = 10 ** ((Math.log10(toTB) * k) / 400);
    const g = gap(hi);
    if (g < 0) {
      let a = lo, b = hi;
      for (let n = 0; n < 50; n++) {
        const m = Math.sqrt(a * b);
        if (gap(m) < 0) b = m; else a = m;
      }
      return b;
    }
    lo = hi; prevGap = g;
  }
  return null;
}

export interface MonthRow {
  month: number; tb: number;
  aws: number; gcp: number; onprem: number;            // spend in that month (cash)
  awsCum: number; gcpCum: number; onpremCum: number;
  hardwareBought: number;                               // capex spent this month
  installedRawTB: number;
}

/** Month-by-month cash simulation with growth and hardware bought ahead of demand. */
export function timeline(i: Inputs): MonthRow[] {
  const ps = prices(i);
  const g = i.growthPct / 100;
  const rows: MonthRow[] = [];
  let awsCum = 0, gcpCum = 0, onpremCum = 0;
  let installed: ReturnType<typeof fleetFor> | null = null;

  // one-time costs before month 0
  const migration = i.migrationWaived ? 0 : tiered(i.storedTB * GB_PER_TB, ps.aws.egressTiers);
  onpremCum += buildCost(i) + migration;

  for (let m = 0; m < i.horizonMonths; m++) {
    const tb = i.storedTB * (1 + g) ** m;
    const target = i.storedTB * (1 + g) ** (m + i.leadMonths);
    const need = fleetFor(target, i);
    let bought = 0;
    if (!installed || need.rawTB > installed.rawTB) {
      // buy in whole racks
      bought = need.capex - (installed?.capex ?? 0);
      installed = need;
    }
    const run = runningCost(installed, tb, i);
    const onprem = bought + run.colocation + run.energy + run.replacement + run.bandwidth + run.staff;
    const aws = cloudBill(tb, i, ps.aws).total;
    const gcp = cloudBill(tb, i, ps.gcp).total;
    awsCum += aws; gcpCum += gcp; onpremCum += onprem;
    rows.push({ month: m, tb, aws, gcp, onprem, awsCum, gcpCum, onpremCum, hardwareBought: bought, installedRawTB: installed.rawTB });
  }
  return rows;
}

/** First month at which cumulative on-prem spend is below the cheaper cloud's. null if not within horizon. */
export function paybackMonth(rows: MonthRow[]): number | null {
  for (const r of rows) if (r.onpremCum < Math.min(r.awsCum, r.gcpCum)) return r.month;
  return null;
}

export interface Summary {
  breakEvenTB: number | null;
  payback: number | null;
  cloud: Record<CloudKey, CloudBill>;
  onprem: OnPremBill;
  fleet: Fleet;
  cheapestCloud: CloudKey;
  horizon: { aws: number; gcp: number; onprem: number; saving: number };
  rows: MonthRow[];
}

export function summarise(i: Inputs): Summary {
  const ps = prices(i);
  const cloud = { aws: cloudBill(i.storedTB, i, ps.aws), gcp: cloudBill(i.storedTB, i, ps.gcp) };
  const cheapestCloud: CloudKey = cloud.aws.total <= cloud.gcp.total ? 'aws' : 'gcp';
  const rows = timeline(i);
  const last = rows[rows.length - 1];
  const bestCloudCum = Math.min(last.awsCum, last.gcpCum);
  return {
    breakEvenTB: breakEvenTB(i),
    payback: paybackMonth(rows),
    cloud,
    onprem: onPremBill(i.storedTB, i),
    fleet: fleetFor(i.storedTB, i),
    cheapestCloud,
    horizon: { aws: last.awsCum, gcp: last.gcpCum, onprem: last.onpremCum, saving: bestCloudCum - last.onpremCum },
    rows,
  };
}

export interface SensitivityRow { key: keyof Inputs; label: string; low: number; high: number; lowSaving: number; highSaving: number; spread: number }

const SENS: { key: keyof Inputs; label: string; low: number; high: number }[] = [
  { key: 'discountPct', label: 'Cloud discount', low: 0, high: 40 },
  { key: 'egressPct', label: 'Egress, % of data / month', low: 0.5, high: 6 },
  { key: 'drivePerTB', label: 'Drive price, $/TB', low: 20, high: 45 },
  { key: 'redundancy', label: 'Redundancy factor', low: 1.6, high: 3.2 },
  { key: 'fillPct', label: 'Disk fill target, %', low: 60, high: 90 },
  { key: 'coloPerKW', label: 'Colocation, $/kW-month', low: 150, high: 300 },
  { key: 'pbPerFTE', label: 'Raw PB per engineer', low: 40, high: 250 },
  { key: 'hotPct', label: 'Hot data share, %', low: 10, high: 60 },
  { key: 'growthPct', label: 'Monthly growth, %', low: 1, high: 5 },
];

/** One-at-a-time sensitivity of the horizon saving. Sorted by spread, largest first. */
export function sensitivity(i: Inputs): SensitivityRow[] {
  return SENS.map((s) => {
    const lowSaving = summarise({ ...i, [s.key]: s.low }).horizon.saving;
    const highSaving = summarise({ ...i, [s.key]: s.high }).horizon.saving;
    return { ...s, lowSaving, highSaving, spread: Math.abs(highSaving - lowSaving) };
  }).sort((a, b) => b.spread - a.spread);
}

// Dropbox S-1 (Feb 2018), $ millions
export const S1 = { cloudCut2016: 92.5, ownDcAdded2016: 53.0, net2016: 39.5, net2017: 35.1 };
