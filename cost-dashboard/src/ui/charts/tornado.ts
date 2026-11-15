// One-at-a-time sensitivity of the horizon saving, as a tornado.
// Columns: label | value when saving falls | bar | axis | bar | value when saving rises
import { SensitivityRow } from '../../engine/model';
import { money, num } from '../format';

const fmtVal = (r: SensitivityRow, v: number) => {
  if (r.key === 'drivePerTB' || r.key === 'coloPerKW') return `$${v}`;
  if (r.key === 'redundancy') return `${num(v, 1)}×`;
  if (r.key === 'pbPerFTE') return `${v} PB`;
  if (r.key === 'computeServers') return `${v} srv`;
  return `${num(v, 1).replace(/\.0$/, '')}%`;
};

export function renderTornado(root: HTMLElement, rows: SensitivityRow[], base: number) {
  // floor the scale at a quarter of the base so tiny changes do not look dramatic
  const max = Math.max(1, Math.abs(base) * 0.25, ...rows.flatMap((r) => [Math.abs(r.lowSaving - base), Math.abs(r.highSaving - base)]));
  root.innerHTML = `
    <div class="tornado-head">
      <span>Assumption</span>
      <span class="t-right">Saving falls</span>
      <span class="t-center">Base saving <b>${money(base)}</b></span>
      <span>Saving rises</span>
    </div>
    ${rows.map((r) => {
      const lo = r.lowSaving - base, hi = r.highSaving - base;
      const downAt = lo <= hi ? r.low : r.high;   // input value that lowers the saving
      const upAt = lo <= hi ? r.high : r.low;
      const down = Math.min(lo, hi), up = Math.max(lo, hi);
      const negW = (Math.abs(Math.min(0, down)) / max) * 100;
      const posW = (Math.max(0, up) / max) * 100;
      return `<div class="tornado-row" role="img" aria-label="${r.label}: ${fmtVal(r, downAt)} gives ${money(base + Math.min(0, down))}, ${fmtVal(r, upAt)} gives ${money(base + Math.max(0, up))}">
        <span class="tornado-label">${r.label}</span>
        <span class="t-val t-right">${negW > 0 ? `<span>${fmtVal(r, downAt)}</span><b>${money(base + down)}</b>` : ''}</span>
        <span class="tornado-side tornado-neg"><span class="bar" style="--w:${negW}%"></span></span>
        <span class="tornado-axis" aria-hidden="true"></span>
        <span class="tornado-side tornado-pos"><span class="bar" style="--w:${posW}%"></span></span>
        <span class="t-val">${posW > 0 ? `<b>${money(base + up)}</b><span>${fmtVal(r, upAt)}</span>` : ''}</span>
      </div>`;
    }).join('')}`;
}
