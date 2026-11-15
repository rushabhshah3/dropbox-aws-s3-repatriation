// Cumulative cash spent over the horizon, with hardware purchases and the payback month.
import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { pointer } from 'd3-selection';
import { MonthRow } from '../../engine/model';
import { money, size } from '../format';
import { drawIn, responsive, tooltip } from './frame';

export function timelineChart(container: HTMLElement) {
  let rows: MonthRow[] = [];
  let payback: number | null = null;
  let startCost = 0;
  const tip = tooltip(container);

  const redraw = responsive(container, 300, ({ svg, w, h, m }, first) => {
    if (!rows.length) return;
    const n = rows.length;
    const x = scaleLinear().domain([-1, n - 1]).range([m.l, w - m.r]);
    const max = Math.max(...rows.map((r) => Math.max(r.awsCum, r.gcpCum, r.onpremCum)));
    const y = scaleLinear().domain([0, max]).nice().range([h - m.b, m.t]);

    svg.attr('aria-label', `Cumulative spend over ${n} months. ${payback === null ? 'Owning does not pay back within the horizon.' : `Owning pays back in month ${payback}.`}`);

    svg.append('g').attr('class', 'axis axis-y').attr('transform', `translate(${m.l},0)`)
      .call(axisLeft(y).ticks(5).tickFormat((v) => money(v as number)).tickSize(-(w - m.l - m.r)) as never);
    const step = n > 24 ? 6 : 3;
    svg.append('g').attr('class', 'axis axis-x').attr('transform', `translate(0,${h - m.b})`)
      .call(axisBottom(x).tickValues(rows.filter((r) => r.month % step === 0).map((r) => r.month)).tickFormat((v) => `M${v}`) as never);

    // hardware purchases as small bars on the baseline
    const maxBuy = Math.sqrt(Math.max(1, ...rows.map((r) => r.hardwareBought)));
    svg.append('g').attr('class', 'buys').selectAll('rect').data(rows.filter((r) => r.hardwareBought > 0)).join('rect')
      .attr('x', (r) => x(r.month) - 2).attr('width', 4)
      .attr('y', (r) => h - m.b - Math.max(2, (Math.sqrt(r.hardwareBought) / maxBuy) * 26)).attr('height', (r) => Math.max(2, (Math.sqrt(r.hardwareBought) / maxBuy) * 26));

    type P = { month: number; v: number };
    const mk = (k: 'awsCum' | 'gcpCum' | 'onpremCum', start: number): P[] => [{ month: -1, v: start }, ...rows.map((r) => ({ month: r.month, v: r[k] }))];
    const gen = line<P>().x((d) => x(d.month)).y((d) => y(d.v));
    const series: { pts: P[]; cls: string }[] = [
      { pts: mk('gcpCum', 0), cls: 'line line-gcp' },
      { pts: mk('awsCum', 0), cls: 'line line-aws' },
      { pts: mk('onpremCum', startCost), cls: 'line line-onprem' },
    ];
    series.forEach((s, k) => drawIn(svg.append('path').datum(s.pts).attr('class', s.cls).attr('d', gen(s.pts)).node(), first, k * 120));

    if (payback !== null) {
      const r = rows[payback];
      svg.append('line').attr('class', 'marker-breakeven').attr('x1', x(payback)).attr('x2', x(payback)).attr('y1', y(r.onpremCum)).attr('y2', h - m.b);
      svg.append('circle').attr('class', 'dot-breakeven').attr('cx', x(payback)).attr('cy', y(r.onpremCum)).attr('r', 5);
      const right = x(payback) > w * 0.7;
      svg.append('text').attr('class', 'label-breakeven label-halo').attr('x', x(payback) + (right ? -10 : 10)).attr('y', y(r.onpremCum) + 22)
        .attr('text-anchor', right ? 'end' : 'start')
        .text(`Pays back · month ${payback}`);
    }

    const guide = svg.append('line').attr('class', 'guide').attr('y1', m.t).attr('y2', h - m.b).style('opacity', 0);
    svg.append('rect').attr('class', 'hit').attr('x', m.l).attr('y', m.t).attr('width', w - m.l - m.r).attr('height', h - m.b - m.t)
      .on('pointermove', (ev: PointerEvent) => {
        const [px] = pointer(ev);
        const mth = Math.max(0, Math.min(n - 1, Math.round(x.invert(px))));
        const r = rows[mth];
        guide.attr('x1', x(mth)).attr('x2', x(mth)).style('opacity', 1);
        tip.show(x(mth), `<b>Month ${mth} · ${size(r.tb)}</b>
          <span class="k k-aws">AWS S3</span><span>${money(r.awsCum)}</span>
          <span class="k k-gcp">Google Cloud</span><span>${money(r.gcpCum)}</span>
          <span class="k k-onprem">On-prem</span><span>${money(r.onpremCum)}</span>
          ${r.hardwareBought ? `<em>Hardware bought this month: ${money(r.hardwareBought)}</em>` : ''}`);
      })
      .on('pointerleave', () => { guide.style('opacity', 0); tip.hide(); });
  });

  return (r: MonthRow[], pb: number | null, start: number) => { rows = r; payback = pb; startCost = start; redraw(); };
}
