import { HONOUR_LEVELS, MEDALS, type Honour } from './honours';

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

const isString = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isNullableString = (v: unknown): v is string | null => v === null || typeof v === 'string';
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';
const isHttpUrl = (v: unknown): boolean => typeof v === 'string' && /^https?:\/\//.test(v);

function validateOne(h: unknown, index: number): string[] {
  const where = `honours[${index}]`;
  if (typeof h !== 'object' || h === null) return [`${where}: not an object`];
  const r = h as Record<string, unknown>;
  const errors: string[] = [];

  if (!isString(r.id)) errors.push(`${where}: id must be a non-empty string`);
  if (!(r.year === null || (Number.isInteger(r.year) && (r.year as number) > 1950)))
    errors.push(`${where}: year must be null or an integer year`);
  if (!HONOUR_LEVELS.includes(r.level as never)) errors.push(`${where}: level must be one of ${HONOUR_LEVELS.join(', ')}`);
  if (!isString(r.event)) errors.push(`${where}: event is required`);
  if (!isString(r.category)) errors.push(`${where}: category is required`);
  if (!isString(r.result)) errors.push(`${where}: result is required`);
  if (!(r.medal === null || MEDALS.includes(r.medal as never))) errors.push(`${where}: medal must be null or one of ${MEDALS.join(', ')}`);
  if (!isNullableString(r.venue)) errors.push(`${where}: venue must be string or null`);
  if (!isNullableString(r.detail)) errors.push(`${where}: detail must be string or null`);
  if (!isNullableString(r.partner)) errors.push(`${where}: partner must be string or null`);
  if (!isBool(r.confirmed)) errors.push(`${where}: confirmed must be boolean`);
  if (!isBool(r.highlight)) errors.push(`${where}: highlight must be boolean`);

  if (r.source !== null) {
    const s = r.source as Record<string, unknown> | undefined;
    if (!s || !isString(s.label) || !isHttpUrl(s.url)) errors.push(`${where}: source must be null or {label, url(http)}`);
  }
  return errors;
}

export function validateHonours(data: unknown): ValidationResult {
  if (!Array.isArray(data)) return { ok: false, errors: ['honours: not an array'] };
  const errors = data.flatMap((h, i) => validateOne(h, i));
  const ids = data.map((h) => (h as Honour).id);
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  const dupErrors = [...new Set(duplicates)].map((id) => `honours: duplicate id "${id}"`);
  const all = [...errors, ...dupErrors];
  return { ok: all.length === 0, errors: all };
}

/** Throws with every problem listed, so a bad data file fails the build loudly. */
export function assertValidHonours(data: unknown): Honour[] {
  const result = validateHonours(data);
  if (!result.ok) throw new Error(`Invalid honours data:\n${result.errors.join('\n')}`);
  return data as Honour[];
}
