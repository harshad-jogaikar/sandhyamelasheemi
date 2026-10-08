import { describe, expect, test } from 'vitest';
import {
  describeHonour,
  displayYear,
  filterByLevel,
  highlights,
  sortHonours,
  summarise,
  type Honour,
} from '@/lib/honours';
import honoursData from '@/data/honours.json';

const base: Honour = {
  id: 'x',
  year: 2020,
  level: 'national',
  event: 'Event',
  venue: null,
  category: 'WS',
  result: 'Gold',
  medal: 'gold',
  detail: null,
  partner: null,
  source: null,
  confirmed: true,
  highlight: false,
};

const make = (over: Partial<Honour>): Honour => ({ ...base, ...over });

describe('sortHonours', () => {
  test('orders newest first and sinks unknown years to the bottom', () => {
    const input = [make({ id: 'a', year: 2021 }), make({ id: 'b', year: null }), make({ id: 'c', year: 2026 })];
    const result = sortHonours(input);
    expect(result.map((h) => h.id)).toEqual(['c', 'a', 'b']);
  });

  test('does not mutate the input array', () => {
    const input = [make({ id: 'a', year: 2021 }), make({ id: 'c', year: 2026 })];
    const copy = [...input];
    sortHonours(input);
    expect(input).toEqual(copy);
  });

  test('keeps relative order for two unknown years', () => {
    const input = [make({ id: 'a', year: null }), make({ id: 'b', year: null })];
    expect(sortHonours(input).map((h) => h.id)).toEqual(['a', 'b']);
  });
});

describe('filterByLevel', () => {
  const input = [make({ id: 'w', level: 'world' }), make({ id: 'n', level: 'national' }), make({ id: 's', level: 'state' })];

  test('returns everything for "all"', () => {
    expect(filterByLevel(input, 'all')).toHaveLength(3);
  });

  test('returns only the requested level', () => {
    expect(filterByLevel(input, 'world').map((h) => h.id)).toEqual(['w']);
  });
});

describe('highlights', () => {
  test('returns only highlighted honours, newest first', () => {
    const input = [make({ id: 'a', year: 2021, highlight: true }), make({ id: 'b', year: 2026, highlight: true }), make({ id: 'c', highlight: false })];
    expect(highlights(input).map((h) => h.id)).toEqual(['b', 'a']);
  });
});

describe('summarise', () => {
  test('counts levels, medals and unconfirmed entries', () => {
    const input = [
      make({ level: 'world', medal: 'bronze' }),
      make({ level: 'national', medal: 'gold' }),
      make({ level: 'national', medal: null, confirmed: false }),
      make({ level: 'state', medal: 'gold', confirmed: false }),
    ];
    expect(summarise(input)).toEqual({ world: 1, national: 2, state: 1, gold: 2, bronze: 1, unconfirmed: 2 });
  });

  test('returns zeros for an empty list', () => {
    expect(summarise([])).toEqual({ world: 0, national: 0, state: 0, gold: 0, bronze: 0, unconfirmed: 0 });
  });
});

describe('describeHonour', () => {
  test('joins partner and detail', () => {
    expect(describeHonour(make({ partner: 'P', detail: 'bt X 21-1' }))).toBe('w/ P · bt X 21-1');
  });
  test('returns a dash when nothing is known', () => {
    expect(describeHonour(make({}))).toBe('—');
  });
  test('returns only the detail when there is no partner', () => {
    expect(describeHonour(make({ detail: 'QF' }))).toBe('QF');
  });
});

describe('displayYear', () => {
  test('shows a placeholder for unknown years', () => {
    expect(displayYear(make({ year: null }))).toBe('[Year]');
    expect(displayYear(make({ year: 2025 }))).toBe('2025');
  });
});

describe('real data', () => {
  test('has the world bronze and both 2026 golds', () => {
    const s = summarise(honoursData as Honour[]);
    expect(s.bronze).toBeGreaterThanOrEqual(1);
    expect(s.gold).toBeGreaterThanOrEqual(4);
    expect(highlights(honoursData as Honour[]).length).toBe(3);
  });
});
