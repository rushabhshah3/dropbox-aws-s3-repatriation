import { DEFAULTS, Inputs, PRESETS, withPreset } from '../engine/inputs';

type Listener = (i: Inputs) => void;

let current: Inputs = readUrl();
let presetId: string | null = detectPreset(current);
const listeners: Listener[] = [];

export const get = () => current;
export const activePreset = () => presetId;

export function set(patch: Partial<Inputs>) {
  current = { ...current, ...patch };
  presetId = detectPreset(current);
  writeUrl();
  listeners.forEach((l) => l(current));
}

export function applyPreset(id: string) {
  current = withPreset(id);
  presetId = id;
  writeUrl();
  listeners.forEach((l) => l(current));
}

export function reset() { applyPreset('reference'); }

export function subscribe(l: Listener) { listeners.push(l); }

function detectPreset(i: Inputs): string | null {
  for (const p of PRESETS) {
    const ref = withPreset(p.id);
    if ((Object.keys(ref) as (keyof Inputs)[]).every((k) => ref[k] === i[k])) return p.id;
  }
  return null;
}

// Scenario lives in the URL so a view can be shared or bookmarked for the viva.
function writeUrl() {
  const q = new URLSearchParams();
  (Object.keys(DEFAULTS) as (keyof Inputs)[]).forEach((k) => {
    if (current[k] !== DEFAULTS[k]) q.set(k, String(current[k]));
  });
  const s = q.toString();
  history.replaceState(null, '', `${location.pathname}${s ? `?${s}` : ''}${location.hash}`);
}

function readUrl(): Inputs {
  const q = new URLSearchParams(location.search);
  const out: Inputs = { ...DEFAULTS };
  (Object.keys(DEFAULTS) as (keyof Inputs)[]).forEach((k) => {
    const v = q.get(k);
    if (v === null) return;
    const d = DEFAULTS[k];
    (out as unknown as Record<string, unknown>)[k] = typeof d === 'number' ? Number(v) : typeof d === 'boolean' ? v === 'true' : v;
  });
  return out;
}
