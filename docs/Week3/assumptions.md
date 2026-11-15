# Assumptions and sources

Every number the model uses. Confidence: **H** = from the provider or a primary source,
**M** = from a reputable secondary source, **L** = our estimate, to be checked or argued in the viva.
Prices checked November 2026. All of these are editable in the dashboard.

## Cloud: AWS S3 (us-east-1)

| Item | Value | Conf. | Source |
| :--- | :--- | :-: | :--- |
| S3 Standard, first 50 TB | $0.023 / GB-month | M | [CloudZero S3 pricing guide 2026](https://www.cloudzero.com/blog/s3-pricing/) |
| S3 Standard, next 450 TB | $0.022 | M | same |
| S3 Standard, over 500 TB | $0.021 | M | same |
| S3 Standard-IA | $0.0125 | M | same |
| S3 Glacier Instant Retrieval | $0.004 | M | same |
| PUT / COPY / POST | $0.005 per 1,000 | M | [Infratally S3 2026](https://infratally.com/articles/aws-s3-pricing-explained-2026/) |
| GET | $0.0004 per 1,000 | M | same |
| Retrieval, Standard-IA | $0.01 / GB | M | to confirm on AWS pricing page |
| Retrieval, Glacier IR | $0.03 / GB | M | to confirm on AWS pricing page |
| Egress, first 10 TB / month | $0.09 / GB | M | [Upstash S3 2026](https://upstash.com/blog/aws-s3-pricing-explained-2026) |
| Egress, next 40 TB / 100 TB / over 150 TB | $0.085 / $0.07 / $0.05 | M | AWS published tiers, to confirm |
| Egress waiver when leaving AWS | free (on request) | H | AWS announcement, March 2024 |

## Cloud: Google Cloud Storage (us-central1, regional)

| Item | Value | Conf. | Source |
| :--- | :--- | :-: | :--- |
| Standard | $0.020 / GB-month | M | [nOps GCS pricing 2026](https://www.nops.io/blog/google-cloud-storage-pricing/) |
| Nearline | $0.010 | M | same |
| Coldline | $0.004 | M | same |
| Class A ops (writes) | $0.005 per 1,000 | M | to confirm |
| Class B ops (reads) | $0.0004 per 1,000 | M | to confirm |
| Retrieval, Nearline / Coldline | $0.01 / $0.02 per GB | M | [usage.ai GCS](https://www.usage.ai/blogs/gcp/google-cloud-storage-pricing/) |
| Egress, first TB / at scale | $0.12 → $0.08 / GB | L | single secondary source ([LeanOps](https://leanopstech.com/blog/google-cloud-storage-pricing-2026/)), must confirm |

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
| Growth | 3 % per month | Week 2 report |
| Read:write | 10:1 | Week 2 report |
| Average object | 1 MB (blocks are up to 4 MB) | Inside the Magic Pocket, 2016 |
| Temperature split | 30 % hot, 40 % warm, 30 % cold | our estimate from Dropbox read-age data |
| Egress | 2 % of stored data per month | our estimate |
| Redundancy factor | 2.4× | Magic Pocket design, blended |
| Fill target | 80 % | common practice |
| Cloud discount | 0 % list (slider to 40 %) | discounts are private; shown as a range |

## 2015-Era Historical Baseline (S-1 Reality Check)

Archived prices from 2015 (Wayback Machine / AWS News Blog):

| Item | 2015 Value | Conf. | Historical Source |
| :--- | :--- | :-: | :--- |
| AWS S3 Standard (first 1 TB) | $0.030 / GB-month | H | AWS Pricing Archive (Q3 2015) |
| AWS S3 Standard (1 to 50 TB) | $0.0295 / GB-month | H | AWS Pricing Archive (Q3 2015) |
| AWS S3 Standard (50 to 500 TB) | $0.0290 / GB-month | H | AWS Pricing Archive (Q3 2015) |
| AWS S3 Standard (over 500 TB) | $0.0275 / GB-month | H | AWS Pricing Archive (Q3 2015) |
| AWS S3 Standard-IA | $0.0125 / GB-month | H | AWS Announcement (Sept 2015) |
| AWS Glacier (Cold) | $0.007 / GB-month | H | AWS Glacier price drop (2015) |
| AWS Egress (10 TB / 50 TB / 150 TB) | $0.12 / $0.09 / $0.07 | M | AWS Data Transfer Out (2015) |
| Enterprise Drive Size | 8 TB PMR / SMR | H | Dropbox "Diskotech" 1 PB chassis (102 drives, 2015-16) |
| Enterprise Drive Price | $45 / TB raw | M | Historical wholesale enterprise HDD pricing |
| Drive Power Draw | ~1.0 W / TB | M | PMR drive power consumption baseline |

## To do before submission

- Confirm every **M** cloud price on the official AWS and GCP pricing pages and calculators
- Replace **L** values with quotes where we can find them, or keep them and state them in the viva
