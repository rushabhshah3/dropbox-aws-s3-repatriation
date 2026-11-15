# Cost model

## 1. The first-principles picture

Cloud storage is **renting**. Cost grows in a straight line with what you store and move, there is
almost nothing to pay before you start, and you never pay for empty space.

Owning storage is **buying**. You pay a large amount up front (hardware, a team to build and run it),
then each extra terabyte is cheap. You also pay for headroom you have not filled yet.

So the two cost curves have different shapes:

```
monthly cost
 │                         cloud  (steep line from zero)
 │                     ／
 │                 ／
 │             ／        ____ on-prem (high start, shallow slope)
 │         ／   ______／
 │_____／_____／
 │  ／
 └──────────────────────────── TB stored
        ↑ break-even scale S*
```

Owning wins once you are past the point where the cloud's higher price per TB has paid for the
fixed cost of owning:

```
S* = fixed monthly cost of owning / (cloud cost per TB − on-prem cost per TB)
```

Everything in the model exists to estimate those three quantities honestly. Three things move S*
the most, and the dashboard makes them the main controls:

1. **Cloud discount.** Dropbox never paid list price. A 30 % discount pushes S* out a lot.
2. **Egress.** Cloud charges for data leaving; owning pays only for bandwidth. Egress-heavy
   workloads repatriate earlier.
3. **The fixed team cost.** Engineers to build and run the system are the biggest fixed cost at
   small scale, and the reason a startup should not do this.

A second, separate question is **time**: with growth, when does the cumulative money spent on
owning drop below the cumulative cloud bill? Owning front-loads cost (hardware bought ahead of
demand, a build team before any savings), so the time break-even is always later than the scale
break-even suggests.

## 2. Cloud model (AWS S3 and Google Cloud Storage)

All monthly, for usable data `S` (TB) at a given month.

**Storage.** Data is split into three temperature classes by share: hot, warm, cold.

| Class | AWS | GCP |
| :--- | :--- | :--- |
| Hot | S3 Standard (tiered by volume) | Standard |
| Warm | S3 Standard-IA | Nearline |
| Cold | S3 Glacier Instant Retrieval | Coldline |

`storage = Σ_class  S × share_class × 1000 × price_class_per_GB`

S3 Standard uses its volume tiers (first 50 TB, next 450 TB, rest).

**Requests.** New data written per month `W = S × growth`. Writes `= W / avg_object_MB`, reads
`= writes × read_write_ratio`. Each is priced per 1,000 operations.

**Retrieval.** Warm and cold classes charge per GB read back. Reads are spread across classes by
the read-share setting (most reads hit recent, hot data; Dropbox reports over 40 % of reads are
for data from the last day and over 90 % from the last year).

**Egress.** `E = S × egress_share` GB leaving per month, priced on the provider's volume tiers.

**Discount.** An enterprise discount `d` applies to the whole bill: `cloud = (sum) × (1 − d)`.

## 3. On-prem model (Magic Pocket style, in colocation)

**Raw capacity needed.**
`raw_TB = S × redundancy_factor / fill_target`

- `redundancy_factor`: copies plus erasure-coding overhead. Magic Pocket keeps each block in two
  zones and erasure codes within a zone (LRC about 1.33×), so about 2.7× for warm data; the cold
  tier cuts this with cross-region XOR. Default 2.4 (blended).
- `fill_target`: you cannot run disks 100 % full; default 0.8.

**Hardware (capital cost).**
- Drives: `ceil(raw_TB / drive_TB)` × drive price
- Servers: `ceil(drives / drives_per_server)` × server price (chassis, CPU, RAM, NICs, without drives)
- Racks: `ceil(servers / servers_per_rack)` × (rack + top-of-rack switching)
- Amortised monthly: `capex / (amortisation_years × 12)`

**Running costs (monthly).**
- Power draw `kW = drives × W_per_drive + servers × W_per_server`
- Colocation: `kW × colo_per_kW_month` (space, cooling, power capacity)
- Energy: `kW × 730 h × PUE × price_per_kWh`
- Drive replacement: `drives × AFR / 12 × drive price`
- Transit bandwidth for egress: average Mbps × peak factor × price per Mbps
- Operations staff: `(base_FTE + raw_PB / PB_per_FTE) × loaded salary / 12`

**One-time costs.**
- Build team: engineers × years × loaded salary (Dropbox: a small team for about 2.5 years).
  Shown separately, and spread over the horizon in the monthly view.
- Migration out of the cloud: egress of the existing data. AWS has waived data-transfer-out fees
  for customers leaving since 2024, so this is a toggle with the waiver on by default.

## 4. Break-even

**By scale.** Compute steady-state monthly cost for each option across a log range of S
(1 TB to 2 EB). S* is the smallest S where on-prem total < cheapest cloud. Reported in TB/PB.

**By time.** Month-by-month simulation over the horizon with growth:
- Cloud: pay the monthly bill for that month's S.
- On-prem: buy hardware in blocks whenever projected `raw_TB` 3 months ahead exceeds installed
  capacity (lead time), pay running costs on installed capacity, pay the build team before month 0.
- Plot cumulative spend; the time break-even is the month the lines cross (if they do).

## 5. Sensitivity

For the reference workload, move each input between a low and high value (one at a time) and record
how much the 3-year saving changes. Sorted into a tornado chart. Inputs tested: cloud discount,
egress share, drive price, redundancy factor, fill target, colocation price, staff count,
cold share.

## 6. Reality check against Dropbox's S-1

The S-1 reports a $92.5M drop in third-party datacenter spend and a $53.0M rise in own-datacenter
cost in 2016 (net $39.5M), then a further $35.1M cut in 2017. The model is run at about 500 PB
with two presets:

- **2026 prices** (today's list prices and hardware)
- **2015-era prices** (smaller, dearer drives; flagged as approximate)

and the dashboard shows the model's annual cloud cost, on-prem cost and saving next to the S-1
figures. Differences are expected and are explained, not hidden: the S-1 lines include more than
storage (compute, networking, facilities), 2016 was a transition year with data held in both
places, and Dropbox negotiated discounts we cannot see. The point of the check is order of
magnitude, not a match.

## 7. What the model deliberately leaves out

Compute for the application tier, the metadata databases, support contracts, taxes, financing
cost of capital, and the value of the cloud's elasticity. These are listed on the dashboard so
nobody mistakes the model for a full TCO.
