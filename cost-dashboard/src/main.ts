import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './ui/styles/tokens.css';
import './ui/styles/app.css';

import { Inputs, withPreset } from './engine/inputs';
import { buildCost, cloudBill, linearFit, prices, S1, scaleCurve, sensitivity, summarise, Summary } from './engine/model';
import { DEFAULTS } from './engine/inputs';
import * as state from './ui/state';
import { mountControls } from './ui/controls';
import { breakEvenChart } from './ui/charts/breakeven';
import { timelineChart } from './ui/charts/timeline';
import { renderTornado } from './ui/charts/tornado';
import { money, num, size } from './ui/format';
import { icon } from './ui/icons';

const REPO = 'https://github.com/rushabhshah3/dropbox-aws-s3-repatriation/blob/main/docs/Week3';

const NAV = [
  { group: 'Analysis', items: [
    { id: 'overview', label: 'Overview', icon: 'overview' },
    { id: 'break-even', label: 'Break-even', icon: 'breakeven' },
    { id: 'timeline', label: 'Three years', icon: 'timeline' },
    { id: 'breakdown', label: 'Where it goes', icon: 'breakdown' },
    { id: 'sensitivity', label: 'What moves it', icon: 'sensitivity' },
  ] },
  { group: 'Evidence', items: [
    { id: 'calculators', label: 'Calculator check', icon: 'cloud' },
    { id: 'reality', label: 'S-1 check', icon: 'evidence' },
    { id: 'assumptions', label: 'Assumptions', icon: 'assumptions' },
    { id: 'panel', label: 'Scenario', icon: 'scenario' },
  ] },
];

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<a class="skip" href="#main">Skip to content</a>
<div class="shell">
  <aside class="rail" aria-label="Sections">
    <div class="brand">
      <span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 9.5 12 5l8 4.5v5L12 19l-8-4.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 5v14M4 9.5l8 4.5 8-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></span>
      <span class="brand-text"><b>Pocket Ledger</b><small>Magic Pocket cost model</small></span>
    </div>
    <nav>
      ${NAV.map((g) => `<p class="rail-group">${g.group}</p><ul>${g.items.map((i) => `<li><a href="#${i.id}" data-nav="${i.id}">${icon(i.icon)}<span>${i.label}</span></a></li>`).join('')}</ul>`).join('')}
    </nav>
    <div class="rail-foot">
      <a href="${REPO}/model.md" target="_blank" rel="noopener">${icon('info', 16)}<span>Model notes</span></a>
      <a href="${REPO}/assumptions.md" target="_blank" rel="noopener">${icon('external', 16)}<span>Sources</span></a>
      <button type="button" class="theme-btn" id="theme-btn">${icon('info', 16)}<span>Dark theme</span></button>
      <p>IT457 Cloud Computing · Week 3</p>
    </div>
  </aside>

  <div class="main-col">
    <header class="topbar">
      <div class="crumbs"><span>Dropbox</span><span aria-hidden="true">/</span><b>Leaving S3: rent vs buy</b></div>
      <div class="ticker" id="ticker" aria-label="Unit prices in this scenario"></div>
    </header>

    <div class="work">
      <main id="main" class="content">
        <section id="overview" class="sec reveal">
          <div class="page-head">
            <div><h1>Overview</h1><p class="eyebrow-line" id="scenario-line"></p></div>
            <span class="status" id="status"></span>
          </div>
          <article class="verdict">
            <span class="chip chip-lg" aria-hidden="true">${icon('breakeven', 22)}</span>
            <div><p class="verdict-k">Verdict</p><h2 id="headline"></h2><p class="lede" id="lede"></p></div>
          </article>
          <div class="kpis" id="kpis"></div>
        </section>

        <section id="break-even" class="sec card reveal">
          <div class="card-head">
            <div><h2>Rent vs buy</h2><p class="sub">Monthly cost at each size, with today's growth and egress. Both axes are logarithmic.</p></div>
            <ul class="legend"><li class="k k-aws">AWS</li><li class="k k-gcp">Google Cloud</li><li class="k k-onprem">On-prem</li></ul>
          </div>
          <div class="chart" id="chart-breakeven"></div>
          <div class="formula" id="formula"></div>
        </section>

        <section id="timeline" class="sec card reveal">
          <div class="card-head">
            <div><h2>Over the horizon</h2><p class="sub" id="timeline-sub"></p></div>
            <ul class="legend"><li class="k k-aws">AWS</li><li class="k k-gcp">Google Cloud</li><li class="k k-onprem">On-prem</li><li class="k k-buy">Hardware bought</li></ul>
          </div>
          <div class="chart" id="chart-timeline"></div>
        </section>

        <section id="breakdown" class="sec card reveal">
          <div class="card-head"><div><h2>Where the money goes</h2><p class="sub" id="breakdown-sub"></p></div></div>
          <div id="breakdown-body" class="breakdown"></div>
        </section>

        <section id="sensitivity" class="sec card reveal">
          <div class="card-head"><div><h2>What moves the answer</h2><p class="sub" id="sens-sub"></p></div></div>
          <div id="tornado" class="tornado"></div>
        </section>

        <section id="calculators" class="sec card reveal">
          <div class="card-head"><div><h2>Checked against the official calculators</h2><p class="sub">The reference workload (500 PB, 50 compute servers) entered into the AWS and Google Cloud pricing calculators on 15 and 16 November 2026, next to this model at the same inputs. Monthly, list prices, no discount.</p></div></div>
          <div class="table-wrap"><table class="assume calc" id="calc"></table></div>
          <p class="note" id="calc-note"></p>
        </section>

        <section id="reality" class="sec card reveal">
          <div class="card-head"><div><h2>Did Dropbox's numbers make sense?</h2><p class="sub">The model at 500 PB, storage only, next to the S-1 filing (February 2018). Annual figures, $ millions.</p></div></div>
          <div id="reality-body" class="reality"></div>
        </section>

        <section id="assumptions" class="sec card reveal">
          <div class="card-head"><div><h2>Assumptions</h2><p class="sub">Every input, its value in this scenario, and where it comes from. H primary source · M secondary · L our estimate.</p></div></div>
          <div class="table-wrap"><table class="assume" id="assume"></table></div>
          <p class="note">Left out on purpose: metadata databases, support contracts, taxes, cost of capital, and the value of cloud elasticity. Compute is a fixed fleet of always-on servers, as the guide's example workload asks, not Dropbox's whole application tier. This is a storage-first model, not a full TCO.</p>
        </section>

        <footer class="foot"><span><b>Pocket Ledger</b> · IT457 case study, Dropbox Magic Pocket</span><span>Prices checked November 2026</span></footer>
      </main>

      <aside class="panel" id="panel" aria-label="Scenario inputs"></aside>
    </div>
  </div>
