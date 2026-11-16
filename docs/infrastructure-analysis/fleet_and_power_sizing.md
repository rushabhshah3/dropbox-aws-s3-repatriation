# Physical Fleet Capacity & Thermodynamic Power Sizing

**Author:** Prateek Kalal (IT457 Cloud Computing)  
**Subject:** 500 PB Reference Workload Infrastructure Sizing  
**System:** Magic Pocket On-Premises Architecture

---

## 1. Capacity Geometry: Usable to Raw Storage

In enterprise storage, physical drive capacity must account for erasure coding redundancy and operating buffers:

$$\text{Raw TB} = \frac{\text{Usable TB} \times \text{Redundancy Factor}}{\text{Target Disk Fill Ratio}}$$

For the 500 PB reference workload:
* **Usable Capacity:** $500\text{ PB} = 500,000\text{ TB}$.
* **Blended Redundancy Factor ($2.4\times$):** Magic Pocket maintains cross-zone duplication (2 US zones) combined with Local Reconstruction Codes (LRC-12,2,2 with 1.33× storage overhead within each zone).
* **Target Disk Fill ($80\%$):** Running disks beyond 80% capacity induces severe filesystem fragmentation, blocks background garbage collection, and creates performance cliffs during rebuilds.

$$\text{Raw Storage Needed} = \frac{500,000 \times 2.4}{0.80} = \mathbf{1,500,000 \text{ TB (1,500 PB)}}$$

---

## 2. Hardware Fleet Hierarchy

| Hardware Level | Unit Specification | Count Required | Derivation |
| :--- | :--- | :---: | :--- |
| **Enterprise Hard Drives** | 24 TB SMR/PMR (Western Digital/Seagate) | **62,500 drives** | $\lceil 1,500,000 / 24 \rceil$ |
| **Storage Servers (OSDs)** | 4U custom chassis holding 100 drives | **625 servers** | $\lceil 62,500 / 100 \rceil$ |
| **Standard Server Racks** | 42U racks, 8 servers + dual ToR switches | **79 racks** | $\lceil 625 / 8 \rceil$ |

---

## 3. Capital Expenditures (CapEx) & Amortization

* **Hard Drives:** $62,500 \text{ drives} \times 24\text{ TB} \times \$30/\text{TB} =$ **\$45,000,000**
* **Storage Servers:** $625 \text{ servers} \times \$12,000/\text{server} =$ **\$7,500,000**
* **Racks & Switching:** $79 \text{ racks} \times \$20,000/\text{rack} =$ **\$1,580,000**
* **Total Initial CapEx:** **\$54,080,000 (~$54.1M)**

Using straight-line 4-year (48-month) hardware depreciation:
$$\text{Monthly Amortized CapEx} = \frac{\$54,080,000}{48} = \mathbf{\$1,126,666.67/\text{month}}$$

---

## 4. Electrical Load & Thermodynamics

* **Drive Power Draw:** $62,500 \text{ drives} \times 24\text{ TB} \times 0.4\text{ W/TB} = 600\text{ kW}$
* **Server Baseboard Power:** $625 \text{ servers} \times 300\text{ W} = 187.5\text{ kW}$
* **Total IT Load:** **$787.5\text{ kW (~0.79 MW)}$**
* **Facility Power (PUE 1.3):** $787.5\text{ kW} \times 1.3 = \mathbf{1,023.75\text{ kW (~1.02 MW)}}$
* **Annual Electricity Consumption:** $1,023.75\text{ kW} \times 730\text{ h/mo} \times 12\text{ mo} = \mathbf{8,968,050\text{ kWh/year}}$

---

## 5. Ongoing Operational Expenses (OpEx)

1. **Colocation Leased Footprint:** $787.5\text{ kW} \times \$200/\text{kW-month} = \$157,500/\text{mo}$
2. **Electricity:** $1,023.75\text{ kW} \times 730\text{ h} \times \$0.08/\text{kWh} = \$59,787/\text{mo}$
3. **Drive Replacements (0.85% AFR):** $\frac{62,500 \times 0.85\%}{12} \approx 44.3\text{ drives/mo} = \$31,875/\text{mo}$
4. **Operations Staffing (19 SRE FTEs):** $4\text{ base} + \frac{1,500\text{ PB}}{100} = 19\text{ FTEs} \times \frac{\$200,000}{12} = \$316,667/\text{mo}$
5. **Transit Bandwidth (Egress):** 95th percentile commodity transit = $\$13,889/\text{mo}$

$$\text{Total Monthly OpEx} = \mathbf{\$579,718/\text{month}}$$
$$\text{Total Monthly TCO (CapEx + OpEx)} = \mathbf{\$1,706,384/\text{month}}$$
