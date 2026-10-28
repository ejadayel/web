# Daily Ring website

The support, privacy policy and account deletion pages for Daily Ring, served by GitHub Pages.

Plain HTML, CSS and JavaScript — no build step. Edit a file, push to `main`, and Pages redeploys.

- `index.html` — support: features, FAQ and the contact form
- `privacy.html` — privacy policy
- `delete-account.html` — how to delete an account
- `terms.html` — terms of sale for Daily Ring Plus: renewal, refunds, and what happens if the app is discontinued
- `images/` — screenshots cropped from the App Store slides in the app repo's `store/` (`fr/` for the French captures), and `icons/`, the Plus app-icon previews from the app's `assets/images/app-icons/`
- `audio/` — the Plus sound packs' fanfares, converted to MP3 from the app's `assets/audio/`, played by the Plus section's sound buttons
- `fr/` — the French versions of the four pages, with the same file names; they load the shared assets from `../`
- `site.js` — store badges, the theme switch, scroll reveal and the contact form. The theme switch (Automatic, Light, Dark, as in the app) pins `data-theme` on `<html>` and keeps the choice in `localStorage` under `daily-ring-theme`; an inline script in each page's head applies it before first paint, so a new page needs that script too. The privacy policy mentions this, and is the place to update if anything else is ever kept. `STORE_LINKS` holds the App Store and Google Play URLs: while one is empty its badges read "Coming soon" and are not links, and filling it in turns them into download links on every page. The badges use neutral glyphs rather than the stores' logos, which only the official badge artwork may carry, so swap that artwork in once the listings are live; `CONTACT_ENDPOINT` points at the Supabase `contact` Edge Function, which emails each message through Resend and stores nothing

The Edge Function itself lives in the app repo under `supabase/functions/contact/`.

The site is in English and French. Each page links to its counterpart from the `EN`/`FR` switch in the header and from the footer, and declares both with `hreflang` alternates. A change to one language's copy goes into the other in the same commit. The app is in English and French too, so the French pages name in-app labels by their French text (**Habitudes → Compte**), and show French screenshots from `images/fr/`. The English privacy policy is the one that prevails, which the French version says.

`images/og.jpg` and `images/fr/og.jpg` are the 1200 × 630 share previews: the hero rendered at 1200px wide and cropped below the header. Re-render them when the hero changes.
