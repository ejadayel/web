// Daily Ring site: scroll reveal and the support form. No cookies, no storage,
// no analytics — the form's fields go to the contact function and nowhere else.

// The Supabase Edge Function in supabase/functions/contact. The project URL is
// already public (it ships in the app), and the function needs no key.
const CONTACT_ENDPOINT = 'https://csapfwigvxyasodfiejy.supabase.co/functions/v1/contact';

// The store listings, once they are live. An empty string keeps that store's
// badge as "coming soon" text; a URL turns it into a download link on every page.
const STORE_LINKS = {
  appStore: '',
  googlePlay: '',
};

// Real reviews only: App Store and Google Play reviews, or beta testers who
// agreed to be quoted. Each page shows its own language's list, and the reviews
// section stays hidden while that list is empty. An entry looks like
//   { quote: 'The widget alone…', name: 'Sam', source: 'App Store review', rating: 5 }
// where `rating` (1 to 5) is optional and only for a review that carried one.
const REVIEWS = {
  en: [],
  fr: [],
};

document.documentElement.classList.add('js');

// Reviews: render this page's list, before the scroll reveal starts observing.
(() => {
  const section = document.getElementById('reviews');
  const list = REVIEWS[document.documentElement.lang] || [];
  if (!section || !list.length) return;
  const fr = document.documentElement.lang === 'fr';
  const ul = section.querySelector('.reviews');
  for (const review of list) {
    const li = document.createElement('li');
    li.className = 'review reveal';
    if (review.rating) {
      const stars = document.createElement('p');
      stars.className = 'review-stars';
      stars.textContent = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
      stars.setAttribute('role', 'img');
      stars.setAttribute(
        'aria-label',
        fr ? `${review.rating} sur 5 étoiles` : `${review.rating} out of 5 stars`
      );
      li.append(stars);
    }
    const quote = document.createElement('blockquote');
    quote.textContent = review.quote;
    const who = document.createElement('p');
    who.className = 'review-who';
    who.textContent = review.name;
    if (review.source) {
      const source = document.createElement('span');
      source.textContent = review.source;
      who.append(source);
    }
    li.append(quote, who);
    ul.append(li);
  }
  section.hidden = false;
})();

// Store badges: link the ones whose listing is live.
document.querySelectorAll('.store-badge[data-store]').forEach((badge) => {
  const url = STORE_LINKS[badge.dataset.store];
  if (!url) return;
  badge.href = url;
  badge.classList.remove('is-soon');
  badge.querySelector('small').textContent = badge.dataset.live;
});

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

// Support form. Its messages follow the page's language: the French pages under
// fr/ share this script.
(() => {
  const form = document.querySelector('form.contact-form');
  if (!form) return;

  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type="submit"]');
  const startedAt = Date.now();
  const fr = document.documentElement.lang === 'fr';

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
    setStatus(fr ? 'Envoi…' : 'Sending…');

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, startedAt }),
      });
      if (!response.ok) throw new Error(String(response.status));
      form.reset();
      setStatus(
        fr
          ? 'Merci, votre message est en route. Nous répondons en général en un jour ou deux.'
          : 'Thanks — your message is on its way. We usually reply within a couple of days.',
        'ok'
      );
    } catch {
      setStatus(
        fr
          ? 'Désolé, le message n’est pas parti. Vérifiez votre connexion et réessayez dans un instant.'
          : 'Sorry, that did not send. Please check your connection and try again in a moment.',
        'error'
      );
    } finally {
      button.disabled = false;
    }
  });
})();
