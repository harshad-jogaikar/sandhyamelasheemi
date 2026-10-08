import { describe, expect, test } from 'vitest';
import { buildMailBody, validateValues } from '@/lib/enquiry-form';

describe('validateValues', () => {
  test('reports each missing required field with a readable label', () => {
    const errors = validateValues({ name: '', work_email: ' ' }, ['name', 'work_email'], 'work_email');
    expect(errors.map((e) => e.message)).toEqual(['Name is required', 'Work email is required']);
  });

  test('rejects a malformed email but accepts a valid one', () => {
    expect(validateValues({ email: 'nope' }, [])).toEqual([{ name: 'email', message: 'Please enter a valid email address' }]);
    expect(validateValues({ email: 'a@b.co' }, [])).toEqual([]);
  });

  test('returns no errors when everything is present', () => {
    expect(validateValues({ name: 'S', email: 'a@b.co' }, ['name', 'email'])).toEqual([]);
  });
});

describe('buildMailBody', () => {
  test('skips hidden/meta fields and blanks, labels the rest', () => {
    const body = buildMailBody({ _subject: 'x', _gotcha: '', name: 'Sandhya ', company: '', message: 'Hi' });
    expect(body).toBe('Name: Sandhya\nMessage: Hi');
  });
});
