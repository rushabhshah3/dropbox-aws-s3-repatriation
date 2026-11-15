// Icons from UI Essentials Pro by Pictomate (Standard License, purchased).
// Licensed for use inside this project only. Do not copy these paths out of the project
// or redistribute them as an icon set. Strokes are set to currentColor so they follow the theme.

const raw: Record<string, string> = {
  overview: '<polygon points="19.719 21 4.281 21 4.281 11 12 3 19.719 11 19.719 21" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
  breakeven: '<path d="M17,14H7m10-4H7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
  timeline: '<path d="M20,18a9.963,9.963,0,1,1,1.579-3.122M20,22V18H16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><polyline points="12 6 12 12 8 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
  breakdown: '<polygon points="12 2 2 7 12 12 22 7 12 2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M22,12,12,17,2,12m0,5,10,5,10-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
  sensitivity: '<path d="M9.5,12H2m20,0H14.5M4,19.5H2m20,0H9m6-15H2m20,0H20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M12,9.5A2.5,2.5,0,1,1,9.5,12,2.5,2.5,0,0,1,12,9.5Zm-8,10A2.5,2.5,0,1,0,6.5,17,2.5,2.5,0,0,0,4,19.5Zm11-15A2.5,2.5,0,1,0,17.5,2,2.5,2.5,0,0,0,15,4.5Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
  evidence: '<polyline points="16 9 11 14 8.5 11.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M4,3H20v8a11.471,11.471,0,0,1-8,11A11.471,11.471,0,0,1,4,11Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
  assumptions: '<path d="M19,9V22H5V2h7m0,0V9h7m0,0L12,2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M8,14h8M8,18h8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
  scenario: '<path d="M12,9.5V2m0,20V14.5M4.5,4V2m0,20V9m15,6V2m0,20V20" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.5,12A2.5,2.5,0,1,1,12,9.5,2.5,2.5,0,0,1,14.5,12ZM4.5,4A2.5,2.5,0,1,0,7,6.5,2.5,2.5,0,0,0,4.5,4Zm15,11A2.5,2.5,0,1,0,22,17.5,2.5,2.5,0,0,0,19.5,15Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
  payback: '<path d="M12,22A10,10,0,1,1,22,12c0,.338-.017.671-.049,1M8,16l4-4V6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22 17 17 22 14.5 19.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
  saving: '<path d="M12,8v8M8,12h8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M20,18A10,10,0,0,1,2,12M20,22V18H16M4,6a10,10,0,0,1,18,6M4,2V6H8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
  cloud: '<path d="M18,19H7a4.993,4.993,0,0,1-.163-9.984A6,6,0,1,1,18.65,11.065,3.994,3.994,0,0,1,18,19Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
  link: '<path d="M21,11.354A4,4,0,0,1,18,18H10a4,4,0,0,1,0-8h4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M10,14h4a4,4,0,0,0,0-8H6a4,4,0,0,0-3,6.646" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
  reset: '<path d="M20,18A10,10,0,0,1,2,12M20,22V18H16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M4,6a10,10,0,0,1,18,6M4,2V6H8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
  info: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><path d="M12,11.25v6M12,8a.5.5,0,1,0-.5-.5A.5.5,0,0,0,12,8Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
  external: '<path d="M14,3h7v7m0-7-9,9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/><polyline points="11 6 3 6 3 21 18 21 18 13" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>',
};

export type IconName = keyof typeof raw;

export function icon(name: IconName | string, size = 18): string {
  return `<svg class="ico" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" stroke-width="1.5">${raw[name] ?? ''}</svg>`;
}
