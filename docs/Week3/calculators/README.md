# Official pricing calculator estimates (guide step 2)

The reference workload at month 0, priced in the official AWS and Google Cloud calculators, then
compared with our engine (`npm run calc` in `cost-dashboard/`, and the "Calculator check" section
of the dashboard). On-demand list prices, no discounts, no free tier.

## The workload we entered

| Part | Amount | Why |
| :--- | :--- | :--- |
| Hot data (30 %) | 150 PB in S3 Standard / GCS Standard | reads concentrate on recent data |
| Warm data (40 %) | 200 PB in S3 Standard-IA / GCS Nearline | |
| Cold data (30 %) | 150 PB in S3 Glacier Instant Retrieval / GCS Coldline | |
| Writes | 15 billion a month | 3 % growth of 500 PB, written as 1 MB objects |
| Reads | 150 billion a month | 10 reads per write |
| Retrieval from warm and cold | 3 PB a month, split 4 : 3 | 30 % of read-out data comes from non-hot classes |
| Data out to the internet | 10 PB a month | 2 % of stored data |
| Compute | 50 servers, 32 vCPU / 64 GB, running all month | the guide's "50 high-compute servers" |

## Results

| Line, $ per month | AWS calculator | Model | Google calculator | Model |
| :--- | ---: | ---: | ---: | ---: |
| Storage | 6,250,563 | 6,250,563 | 5,215,406 | 5,215,406 |
| Requests | 135,000 | 135,000 | 135,000 * | 135,000 |
| Retrieval | 55,714 | 55,714 | 39,913 | 39,913 |
| Data out, 10 PB | 515,891 | 503,800 | 745,380 | 745,375 |
| Compute, 50 servers | 52,122 | 52,122 | 43,828 | 43,778 |
| **Total** | **7,009,291** | **6,997,186** | **6,179,527** | **6,179,474** |
| Gap | | −0.2 % | | −0.0 % |

\* Google's calculator caps operations at 10,000 million per line. We entered 10,000 million of each
class (which cost $50,000 and $4,000, confirming $0.005 and $0.0004 per 1,000) and scaled to the
full 15,000 + 150,000 million. The raw calculator total with the capped lines is $6,098,527.

## What the calculators taught us

1. **Google bills per GiB, AWS per GB.** 500 PB is 465.7 million GiB. Our first version priced
   Google per GB and overstated its bill by 7.4 %. The engine now converts to each provider's unit,
   and Google became the cheaper cloud for this workload ($6.18M vs $7.01M a month).
2. **The AWS calculator converts transfer at 1 TB = 1,024 GB.** That is the whole 2.3 % gap on the
   AWS transfer line. The model keeps 1 TB = 1,000 GB, as AWS bills transfer per GB.
3. **Storage is about 90 % of either bill.** Compute for 50 servers is under 1 %. The cloud bill at
   this scale is a storage bill, which is why Dropbox could leave S3 without leaving AWS entirely.
4. **Google's compute is 16 % cheaper per hour** for a comparable 32-vCPU, 64 GB machine
   ($1.1994 vs $1.428), and its internet transfer is dearer ($0.08 vs $0.05 per unit at volume).

## Files

| File | What it shows |
| :--- | :--- |
| `aws-0-summary.jpg` | AWS estimate summary: S3 $6,957,168.68 + EC2 $52,122.00 = $7,009,290.68 a month |
| `aws-1-s3-standard.jpg` | S3 Standard tiers, PUT and GET requests |
| `aws-2-s3-glacier-ir.jpg` | Glacier Instant Retrieval storage and retrieval |
| `aws-3-s3-data-transfer.jpg` | Data transfer out, tier by tier |
| `aws-4-ec2-compute.jpg` | 50 × c7i.8xlarge, on-demand |
| `aws-s3-breakdown.txt` | Every line of the S3 calculation as text |
| `gcp-0-summary.jpg` | Google Cloud estimate summary, $6,098,527.22 a month |
| `gcp-1-standard.jpg` to `gcp-3-coldline.jpg` | The three storage classes |
| `gcp-4-compute.jpg` | 50 × c2d-highcpu-32 |
| `gcp-5-egress.jpg` | Internet transfer, Premium tier, 9,095 TiB |
| `gcp-breakdown.txt` | Every line of the Google estimate as text |
