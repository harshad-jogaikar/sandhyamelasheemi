const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface FieldError {
  name: string;
  message: string;
}

/** Validate a plain record of form values. Required fields come from the field list. */
export function validateValues(values: Record<string, string>, required: readonly string[], emailField = 'email'): FieldError[] {
  const missing = required
    .filter((name) => !(values[name] ?? '').trim())
    .map((name) => ({ name, message: `${labelFor(name)} is required` }));
  const email = (values[emailField] ?? '').trim();
  const badEmail = email && !EMAIL_RE.test(email) ? [{ name: emailField, message: 'Please enter a valid email address' }] : [];
  return [...missing, ...badEmail];
}

function labelFor(name: string): string {
  const spaced = name.replace(/[_-]+/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Build the plain-text body for the mailto fallback from the form values. */
export function buildMailBody(values: Record<string, string>): string {
  return Object.entries(values)
    .filter(([key, value]) => !key.startsWith('_') && value.trim() !== '')
    .map(([key, value]) => `${labelFor(key)}: ${value.trim()}`)
    .join('\n');
}

export function formValues(form: HTMLFormElement): Record<string, string> {
  const data = new FormData(form);
  return Object.fromEntries([...data.entries()].map(([k, v]) => [k, String(v)]));
}

function requiredNames(form: HTMLFormElement): string[] {
  return [...form.querySelectorAll<HTMLElement & { name: string }>('[required]')].map((el) => el.name);
}

function show(el: HTMLElement | null, text?: string): void {
  if (!el) return;
  if (text !== undefined) el.textContent = text;
  el.hidden = false;
}

async function postToEndpoint(endpoint: string, values: Record<string, string>): Promise<void> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) throw new Error(`Form endpoint responded ${res.status}`);
}

export function mailtoHref(action: string, subject: string, values: Record<string, string>): string {
  return `${action.split('?')[0]}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildMailBody(values))}`;
}

function openMailClient(form: HTMLFormElement, values: Record<string, string>): void {
  const subject = form.dataset.subject ?? 'Website enquiry';
  window.location.href = mailtoHref(form.getAttribute('action') ?? '', subject, values);
  show(form.querySelector<HTMLElement>('[data-mailto-note]'));
}

function markInvalid(form: HTMLFormElement, errors: readonly FieldError[]): void {
  const errorId = form.querySelector<HTMLElement>('[data-error]')?.id;
  const bad = new Set(errors.map((e) => e.name));
  form.querySelectorAll<HTMLElement>('[name]').forEach((el) => {
    const name = el.getAttribute('name') ?? '';
    if (bad.has(name)) {
      el.setAttribute('aria-invalid', 'true');
      if (errorId) el.setAttribute('aria-describedby', errorId);
    } else {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    }
  });
}

export function setupEnquiryForms(root: ParentNode = document): void {
  root.querySelectorAll<HTMLFormElement>('form.enquiry').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const errorEl = form.querySelector<HTMLElement>('[data-error]');
      const successEl = form.querySelector<HTMLElement>('[data-success]');
      const button = form.querySelector<HTMLButtonElement>('button[type=submit]');
      if (errorEl) errorEl.hidden = true;
      form.querySelector<HTMLElement>('[data-mailto-note]')?.setAttribute('hidden', '');

      const values = formValues(form);
      if (values._gotcha) return; // honeypot tripped: silently ignore bots
      const errors = validateValues(values, requiredNames(form));
      markInvalid(form, errors);
      if (errors.length > 0) {
        show(errorEl, errors.map((e) => e.message).join('. '));
        form.querySelector<HTMLElement>(`[name="${errors[0].name}"]`)?.focus();
        return;
      }

      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        openMailClient(form, values);
        return;
      }

      if (button) button.disabled = true;
      try {
        await postToEndpoint(endpoint, values);
        form.reset();
        show(successEl);
      } catch (err) {
        console.error('Enquiry form submission failed', err);
        show(errorEl, 'Sorry, the message could not be sent. Please email us directly instead.');
      } finally {
        if (button) button.disabled = false;
      }
    });
  });
}
