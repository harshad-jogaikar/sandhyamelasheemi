// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { formValues, setupEnquiryForms } from '@/lib/enquiry-form';

function mountForm(endpoint: string): HTMLFormElement {
  document.body.innerHTML = `
    <form class="enquiry" action="${endpoint || 'mailto:hello@example.com?subject=Test'}" data-endpoint="${endpoint}" data-subject="Test enquiry" novalidate>
      <input type="hidden" name="_subject" value="Test enquiry" />
      <input type="text" name="_gotcha" />
      <input name="name" required />
      <input name="email" type="email" required />
      <textarea name="message"></textarea>
      <p data-error hidden></p>
      <button type="submit">Send</button>
      <p data-success hidden></p>
    </form>`;
  const form = document.querySelector<HTMLFormElement>('form.enquiry')!;
  setupEnquiryForms();
  return form;
}

const fill = (form: HTMLFormElement, values: Record<string, string>) => {
  Object.entries(values).forEach(([k, v]) => {
    form.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${k}"]`)!.value = v;
  });
};

const submit = async (form: HTMLFormElement) => {
  form.dispatchEvent(new Event('submit', { cancelable: true }));
  await new Promise((r) => setTimeout(r, 0));
};

describe('setupEnquiryForms', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('formValues reads every named control', () => {
    const form = mountForm('');
    fill(form, { name: 'A', email: 'a@b.co', message: 'hi' });
    expect(formValues(form)).toMatchObject({ name: 'A', email: 'a@b.co', message: 'hi', _subject: 'Test enquiry' });
  });

  test('shows validation errors and focuses the first bad field', async () => {
    const form = mountForm('https://forms.example/submit');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await submit(form);
    const error = form.querySelector<HTMLElement>('[data-error]')!;
    expect(error.hidden).toBe(false);
    expect(error.textContent).toContain('Name is required');
    expect(document.activeElement).toBe(form.querySelector('[name="name"]'));
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('posts JSON to the endpoint and shows success', async () => {
    const form = mountForm('https://forms.example/submit');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    fill(form, { name: 'Sandhya', email: 's@example.com', message: 'Hello' });
    await submit(form);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://forms.example/submit');
    expect(JSON.parse(String(init?.body))).toMatchObject({ name: 'Sandhya', email: 's@example.com' });
    expect(form.querySelector<HTMLElement>('[data-success]')!.hidden).toBe(false);
    expect(form.querySelector<HTMLInputElement>('[name="name"]')!.value).toBe('');
  });

  test('reports a failed endpoint without losing the form', async () => {
    const form = mountForm('https://forms.example/submit');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('no', { status: 500 }));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fill(form, { name: 'S', email: 's@example.com' });
    await submit(form);
    const error = form.querySelector<HTMLElement>('[data-error]')!;
    expect(error.hidden).toBe(false);
    expect(error.textContent).toMatch(/could not be sent/);
    expect(form.querySelector<HTMLButtonElement>('button')!.disabled).toBe(false);
  });

  test('ignores submissions where the honeypot is filled', async () => {
    const form = mountForm('https://forms.example/submit');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fill(form, { name: 'Bot', email: 'bot@spam.io', _gotcha: 'spam' });
    await submit(form);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('falls back to a mailto link when no endpoint is configured', async () => {
    const form = mountForm('');
    const assigned: string[] = [];
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { set href(v: string) { assigned.push(v); } },
    });
    fill(form, { name: 'S', email: 's@example.com', message: 'Hi there' });
    await submit(form);
    expect(assigned).toHaveLength(1);
    expect(assigned[0]).toMatch(/^mailto:hello@example\.com\?subject=Test%20enquiry&body=/);
    expect(decodeURIComponent(assigned[0])).toContain('Message: Hi there');
  });
});
