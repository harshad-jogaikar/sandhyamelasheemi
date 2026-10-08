import { describe, expect, test } from 'vitest';
import { assertValidHonours, validateHonours } from '@/lib/validate';
import honoursData from '@/data/honours.json';

const valid = {
  id: 'ok',
  year: 2025,
  level: 'national',
  event: 'E',
  venue: null,
  category: 'C',
  result: 'Gold',
  medal: 'gold',
  detail: null,
  partner: null,
  source: { label: 'L', url: 'https://example.com' },
  confirmed: true,
  highlight: false,
};

describe('validateHonours', () => {
  test('accepts the shipped data file', () => {
    const r = validateHonours(honoursData);
    expect(r.errors).toEqual([]);
    expect(r.ok).toBe(true);
  });

  test('rejects a non-array', () => {
    expect(validateHonours({}).ok).toBe(false);
  });

  test('rejects a non-object entry', () => {
    expect(validateHonours([42]).errors[0]).toMatch(/not an object/);
  });

  test('reports a bad level, medal, year and source together', () => {
    const r = validateHonours([{ ...valid, level: 'galactic', medal: 'platinum', year: 12, source: { label: 'x', url: 'ftp://no' } }]);
    expect(r.ok).toBe(false);
    expect(r.errors.join('\n')).toMatch(/level/);
    expect(r.errors.join('\n')).toMatch(/medal/);
    expect(r.errors.join('\n')).toMatch(/year/);
    expect(r.errors.join('\n')).toMatch(/source/);
  });

  test('rejects wrong types for the nullable and boolean fields', () => {
    const r = validateHonours([{ ...valid, venue: 3, detail: 3, partner: 3, confirmed: 'yes', highlight: 'no', id: '', event: '', category: '', result: '' }]);
    expect(r.errors.length).toBeGreaterThanOrEqual(9);
  });

  test('rejects duplicate ids', () => {
    const r = validateHonours([valid, { ...valid }]);
    expect(r.errors).toContain('honours: duplicate id "ok"');
  });
});

describe('assertValidHonours', () => {
  test('returns the typed data when valid', () => {
    expect(assertValidHonours([valid])[0].id).toBe('ok');
  });
  test('throws listing every problem', () => {
    expect(() => assertValidHonours([{ ...valid, id: '' }])).toThrow(/Invalid honours data/);
  });
});