</div>`;

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector<T>(s)!;

mountControls($('#panel'));
const drawBreakEven = breakEvenChart($('#chart-breakeven'));
const drawTimeline = timelineChart($('#chart-timeline'));

function cloudName(s: Summary) { return s.cheapestCloud === 'aws' ? 'AWS' : 'Google Cloud'; }

function renderTicker(i: Inputs) {
  const p = prices(i);
  const items: [string, string][] = [
    ['S3 Standard', `$${p.aws.hotTiers[p.aws.hotTiers.length - 1].price}/GB`],
    ['GCS Standard', `$${p.gcp.hotTiers[0].price}/GiB`],
    ['S3 egress at scale', `$${p.aws.egressTiers[p.aws.egressTiers.length - 1].price}/GB`],
    [p.aws.computeType, `$${p.aws.computeHr}/h`],
    [p.gcp.computeType, `$${p.gcp.computeHr}/h`],
    [`${i.driveTB} TB drive`, `$${i.drivePerTB}/TB`],
    ['Colocation', `$${i.coloPerKW}/kW`],
    ['Engineer', `${money(i.salary)}/yr`],
  ];
  $('#ticker').innerHTML = items.map(([k, v]) => `<span class="tick"><span>${k}</span><b>${v}</b></span>`).join('');
}

function renderOverview(i: Inputs, s: Summary) {
  const best = s.cloud[s.cheapestCloud].total;
  const diff = best - s.onprem.total;
  $('#scenario-line').textContent = `${size(i.storedTB)} stored · +${num(i.growthPct, 1)}% a month · ${i.priceYear} list prices${i.discountPct ? ` less ${i.discountPct}%` : ''}`;
  $('#headline').innerHTML = s.breakEvenTB
    ? `Owning beats renting above <span class="hl">${size(s.breakEvenTB)}</span>.`
    : `Renting stays cheaper at every size up to 2 EB.`;
  $('#lede').textContent = diff > 0
    ? `This scenario stores ${size(i.storedTB)}, past the break-even point. Running your own storage costs ${money(s.onprem.total)} a month against ${money(best)} on ${cloudName(s)}: ${money(diff)} a month less.`
    : `This scenario stores ${size(i.storedTB)}, below the break-even point. ${cloudName(s)} costs ${money(best)} a month; building your own would cost ${money(s.onprem.total)}, mostly the team. Stay in the cloud.`;

  const save = s.horizon.saving;
  const own = s.onprem.total;
  const past = s.breakEvenTB ? i.storedTB / s.breakEvenTB : 0;
  const cloudSpend = s.rows.length ? s.rows[s.rows.length - 1][s.cheapestCloud === 'aws' ? 'awsCum' : 'gcpCum'] : 0;
  const st = $('#status');
  st.className = `status ${diff > 0 ? 'status-good' : 'status-bad'}`;
  st.textContent = diff > 0 ? 'Build your own' : 'Stay in the cloud';
  // meters: each one shows a real ratio from the model, labelled under the bar
  const kpis = [
    { label: 'Break-even size', ico: 'breakeven', value: s.breakEvenTB ? size(s.breakEvenTB) : 'Over 2 EB', sub: s.breakEvenTB ? (past >= 1 ? `you are ${num(past, past >= 10 ? 0 : 1)}× past it` : `you are at ${num(past * 100)}% of it`) : 'on-prem never catches up', tone: 'accent', meter: s.breakEvenTB ? Math.min(1, past) : 0 },
    { label: `${i.horizonMonths}-month saving`, ico: 'saving', value: money(save, { sign: true }), sub: cloudSpend ? `${num(Math.abs(save) / cloudSpend * 100)}% of ${cloudName(s)} spend` : `vs ${cloudName(s)}`, tone: save >= 0 ? 'good' : 'bad', meter: cloudSpend ? Math.min(1, Math.abs(save) / cloudSpend) : 0 },
    { label: 'Pays back', ico: 'payback', value: s.payback === null ? `After M${i.horizonMonths}` : `Month ${s.payback}`, sub: s.payback === null ? 'not within the horizon' : `of a ${i.horizonMonths}-month horizon`, tone: s.payback === null ? 'bad' : 'good', meter: s.payback === null ? 1 : s.payback / i.horizonMonths },
    { label: 'Monthly, today', ico: 'cloud', value: money(own), sub: `own, vs ${money(best)} to rent`, tone: 'neutral', meter: Math.min(1, own / Math.max(own, best)) },
  ];
  const SEG = 12;
  $('#kpis').innerHTML = kpis.map((k) => {
    const on = Math.round(k.meter * SEG);
    return `<article class="kpi kpi-${k.tone}">
      <div class="kpi-top"><span class="chip" aria-hidden="true">${icon(k.ico, 18)}</span><p class="kpi-label">${k.label}</p></div>
      <p class="kpi-value">${k.value}</p>
      <div class="meter" aria-hidden="true">${Array.from({ length: SEG }, (_, n) => `<span${n < on ? ' class="on"' : ''}></span>`).join('')}</div>
      <p class="kpi-sub">${k.sub}</p>
    </article>`;
  }).join('');
}

function renderFormula(i: Inputs, s: Summary) {
  // S* = (fixed own - fixed cloud) / (cloud $/TB - own $/TB), from a straight-line fit at scale
  const at = Math.max(1000, (s.breakEvenTB ?? 1000) * 4);
  const fit = linearFit(i, at);
  const net = fit.ownFixed - fit.cloudFixed;
  $('#formula').innerHTML = `
    <div class="f-eq"><span class="f-s">S*</span> = <span class="f-frac"><span>fixed cost of owning − fixed cost of renting</span><span>cloud $/TB − on-prem $/TB</span></span></div>
    <div class="f-nums">
      <div><p>Net fixed, per month</p><b>${money(net)}</b><small>staff, build team, compute: own ${money(fit.ownFixed)} vs cloud ${money(fit.cloudFixed)}</small></div>
      <div><p>Cloud, per TB-month</p><b>$${num(fit.cloudPerTB, 2)}</b><small>storage, egress, requests at scale</small></div>
      <div><p>On-prem, per TB-month</p><b>$${num(fit.ownPerTB, 2)}</b><small>drives, servers, power, space, staff growth</small></div>
      <div class="f-out"><p>Estimate</p><b>${fit.estimate && fit.estimate > 0 ? size(fit.estimate) : 'none'}</b><small>exact crossing: ${s.breakEvenTB ? size(s.breakEvenTB) : 'none'}</small></div>
    </div>`;
}

function renderBreakdown(i: Inputs, s: Summary) {
  const o = s.onprem;
  const options = [
    { name: 'AWS', total: s.cloud.aws.total, parts: [['Storage', s.cloud.aws.storage], ['Egress', s.cloud.aws.egress], ['Compute', s.cloud.aws.compute], ['Retrieval', s.cloud.aws.retrieval], ['Requests', s.cloud.aws.requests]], disc: s.cloud.aws.discount, accent: false },
    { name: 'Google Cloud', total: s.cloud.gcp.total, parts: [['Storage', s.cloud.gcp.storage], ['Egress', s.cloud.gcp.egress], ['Compute', s.cloud.gcp.compute], ['Retrieval', s.cloud.gcp.retrieval], ['Requests', s.cloud.gcp.requests]], disc: s.cloud.gcp.discount, accent: false },
    { name: 'On-prem', total: o.total, parts: [['Storage hardware', o.drives + o.servers + o.racks], ['Staff', o.staff], ['Build team', o.build], ['Space and power', o.colocation + o.energy], ['Compute servers', o.compute], ['Drive swaps', o.replacement], ['Bandwidth', o.bandwidth]], disc: 0, accent: true },
  ] as const;
  const max = Math.max(...options.map((x) => x.total));
  const CELLS = 40;
  $('#breakdown-sub').textContent = `Monthly cost at ${size(i.storedTB)}. Bars share one scale, so their lengths compare directly.`;
  $('#breakdown-body').innerHTML = options.map((opt) => {
    const scale = opt.disc ? 1 - i.discountPct / 100 : 1;
    const parts = opt.parts.map(([k, v]) => [k, v * scale] as [string, number]).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const filled = Math.max(1, Math.round((opt.total / max) * CELLS));
    let acc = 0;
    const bounds = parts.map(([, v]) => (acc += v / opt.total));
    const ramp = (k: number) => (opt.accent && k === 0 ? 'var(--ramp-1)' : `var(--ramp-${Math.min(6, k + 2)})`);
    const cells = Array.from({ length: CELLS }, (_, c) => {
      if (c >= filled) return '<span class="cell"></span>';
      const pos = (c + 0.5) / filled;
      const k = bounds.findIndex((b) => pos <= b + 1e-9);
      return `<span class="cell on" style="--c:${ramp(Math.max(0, k))}"></span>`;
    }).join('');
    return `<div class="bd-row">
      <div class="bd-head"><b>${opt.name}</b><span>${money(opt.total)}<small>/mo</small></span></div>
      <div class="cells" role="img" aria-label="${opt.name}: ${parts.map(([k, v]) => `${k} ${money(v)}`).join(', ')}">${cells}</div>
      <ul class="bd-legend">${parts.map(([k, v], n) => `<li><span class="sw" style="--c:${ramp(n)}"></span>${k}<b>${money(v)}</b><small>${num((v / opt.total) * 100)}%</small></li>`).join('')}</ul>
    </div>`;
  }).join('');
}

function renderSensitivity(i: Inputs, s: Summary) {
  const rows = sensitivity(i);
  $('#sens-sub').textContent = `Each input moved alone from a low to a high value. Bars show the ${i.horizonMonths}-month saving (on-prem vs the cheaper cloud). Largest effect first.`;
  renderTornado($('#tornado'), rows, s.horizon.saving);
}

// Official calculator results, reference workload at month 0 (docs/Week3/calculators/)
type CalcLine = 'storage' | 'requests' | 'retrieval' | 'egress' | 'compute';
const CALC: Record<'aws' | 'gcp', Record<CalcLine, number>> = {
  aws: { storage: 3_150_563.2 + 2_500_000 + 600_000, requests: 135_000, retrieval: 17_142.86 + 38_571.42, egress: 515_891.2, compute: 52_122 },
  // Google caps operations at 10,000 million per line; requests use the full 15,000 + 150,000 million at the same rates
  gcp: { storage: 2_793_967.62 + 1_862_645.15 + 558_793.54, requests: 135_000, retrieval: 15_965.16 + 23_948.26, egress: 745_379.72, compute: 43_827.81 },
};

function renderCalculators() {
  const ref = { ...DEFAULTS };
  const ps = prices(ref);
  const m = { aws: cloudBill(ref.storedTB, ref, ps.aws), gcp: cloudBill(ref.storedTB, ref, ps.gcp) };
  const rows: [string, CalcLine][] = [['Storage', 'storage'], ['Requests', 'requests'], ['Retrieval', 'retrieval'], ['Egress, 10 PB a month', 'egress'], ['Compute, 50 servers', 'compute']];
  const tot = (o: Record<CalcLine, number>) => rows.reduce((acc, [, k]) => acc + o[k], 0);
  const gap = (calc: number, model: number) => {
    const raw = (model / calc - 1) * 100;
    const d = Math.abs(raw) < 0.05 ? 0 : raw;
    return `<span class="${Math.abs(d) < 1 ? 'gap-ok' : 'gap-warn'}">${d >= 0 ? '+' : '−'}${num(Math.abs(d), 1)}%</span>`;
  };
  const cells = (calc: number, model: number) => `<td class="mono">${money(calc)}</td><td class="mono">${money(model)}</td><td class="mono">${gap(calc, model)}</td>`;
  $('#calc').innerHTML = `<thead><tr><th scope="col" rowspan="2">Line</th><th scope="colgroup" colspan="3">AWS, us-east-1</th><th scope="colgroup" colspan="3">Google Cloud, us-central1</th></tr>
    <tr><th scope="col">Calculator</th><th scope="col">Model</th><th scope="col">Gap</th><th scope="col">Calculator</th><th scope="col">Model</th><th scope="col">Gap</th></tr></thead>
    <tbody>${rows.map(([label, k]) => `<tr><td>${label}</td>${cells(CALC.aws[k], m.aws[k])}${cells(CALC.gcp[k], m.gcp[k])}</tr>`).join('')}
    <tr class="tot"><td>Total per month</td>${cells(tot(CALC.aws), tot(m.aws))}${cells(tot(CALC.gcp), tot(m.gcp))}</tr></tbody>`;
  $('#calc-note').innerHTML = `Two unit details matter at this scale. Google bills per GiB (2<sup>30</sup> bytes), so 500 PB is 465.7 million GiB, and the AWS calculator converts transfer at 1 TB = 1,024 GB. The model follows each provider's billing unit. Google's calculator caps operations at 10 billion per line, so its request line is the full volume at the calculator's rates. Screenshots and every line item: <a href="${REPO}/calculators/README.md" target="_blank" rel="noopener">docs/Week3/calculators</a>.`;
}

