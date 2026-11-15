// Every editable input, with the documented default. See docs/Week3/assumptions.md.

export interface Inputs {
  // workload
  storedTB: number;        // usable data at month 0
  growthPct: number;       // monthly growth, %
  horizonMonths: number;
  hotPct: number;          // share of data in the hot class, %
  warmPct: number;         // share in warm class, % (cold = rest)
  readWrite: number;       // read ops per write op
  avgObjectMB: number;
  egressPct: number;       // data read out per month, % of stored
  readsFromHotPct: number; // share of read-out data that comes from the hot class, %
  // cloud
  discountPct: number;     // enterprise discount on the whole cloud bill, %
  priceYear: '2026' | '2015';
  // on-prem hardware
  redundancy: number;      // raw bytes per usable byte
  fillPct: number;         // target disk fill, %
  driveTB: number;
  drivePerTB: number;      // $ per TB of raw drive
  drivesPerServer: number;
  serverCost: number;      // $ per server without drives
  serversPerRack: number;
  rackCost: number;        // $ per rack incl. top-of-rack switching
  wattsPerTB: number;      // drive power
  serverWatts: number;     // non-drive power per server
  amortYears: number;
  afrPct: number;          // annual drive failure rate, %
  leadMonths: number;      // buy hardware this far ahead of demand
  // facilities, network, people
  coloPerKW: number;       // $ per kW-month
  kWhPrice: number;
  pue: number;
  transitPerMbps: number;  // $ per Mbps-month (95th percentile)
  peakFactor: number;
  baseFTE: number;
  pbPerFTE: number;        // raw PB each extra engineer can run
  salary: number;          // loaded $ per FTE-year
  buildEngineers: number;
  buildYears: number;
  migrationWaived: boolean; // cloud waives egress when you leave
}

export const DEFAULTS: Inputs = {
  storedTB: 500_000,
  growthPct: 3,
  horizonMonths: 36,
  hotPct: 30,
  warmPct: 40,
  readWrite: 10,
  avgObjectMB: 1,
  egressPct: 2,
  readsFromHotPct: 70,
  discountPct: 0,
  priceYear: '2026',
  redundancy: 2.4,
  fillPct: 80,
  driveTB: 24,
  drivePerTB: 30,
  drivesPerServer: 100,
  serverCost: 12_000,
  serversPerRack: 8,
  rackCost: 20_000,
  wattsPerTB: 0.4,
  serverWatts: 300,
  amortYears: 4,
  afrPct: 0.85,
  leadMonths: 3,
  coloPerKW: 200,
  kWhPrice: 0.08,
  pue: 1.3,
  transitPerMbps: 0.3,
  peakFactor: 1.5,
  baseFTE: 4,
  pbPerFTE: 100,
  salary: 200_000,
  buildEngineers: 8,
  buildYears: 2.5,
  migrationWaived: true,
};

export interface Preset { id: string; label: string; note: string; patch: Partial<Inputs> }

export const PRESETS: Preset[] = [
  { id: 'startup', label: 'Startup', note: '50 TB', patch: { storedTB: 50, growthPct: 5 } },
  { id: 'scaleup', label: 'Scale-up', note: '5 PB', patch: { storedTB: 5_000, growthPct: 4 } },
  { id: 'reference', label: 'Reference', note: '500 PB · Week 2', patch: {} },
  {
    id: 'dropbox2015',
    label: 'Dropbox 2015',
    note: '500 PB · 2015 prices',
    patch: { priceYear: '2015', driveTB: 8, drivePerTB: 45, wattsPerTB: 1.0, drivesPerServer: 90 },
  },
  {
    id: 'dropbox2026',
    label: 'Dropbox 7th-Gen',
    note: '500 PB · 32 TB SMR',
    patch: {
      driveTB: 32,
      drivePerTB: 28,
      wattsPerTB: 0.30,
      drivesPerServer: 100,
      serverCost: 14_000,
      rackCost: 25_000,
      redundancy: 2.2,
      priceYear: '2026',
    },
  },
];

export function withPreset(id: string): Inputs {
  const p = PRESETS.find((x) => x.id === id);
  return { ...DEFAULTS, ...(p?.patch ?? {}) };
}
