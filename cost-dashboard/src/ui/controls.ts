// Scenario panel: presets plus grouped inputs. Every number on the page is driven from here.
import { Inputs, PRESETS } from '../engine/inputs';
import * as state from './state';
import { el, money, num, size } from './format';

type Ctl =
  | { kind: 'range'; key: keyof Inputs; label: string; min: number; max: number; step: number; fmt: (v: number) => string; log?: boolean; hint?: string }
  | { kind: 'toggle'; key: keyof Inputs; label: string; on: string; off: string; hint?: string }
  | { kind: 'choice'; key: keyof Inputs; label: string; options: { value: string; label: string }[] };

const pctFmt = (d = 0) => (v: number) => `${num(v, d)}%`;

const GROUPS: { title: string; open: boolean; ctls: Ctl[] }[] = [
  {
    title: 'Workload',
    open: true,
    ctls: [
      { kind: 'range', key: 'storedTB', label: 'Data stored', min: 1, max: 2_000_000, step: 0.01, fmt: size, log: true },
      { kind: 'range', key: 'growthPct', label: 'Growth per month', min: 0, max: 8, step: 0.5, fmt: pctFmt(1) },
      { kind: 'range', key: 'egressPct', label: 'Read out per month', min: 0, max: 10, step: 0.5, fmt: pctFmt(1), hint: 'Share of stored data leaving to users each month (egress).' },
      { kind: 'range', key: 'hotPct', label: 'Hot data', min: 0, max: 100, step: 5, fmt: pctFmt() },
      { kind: 'range', key: 'warmPct', label: 'Warm data', min: 0, max: 100, step: 5, fmt: pctFmt(), hint: 'Cold data is whatever is left.' },
    ],
  },
  {
    title: 'Cloud',
    open: true,
    ctls: [
      { kind: 'range', key: 'discountPct', label: 'Negotiated discount', min: 0, max: 50, step: 1, fmt: pctFmt(), hint: 'Private enterprise discounts. Dropbox never paid list price.' },
      { kind: 'choice', key: 'priceYear', label: 'Price list', options: [{ value: '2026', label: '2026' }, { value: '2015', label: '2015 (approx.)' }] },
    ],
  },
  {
    title: 'On-prem hardware',
    open: false,
    ctls: [
      { kind: 'range', key: 'redundancy', label: 'Redundancy factor', min: 1.2, max: 4, step: 0.1, fmt: (v) => `${num(v, 1)}×`, hint: 'Raw bytes per usable byte: zone copies plus erasure coding.' },
      { kind: 'range', key: 'fillPct', label: 'Disk fill target', min: 50, max: 95, step: 5, fmt: pctFmt() },
      { kind: 'range', key: 'driveTB', label: 'Drive size', min: 4, max: 32, step: 4, fmt: (v) => `${v} TB` },
      { kind: 'range', key: 'drivePerTB', label: 'Drive price', min: 15, max: 80, step: 1, fmt: (v) => `$${v}/TB` },
      { kind: 'range', key: 'serverCost', label: 'Server, without drives', min: 4000, max: 30000, step: 500, fmt: (v) => money(v) },
      { kind: 'range', key: 'amortYears', label: 'Hardware life', min: 3, max: 6, step: 1, fmt: (v) => `${v} years` },
    ],
  },
  {
    title: 'Facilities and people',
    open: false,
    ctls: [
      { kind: 'range', key: 'coloPerKW', label: 'Colocation', min: 100, max: 400, step: 10, fmt: (v) => `$${v}/kW` },
      { kind: 'range', key: 'kWhPrice', label: 'Electricity', min: 0.04, max: 0.3, step: 0.01, fmt: (v) => `$${num(v, 2)}/kWh` },
      { kind: 'range', key: 'baseFTE', label: 'Base ops team', min: 1, max: 20, step: 1, fmt: (v) => `${v} FTE` },
      { kind: 'range', key: 'pbPerFTE', label: 'Raw PB per engineer', min: 20, max: 400, step: 10, fmt: (v) => `${v} PB` },
      { kind: 'range', key: 'salary', label: 'Loaded salary', min: 80000, max: 400000, step: 10000, fmt: (v) => money(v) },
      { kind: 'range', key: 'buildEngineers', label: 'Build team', min: 0, max: 40, step: 1, fmt: (v) => `${v} engineers` },
      { kind: 'toggle', key: 'migrationWaived', label: 'Exit egress', on: 'Waived', off: 'Charged', hint: 'AWS waives data-transfer-out for customers leaving (since 2024).' },
    ],
  },
];