function renderReality(i: Inputs) {
  const runs = [
    // storage only: the S-1 lines are about where the files live
    { label: 'Model, 2015-era prices', inp: { ...withPreset('dropbox2015'), discountPct: i.discountPct, computeServers: 0 } },
    { label: 'Model, 2026 prices', inp: { ...withPreset('reference'), discountPct: i.discountPct, computeServers: 0 } },
  ].map((r) => {
    const s = summarise(r.inp);
    return { label: r.label, cloud: (s.cloud.aws.total * 12) / 1e6, own: (s.onprem.total * 12) / 1e6 };
  });
  const rows = [
    { k: 'Cloud spend avoided', s1: S1.cloudCut2016, m: runs.map((r) => r.cloud), note: 'S-1: drop in third-party datacenter spend, 2016' },
    { k: 'Own infrastructure added', s1: S1.ownDcAdded2016, m: runs.map((r) => r.own), note: 'S-1: rise in depreciation, facilities, support' },
    { k: 'Net saving', s1: S1.net2016, m: runs.map((r) => r.cloud - r.own), note: 'S-1: net fall in infrastructure cost, 2016' },
  ];
  const max = Math.max(...rows.flatMap((r) => [r.s1, ...r.m]));
  const bar = (v: number, cls: string) => `<span class="rbar ${cls}" style="--w:${(Math.max(0, v) / max) * 100}%"></span><b>$${num(v, 1)}M</b>`;
  $('#reality-body').innerHTML = `
    <div class="r-legend"><span class="k k-s1">Dropbox S-1</span><span class="k k-m15">${runs[0].label}</span><span class="k k-m26">${runs[1].label}</span></div>
    ${rows.map((r) => `<div class="r-row"><div class="r-k"><b>${r.k}</b><small>${r.note}</small></div>
      <div class="r-bars"><div>${bar(r.s1, 's1')}</div><div>${bar(r.m[0], 'm15')}</div><div>${bar(r.m[1], 'm26')}</div></div></div>`).join('')}
    <div class="r-read">
      <p><b>Cloud side.</b> At 2015 list prices the model puts S3 for 500 PB at $${num(runs[0].cloud, 0)}M a year; the S-1 reports a $${S1.cloudCut2016}M drop in cloud spend. Close, though Dropbox moved about 90% of data, not all, and paid negotiated rates.</p>
      <p><b>Own side.</b> The model's $${num(runs[0].own, 0)}M is below the S-1's $${S1.ownDcAdded2016}M because the filing's line also covers compute, networking and facilities, and 2016 was a transition year with data held in both places.</p>
      <p><b>So.</b> The orders of magnitude agree. The model does not claim to reproduce Dropbox's books, only to show that the decision was sound at their scale.</p>
    </div>`;
}

