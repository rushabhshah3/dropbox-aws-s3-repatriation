# Week 3: Cost and repatriation exercise

Theme 3 of the implementation guide (Dropbox, Basecamp, Meesho). The grade depends on the cost
model and how well it is measured and explained, not on application features.

## What the guide asks for, and where we answer it

| Guide deliverable | Our answer | Where |
| :--- | :--- | :--- |
| Programmatic cost-calculator script or interactive dashboard | One TypeScript cost engine, used by both a CLI script and a web dashboard | `cost-dashboard/src/engine/`, `npm run calc`, `npm run dev` |
| Architectural cost model comparing two cloud providers | AWS S3 vs Google Cloud Storage, priced line by line (storage tiers, requests, retrieval, egress, discounts) | [model.md](model.md), dashboard "Breakdown" |
| Break-even analysis against an on-premises estimate | Break-even by scale (TB at which owning wins) and by time (month the cumulative cost lines cross) | [model.md](model.md) §4, dashboard "Break-even" |
| Official pricing calculators used (step 2) | Published AWS and GCP rate cards (the same inputs the calculators take), priced line by line in the addendum and the spreadsheet. Calculator screenshots still to add | [Addendum](IT457_Week3_Addendum_Dropbox_MagicPocket.pdf), [TCO_model.xlsx](TCO_model.xlsx) |
| On-prem hardware priced (step 3) | Drives, servers, racks, colocation, power, transit, staff, build team, each with a source | [assumptions.md](assumptions.md) |

It also covers the Week 2 report's promises: 3-year TCO, sensitivity on utilisation, drive prices and
egress, and reconciling the model with the S-1 savings.

## Reference workload (from the Week 2 report, Table 4)

- 500 PB stored at month 0, growing 3 % per month
- Read:write ratio about 10:1, blocks up to 4 MB
- Durability across regions (2 copies across zones, erasure coded inside a zone)
- 3-year horizon, hardware amortised over 4 years
- 4 FTE storage operations at the start

Smaller presets (50 TB startup, 5 PB scale-up) are included so the break-even crossing is visible.
At 500 PB on its own, owning wins by a wide margin, so the interesting part is *where* it starts to win.

## Files in this folder

- [model.md](model.md): the cost model from first principles, every formula
- [assumptions.md](assumptions.md): every price and constant, with source, date and confidence
- [dashboard.md](dashboard.md): what the dashboard shows, in what order, and how to present it in the viva
- [IT457_Week3_Addendum_Dropbox_MagicPocket.pdf](IT457_Week3_Addendum_Dropbox_MagicPocket.pdf): the results addendum for the report
- [TCO_model.xlsx](TCO_model.xlsx): line-item spreadsheet behind the addendum
- [week3_charts.png](week3_charts.png): charts used in the addendum
- [img/](img/): dashboard screenshots
- The dashboard itself: [../../cost-dashboard/](../../cost-dashboard/)

The addendum assumes no egress; the dashboard defaults to 2% of data read out per month. Set
*Read out per month* to 0% in the dashboard to compare the two directly.

## Build order

1. Engine (pure functions, no UI) plus unit checks against hand calculations
2. CLI: `npm run calc -- --preset reference` prints the cost table and break-even
3. Dashboard on top of the same engine
4. Run the official calculators for the reference workload, compare with the engine, note gaps
5. Results addendum for the report: charts exported from the dashboard plus interpretation
