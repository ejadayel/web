# Daily Ring website

The support, privacy policy and account deletion pages for Daily Ring, served by GitHub Pages.

Plain HTML, CSS and JavaScript — no build step. Edit a file, push to `main`, and Pages redeploys.

- `index.html` — support: features, FAQ and the contact form
- `privacy.html` — privacy policy
- `delete-account.html` — how to delete an account
- `site.js` — scroll reveal and the contact form; `CONTACT_ENDPOINT` points at the Supabase `contact` Edge Function, which emails each message through Resend and stores nothing

The Edge Function itself lives in the app repo under `supabase/functions/contact/`.
