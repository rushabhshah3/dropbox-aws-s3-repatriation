#!/usr/bin/env python3
"""
Infrastructure Fleet Sizing & Capacity Calculator
Author: Prateek Kalal (IT457 Cloud Computing - Dhirubhai Ambani University)
Case Study: Dropbox Magic Pocket S3 Repatriation

Calculates physical hardware, power density, thermal footprint,
operational expenses, and ESG carbon emissions from first principles.
"""

import argparse
import math
import sys

def size_fleet(
    usable_pb=500.0,
    drive_tb=24.0,
    redundancy=2.4,
    fill_pct=80.0,
    drives_per_server=100,
    servers_per_rack=8,
    drive_watts_per_tb=0.4,
    server_base_watts=300.0,
    drive_price_per_tb=30.0,
    server_cost=12000.0,
    rack_cost=20000.0,
    amort_years=4.0,
    afr_pct=0.85,
    pue=1.3,
    kwh_price=0.08,
    colo_kw_month=200.0,
    base_fte=4.0,
    pb_per_fte=100.0,
    sre_salary=200000.0,
    egress_pct=2.0,
    transit_per_mbps=0.30,
    peak_factor=1.5
):
    # 1. Capacity Geometry
    usable_tb = usable_pb * 1000.0
    fill_ratio = fill_pct / 100.0
    raw_tb = (usable_tb * redundancy) / fill_ratio
    raw_pb = raw_tb / 1000.0

    # 2. Hardware Fleet Sizing
    drives = math.ceil(raw_tb / drive_tb)
    servers = math.ceil(drives / drives_per_server)
    racks = math.ceil(servers / servers_per_rack)

    # 3. Capital Expenditures (CapEx)
    drive_capex = drives * drive_tb * drive_price_per_tb
    server_capex = servers * server_cost
    rack_capex = racks * rack_cost
    total_capex = drive_capex + server_capex + rack_capex
    monthly_amortized_capex = total_capex / (amort_years * 12.0)

    # 4. Power & Thermodynamics
    drive_kw = (drives * drive_tb * drive_watts_per_tb) / 1000.0
    server_kw = (servers * server_base_watts) / 1000.0
    it_kw = drive_kw + server_kw
    total_facility_kw = it_kw * pue  # Including cooling/overhead

    hours_per_month = 730.0
    monthly_it_kwh = it_kw * hours_per_month
    monthly_facility_kwh = total_facility_kw * hours_per_month
    annual_facility_kwh = monthly_facility_kwh * 12.0

    # 5. Drive Reliability & Replacement (Backblaze AFR standard)
    monthly_failed_drives = (drives * (afr_pct / 100.0)) / 12.0
    annual_failed_drives = drives * (afr_pct / 100.0)
    monthly_replacement_cost = monthly_failed_drives * drive_tb * drive_price_per_tb

    # 6. Operations & Headcount
    sre_headcount = base_fte + (raw_pb / pb_per_fte)
    monthly_staff_cost = (sre_headcount * sre_salary) / 12.0

    # 7. Colocation, Energy, Network OpEx
    monthly_colo_cost = it_kw * colo_kw_month
    monthly_energy_cost = monthly_facility_kwh * kwh_price
    
    # Egress transit calculation
    monthly_egress_gb = usable_tb * 1000.0 * (egress_pct / 100.0)
    avg_mbps = (monthly_egress_gb * 8000.0) / (30.0 * 86400.0)
    billed_mbps = avg_mbps * peak_factor
    monthly_bandwidth_cost = billed_mbps * transit_per_mbps

    total_monthly_opex = (
        monthly_colo_cost +
        monthly_energy_cost +
        monthly_replacement_cost +
        monthly_staff_cost +
        monthly_bandwidth_cost
    )

    total_monthly_tco = monthly_amortized_capex + total_monthly_opex

    # 8. ESG & Environmental Impact (EPA eGRID national factor: 0.385 kg CO2e / kWh)
    annual_co2_kg = annual_facility_kwh * 0.385
    annual_co2_metric_tons = annual_co2_kg / 1000.0

    return {
        "usable_pb": usable_pb,
        "usable_tb": usable_tb,
        "raw_tb": raw_tb,
        "raw_pb": raw_pb,
        "drives": drives,
        "drive_tb": drive_tb,
        "servers": servers,
        "racks": racks,
        "total_capex": total_capex,
        "drive_capex": drive_capex,
        "server_capex": server_capex,
        "rack_capex": rack_capex,
        "monthly_amortized_capex": monthly_amortized_capex,
        "it_kw": it_kw,
        "facility_kw": total_facility_kw,
        "annual_kwh": annual_facility_kwh,
        "monthly_failed_drives": monthly_failed_drives,
        "annual_failed_drives": annual_failed_drives,
        "sre_headcount": sre_headcount,
        "monthly_colo_cost": monthly_colo_cost,
        "monthly_energy_cost": monthly_energy_cost,
        "monthly_replacement_cost": monthly_replacement_cost,
        "monthly_staff_cost": monthly_staff_cost,
        "monthly_bandwidth_cost": monthly_bandwidth_cost,
        "total_monthly_opex": total_monthly_opex,
        "total_monthly_tco": total_monthly_tco,
        "annual_co2_metric_tons": annual_co2_metric_tons,
    }

