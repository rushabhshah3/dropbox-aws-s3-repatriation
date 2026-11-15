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
  egressTiers: Tier[];    // $/unit leaving to the internet, monthly volume tiers
  unitGB: number;         // GB per billing unit: 1 for AWS (GB), 1.073741824 for Google (GiB)
  computeHr: number;      // $/hour, one 32-vCPU compute instance, on-demand Linux
  computeType: string;
}

const TB = 1000; // GB per TB (decimal, as AWS bills)
const TiB = 1024; // GiB per TiB (binary, as Google bills)

export interface PriceSet { year: '2026' | '2015'; aws: CloudPrices; gcp: CloudPrices }

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
    unitGB: 1,
    computeHr: 1.428,          // c7i.8xlarge, us-east-1, AWS Pricing Calculator Nov 2026
    computeType: 'c7i.8xlarge',
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
    // tier bounds and prices are per GiB, as the Google Cloud calculator bills them
    egressTiers: [
      { upToGB: 1 * TiB, price: 0.12 },
      { upToGB: 10 * TiB, price: 0.11 },
      { upToGB: Infinity, price: 0.08 },
    ],
    unitGB: 1.073741824,
    computeHr: 1.1994,         // c2d-highcpu-32, us-central1, Google Cloud calculator Nov 2026
    computeType: 'c2d-highcpu-32',
  },
};

// Approximate 2015 list prices (S3 Standard ~ $0.0275/GB at scale, Standard-IA launched
// Sep 2015 at $0.0125, Glacier $0.007). Flagged L confidence in assumptions.md.
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
    cold: 0.007,
    computeHr: 1.591,          // c4.8xlarge (36 vCPU), 2015 on-demand
    computeType: 'c4.8xlarge',
  },
  gcp: { ...PRICES_2026.gcp, hotTiers: [{ upToGB: Infinity, price: 0.026 }], warm: 0.01, cold: 0.007, computeHr: 1.216, computeType: 'n1-highcpu-32' },
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
