# Sources

Tags: **P** primary (Dropbox or its filings), **C** talk or interview by Dropbox engineers,
**A** academic, **S** secondary or commentary, **V** vendor.

## Dropbox engineering blog

| # | Tag | Source | What we took from it |
| :-: | :-: | :--- | :--- |
| 1 | P | A. Gupta, [Scaling to exabytes and beyond](https://dropbox.tech/infrastructure/magic-pocket-infrastructure), 14 Mar 2016 | Migration timeline, 500 PB scale, durability and availability targets |
| 2 | P | J. Cowling, [Inside the Magic Pocket](https://dropbox.tech/infrastructure/inside-the-magic-pocket), 6 May 2016 | Data model, Block Index, Replication Table, Master, Volume Manager, OSD |
| 3 | P | J. Cowling, [Pocket watch: verifying exabytes of data](https://dropbox.tech/infrastructure/pocket-watch), 6 Jul 2016 | 27-nines model, the six verifiers, over half of disk load is verification |
| 4 | P | P. Le, [How we optimized Magic Pocket for cold storage](https://dropbox.tech/infrastructure/how-we-optimized-magic-pocket-for-cold-storage), 6 May 2019 | Cross-region XOR tier, 25% saving, latency percentiles, read-age statistics |
| 5 | P | E. Shobe, [After four years of SMR storage](https://dropbox.tech/infrastructure/four-years-of-smr-storage-what-we-love-and-whats-next), 8 Mar 2023 | SMR without a filesystem, W/TB, power and space per EB |
| 6 | P | E. Shobe, J. Mednick, [Seventh-generation server hardware](https://dropbox.tech/infrastructure/seventh-generation-server-hardware), 2 Jul 2025 | 32 TB SMR drives, 99% SMR fleet, rack power |
| 7 | P | F. Agriel, [Improving storage efficiency in Magic Pocket](https://dropbox.tech/infrastructure/improving-storage-efficiency-in-magic-pocket-our-immutable-blob-store), 2 Apr 2026 | Fragmentation incident, L1/L2/L3 compaction |

## Financial filings

| # | Tag | Source | What we took from it |
| :-: | :-: | :--- | :--- |
| 8 | P | Dropbox Inc., [Form S-1](https://www.sec.gov/Archives/edgar/data/0001467623/000119312518055809/d451946ds1.htm), Feb 2018 | Cost of revenue, gross margin, capex, leases, data centre locations, AWS use |
| 9 | P | Dropbox Inc., [Form 10-K FY2024](https://www.sec.gov/Archives/edgar/data/1467623/000146762325000011/dbx-20241231.htm), Feb 2025 | Finance-lease cost of infrastructure in 2024 |

## Talks and interviews

| # | Tag | Source | What we took from it |
| :-: | :-: | :--- | :--- |
| 10 | C | F. Agriel, [Magic Pocket: Dropbox's exabyte-scale blob storage system](https://www.infoq.com/articles/dropbox-magic-pocket-exabyte-storage/), QCon SF 2022, InfoQ write-up 15 May 2023 | 600k+ drives, 4× replication then LRC-(12,2,2), repair rate, lessons |
| 11 | C | J. Cowling, [Dropbox's Magic Pocket](https://softwareengineeringdaily.com/podcasts/dropboxs-magic-pocket-james-cowling/), Software Engineering Daily, 2016; C. Metz, *Wired*, Mar 2016 | Design reasoning, the Go to Rust rewrite |

## Academic

| # | Tag | Source | What we took from it |
| :-: | :-: | :--- | :--- |
| 12 | A | C. Huang et al., "Erasure Coding in Windows Azure Storage", USENIX ATC 2012; S. Muralidhar et al., "f4: Facebook's Warm BLOB Storage System", OSDI 2014 | Background for LRC codes and the f4 XOR design |

## Context and commentary

| # | Tag | Source | What we took from it |
| :-: | :-: | :--- | :--- |
| 13 | P/S | Dropbox blog, "Dropbox is growing in Europe", Feb 2016; [Fortune](https://fortune.com/2016/05/23/dropbox-germany), 23 May 2016 | European business data on AWS Germany |
| 14 | S | S. Wang, M. Casado, [The cost of cloud, a trillion dollar paradox](https://a16z.com/the-cost-of-cloud-a-trillion-dollar-paradox/), a16z, May 2021 | Dropbox as the lead repatriation example |
| 15 | S | C. Quinn, [The trillion-dollar paradoxical arguments of a16z](https://www.lastweekinaws.com/blog/the-trillion-dollar-paradoxical-arguments-of-a16z), 16 Jun 2021 | Counter-argument on capex and workload shape |
| 16 | V | Seagate, [Powering AI at scale: Dropbox qualifies Seagate's Exos 32TB drives](https://www.seagate.com/blog/powering-ai-at-scale/), 29 Sep 2025 | HAMR qualification, drive inputs for the cost model |

## Found but not yet read

These look useful for Week 2 but could not be opened when we checked (access denied or
encrypted PDF):

- U. Ummadi, E. Shobe, *Scaling Magic Pocket to exabyte scale*, SNIA SDC 2024 (slides)
- DatacenterDynamics, *How Dropbox pulled off its hybrid cloud transition*
- Western Digital, *Dropbox Magic Pocket achieves exabyte scale with SMR HDDs* (case study)

## Corrections to our first draft

- SMR was first deployed in 2018, not 2020.
- "500 million" is sign-ups, not active users.
- $74.6M is our sum of the 2016 and 2017 reductions, not a single figure in the S-1, and
  not an annual saving.
- The 90% milestone was three weeks early (7 Oct vs 30 Oct), not a month.
