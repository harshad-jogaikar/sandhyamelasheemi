import { describe, expect, test } from 'vitest';
import { formatMonthYear, mailtoUrl, socialUrl, sortByDateDesc } from '@/lib/format';

describe('formatMonthYear', () => {
  test('formats an ISO date as month and year', () => {
    expect(formatMonthYear('2026-03-27')).toBe('Mar 2026');
    expect(formatMonthYear('2021-12-07')).toBe('Dec 2021');
  });
  test('returns invalid input unchanged', () => {
    expect(formatMonthYear('yesterday')).toBe('yesterday');
    expect(formatMonthYear('2026-13-01')).toBe('2026-13-01');
  });
});

describe('sortByDateDesc', () => {
  test('orders newest first without mutating input', () => {
    const input = [{ date: '2021-01-01' }, { date: '2026-03-27' }, { date: '2025-03-20' }];
    const copy = [...input];
    expect(sortByDateDesc(input).map((i) => i.date)).toEqual(['2026-03-27', '2025-03-20', '2021-01-01']);
    expect(input).toEqual(copy);
  });
  test('keeps equal dates stable', () => {
    const input = [{ date: '2025-01-01', k: 1 }, { date: '2025-01-01', k: 2 }];
    expect(sortByDateDesc(input).map((i) => i.k)).toEqual([1, 2]);
  });
});

describe('mailtoUrl', () => {
  test('encodes the subject', () => {
    expect(mailtoUrl('a@b.com', 'Sponsorship enquiry & more')).toBe('mailto:a@b.com?subject=Sponsorship%20enquiry%20%26%20more');
  });
});

describe('socialUrl', () => {
  test('builds profile urls from handles with or without @', () => {
    expect(socialUrl('instagram', '@sandhya')).toBe('https://instagram.com/sandhya');
    expect(socialUrl('facebook', 'sandhya')).toBe('https://facebook.com/sandhya');
    expect(socialUrl('youtube', 'sandhya')).toBe('https://youtube.com/@sandhya');
  });
  test('passes full urls through and returns empty for blank', () => {
    expect(socialUrl('instagram', 'https://instagram.com/x')).toBe('https://instagram.com/x');
    expect(socialUrl('instagram', '  ')).toBe('');
  });
});
