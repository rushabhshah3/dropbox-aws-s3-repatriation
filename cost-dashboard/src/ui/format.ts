export function money(n: number, opts: { compact?: boolean; sign?: boolean } = {}): string {
  const { compact = true, sign = false } = opts;
  const s = n < 0 ? '−' : sign && n > 0 ? '+' : '';
  const a = Math.abs(n);
  if (compact) {
    if (a >= 1e9) return `${s}$${(a / 1e9).toFixed(2)}B`;
    if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(a >= 1e8 ? 0 : a >= 1e7 ? 1 : 2)}M`;
    if (a >= 1e4) return `${s}$${(a / 1e3).toFixed(0)}k`;
    if (a >= 1e3) return `${s}$${(a / 1e3).toFixed(1)}k`;
  }
  return `${s}$${Math.round(a).toLocaleString('en-US')}`;
}

export function size(tb: number): string {
  if (tb >= 1_000_000) return `${(tb / 1_000_000).toFixed(tb >= 10_000_000 ? 0 : 1)} EB`;
  if (tb >= 1000) return `${(tb / 1000).toFixed(tb >= 100_000 ? 0 : tb >= 10_000 ? 0 : 1)} PB`;
  if (tb >= 10) return `${Math.round(tb)} TB`;
  return `${tb.toFixed(1)} TB`;
}

export const num = (n: number, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });
export const pct = (n: number, d = 0) => `${num(n, d)}%`;

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, html = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (html) e.innerHTML = html;
  return e;
}
