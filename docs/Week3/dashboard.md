# Dashboard: what it shows and how to present it

## The one question it answers

> At what size does leaving S3 start to pay, and was Dropbox past that point?

Every panel either helps answer that question or explains why the answer moves. Anything that does
neither is cut.

## Who it is for

The professor and classmates in the viva. They know cloud basics but have not seen our numbers.
They will ask "where does that number come from?" and "what if X were different?". The dashboard
has to answer both without anyone leaving the page: every figure links to its source, and every
assumption is a control.

## Structure

A side rail with the sections, a sticky top bar with today's unit prices, the analysis in the
middle and the scenario panel on the right. Changing any input updates every section live, and
the scenario is saved in the URL.

| # | Section | The point it makes |
| :- | :--- | :--- |
| 1 | **Overview** | Verdict for the current inputs, plus four numbers: break-even size, 36-month saving, payback month, monthly cost today |
| 2 | **Rent vs buy** | Monthly cost against data stored (log-log) for AWS, Google Cloud and on-prem; the crossing is marked, and the formula S* = net fixed ÷ (cloud $/TB − own $/TB) is worked through underneath |
| 3 | **Over the horizon** | Cumulative cash month by month with growth; on-prem starts with the build team and buys hardware ahead of need; the payback month is marked |
| 4 | **Where the money goes** | Each option's monthly bill split into its parts on one shared scale |
| 5 | **What moves the answer** | Tornado chart: ten inputs, each moved alone from low to high |
| 6 | **Calculator check** | The reference workload in the official AWS and Google Cloud calculators next to the model; within 0.2 % |
| 7 | **S-1 check** | The model at 500 PB, storage only, at 2015 and 2026 prices, next to Dropbox's S-1 figures |
| 8 | **Assumptions** | Every input with its value, confidence (H/M/L) and source |

Presets: Startup (50 TB), Scale-up (5 PB), Reference (500 PB, the Week 2 workload), Dropbox 2015
(2015 prices and hardware) and Addendum (the Week 3 PDF's assumptions). Input groups: workload,
compute, cloud, on-prem hardware, facilities and people. "Reset to sources" restores the documented
defaults. Light and dark themes.

## How to present it (viva script, about 6 minutes)

1. **Startup preset.** "At 50 TB the cloud costs a few thousand dollars a month. Owning would cost
   about $180k, almost all of it people. Stay in the cloud."
2. **Drag Data stored upwards** and watch the on-prem line meet the cloud lines at about 17 PB.
   Point at the formula strip: net fixed cost of owning divided by the per-TB price gap.
3. **Reference preset (500 PB).** "We are 29× past break-even. Owning costs $1.84M a month against
   $6.18M on Google Cloud, the cheaper cloud." Scroll to the timeline: payback at month 13,
   $181M saved over three years.
4. **Where the money goes.** Cloud bills are about 90 % storage; on-prem is mostly hardware, then
   staff.
5. **Turn the cloud discount up to 40 %.** The saving falls to about $25M. "Negotiation matters as
   much as engineering; Dropbox never paid list price."
6. **Tornado.** Hot-data share and discount matter most; colocation price and compute barely move it.
7. **Calculator check.** Both official calculators agree with the model within 0.2 %. Mention the
   GiB finding.
8. **S-1 check.** At 2015 prices the model's S3 bill is about $100M a year; Dropbox reported a
   $92.5M cut. Same order of magnitude.
9. If asked about the addendum: click **Addendum**, the dashboard reproduces its $55M on-prem total.

## Technical shape

- Vite + TypeScript, no framework; charts drawn with D3 into SVG
- The cost engine is a separate pure module (`src/engine/`) shared with the CLI
- `npm run check` tests the engine against hand calculations and both calculators
- Static build (`npm run build`), deployable anywhere
- Works on a laptop projector (1280 px) and on a phone (375 px)

## Design

Modern, restrained dashboard: warm paper background, Geist and Geist Mono, one coral accent kept for
on-prem and the break-even point, neutral greys for the two clouds. Icons from UI Essentials Pro
(licensed). No gradients or decoration; the data is the imagery.
