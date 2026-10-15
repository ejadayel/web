// Daily Ring site: scroll reveal and the support form. No cookies, no storage,
// no analytics — the form's fields go to the contact function and nowhere else.

// The Supabase Edge Function in supabase/functions/contact. The project URL is
// already public (it ships in the app), and the function needs no key.
const CONTACT_ENDPOINT = 'https://csapfwigvxyasodfiejy.supabase.co/functions/v1/contact';

document.documentElement.classList.add('js');

// Reveal sections as they scroll in.
(() => {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  items.forEach((el) => observer.observe(el));
})();

// Support form.
(() => {
  const form = document.querySelector('form.contact-form');
  if (!form) return;

  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type="submit"]');
  const startedAt = Date.now();

  // Links such as index.html?topic=delete#contact preselect the topic.
  const topic = new URLSearchParams(location.search).get('topic');
  if (topic && form.topic.querySelector(`option[value="${CSS.escape(topic)}"]`)) {
    form.topic.value = topic;
  }

  const setStatus = (text, kind) => {
    status.textContent = text;
    status.className = `form-status${kind ? ` ${kind}` : ''}`;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form));
    button.disabled = true;
    setStatus('Sending…');

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, startedAt }),
      });
      if (!response.ok) throw new Error(String(response.status));
      form.reset();
      setStatus(
        'Thanks — your message is on its way. We usually reply within a couple of days.',
        'ok'
      );
    } catch {
      setStatus(
        'Sorry, that did not send. Please check your connection and try again in a moment.',
        'error'
      );
    } finally {
      button.disabled = false;
    }
  });
})();
