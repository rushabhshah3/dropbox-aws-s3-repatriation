// Shared chart scaffolding: responsive SVG, hover crosshair, first-draw line animation.
import { select, Selection } from 'd3-selection';

export type SVG = Selection<SVGSVGElement, unknown, null, undefined>;

export interface Frame { svg: SVG; w: number; h: number; m: { t: number; r: number; b: number; l: number } }

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Re-render `draw` whenever the container resizes. Returns a function to trigger a redraw with new data. */
export function responsive(container: HTMLElement, height: number, draw: (f: Frame, first: boolean) => void) {
  let first = true;
  const render = () => {
    const w = Math.max(280, container.clientWidth);
    const h = container.clientWidth < 520 ? Math.round(height * 0.85) : height;
    const m = { t: 16, r: container.clientWidth < 520 ? 12 : 20, b: 34, l: container.clientWidth < 520 ? 52 : 64 };
    select(container).selectAll('svg').remove();
    const svg = select(container).append('svg').attr('viewBox', `0 0 ${w} ${h}`).attr('width', '100%').attr('height', h).attr('role', 'img') as SVG;
    draw({ svg, w, h, m }, first);
    first = false;
  };
  const ro = new ResizeObserver(() => render());
  ro.observe(container);
  return render;
}

/** Animate a path drawing itself, once. */
export function drawIn(path: SVGPathElement | null, first: boolean, delay = 0) {
  if (!path || !first || reduceMotion()) return;
  const len = path.getTotalLength();
  path.style.strokeDasharray = `${len}`;
  path.style.strokeDashoffset = `${len}`;
  path.getBoundingClientRect();
  path.style.transition = `stroke-dashoffset var(--dur-slow) var(--ease-out) ${delay}ms`;
  path.style.strokeDashoffset = '0';
  path.addEventListener('transitionend', () => { path.style.strokeDasharray = ''; path.style.transition = ''; }, { once: true });
}

/** Tooltip element positioned inside the chart container. */
export function tooltip(container: HTMLElement) {
  let tip = container.querySelector<HTMLDivElement>('.chart-tip');
  if (!tip) {
    tip = document.createElement('div');
    tip.className = 'chart-tip';
    tip.setAttribute('role', 'status');
    container.append(tip);
  }
  return {
    show(x: number, html: string) {
      tip!.innerHTML = html;
      tip!.dataset.visible = 'true';
      const cw = container.clientWidth;
      const tw = tip!.offsetWidth;
      tip!.style.left = `${Math.min(cw - tw - 4, Math.max(4, x + 14))}px`;
    },
    hide() { tip!.dataset.visible = 'false'; },
  };
}