def print_report(res):
    print("=" * 72)
    print("  MAGIC POCKET INFRASTRUCTURE CAPACITY & POWER SIZING MODEL")
    print(f"  Target Workload: {res['usable_pb']:.1f} PB Usable | Redundancy: 2.4x | Fill: 80%")
    print("=" * 72)

    print("\n[1] PHYSICAL STORAGE SIZING")
    print(f"  • Usable Capacity:       {res['usable_pb']:>12,.1f} PB ({res['usable_tb']:>14,.0f} TB)")
    print(f"  • Raw Capacity Needed:   {res['raw_pb']:>12,.1f} PB ({res['raw_tb']:>14,.0f} TB)")
    print(f"  • Enterprise Hard Drives:{res['drives']:>12,d} units ({res['drive_tb']:.0f} TB SMR/PMR)")
    print(f"  • Storage Servers (4U):  {res['servers']:>12,d} servers (100 drives/chassis)")
    print(f"  • Standard Server Racks: {res['racks']:>12,d} racks (8 servers/rack)")

    print("\n[2] CAPITAL EXPENDITURES (CapEx)")
    print(f"  • Hard Drives CapEx:     ${res['drive_capex']:>12,.2f} (@ $30/TB)")
    print(f"  • Server Chassis CapEx:  ${res['server_capex']:>12,.2f} (@ $12,000/server)")
    print(f"  • Racks & ToR Switches:  ${res['rack_capex']:>12,.2f} (@ $20,000/rack)")
    print(f"  -------------------------------------------------------------")
    print(f"  • Total Initial CapEx:   ${res['total_capex']:>12,.2f} (~${res['total_capex']/1e6:.1f}M)")
    print(f"  • Amortized Monthly Cost:${res['monthly_amortized_capex']:>12,.2f} (over 4 years)")

    print("\n[3] THERMODYNAMICS, POWER & RELIABILITY")
    print(f"  • IT Equipment Power:    {res['it_kw']:>12,.1f} kW ({res['it_kw']/1000.0:.2f} MW)")
    print(f"  • Facility Power (PUE 1.3){res['facility_kw']:>11,.1f} kW ({res['facility_kw']/1000.0:.2f} MW)")
    print(f"  • Annual Electricity:    {res['annual_kwh']:>12,.0f} kWh/year")
    print(f"  • Drive Failure Rate:    {res['monthly_failed_drives']:>12,.1f} drives/mo (~{res['annual_failed_drives']:.0f}/year)")

    print("\n[4] MONTHLY OPERATING EXPENSES (OpEx)")
    print(f"  • Colocation Floor/Power:${res['monthly_colo_cost']:>12,.2f} ($200/kW-mo)")
    print(f"  • Active Power (Energy): ${res['monthly_energy_cost']:>12,.2f} (@ $0.08/kWh)")
    print(f"  • Drive Replacements:    ${res['monthly_replacement_cost']:>12,.2f} (0.85% AFR)")
    print(f"  • IP Transit Bandwidth:  ${res['monthly_bandwidth_cost']:>12,.2f} (95th percentile)")
    print(f"  • SRE Operations Staff:  ${res['monthly_staff_cost']:>12,.2f} ({res['sre_headcount']:.1f} FTEs)")
    print(f"  -------------------------------------------------------------")
    print(f"  • Total Monthly OpEx:    ${res['total_monthly_opex']:>12,.2f}")
    print(f"  • Total Monthly TCO:     ${res['total_monthly_tco']:>12,.2f} (CapEx amort. + OpEx)")

    print("\n[5] ESG & ENVIRONMENTAL GREEN COMPUTING AUDIT")
    print(f"  • Carbon Intensity Standard: EPA eGRID National Factor (0.385 kg CO2e / kWh)")
    print(f"  • Annual GHG Emissions:     {res['annual_co2_metric_tons']:>12,.1f} Metric Tons CO2e")
    print(f"  • Equivalent Flight Miles:  ~{res['annual_co2_metric_tons'] * 2400:>11,.0f} miles of jet travel")
    print("=" * 72)

def main():
    parser = argparse.ArgumentParser(description="Infrastructure Fleet Capacity Calculator (Dropbox Magic Pocket)")
    parser.add_argument("--usable-pb", type=float, default=500.0, help="Usable storage capacity in PB (default: 500)")
    parser.add_argument("--drive-tb", type=float, default=24.0, help="Capacity per drive in TB (default: 24)")
    parser.add_argument("--redundancy", type=float, default=2.4, help="Redundancy factor (default: 2.4)")
    parser.add_argument("--fill-pct", type=float, default=80.0, help="Target disk fill percentage (default: 80)")
    parser.add_argument("--pue", type=float, default=1.3, help="Data center Power Usage Effectiveness (default: 1.3)")
    args = parser.parse_args()

    result = size_fleet(
        usable_pb=args.usable_pb,
        drive_tb=args.drive_tb,
        redundancy=args.redundancy,
        fill_pct=args.fill_pct,
        pue=args.pue
    )
    print_report(result)

if __name__ == "__main__":
    main()
