// Unit prices. Sources and confidence: docs/Week3/assumptions.md.
// The 2015 set is approximate and only feeds the S-1 reality check.

export interface Tier { upToGB: number; price: number } // price per GB; last tier upToGB = Infinity

export interface CloudPrices {
  name: string;
  hotTiers: Tier[];       // hot class, volume-tiered
  warm: number;           // $/GB-month
  cold: number;           // $/GB-month
  writePer1k: number;     // $/1,000 write ops
  readPer1k: number;      // $/1,000 read ops
  warmRetrieval: number;  // $/GB read back
  coldRetrieval: number;  // $/GB read back
  egressTiers: Tier[];    // $/GB leaving to the internet, monthly volume tiers
}

const TB = 1000; // GB per TB (decimal, as providers bill)

export interface PriceSet { year: '2026' | '2015'; aws: CloudPrices; gcp: CloudPrices; azure: CloudPrices }

export const PRICES_2026: PriceSet = {
  year: '2026',
  aws: {
    name: 'AWS S3',
    hotTiers: [
      { upToGB: 50 * TB, price: 0.023 },
      { upToGB: 500 * TB, price: 0.022 },
      { upToGB: Infinity, price: 0.021 },
    ],
    warm: 0.0125,
    cold: 0.004,
    writePer1k: 0.005,
    readPer1k: 0.0004,
    warmRetrieval: 0.01,
    coldRetrieval: 0.03,
    egressTiers: [
      { upToGB: 10 * TB, price: 0.09 },
      { upToGB: 50 * TB, price: 0.085 },
      { upToGB: 150 * TB, price: 0.07 },
      { upToGB: Infinity, price: 0.05 },
    ],
  },
  gcp: {
    name: 'Google Cloud',
    hotTiers: [{ upToGB: Infinity, price: 0.02 }],
    warm: 0.01,
    cold: 0.004,
    writePer1k: 0.005,
    readPer1k: 0.0004,
    warmRetrieval: 0.01,
    coldRetrieval: 0.02,
    egressTiers: [
      { upToGB: 1 * TB, price: 0.12 },
      { upToGB: 10 * TB, price: 0.11 },
      { upToGB: Infinity, price: 0.08 },
    ],
  },
  azure: {
    name: 'Azure Blob',
    hotTiers: [
      { upToGB: 50 * TB, price: 0.018 },
      { upToGB: 500 * TB, price: 0.0173 },
      { upToGB: Infinity, price: 0.0166 },
    ],
    warm: 0.010,
    cold: 0.002,
    writePer1k: 0.005,
    readPer1k: 0.0004,
    warmRetrieval: 0.01,
    coldRetrieval: 0.02,
    egressTiers: [
      { upToGB: 10 * TB, price: 0.087 },
      { upToGB: 50 * TB, price: 0.083 },
      { upToGB: 150 * TB, price: 0.07 },
      { upToGB: Infinity, price: 0.05 },
    ],
  },
};

// Archived 2015 list prices (S3 Standard tiered $0.030 down to $0.0275/GB at scale;
// Standard-IA launched September 2015 at $0.0125; Glacier at $0.007).
// Sourced from AWS Pricing Archive (Wayback Machine, October 2015).
export const PRICES_2015: PriceSet = {
  year: '2015',
  aws: {
    ...PRICES_2026.aws,
    hotTiers: [
      { upToGB: 1 * TB, price: 0.03 },
      { upToGB: 50 * TB, price: 0.0295 },
      { upToGB: 500 * TB, price: 0.029 },
      { upToGB: Infinity, price: 0.0275 },
    ],
    warm: 0.0125,
    cold: 0.007,
    egressTiers: [
      { upToGB: 10 * TB, price: 0.12 },
      { upToGB: 50 * TB, price: 0.09 },
      { upToGB: 150 * TB, price: 0.07 },
      { upToGB: Infinity, price: 0.05 },
    ],
  },
  gcp: {
    ...PRICES_2026.gcp,
    hotTiers: [{ upToGB: Infinity, price: 0.026 }],
    warm: 0.01,
    cold: 0.007,
    egressTiers: [
      { upToGB: 1 * TB, price: 0.12 },
      { upToGB: 10 * TB, price: 0.11 },
      { upToGB: Infinity, price: 0.08 },
    ],
  },
  azure: {
    ...PRICES_2026.azure,
    hotTiers: [{ upToGB: Infinity, price: 0.024 }],
    warm: 0.012,
    cold: 0.005,
  },
};

/** Cost of `gb` under a volume-tiered price list. */
export function tiered(gb: number, tiers: Tier[]): number {
  let cost = 0;
  let prev = 0;
  for (const t of tiers) {
    if (gb <= prev) break;
    const inTier = Math.min(gb, t.upToGB) - prev;
    cost += inTier * t.price;
    prev = t.upToGB;
  }
  return cost;
}
