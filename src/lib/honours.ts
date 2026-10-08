export const HONOUR_LEVELS = ['world', 'national', 'state'] as const;
export type HonourLevel = (typeof HONOUR_LEVELS)[number];

export const MEDALS = ['gold', 'silver', 'bronze'] as const;
export type Medal = (typeof MEDALS)[number];

export interface HonourSource {
  label: string;
  url: string;
}

export interface Honour {
  id: string;
  year: number | null;
  level: HonourLevel;
  event: string;
  venue: string | null;
  category: string;
  result: string;
  medal: Medal | null;
  detail: string | null;
  partner: string | null;
  source: HonourSource | null;
  confirmed: boolean;
  highlight: boolean;
}

export interface HonourSummary {
  world: number;
  national: number;
  state: number;
  gold: number;
  bronze: number;
  unconfirmed: number;
}

export const LEVEL_LABELS: Record<HonourLevel, string> = {
  world: 'World',
  national: 'National',
  state: 'State',
};

/** Newest first; entries without a year sink to the bottom in their original order. */
export function sortHonours(honours: readonly Honour[]): Honour[] {
  return [...honours].sort((a, b) => {
    if (a.year === null && b.year === null) return 0;
    if (a.year === null) return 1;
    if (b.year === null) return -1;
    return b.year - a.year;
  });
}

export function filterByLevel(honours: readonly Honour[], level: HonourLevel | 'all'): Honour[] {
  if (level === 'all') return [...honours];
  return honours.filter((h) => h.level === level);
}

export function highlights(honours: readonly Honour[]): Honour[] {
  return sortHonours(honours.filter((h) => h.highlight));
}

export function summarise(honours: readonly Honour[]): HonourSummary {
  return honours.reduce<HonourSummary>(
    (acc, h) => ({
      ...acc,
      [h.level]: acc[h.level] + 1,
      gold: acc.gold + (h.medal === 'gold' ? 1 : 0),
      bronze: acc.bronze + (h.medal === 'bronze' ? 1 : 0),
      unconfirmed: acc.unconfirmed + (h.confirmed ? 0 : 1),
    }),
    { world: 0, national: 0, state: 0, gold: 0, bronze: 0, unconfirmed: 0 },
  );
}

/** "w/ Partner · detail" with whichever parts exist. */
export function describeHonour(h: Honour): string {
  const parts = [h.partner ? `w/ ${h.partner}` : null, h.detail].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : '—';
}

export function displayYear(h: Honour): string {
  return h.year === null ? '[Year]' : String(h.year);
}
