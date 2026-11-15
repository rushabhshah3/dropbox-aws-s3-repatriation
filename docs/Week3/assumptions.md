# Assumptions and sources

Every number the model uses. Confidence: **H** = from the provider or a primary source,
**M** = from a reputable secondary source, **L** = our estimate, to be checked or argued in the viva.
Prices checked November 2026. All of these are editable in the dashboard.

## Cloud: AWS (us-east-1)

All confirmed in the AWS Pricing Calculator, 15 November 2026 ([calculators/](calculators/README.md)).

| Item | Value | Conf. | Source |
| :--- | :--- | :-: | :--- |
| S3 Standard, first 50 TB / next 450 TB / over 500 TB | $0.023 / $0.022 / $0.021 per GB-month | H | AWS Pricing Calculator |
| S3 Standard-IA | $0.0125 | H | AWS Pricing Calculator |
| S3 Glacier Instant Retrieval | $0.004 | H | AWS Pricing Calculator |
| PUT / COPY / POST | $0.005 per 1,000 | H | AWS Pricing Calculator |
| GET | $0.0004 per 1,000 | H | AWS Pricing Calculator |
| Retrieval, Standard-IA / Glacier IR | $0.01 / $0.03 per GB | H | AWS Pricing Calculator |
| Transfer out, first 10 TB / next 40 TB / next 100 TB / over 150 TB | $0.09 / $0.085 / $0.07 / $0.05 per GB | H | AWS Pricing Calculator |
| EC2 c7i.8xlarge (32 vCPU, 64 GiB), Linux, on-demand | $1.428 per hour | H | AWS Pricing Calculator |
| Egress waiver when leaving AWS | free (on request) | H | AWS announcement, March 2024 |

## Cloud: Google Cloud (us-central1, regional)

All confirmed in the Google Cloud Pricing Calculator, 16 November 2026. **Google bills per GiB**
(2^30 bytes), so the same data costs 7.4 % fewer units than at a per-GB price.

| Item | Value | Conf. | Source |
| :--- | :--- | :-: | :--- |
| Standard / Nearline / Coldline | $0.020 / $0.010 / $0.004 per GiB-month | H | Google Cloud calculator |
| Class A ops (writes) | $0.005 per 1,000 | H | Google Cloud calculator |
| Class B ops (reads) | $0.0004 per 1,000 | H | Google Cloud calculator |
| Retrieval, Nearline / Coldline | $0.01 / $0.02 per GiB | H | Google Cloud calculator |
| Internet transfer, Premium tier, to North America | $0.12 first TiB, $0.11 to 10 TiB, $0.08 after (per GiB) | H | Google Cloud calculator (9,095 TiB cost $0.080/GiB) |
| Compute c2d-highcpu-32 (32 vCPU, 64 GB), on-demand | $1.1994 per hour | H | Google Cloud calculator |

## On-prem hardware

| Item | Value | Conf. | Source |
| :--- | :--- | :-: | :--- |
| Drive size | 24 TB (option 32 TB) | H | Dropbox 7th-gen servers use up to 32 TB SMR drives (dropbox.tech, Jul 2025) |
| Drive price | $30 / TB (volume) | M | best 18–24 TB enterprise drives $28–33/TB, Aug–Nov 2026 ([HDDHunt](https://hddhunt.com/blog/hdd-price-per-tb-august-2026/)) |
| Drive annual failure rate | 0.85 % | H | Backblaze Q1 2026, 20 TB+ drives ([Backblaze](https://ir.backblaze.com/news/news-details/2026/Backblaze-Publishes-Q1-2026-Drive-Stats-Reliability-Improves-as-92-of-New-Deployments-Exceed-20TB/default.aspx)) |
| Drives per server | 100 | H | Magic Pocket OSDs have about 100 disks (InfoQ, 2023) |
| Server price without drives | $12,000 | L | our estimate for a 4U high-density chassis with CPU, RAM, 2×25 GbE |
| Servers per rack | 8 | M | "over 8 PB per rack" at 1 PB+ per server (dropbox.tech, 2016) |
| Rack plus top-of-rack switching | $20,000 | L | our estimate |
| Power per drive | 0.4 W / TB (about 10 W for 24 TB) | H | Dropbox SMR post: about 0.30 W/TB idle, 0.50 W/TB random read |
| Power per server (non-drive) | 300 W | L | our estimate |
| Hardware amortisation | 4 years | L | common straight-line life; Dropbox does not publish |
| Compute server, bought | $15,000 (2 × 16 cores, 64 GB, 1U), 450 W, 20 per rack | L | our estimate for a server matching the 32-vCPU cloud instances |

## Facilities, network, people

| Item | Value | Conf. | Source |
| :--- | :--- | :-: | :--- |
| Colocation | $200 / kW-month | M | CBRE primary North America average, about $196–205 (via [MetroColo](https://metrocoloadvisory.com/colocation-pricing-guide/), [ColocationScout](https://colocationscout.com/data-center-pricing-benchmarks.html)) |
| Electricity | $0.08 / kWh | L | US industrial average order of magnitude |
| PUE | 1.3 | L | typical modern colocation |
| IP transit | $0.30 / Mbps-month, 95th percentile | L | large-volume commodity transit, our estimate |
| Peak-to-average traffic | 1.5× | L | our estimate |
| Ops staff | 4 FTE base + 1 per 100 PB raw | L | Week 2 plan sets 4 FTE; scaling rule is ours |
| Loaded salary | $200,000 / year | L | US storage SRE, fully loaded, estimate |
| Build team | 8 engineers × 2.5 years | M | Magic Pocket built by a small team over about 2.5 years (Wired, 2016; dropbox.tech) |

## Workload defaults

| Item | Value | Source |
| :--- | :--- | :--- |
| Stored data | 500 PB (reference), presets 50 TB and 5 PB | Week 2 report; Dropbox 2015 scale |
| Compute servers | 50 (reference), 2 (startup), 10 (scale-up) | implementation guide example workload |
| Growth | 3 % per month | Week 2 report |
| Read:write | 10:1 | Week 2 report |
| Average object | 1 MB (blocks are up to 4 MB) | Inside the Magic Pocket, 2016 |
| Temperature split | 30 % hot, 40 % warm, 30 % cold | our estimate from Dropbox read-age data |
| Egress | 2 % of stored data per month | our estimate |
| Redundancy factor | 2.4× | Magic Pocket design, blended |
| Fill target | 80 % | common practice |
| Cloud discount | 0 % list (slider to 40 %) | discounts are private; shown as a range |

## Still our estimates (say so in the viva)

The **L** rows above: server and rack prices, electricity, PUE, transit, staff scaling, salary,
temperature split and egress share. Each one is a slider in the dashboard, and the sensitivity
chart shows how much the answer moves if it is wrong.
