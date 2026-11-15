// Rent vs buy: monthly cost against data stored, log-log, with the crossing marked.
import { scaleLog } from 'd3-scale';
import { line } from 'd3-shape';
import { axisBottom, axisLeft } from 'd3-axis';
import { bisector } from 'd3-array';
import { pointer } from 'd3-selection';
import { ScalePoint } from '../../engine/model';
import { money, size } from '../format';
import { drawIn, responsive, tooltip } from './frame';

export function breakEvenChart(container: HTMLElement) {
  let data: ScalePoint[] = [];
  let breakEven: number | null = null;
  let current = 0;
  const tip = tooltip(container);

  const redraw = responsive(container, 340, ({ svg, w, h, m }, first) => {
    if (!data.length) return;
    const x = scaleLog().domain([data[0].tb, data[data.length - 1].tb]).range([m.l, w - m.r]);
    const ys = data.flatMap((d) => [d.aws, d.gcp, d.onprem]).filter((v) => v > 0);
    const y = scaleLog().domain([Math.max(10, Math.min(...ys)), Math.max(...ys)]).nice().range([h - m.b, m.t]);

    svg.attr('aria-label', `Monthly cost by data stored. On-prem becomes cheaper above ${breakEven ? size(breakEven) : 'the range shown'}.`);

    const yAxis = axisLeft(y).ticks(5, (v: number) => money(v)).tickSize(-(w - m.l - m.r));
    svg.append('g').attr('class', 'axis axis-y').attr('transform', `translate(${m.l},0)`).call(yAxis as never);
    const xTicks = [1, 10, 100, 1e3, 1e4, 1e5, 1e6].filter((t) => t >= x.domain()[0] && t <= x.domain()[1]);
    svg.append('g').attr('class', 'axis axis-x').attr('transform', `translate(0,${h - m.b})`)
      .call(axisBottom(x).tickValues(xTicks).tickFormat((v) => size(v as number)) as never);

    // shaded region where owning wins
    if (breakEven) {
      svg.append('rect').attr('class', 'win-zone')
        .attr('x', x(breakEven)).attr('y', m.t).attr('width', w - m.r - x(breakEven)).attr('height', h - m.b - m.t);
    }

    const series: { key: keyof ScalePoint; cls: string }[] = [
      { key: 'gcp', cls: 'line line-gcp' },
      { key: 'aws', cls: 'line line-aws' },
      { key: 'onprem', cls: 'line line-onprem' },
    ];
    series.forEach((s, k) => {
      const p = svg.append('path').datum(data).attr('class', s.cls)
        .attr('d', line<ScalePoint>().x((d) => x(d.tb)).y((d) => y(Math.max(y.domain()[0], d[s.key] as number)))(data));
      drawIn(p.node(), first, k * 120);
    });

    // you are here
    if (current >= x.domain()[0] && current <= x.domain()[1]) {
      svg.append('line').attr('class', 'marker-current').attr('x1', x(current)).attr('x2', x(current)).attr('y1', m.t).attr('y2', h - m.b);
      svg.append('text').attr('class', 'marker-label').attr('x', x(current) + 6).attr('y', m.t + 12)
        .attr('text-anchor', x(current) > w - 120 ? 'end' : 'start').attr('dx', x(current) > w - 120 ? -12 : 0)
        .text(`You · ${size(current)}`);
    }

    if (breakEven) {
      const i = bisector((d: ScalePoint) => d.tb).left(data, breakEven);
      const d = data[Math.min(i, data.length - 1)];
      const cy = y(Math.max(y.domain()[0], d.onprem));
      svg.append('line').attr('class', 'marker-breakeven').attr('x1', x(breakEven)).attr('x2', x(breakEven)).attr('y1', cy).attr('y2', h - m.b);
      svg.append('circle').attr('class', 'dot-breakeven').attr('cx', x(breakEven)).attr('cy', cy).attr('r', 5);
      svg.append('text').attr('class', 'label-breakeven').attr('x', x(breakEven) - 8).attr('y', cy - 12).attr('text-anchor', 'end')
        .text(`Break-even ${size(breakEven)}`);
    }

    // hover crosshair
    const guide = svg.append('line').attr('class', 'guide').attr('y1', m.t).attr('y2', h - m.b).style('opacity', 0);
    svg.append('rect').attr('class', 'hit').attr('x', m.l).attr('y', m.t).attr('width', w - m.l - m.r).attr('height', h - m.b - m.t)
      .on('pointermove', (ev: PointerEvent) => {
        const [px] = pointer(ev);
        const tb = x.invert(px);
        const i = Math.min(data.length - 1, bisector((d: ScalePoint) => d.tb).left(data, tb));
        const d = data[i];
        guide.attr('x1', x(d.tb)).attr('x2', x(d.tb)).style('opacity', 1);
        const best = Math.min(d.aws, d.gcp);
        tip.show(x(d.tb), `<b>${size(d.tb)} stored</b>
          <span class="k k-aws">AWS</span><span>${money(d.aws)}/mo</span>
          <span class="k k-gcp">Google Cloud</span><span>${money(d.gcp)}/mo</span>
          <span class="k k-onprem">On-prem</span><span>${money(d.onprem)}/mo</span>
          <em>${d.onprem < best ? `Owning saves ${money(best - d.onprem)}/mo` : `Renting saves ${money(d.onprem - best)}/mo`}</em>`);
      })
      .on('pointerleave', () => { guide.style('opacity', 0); tip.hide(); });
  });

  return (d: ScalePoint[], be: number | null, cur: number) => { data = d; breakEven = be; current = cur; redraw(); };
}
