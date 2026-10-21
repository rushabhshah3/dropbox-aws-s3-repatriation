# Cost and outcomes

All dollar figures below are from Dropbox's Form S-1 (February 2018) [8] unless marked
otherwise. The S-1 never names AWS in the cost section; it says "third-party datacenter
service provider".

## Income statement view

| $ million        | 2015  | 2016  | 2017    |
| :--------------- | ----: | ----: | ------: |
| Revenue          | 603.8 | 844.8 | 1,106.8 |
| Cost of revenue  | 407.4 | 390.6 | 368.9   |
| Gross profit     | 196.4 | 454.2 | 737.9   |
| Gross margin     | 33%   | 54%   | 67%     |

Revenue nearly doubled while cost of revenue went down.

## What the S-1 attributes to "Infrastructure Optimization"

| Year | Change in infrastructure cost | Detail |
| :--- | :--- | :--- |
| 2016 | −$39.5M | −$92.5M paid to the third-party provider, +$53.0M depreciation, facilities and support for own equipment |
| 2017 | −$35.1M | Further reduction from the same programme |

The widely quoted **$74.6M** is the sum of these two lines. It does not appear in the S-1
as a single figure, and it is a two-year total, not an annual saving.

During the migration data was kept in both places, which raised storage cost until the
migration finished in Q4 2016.

## What the savings figure leaves out

| $ million                    | 2015  | 2016  | 2017  |
| :--------------------------- | ----: | ----: | ----: |
| Capital expenditure          | 78.7  | 115.2 | 25.3  |
| Principal paid on capital leases | 101.2 | 137.9 | 133.0 |

- Capex over 2015–2017 was about $219M. Capex is not in cost of revenue; only its
  depreciation is.
- Capital lease obligations were $257.2M at end of 2016 and $174.3M at end of 2017.
- The FY2024 10-K still shows $92.7M of finance-lease cost for the year [9]. Running your own
  storage is an ongoing commitment, not a one-off project.

## Where the data lives

- Co-location facilities in **California, Texas and Virginia** [8].
- "More than 90%" of user data on Dropbox's own infrastructure; AWS used "for the remainder"
  and to localise storage in the US and Europe [8].
- From Q3 2016, European business customers' files are stored on AWS in Germany [13].

So this was a selective repatriation, not a full exit from the cloud.

## The debate

- **a16z (Wang and Casado, 2021)** uses Dropbox as its lead example and suggests that
  repatriation costs one third to one half of running the same workload in the cloud [14].
- **Corey Quinn (2021)** accepts the numbers but not the conclusion: capex sits outside cost of
  revenue, Dropbox had a single large and predictable workload, and cloud prices hide drive
  failures and networking that you pay for yourself on-premises [15].

## What this means for our Week 3 exercise

The exercise is to price the workload on two cloud providers and compare with an on-premises
estimate. Inputs we will need, with where we expect to get them:

| Input | Source |
| :--- | :--- |
| Data size and growth | 500 PB in 2015, 40 PB in 2012 [1]; S-1 says "over an exabyte" in 2018 [8] |
| Access pattern | over 40% of reads on data under a day old, over 90% under a year [4] |
| Redundancy overhead | 4× open, about 1.33× closed (LRC), 1.5× cold tier [4][10] |
| Drive power | about 0.3 W/TB idle, 0.5 W/TB random read [5] |
| Drive size | 20 TB to 32 TB SMR [5][6] |
| Cloud prices | AWS S3 and a second provider's public calculators (to be captured in Week 3) |
