# Daily Ring website

The support, privacy policy and account deletion pages for Daily Ring, served by GitHub Pages.

Plain HTML, CSS and JavaScript — no build step. Edit a file, push to `main`, and Pages redeploys.

- `index.html` — support: features, FAQ and the contact form
- `privacy.html` — privacy policy
- `delete-account.html` — how to delete an account
- `fr/` — the French versions of the three pages, with the same file names; they load the shared assets from `../`
- `site.js` — scroll reveal and the contact form; `CONTACT_ENDPOINT` points at the Supabase `contact` Edge Function, which emails each message through Resend and stores nothing

The Edge Function itself lives in the app repo under `supabase/functions/contact/`.

The site is in English and French. Each page links to its counterpart from the `EN`/`FR` switch in the header and from the footer, and declares both with `hreflang` alternates. A change to one language's copy goes into the other in the same commit. The app is in English and French too, so the French pages name in-app labels by their French text (**Habitudes → Compte**), and show French screenshots from `images/fr/`. The English privacy policy is the one that prevails, which the French version says.
