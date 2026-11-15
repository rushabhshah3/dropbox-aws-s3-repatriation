# Official pricing calculator estimates (guide step 2)

Reference workload at month 0, priced in the official calculators and compared with our engine
(`npm run calc` in `cost-dashboard/`). Captured 15 November 2026, on-demand list prices.

## AWS Pricing Calculator (calculator.aws), US East (N. Virginia)

| Line | Calculator input | Calculator, $/month | Our engine, $/month |
| :--- | :--- | ---: | ---: |
| S3 Standard (hot 30%) | 150,000,000 GB, 15 bn PUT, 150 bn GET | 3,285,563 | |
| S3 Standard-IA (warm 40%) | 200,000,000 GB, 1,714,286 GB retrieved | 2,517,143 | |
| S3 Glacier Instant Retrieval (cold 30%) | 150,000,000 GB, 1,285,714 GB retrieved | 638,571 | |
| Data transfer out | 10,000 TB to the internet | 515,891 | 503,800 |
| **S3 total** | | **6,957,169** | **6.95M** |
| EC2, 50 × c7i.8xlarge (32 vCPU, 64 GiB), Linux, on-demand, 100% | 50 instances × 730 h × $1.428 | 52,122 | not yet modelled |
| **Estimate total** | | **7,009,291** | |

The S3 total agrees with the engine to within 0.1%. The only gap is data transfer: the
calculator converts 1 TB = 1,024 GB, the engine uses 1,000 GB.

Files: `aws-0-summary.jpg` (estimate summary), `aws-1..4-*.jpg` (per-service calculations),
`aws-s3-breakdown.txt` (every line of the S3 calculation as text).

## Google Cloud Pricing Calculator

To do: same workload (Standard / Nearline / Coldline, egress, 50 × c2d-highcpu-32).
