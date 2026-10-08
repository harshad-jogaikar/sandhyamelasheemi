const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-03-27" → "Mar 2026". Invalid input is returned unchanged. */
export function formatMonthYear(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(isoDate);
  if (!match) return isoDate;
  const month = Number(match[2]);
  if (month < 1 || month > 12) return isoDate;
  return `${MONTHS[month - 1]} ${match[1]}`;
}

/** Newest first by ISO date string. */
export function sortByDateDesc<T extends { date: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Build a mailto: URL used as the fallback when no form endpoint is configured. */
export function mailtoUrl(email: string, subject: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

/** Instagram handle → profile URL; accepts "@name" or "name". Empty stays empty. */
export function socialUrl(network: 'instagram' | 'facebook' | 'youtube', handle: string): string {
  const clean = handle.trim().replace(/^@/, '');
  if (!clean) return '';
  if (/^https?:\/\//.test(clean)) return clean;
  const base: Record<typeof network, string> = {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    youtube: 'https://youtube.com/@',
  };
  return `${base[network]}${clean}`;
}
