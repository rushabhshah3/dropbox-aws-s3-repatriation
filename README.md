# Dropbox Magic Pocket — Repatriation from AWS S3

> Cloud Computing (IT457) case study on **Dropbox's "Magic Pocket"**, the exabyte-scale custom storage system built to migrate ~90% of data off AWS S3. Covers architecture analysis, repatriation cost modeling (cloud pricing calculators vs. on-premises TCO), and outcomes from Dropbox's S-1 filing.

## About the Case Study

Dropbox launched in 2007 with all file content stored in AWS S3. By 2015, with 500M+ users and hundreds of petabytes, it was one of the largest single S3 workloads — and S3's pay-per-use economics no longer made sense at that scale. Dropbox responded by building **Magic Pocket**: a self-hosted, software-defined, exabyte-scale blob storage system.

- **Migration completed:** 7 Oct 2015 — a month ahead of schedule, zero data loss
- **Savings:** $74.6M over two years ($39.5M in 2016 + $35.1M in 2017), per Dropbox's 2018 S-1
- **Scale today:** 600,000+ drives, tens of millions of requests/sec, 3 geographic zones, 12-nines durability

## Project Timeline (IT457)

| Week   | Task                                                                                                                    | Status |
| :----- | :---------------------------------------------------------------------------------------------------------------------- | :----: |
| Week 1 | Find primary sources; extract architecture, cost & outcome data → one-page source summary + salient points              |   ✅   |
| Week 2 | Case analysis: architecture diagram, problem & solution → 10-page report + exercise plan, team roles                    |   ⬜   |
| Week 3 | Build exercise core: model the workload on 2 cloud providers' pricing calculators vs. on-prem TCO; collect measurements |   ⬜   |
| Week 4 | Report preparation and submission                                                                                       |   ⬜   |
| Week 5 | Project VIVA                                                                                                            |   ⬜   |

**Exercise theme:** _Cost & Repatriation_ — use provider pricing calculators to model the case's workload on two providers, then compare against an on-premises estimate.

## Repository Structure

```
├── week1/
│   ├── sources-summary.pdf      # One-page summary of sources found
│   └── salient-points.md        # Case study salient points
├── week2/
│   ├── architecture-diagram/    # Magic Pocket architecture (to be added)
│   └── report/                  # 10-page case analysis (to be added)
├── week3/
│   ├── cost-model/              # Pricing calculator screenshots & TCO model
│   └── results/                 # Measurements & comparison (to be added)
└── README.md
```

## Key Facts

| Metric                       | Value                                                              |
| :--------------------------- | :----------------------------------------------------------------- |
| File content migrated off S3 | ~90% (hybrid: ~10% stayed on AWS, mainly Europe)                   |
| Data model                   | Immutable, encrypted ≤4 MB blocks → 1 GB buckets → volumes on OSDs |
| Storage cells                | ~50–100 PB per cell, striped across racks                          |
| Zones                        | 3 geographic zones (North America), async cross-zone replication   |
| Durability / Availability    | 12 nines (99.9999999999%) / 99.99%                                 |
| Hardware                     | Custom OSD servers, 100+ HDDs each (1–2+ PB), later SMR drives     |
| Savings (2016)               | −$92.5M AWS spend, +$53M own-DC cost → **−$39.5M**                 |
| Savings (2017)               | **−$35.1M**                                                        |
| **Total saved**              | **$74.6M over two years**                                          |

## Primary Sources

1. [Magic Pocket: Scaling to Exabytes and Beyond](https://dropbox.tech/infrastructure/magic-pocket-infrastructure) — Dropbox Tech Blog, Mar 2016
2. [Inside the Magic Pocket](https://dropbox.tech/infrastructure/inside-the-magic-pocket) — Dropbox Tech Blog, May 2016
3. Dropbox S-1 Registration Statement (SEC filing, Feb 2018) — cost & outcome data
4. [Magic Pocket: Dropbox's Exabyte-Scale Blob Storage System](https://www.infoq.com/presentations/dropbox-exabyte-blob-storage/) — Facundo Agriel, QCon SF 2022 (via InfoQ)
5. [Software Engineering Daily — Dropbox's Magic Pocket](https://softwareengineeringdaily.com/2016/05/05/magic-pocket-dropbox-james-cowling/) — podcast with storage team lead James Cowling
