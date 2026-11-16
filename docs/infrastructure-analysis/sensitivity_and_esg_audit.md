# Sensitivity Tornado Analysis & Data Center ESG Carbon Footprint

**Author:** Prateek Kalal (IT457 Cloud Computing)  
**Subject:** Multi-Variable Risk Analysis and Greenhouse Gas Accounting

---

## 1. Sensitivity Analysis (The Tornado Model)

Using our simulation engine, we evaluated how 3-year net savings ($208M reference) swing when moving individual variables between extreme boundaries:

| Variable | Low Value | High Value | 3-Year Savings Impact | Sensitivity Rank |
| :--- | :---: | :---: | :---: | :---: |
| **Enterprise Cloud Discount** | 0% (List) | 40% Discount | **$208M → $84M** | **#1 (Dominant)** |
| **Network Egress Ratio** | 0.5% / month | 6.0% / month | **$162M → $312M** | **#2 (High)** |
| **Drive Price ($/TB)** | $20 / TB | $45 / TB | **$231M → $174M** | **#3 (Moderate)** |
| **Redundancy Factor** | 1.8× (Aggressive LRC) | 3.0× (Multi-zone copy) | **$238M → $171M** | **#4 (Moderate)** |
| **Colocation Power Rate** | $150 / kW-mo | $300 / kW-mo | **$218M → $194M** | **#5 (Low)** |
| **Disk Fill Target** | 60% | 90% | **$182M → $219M** | **#6 (Low)** |

### Key Insight on Cloud Discounts:
Cloud repatriation is fundamentally a **negotiation lever**. If AWS or GCP grants an enterprise customer a 40–50% discount on list prices, the break-even scale pushes out from **18 PB to >60 PB**, reducing financial justification for on-premise builds.

---

## 2. Environmental Impact (ESG Carbon Audit)

### 2.1 Annual Power & Thermodynamic Balance
* **Data Center IT Power:** $787.5\text{ kW}$
* **Facility Power (PUE 1.3):** $1,023.75\text{ kW}$
* **Annual Electricity Used:** $8,968,050\text{ kWh/year}$

### 2.2 Greenhouse Gas Emissions (GHG Protocol Scope 2)
Using the United States Environmental Protection Agency (EPA) eGRID national grid average emission factor ($0.385\text{ kg } CO_2e / \text{kWh}$):

$$\text{Annual } CO_2e\text{ (kg)} = 8,968,050\text{ kWh} \times 0.385\text{ kg/kWh} = 3,452,700\text{ kg}$$
$$\mathbf{\text{Annual Scope 2 Emissions: } 3,452.7 \text{ Metric Tons } CO_2e}$$

### 2.3 Environmental Real-World Equivalents
* **Passenger Flight Miles:** $\approx \mathbf{8,286,478 \text{ miles}}$ of commercial passenger aviation.
* **Gasoline Consumed:** $\approx \mathbf{388,470 \text{ gallons}}$ of vehicle fuel burned.
* **Tree Seedlings Needed:** $\approx \mathbf{57,090 \text{ trees}}$ grown for 10 years to sequester emissions.

### 2.4 Mitigation Engineering
To achieve carbon neutrality on-premise, Dropbox implemented:
1. **Shingled Magnetic Recording (SMR):** 7th-gen servers drop drive idle power from 0.5 W/TB to 0.3 W/TB.
2. **Cold XOR Tiering:** Cross-region XOR parity eliminated 25% of redundant hard drives, directly saving 2.2 million kWh annually.
