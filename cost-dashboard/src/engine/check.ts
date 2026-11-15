// Hand-calculation checks for the engine. Run: npm run check
import { DEFAULTS } from './inputs';
import { cloudBill, fleetFor, prices } from './model';
import { tiered, PRICES_2026 } from './prices';

let failed = 0;
const near = (name: string, got: number, want: number, tol = 0.005) => {
  const ok = Math.abs(got - want) <= Math.abs(want) * tol + 1e-9;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: got ${got.toFixed(2)}, want ${want.toFixed(2)}`);
};

// S3 Standard tiers: 600 TB hot = 50 TB*23 + 450 TB*22 + 100 TB*21 per TB-month
near('S3 hot tiering 600 TB', tiered(600_000, PRICES_2026.aws.hotTiers), 50_000 * 0.023 + 450_000 * 0.022 + 100_000 * 0.021);

// 100 TB, all hot, no egress, no growth: just tiered storage
const i0 = { ...DEFAULTS, hotPct: 100, warmPct: 0, egressPct: 0, growthPct: 0 };
near('AWS 100 TB all-hot bill', cloudBill(100, i0, prices(i0).aws).total, 50_000 * 0.023 + 50_000 * 0.022);
near('GCP 100 TB all-hot bill', cloudBill(100, i0, prices(i0).gcp).total, 100_000 * 0.02);

// 30% discount scales the whole bill
near('Discount 30%', cloudBill(100, { ...i0, discountPct: 30 }, prices(i0).aws).total, (50_000 * 0.023 + 50_000 * 0.022) * 0.7);

// Fleet: 1,000 TB usable × 2.4 / 0.8 = 3,000 TB raw → 125 drives → 2 servers → 1 rack
const f = fleetFor(1000, DEFAULTS);
near('raw TB', f.rawTB, 3000);
near('drives', f.drives, 125);
near('servers', f.servers, 2);
near('capex', f.capex, 125 * 24 * 30 + 2 * 12_000 + 20_000);

// --- Additional Edge-Case & Boundary Checks ---

// 1. Zero growth workload: writes and read requests from writes should be zero
const iZero = { ...DEFAULTS, growthPct: 0, hotPct: 100, warmPct: 0, egressPct: 0 };
const bZero = cloudBill(500, iZero, prices(iZero).aws);
near('Zero growth write requests cost', bZero.requests, 0);

// 2. 100% cold archival tier with retrieval
const iCold = { ...DEFAULTS, hotPct: 0, warmPct: 0, egressPct: 2, growthPct: 0, readsFromHotPct: 0 };
const bColdAWS = cloudBill(100, iCold, prices(iCold).aws);
// Storage: 100,000 GB * 0.004 = $400; Egress: tiered(2,000 GB) = 2,000 * 0.09 = $180; Retrieval: 2,000 GB * 0.03 = $60
const expectedColdAWS = (100_000 * 0.004) + (2_000 * 0.09) + (2_000 * 0.03);
near('100% cold archival AWS bill', bColdAWS.total, expectedColdAWS);

// 3. Minimum hardware boundary for tiny capacity (1 TB)
const fTiny = fleetFor(1, DEFAULTS);
near('Tiny fleet minimum drives', fTiny.drives, 1);
near('Tiny fleet minimum servers', fTiny.servers, 1);
near('Tiny fleet minimum racks', fTiny.racks, 1);

// 4. Maximum cloud discount boundary (50% discount)
const bDiscount = cloudBill(500, { ...DEFAULTS, discountPct: 50 }, prices(DEFAULTS).aws);
near('50% enterprise discount gross-to-net', bDiscount.discount, bDiscount.total);

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
