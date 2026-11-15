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

## Structure: an argument you scroll through, with the controls always in reach

The page reads like a short analysis piece (think a financial-press explainer or an annual-report
section), not a grid of widgets. A sticky control rail on the left holds the workload and price
inputs; the right side is a sequence of sections that each make one point. Changing any input
updates every section live.

Sections, in order:

1. **The question.** One sentence and the headline answer for the current inputs:
   "Owning becomes cheaper above **x PB**. At 500 PB it saves **$y M a year**." Numbers are live.
2. **Rent vs buy.** The break-even chart: monthly cost against data stored (log scale), three lines
   (AWS, GCP, on-prem), the crossing point marked and labelled. This is the main chart.
3. **Over three years.** Cumulative spend over time with 3 % monthly growth. On-prem shows its
   staircase of hardware purchases and the build cost before month 0. Marks the month the lines cross.
4. **Where the money goes.** Stacked breakdown for each option at the current scale: storage,
   requests, retrieval, egress for the clouds; drives, servers, racks, colocation, energy,
   bandwidth, staff, build team for on-prem.
5. **What moves the answer.** Tornado chart of the sensitivity analysis: which assumption shifts the
   3-year saving most. Expected leaders: cloud discount, egress, drive price.
6. **Did Dropbox's numbers make sense?** The model at about 500 PB next to the S-1 figures ($92.5M
   less cloud spend, $53.0M more own-datacenter cost, $39.5M net). 2026 prices vs 2015-era prices.
   A short paragraph on why they differ.
7. **Assumptions.** The full table from [assumptions.md](assumptions.md), with confidence marks and
   source links, plus what the model leaves out.

The control rail has presets at the top (Startup 50 TB, Scale-up 5 PB, Week 2 reference 500 PB,
Dropbox 2015) and grouped inputs below: workload, cloud, on-prem hardware, facilities and people.
A "reset to sources" button restores the documented defaults. The current inputs are encoded in the
URL, so a specific scenario can be shared or bookmarked for the viva.

## How to present it (viva script, about 5 minutes)

1. Open on the Startup preset. "At 50 TB, cloud is far cheaper. The fixed cost of a team dominates."
2. Drag stored data up and watch the break-even point appear. Say where it is and why (the formula
   from [model.md](model.md) §1).
3. Switch to the Week 2 reference. Show the 3-year chart and the size of the gap.
4. Turn the cloud discount up to 30 %. The break-even moves out. "This is why the decision is about
   negotiation as much as engineering."
5. Show the tornado chart: which inputs matter, which do not.
6. End on the S-1 reality check: our model and Dropbox's own figures agree in order of magnitude,
   and here is why they are not equal.

## Technical shape

- Vite + TypeScript, no framework needed; charts drawn with D3 into SVG so they can be styled
  properly and exported as images for the report
- The cost engine is a separate pure module (`src/engine/`) shared with the CLI script
- Static build, deployable to GitHub Pages so there is a live link
- Works on a laptop projector (1280 px) and on a phone

## Design direction (to confirm)

Tone: **editorial, technical**. It should feel like a careful financial analysis, close in spirit to
the S-1 filing it checks, not like a SaaS admin panel. Light paper background, a serif for headings
and big numbers, a monospaced face for figures in tables, one restrained accent colour reserved for
the break-even point. No gradients, no glass cards, no icon grids.
