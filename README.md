# Fathi & Shaza — Graduation Afterparty 🎓

A mobile-first, animated invite site for the UGA graduation afterparty (buffet dinner),
with a Three.js particle background, scroll animations, a live countdown, and an
RSVP form that can write straight into a Google Sheet.

## Files

- `index.html` — page markup
- `style.css` — mobile-first styling & animations
- `script.js` — Three.js background, countdown, scroll reveals, RSVP logic
- `config.js` — **edit this** to set the real event date/time and your Google Sheet URL
- `google-apps-script.gs` — paste into Google Apps Script to receive RSVPs

## 1. Update event details

Edit `index.html`:
- Restaurant name/address (currently "ABC Restaurant, 123 Placeholder Ave, Athens, GA")
- Time (currently "8:00 PM")

Edit `config.js`:
```js
eventDateTime: "2026-07-18T20:00:00", // used by the countdown timer
```

## 2. Connect RSVPs to a Google Sheet

1. Create a new Google Sheet, e.g. "Grad Afterparty RSVPs".
2. In the Sheet, go to **Extensions > Apps Script**.
3. Delete the placeholder code and paste in the contents of `google-apps-script.gs`.
4. Click **Deploy > New deployment**, choose type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, authorize the script, and copy the **Web app URL**.
6. Paste that URL into `config.js`:
   ```js
   googleSheetWebAppUrl: "https://script.google.com/macros/s/XXXXXXXX/exec",
   ```
7. Reload the site — RSVP submissions will now append a row (Name, Timestamp) to your Sheet.

> Note: while `googleSheetWebAppUrl` is empty, submitting the form will just show
> the "See you there!" confirmation without saving anywhere — set the URL once
> your Sheet is ready so responses are actually recorded.

## 3. Run locally

Any static file server works, e.g.:
```bash
cd grad-afterparty
python3 -m http.server 8080
```
Then open http://localhost:8080 on your phone (mobile-first!) or desktop browser.

## 4. Deploy

This is a fully static site — you can host it for free on GitHub Pages, Netlify,
Vercel, or Cloudflare Pages by just uploading these files.