const CALCS = `${REPO}/calculators/README.md`;
const ASSUME: { k: keyof Inputs | null; label: string; fmt?: (i: Inputs) => string; conf: 'H' | 'M' | 'L'; src: string; href?: string }[] = [
  { k: null, label: 'S3 Standard over 500 TB', fmt: (i) => `$${prices(i).aws.hotTiers.at(-1)!.price}/GB-mo`, conf: 'H', src: 'AWS Pricing Calculator, Nov 2026', href: CALCS },
  { k: null, label: 'S3 Standard-IA / Glacier IR', fmt: (i) => `$${prices(i).aws.warm} / $${prices(i).aws.cold}`, conf: 'H', src: 'AWS Pricing Calculator, Nov 2026', href: CALCS },
  { k: null, label: 'S3 egress over 150 TB', fmt: (i) => `$${prices(i).aws.egressTiers.at(-1)!.price}/GB`, conf: 'H', src: 'AWS Pricing Calculator, Nov 2026', href: CALCS },
  { k: null, label: 'GCS Standard / Nearline / Coldline', fmt: (i) => `$${prices(i).gcp.hotTiers[0].price} / $${prices(i).gcp.warm} / $${prices(i).gcp.cold} per GiB`, conf: 'H', src: 'Google Cloud calculator, Nov 2026', href: CALCS },
  { k: null, label: 'GCS egress at scale', fmt: (i) => `$${prices(i).gcp.egressTiers.at(-1)!.price}/GiB`, conf: 'H', src: 'Google Cloud calculator, Nov 2026', href: CALCS },
  { k: null, label: 'Cloud compute, 32 vCPU', fmt: (i) => `$${prices(i).aws.computeHr}/h AWS · $${prices(i).gcp.computeHr}/h GCP`, conf: 'H', src: 'Both calculators, on-demand Linux', href: CALCS },
  { k: 'computeServerCost', label: 'Bought compute server', fmt: (i) => `${money(i.computeServerCost)} · ${i.computeWatts} W`, conf: 'L', src: 'our estimate (2 × 16-core, 64 GB, 1U)' },
  { k: 'drivePerTB', label: 'Drive price', fmt: (i) => `$${i.drivePerTB}/TB`, conf: 'M', src: 'HDDHunt, Aug–Nov 2026', href: 'https://hddhunt.com/blog/hdd-price-per-tb-august-2026/' },
  { k: 'afrPct', label: 'Drive annual failure rate', fmt: (i) => `${i.afrPct}%`, conf: 'H', src: 'Backblaze Q1 2026' },
  { k: 'drivesPerServer', label: 'Drives per server', fmt: (i) => `${i.drivesPerServer}`, conf: 'H', src: 'InfoQ, Magic Pocket talk 2023' },
  { k: 'wattsPerTB', label: 'Drive power', fmt: (i) => `${i.wattsPerTB} W/TB`, conf: 'H', src: 'Dropbox, four years of SMR (2023)' },
  { k: 'redundancy', label: 'Redundancy factor', fmt: (i) => `${i.redundancy}×`, conf: 'M', src: 'Inside the Magic Pocket; cold storage post' },
  { k: 'coloPerKW', label: 'Colocation', fmt: (i) => `$${i.coloPerKW}/kW-mo`, conf: 'M', src: 'CBRE via MetroColo, 2026', href: 'https://metrocoloadvisory.com/colocation-pricing-guide/' },
  { k: 'serverCost', label: 'Server without drives', fmt: (i) => money(i.serverCost), conf: 'L', src: 'our estimate' },
  { k: 'kWhPrice', label: 'Electricity', fmt: (i) => `$${i.kWhPrice}/kWh`, conf: 'L', src: 'our estimate' },
  { k: 'salary', label: 'Loaded salary', fmt: (i) => money(i.salary), conf: 'L', src: 'our estimate' },
  { k: 'buildEngineers', label: 'Build team', fmt: (i) => `${i.buildEngineers} × ${i.buildYears} yr`, conf: 'M', src: 'Wired 2016; dropbox.tech' },
  { k: 'growthPct', label: 'Growth', fmt: (i) => `${i.growthPct}%/mo`, conf: 'M', src: 'Week 2 report' },
  { k: 'egressPct', label: 'Read out per month', fmt: (i) => `${i.egressPct}%`, conf: 'L', src: 'our estimate' },
];