const toSlider = (c: Extract<Ctl, { kind: 'range' }>, v: number) => (c.log ? Math.log10(v) : v);
const fromSlider = (c: Extract<Ctl, { kind: 'range' }>, s: number) => {
  if (!c.log) return s;
  const v = 10 ** s;
  // snap to 2 significant figures so the URL stays readable
  const p = 10 ** (Math.floor(Math.log10(v)) - 1);
  return Math.round(v / p) * p;
};

export function mountControls(root: HTMLElement) {
  root.innerHTML = '';
  root.append(el('h2', { class: 'panel-title' }, 'Scenario'));

  const presets = el('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Preset scenarios' });
  for (const p of PRESETS) {
    const b = el('button', { type: 'button', role: 'radio', 'data-preset': p.id }, `<span>${p.label}</span><small>${p.note}</small>`);
    b.addEventListener('click', () => state.applyPreset(p.id));
    presets.append(b);
  }
  root.append(presets);

  const updaters: ((i: Inputs) => void)[] = [];

  for (const g of GROUPS) {
    const d = el('details', { class: 'group' });
    if (g.open) d.open = true;
    d.append(el('summary', {}, `<span>${g.title}</span>`));
    const body = el('div', { class: 'group-body' });
    for (const c of g.ctls) {
      const row = el('div', { class: 'ctl' });
      const id = `ctl-${c.key}`;
      if (c.kind === 'range') {
        const out = el('output', { for: id, class: 'ctl-value' });
        const head = el('div', { class: 'ctl-head' });
        head.append(el('label', { for: id }, c.label), out);
        const input = el('input', {
          type: 'range', id,
          min: String(toSlider(c, c.min)), max: String(toSlider(c, c.max)),
          step: String(c.log ? 0.01 : c.step),
        }) as HTMLInputElement;
        input.addEventListener('input', () => state.set({ [c.key]: fromSlider(c, Number(input.value)) } as Partial<Inputs>));
        row.append(head, input);
        if (c.hint) row.append(el('p', { class: 'ctl-hint' }, c.hint));
        updaters.push((i) => {
          const v = i[c.key] as number;
          out.textContent = c.fmt(v);
          if (document.activeElement !== input) input.value = String(toSlider(c, v));
          const frac = (toSlider(c, v) - toSlider(c, c.min)) / (toSlider(c, c.max) - toSlider(c, c.min));
          input.style.setProperty('--fill', `${Math.max(0, Math.min(1, frac)) * 100}%`);
        });
      } else if (c.kind === 'toggle') {
        const btn = el('button', { type: 'button', class: 'switch', role: 'switch', id }) as HTMLButtonElement;
        const head = el('div', { class: 'ctl-head' });
        head.append(el('label', { for: id }, c.label), btn);
        btn.addEventListener('click', () => state.set({ [c.key]: !state.get()[c.key] } as Partial<Inputs>));
        row.append(head);
        if (c.hint) row.append(el('p', { class: 'ctl-hint' }, c.hint));
        updaters.push((i) => {
          const on = Boolean(i[c.key]);
          btn.setAttribute('aria-checked', String(on));
          btn.innerHTML = `<span class="switch-track"><span class="switch-thumb"></span></span><span>${on ? c.on : c.off}</span>`;
        });
      } else {
        const wrap = el('div', { class: 'seg seg-sm', role: 'radiogroup', 'aria-label': c.label });
        const head = el('div', { class: 'ctl-head' });
        head.append(el('span', { class: 'ctl-label' }, c.label));
        for (const o of c.options) {
          const b = el('button', { type: 'button', role: 'radio', 'data-v': o.value }, `<span>${o.label}</span>`);
          b.addEventListener('click', () => state.set({ [c.key]: o.value } as Partial<Inputs>));
          wrap.append(b);
        }
        row.append(head, wrap);
        updaters.push((i) => wrap.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === i[c.key]))));
      }
      body.append(row);
    }
    d.append(body);
    root.append(d);
  }

  const actions = el('div', { class: 'panel-actions' });
  const share = el('button', { type: 'button', class: 'btn btn-primary' }, 'Copy scenario link');
  share.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      share.textContent = 'Link copied';
      share.dataset.state = 'success';
    } catch {
      share.textContent = 'Copy failed: use the address bar';
      share.dataset.state = 'error';
    }
    setTimeout(() => { share.textContent = 'Copy scenario link'; delete share.dataset.state; }, 1800);
  });
  const reset = el('button', { type: 'button', class: 'btn btn-ghost' }, 'Reset to sources');
  reset.addEventListener('click', () => state.reset());
  actions.append(share, reset);
  root.append(actions);

  const update = (i: Inputs) => {
    const pid = state.activePreset();
    presets.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.preset === pid)));
    updaters.forEach((u) => u(i));
  };
  state.subscribe(update);
  update(state.get());
}
