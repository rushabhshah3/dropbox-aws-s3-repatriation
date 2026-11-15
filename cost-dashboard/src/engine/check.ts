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

console.log(failed ? `\n${failed} check(s) failed` : '\nall checks passed');
process.exit(failed ? 1 : 0);
