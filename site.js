// Daily Ring site: scroll reveal, the theme switch and the support form. No
// cookies and no analytics; the only thing kept is a pinned theme, in this
// browser's localStorage. The form's fields go to the contact function and
// nowhere else.

// The Supabase Edge Function in supabase/functions/contact. The project URL is
// already public (it ships in the app), and the function needs no key.
const CONTACT_ENDPOINT = 'https://csapfwigvxyasodfiejy.supabase.co/functions/v1/contact';

// Lets the confirmation link's leftover session be revoked. Publishable by
// design: it ships in the app and identifies the project; RLS guards the data.
const SUPABASE_KEY = 'sb_publishable_vAQ6cdTuxk6fakum5fxgjQ_irWdT8iF';

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

// Line icons, drawn in currentColor.
const svg = (paths, className) =>
  `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

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

// Theme switch: Automatic follows the system, Light and Dark pin it, as in the
// app's Settings. The choice is remembered in this browser only (the inline
// script in each page's head reads it back before first paint).
(() => {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;
  const KEY = 'daily-ring-theme';
  const root = document.documentElement;
  const labels =
    root.lang === 'fr'
      ? { title: 'Thème\u00a0:', system: 'Automatique', light: 'Clair', dark: 'Sombre' }
      : { title: 'Theme:', system: 'Automatic', light: 'Light', dark: 'Dark' };
  const icons = {
    system:
      '<circle cx="12" cy="12" r="8.5" /><path d="M12 3.5a8.5 8.5 0 0 1 0 17Z" fill="currentColor" />',
    light:
      '<circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />',
    dark: '<path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1Z" />',
  };
  const values = ['system', 'light', 'dark'];
  const current = () => root.dataset.theme || 'system';

  const wrap = document.createElement('span');
  wrap.className = 'theme-switch';
  toggle.replaceWith(wrap);
  wrap.append(toggle);

  const menu = document.createElement('ul');
  menu.className = 'theme-menu';
  menu.id = 'theme-menu';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', toggle.getAttribute('aria-label'));
  menu.hidden = true;
  toggle.setAttribute('aria-controls', menu.id);
  const items = values.map((value) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'menuitemradio');
    li.tabIndex = -1;
    li.dataset.value = value;
    li.innerHTML = `<span class="theme-icon">${svg(icons[value], '')}</span>`;
    li.append(labels[value]);
    li.insertAdjacentHTML('beforeend', svg('<path d="m5 12.5 4.5 4.5L19 7.5" />', 'theme-check'));
    li.addEventListener('click', () => choose(value));
    menu.append(li);
    return li;
  });
  wrap.append(menu);

  function render() {
    const value = current();
    toggle.innerHTML = svg(icons[value], '');
    toggle.setAttribute('aria-label', `${labels.title} ${labels[value]}`);
    toggle.title = `${labels.title} ${labels[value]}`;
    items.forEach((li) => li.setAttribute('aria-checked', String(li.dataset.value === value)));
  }

  function choose(value) {
    if (value === 'system') delete root.dataset.theme;
    else root.dataset.theme = value;
    try {
      if (value === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, value);
    } catch {
      // Storage blocked (a private window): the choice holds for this page only.
    }
    render();
    close();
  }

  function open() {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    items[values.indexOf(current())].focus();
  }

  function close(refocus = true) {
    if (menu.hidden) return;
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    if (refocus) toggle.focus();
  }

  toggle.addEventListener('click', () => (menu.hidden ? open() : close()));
  toggle.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      open();
    }
  });
  menu.addEventListener('keydown', (event) => {
    const i = items.indexOf(document.activeElement);
    const move = (to) => items[(to + items.length) % items.length].focus();
    const keys = {
      ArrowDown: () => move(i + 1),
      ArrowUp: () => move(i - 1),
      Home: () => move(0),
      End: () => move(items.length - 1),
      Enter: () => choose(values[i]),
      ' ': () => choose(values[i]),
      Escape: () => close(),
    };
    if (keys[event.key]) {
      event.preventDefault();
      keys[event.key]();
    } else if (event.key === 'Tab') {
      close(false);
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (!wrap.contains(event.target)) close(false);
  });

  render();
})();

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

// Sound packs: each button plays its pack's fanfare, as a tap does in the app's
// Settings. One sound at a time; a second tap on the playing one stops it.
(() => {
  const buttons = document.querySelectorAll('[data-sound]');
  if (!buttons.length) return;
  let audio = null;
  let current = null;
  const stop = () => {
    if (audio) audio.pause();
    if (current) current.setAttribute('aria-pressed', 'false');
    current = null;
  };
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const same = current === button;
      stop();
      if (same) return;
      audio = new Audio(button.dataset.sound);
      audio.addEventListener('ended', () => {
        if (current === button) stop();
      });
      current = button;
      button.setAttribute('aria-pressed', 'true');
      audio.play().catch(stop);
    });
  });
})();

// Topic picker. The native <select> stays in the form and keeps the value, so
// the form submits, resets and preselects exactly as before (and works without
// JS); this draws an icon menu over it. Icons are keyed by option value, and
// each option's one-line description is its data-hint, so the copy stays in the
// page's own language.
const TOPIC_ICONS = {
  question: [
    'var(--c-blue)',
    '<circle cx="12" cy="12" r="9" /><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.5v.4M12 16.8h.01" />',
  ],
  bug: [
    'var(--c-orange)',
    '<rect x="8" y="7" width="8" height="13" rx="4" /><path d="M9.8 7.4 8.5 5M14.2 7.4 15.5 5M8 11.5H4.5M19.5 11.5H16M8 16H5M19 16h-3M12 11v9" />',
  ],
  idea: [
    'var(--c-amber)',
    '<path d="M9.5 18h5M10.5 21h3" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1v.1h5v-.1c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3Z" />',
  ],
  delete: [
    'var(--c-red)',
    '<path d="M4 7h16M10 11v6M14 11v6" /><path d="m6 7 .9 12.1A2 2 0 0 0 8.9 21h6.2a2 2 0 0 0 2-1.9L18 7M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />',
  ],
  privacy: [
    'var(--c-purple)',
    '<path d="M12 3 5 6v5.2c0 4.3 2.9 8.1 7 9.8 4.1-1.7 7-5.5 7-9.8V6l-7-3Z" /><path d="m9 12 2.2 2.2L15.2 10" />',
  ],
  other: [
    'var(--c-teal)',
    '<path d="M20.5 12a8.5 8.5 0 0 1-12.3 7.6L3.5 20.5l1-4.4A8.5 8.5 0 1 1 20.5 12Z" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />',
  ],
};

function iconTile(value) {
  const [accent, paths] = TOPIC_ICONS[value] || TOPIC_ICONS.other;
  const tile = document.createElement('span');
  tile.className = 'picker-icon';
  tile.style.setProperty('--accent', accent);
  tile.innerHTML = svg(paths, '');
  return tile;
}

function enhanceTopicPicker(select) {
  const field = select.closest('.field');
  const label = field.querySelector(`label[for="${select.id}"]`);
  const options = [...select.options];

  const picker = document.createElement('div');
  picker.className = 'picker';

  const button = document.createElement('button');
  button.type = 'button';
  button.id = `${select.id}-picker`;
  button.className = 'picker-button';
  button.setAttribute('aria-haspopup', 'listbox');
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', `${select.id}-options`);
  label.id ||= `${select.id}-label`;
  label.htmlFor = button.id;
  button.setAttribute('aria-labelledby', `${label.id} ${button.id}`);

  const list = document.createElement('ul');
  list.id = `${select.id}-options`;
  list.className = 'picker-list';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-labelledby', label.id);
  list.tabIndex = -1;
  list.hidden = true;

  const items = options.map((option, i) => {
    const li = document.createElement('li');
    li.id = `${list.id}-${i}`;
    li.className = 'picker-option';
    li.setAttribute('role', 'option');
    const text = document.createElement('span');
    text.className = 'picker-text';
    const name = document.createElement('span');
    name.className = 'picker-label';
    name.textContent = option.textContent;
    text.append(name);
    if (option.dataset.hint) {
      const hint = document.createElement('span');
      hint.className = 'picker-hint';
      hint.textContent = option.dataset.hint;
      text.append(hint);
    }
    li.append(iconTile(option.value), text);
    li.insertAdjacentHTML('beforeend', svg('<path d="m5 12.5 4.5 4.5L19 7.5" />', 'picker-check'));
    li.addEventListener('click', () => choose(i));
    li.addEventListener('pointermove', () => highlight(i));
    list.append(li);
    return li;
  });

  picker.append(button, list);
  select.after(picker);
  select.hidden = true;

  let active = 0;

  function render() {
    const i = Math.max(0, select.selectedIndex);
    button.replaceChildren(iconTile(options[i].value));
    const value = document.createElement('span');
    value.className = 'picker-value';
    value.textContent = options[i].textContent;
    button.append(value);
    button.insertAdjacentHTML('beforeend', svg('<path d="m7 10 5 5 5-5" />', 'picker-chevron'));
    items.forEach((li, j) => li.setAttribute('aria-selected', String(j === i)));
  }

  function highlight(i) {
    active = (i + items.length) % items.length;
    items.forEach((li, j) => li.classList.toggle('is-active', j === active));
    list.setAttribute('aria-activedescendant', items[active].id);
    items[active].scrollIntoView({ block: 'nearest' });
  }

  function open() {
    if (!list.hidden) return;
    list.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    // Open upwards when the menu would run off the bottom of the window.
    list.classList.remove('is-up');
    const below = window.innerHeight - button.getBoundingClientRect().bottom;
    const above = button.getBoundingClientRect().top;
    list.classList.toggle('is-up', below < list.offsetHeight + 16 && above > below);
    highlight(Math.max(0, select.selectedIndex));
    list.focus({ preventScroll: true });
  }

  function close(refocus = true) {
    if (list.hidden) return;
    list.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (refocus) button.focus({ preventScroll: true });
  }

  function choose(i, refocus = true) {
    if (select.selectedIndex !== i) {
      select.selectedIndex = i;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    render();
    close(refocus);
  }

  button.addEventListener('click', () => (list.hidden ? open() : close()));
  button.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      open();
    }
  });

  let typed = '';
  let typedAt = 0;
  list.addEventListener('keydown', (event) => {
    const keys = {
      ArrowDown: () => highlight(active + 1),
      ArrowUp: () => highlight(active - 1),
      Home: () => highlight(0),
      End: () => highlight(items.length - 1),
      Enter: () => choose(active),
      ' ': () => choose(active),
      Escape: () => close(),
    };
    if (keys[event.key]) {
      event.preventDefault();
      keys[event.key]();
    } else if (event.key === 'Tab') {
      choose(active, false);
    } else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) {
      // Type to jump, as a native select does.
      typed = (Date.now() - typedAt > 700 ? '' : typed) + event.key.toLowerCase();
      typedAt = Date.now();
      const match = options.findIndex((o) => o.textContent.toLowerCase().startsWith(typed));
      if (match >= 0) highlight(match);
    }
  });

  document.addEventListener('pointerdown', (event) => {
    if (!picker.contains(event.target)) close(false);
  });
  // Tabbing or clicking away. A null relatedTarget is Safari clicking the button
  // (which it never focuses), and the click handler toggles that instead.
  list.addEventListener('focusout', (event) => {
    if (event.relatedTarget && !picker.contains(event.relatedTarget)) close(false);
  });
  select.addEventListener('change', render);
  // reset fires before the form's controls are reset.
  select.form.addEventListener('reset', () => setTimeout(render));

  render();
}

// The phone a visitor is browsing on, if it is one: the likeliest place for the
// problem they are reporting. Only the platform is guessed, never the OS version,
// which current browsers freeze or round in the user agent.
function guessPlatform() {
  const ua = navigator.userAgent;
  // iPadOS asks for desktop pages as a Mac; the touch screen gives it away.
  if (/iPhone|iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) {
    return 'iphone';
  }
  return /Android/.test(ua) ? 'android' : null;
}

// Fields that follow the topic. Everything in the form carrying data-topics is
// shown only for the topics it names; hidden fields are also disabled, so they are
// neither validated nor sent. The message's label, placeholder and whether it is
// required follow too: a deletion, or a privacy request for a copy or an erasure,
// needs nothing more than the choice itself.
function followTopic(form) {
  const message = form.message;
  const optionalHint = form.querySelector('.message-optional');
  const blocks = '.field, .topic-note, .check';
  let shown = null;

  function sync() {
    const topic = form.topic.value;
    const request = form.request?.value;
    for (const el of form.querySelectorAll('[data-topics]')) {
      const visible = el.dataset.topics.split(' ').includes(topic);
      // Animate a block in, but not on load or when the topic is unchanged.
      if (visible && el.hidden && shown !== null && el.matches(blocks)) {
        el.classList.remove('topic-in');
        void el.offsetWidth;
        el.classList.add('topic-in');
      }
      el.hidden = !visible;
      if (el.matches('fieldset, input, select, textarea')) el.disabled = !visible;
      else el.querySelectorAll('input, select, textarea').forEach((i) => (i.disabled = !visible));
    }

    const key = `placeholder${topic[0].toUpperCase()}${topic.slice(1)}`;
    message.placeholder = message.dataset[key] ?? message.getAttribute('placeholder');
    const optional =
      topic === 'delete' || (topic === 'privacy' && ['copy', 'erase'].includes(request));
    message.required = !optional;
    optionalHint.hidden = !optional;

    // A bug is most often on the phone in hand, so start there; any choice the
    // visitor makes stands.
    if (topic === 'bug' && shown !== 'bug' && !form.querySelector('[name="platform"]:checked')) {
      const guess = guessPlatform();
      if (guess) form.querySelector(`[name="platform"][value="${guess}"]`).checked = true;
    }
    shown = topic;
  }

  // The question's placeholder, kept for switching back.
  message.dataset.placeholderQuestion = message.getAttribute('placeholder');
  form.topic.addEventListener('change', sync);
  form.addEventListener('change', (event) => event.target.name === 'request' && sync());
  // reset fires before the form's controls are reset.
  form.addEventListener('reset', () =>
    setTimeout(() => {
      shown = null;
      sync();
    })
  );
  sync();
}

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
  enhanceTopicPicker(form.topic);
  followTopic(form);

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
      if (response.status === 429) {
        setStatus(
          fr
            ? 'Trop de messages envoyés depuis cette connexion. Réessayez dans une heure.'
            : 'Too many messages from this connection. Please try again in an hour.',
          'error'
        );
        return;
      }
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

// Back from an email confirmation link: the app's Site URL is this page.
// - Supabase appends the outcome to the hash: a session, or an error
// - The hash leaves the address bar and history straight away
// - The session it carries is revoked: the app has its own, this one is unused
// - A short message says what happened, in the page's or browser's language
(() => {
  const params = new URLSearchParams(location.hash.slice(1));
  const token = params.get('access_token');
  const error = params.get('error_code') || params.get('error');
  const message = params.get('message');
  if (!token && !error && !message) return;

  history.replaceState(null, '', location.pathname + location.search);

  if (token) {
    fetch('https://csapfwigvxyasodfiejy.supabase.co/auth/v1/logout?scope=local', {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
      keepalive: true,
    }).catch(() => {});
  }

  const fr = document.documentElement.lang === 'fr' || /^fr\b/i.test(navigator.language || '');
  const copy = fr
    ? {
        ok: [
          'Courriel confirmé',
          'Retournez dans Daily Ring\u00a0: vos habitudes sont maintenant sauvegardées sous cette adresse.',
        ],
        step: ['Encore une étape', 'Confirmez aussi avec le lien envoyé à votre autre adresse.'],
        expired: [
          'Ce lien a expiré',
          'Il a peut-être déjà servi. Dans Daily Ring, ouvrez Habitudes → Compte pour en recevoir un nouveau.',
        ],
        close: 'Fermer',
      }
    : {
        ok: [
          'Email confirmed',
          'Head back to Daily Ring: your habits are now saved under this address.',
        ],
        step: ['One more step', 'Also confirm with the link sent to your other address.'],
        expired: [
          'This link has expired',
          'It may have been used already. In Daily Ring, open Habits → Account to get a new one.',
        ],
        close: 'Close',
      };
  const kind = token ? 'ok' : error ? 'expired' : 'step';
  const [title, body] = copy[kind];

  const notice = document.createElement('div');
  notice.className = `auth-notice auth-notice-${kind}`;
  notice.setAttribute('role', 'status');
  const text = document.createElement('div');
  const strong = document.createElement('strong');
  strong.textContent = title;
  const p = document.createElement('p');
  p.textContent = body;
  text.append(strong, p);
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'auth-notice-close';
  close.setAttribute('aria-label', copy.close);
  close.textContent = '×';
  close.addEventListener('click', () => notice.remove());
  notice.append(text, close);
  document.body.append(notice);
})();