function renderAssumptions(i: Inputs) {
  $('#assume').innerHTML = `<thead><tr><th scope="col">Input</th><th scope="col">Value</th><th scope="col">Conf.</th><th scope="col">Source</th></tr></thead>
    <tbody>${ASSUME.map((a) => `<tr><td>${a.label}</td><td class="mono">${a.fmt ? a.fmt(i) : ''}</td><td><span class="conf conf-${a.conf}">${a.conf}</span></td><td>${a.href ? `<a href="${a.href}" target="_blank" rel="noopener">${a.src}</a>` : a.src}</td></tr>`).join('')}</tbody>`;
}

let raf = 0;
function render(i: Inputs) {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const s = summarise(i);
    renderTicker(i);
    renderOverview(i, s);
    drawBreakEven(scaleCurve(i), s.breakEvenTB, i.storedTB);
    renderFormula(i, s);
    $('#timeline-sub').textContent = `Cash spent, month by month, as data grows ${num(i.growthPct, 1)}% a month. On-prem starts with the build team (${money(buildCost(i))}) and buys hardware ${i.leadMonths} months ahead of need.`;
    drawTimeline(s.rows, s.payback, buildCost(i));
    renderBreakdown(i, s);
    renderSensitivity(i, s);
    renderReality(i);
    renderCalculators();
    renderAssumptions(i);
  });
}

state.subscribe(render);
render(state.get());

// scroll-spy for the rail
const links = document.querySelectorAll<HTMLAnchorElement>('[data-nav]');
const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) links.forEach((l) => (l.dataset.nav === e.target.id ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
  });
}, { rootMargin: '-35% 0px -60% 0px' });
document.querySelectorAll('.sec').forEach((s) => spy.observe(s));

// light / dark toggle; follows the system until the viewer picks one
const themeBtn = $('#theme-btn');
const isDark = () => document.documentElement.dataset.theme
  ? document.documentElement.dataset.theme === 'dark'
  : matchMedia('(prefers-color-scheme: dark)').matches;
const paintThemeBtn = () => { themeBtn.querySelector('span')!.textContent = isDark() ? 'Light theme' : 'Dark theme'; };
try { const t = localStorage.getItem('pl-theme'); if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t; } catch { /* storage blocked */ }
paintThemeBtn();
themeBtn.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('pl-theme', next); } catch { /* storage blocked */ }
  paintThemeBtn();
  render(state.get()); // charts read colours at draw time
});

// staggered first reveal
document.documentElement.classList.add('ready');
