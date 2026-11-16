# Forensic Financial Audit: Dropbox Form S-1 & Cloud Economics

**Author:** Prateek Kalal (IT457 Cloud Computing)  
**Subject:** S-1 SEC Filing Analysis, CapEx vs. OpEx, and Industry Debate

---

## 1. Income Statement Transformation (2015–2017)

All figures derived from Dropbox Form S-1 filed with the SEC in February 2018:

| Metric ($ Millions) | FY 2015 | FY 2016 | FY 2017 | 3-Year Trend |
| :--- | :---: | :---: | :---: | :--- |
| **Revenue** | $603.8M | $844.8M | $1,106.8M | **+83.3% (Nearly doubled)** |
| **Cost of Revenue (COR)** | $407.4M | $390.6M | $368.9M | **-9.5% (Decreased)** |
| **Gross Profit** | $196.4M | $454.2M | $737.9M | **+275.7%** |
| **Gross Margin (%)** | **33.0%** | **54.0%** | **67.0%** | **+34 percentage points** |

---

## 2. Deconstructing the "$75 Million Savings" Myth

Tech blogs frequently cite that Dropbox saved "$75M per year" by exiting AWS. A forensic reading of the S-1 reveals two critical nuances:

1. **It was a 2-Year Total, Not an Annual Run Rate:**
   * **2016 Reduction:** $-\$39.5\text{M}$ net ($-\$92.5\text{M}$ cloud spend drop, offset by $+\$53.0\text{M}$ in own datacenter costs).
   * **2017 Reduction:** $-\$35.1\text{M}$ net.
   * Total Cost of Revenue reduction = $\$39.5\text{M} + \$35.1\text{M} = \mathbf{\$74.6\text{M}}$.

2. **The Hidden Capital Expenditures (CapEx):**
   * Reductions in Cost of Revenue only capture equipment **depreciation**, not the cash spent to buy hardware.
   * **Actual CapEx spent (2015–2017):** **~$219 Million**.
   * **Principal paid on capital leases (2015–2017):** **~$372 Million**.
   * **Ongoing Commitments:** By FY 2024, Dropbox still reported **$92.7M/year** in finance lease costs. Repatriation is a permanent balance sheet commitment, not free money.

---

## 3. Selective Repatriation vs. Full Exit

Dropbox never executed a 100% cloud exit:
* **The 90/10 Split:** >90% of user data was migrated to Magic Pocket in California, Texas, and Virginia colocation facilities.
* **AWS in Germany (2016):** Retained AWS S3 in Frankfurt to store data for European business customers complying with GDPR and strict EU data residency regulations.
* **Edge Acceleration:** Maintained AWS CloudFront and S3 for regional caching and edge network connectivity.

---

## 4. The Industry Debate: a16z vs. Corey Quinn

* **The a16z Thesis (Martin Casado & Sarah Wang):** Argues that public cloud markups extract a "50% tax" on high-growth software companies, and repatriation can double enterprise valuation by restoring gross margins.
* **The Corey Quinn Counter-Argument:** Points out that Dropbox had an ultra-rare workload: petabyte-scale, 100% predictable, write-once immutable blobs. For 99% of enterprises with variable compute workloads, building custom data centers leads to catastrophic idle hardware, unhedged drive failure risks, and inflated headcount.
