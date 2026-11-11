# Business Con × Krillion

A three-question Krillion dive built for the Business Con Instagram Reel. It plays like an ordinary Krillion game until someone types **Business Con**. That answer sinks all the way to the trench floor and lands as **1 IN A KRILLION**. After question 3 the player surfaces onto the Business Con end screen.

It's a fork of [OpenKrillion](https://github.com/VulcanEon/openkrillion.com-service) (MIT, see `LICENSE`). The original ocean, pixel art, sounds, tier ladder, timer and landing animations are unchanged. Only the question source, round count and ending are different.

## Run it locally

You need Node.js 24 or newer. Nothing else: there's no `npm install`, no API keys and no database.

```bash
npm start
```

Then open http://localhost:4173. This builds `dist/` and serves it. To use a different port, run `node scripts/serve.mjs 8080`.

Run the tests:

```bash
node --test tests/campaign.test.mjs
```

## Recording the Reel

- Use your phone, or a desktop browser in device mode at **390 × 844** (9:16). Every screen was checked at that size.
- Turn sound on with the speaker button. Audio starts on the first tap.
- **☰ → Restart from prompt 1** reloads to the start screen. **↺ PLAY AGAIN** on the end screen jumps straight to question 1.
- Each landing screen stays up until you tap **DESCEND**, so you choose how long viewers get to read the result.
- Each question has a 25-second answer timer. You can change it in the config.

## Changing questions, answers and the end screen

Everything is in **`public/campaign.config.mjs`**. After editing, run `npm start` again (or just push, if you use GitHub Pages).

| What | Where in the config |
|---|---|
| Question wording and order | `QUESTIONS[].text` |
| Ordinary answers and their tiers | `QUESTIONS[].answers`, written as `a('Answer', 'tier', ['aliases'])` |
| The special answer, its aliases and quip | `SPECIAL_ANSWER` (shared by all three questions through `special:`) |
| Answers not in the bank | `GAME.unlisted.tier`: currently `'schooler'` (30 pts). Set it to `null` to reject them the way the original game does ("no echo. try again"). |
| Timer and countdown | `GAME.answerSeconds`, `GAME.previewSeconds` |
| Start screen title, tab title, dive number | `GAME.title`, `GAME.pageTitle`, `GAME.diveNumber` |
| End screen | `END_SCREEN`: `eventName`, `date`, `venue`, `tagline`, `statusLead`, `status`, `details`, `logo`, `registrationUrl`, `registrationLabel`, `qrCode`, `replayLabel` |

Tiers, from lowest to highest: `plankton` 10 · `tooclever` 15 · `schooler` 30 · `rare` 60 · `deepcut` 85 · `krillion` 100. The `krillion` tier displays as **1 IN A KRILLION** and is reserved for the special answer.

**Adding the logo or QR code:** put the image in `public/assets/`, for example `public/assets/business-con-logo.png`. Then set `logo: 'assets/business-con-logo.png'` (or `qrCode: 'assets/qr.png'`). An empty field is simply left off the end screen. No event date or registration link has been filled in yet.

**Special-answer matching** ignores case, spaces, hyphens and punctuation. `Business Con`, `business con`, `BUSINESS CON`, `BusinessCon`, `business-con` and ` BUSINESS CON ` all match exactly. A near-miss typo like `Busness Con` gets the original game's "corrects to Business Con, submit again to confirm" prompt.

## Deploying publicly (GitHub Pages)

1. Create a new **empty** GitHub repository under your own account.
2. Point this folder at it and push:
   ```bash
   git remote set-url origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   ```
   ```bash
   git add -A && git commit -m "Business Con × Krillion" && git push -u origin main
   ```
3. On GitHub, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
4. The included workflow (`.github/workflows/pages.yml`) runs the tests, builds `dist/` and publishes it. The site appears at `https://YOUR-USERNAME.github.io/YOUR-REPO/`. All paths are relative, so it works from a subfolder.

Any static host also works: upload the contents of `dist/` to Netlify Drop, Vercel or Cloudflare Pages.

## What changed from OpenKrillion

- **`public/campaign.config.mjs` (new):** the single place for questions, answer banks, the special answer, timing and end-screen content.
- **`public/local-api.mjs` (new):** an in-browser version of the Worker API (`today`, `start`, `next`, `answer`, `pause`, `review`). It keeps the original matching, fuzzy correction, rejection and tier scoring. It reads from the config instead of D1, so the game needs no server and runs as static files.
- **`public/app.mjs`:** calls the local API instead of `fetch`, uses the config's round count and timer instead of a hardcoded 7, marks special landings with a `special-answer` class, and replaces the results page with the Business Con end screen (round recap → BUSINESS CON '27 @ SJII → tagline → "Be there or BE SQUARE" → play again). It also adds a Restart menu action.
- **`public/rules.mjs`:** the top tier is now named "1 in a Krillion".
- **`public/campaign.css` (new):** a larger, gold, pulsing "1 IN A KRILLION" for the special landing, positioned below the gold krill so they don't overlap, plus the end-screen styles. It reuses the original palette and VT323 pixel font.
- **`src/campaign-page.mjs` + `scripts/build-static.mjs` + `scripts/serve.mjs` (new):** build and serve the static page. This page drops the SEO guide, AI-docs links, analytics and footer links so nothing distracts on camera, and it shows no Business Con branding before the end.
- Asset paths are now relative (`assets/…`), so the build works on GitHub Pages.
- The Cloudflare Worker (`src/worker.mjs`), its tests and the original README (`README.openkrillion.md`) are still there but aren't needed for the campaign build.

## Testing performed

- `tests/campaign.test.mjs` checks the exact wording and order of the three questions. It checks that every listed variation of Business Con is 1 IN A KRILLION on every question with no correction prompt, and that ordinary answers keep normal tiers and are never special. It plays three full runs of special answers (300 pts, completed, restart lands on round 1) and one mixed run. All 4 pass.
- The original 14 OpenKrillion tests still pass (`npm test`).
- In a real browser at 390 × 844 (mobile). At desktop size, only the question screen was checked.
  - Q1 "Business Con" → 1 IN A KRILLION
  - Q1 "Football" → PLANKTON
  - Q2 "businesscon" and "business-con" → 1 IN A KRILLION
  - Q2 "LinkedIn" → PLANKTON
  - Q3 " BUSINESS CON " → 1 IN A KRILLION
  - The end screen shows the recap and the Business Con reveal
  - PLAY AGAIN goes back to question 1
  - Nothing is cropped
  - No console errors

## Limitations

- The answer banks are hand-written. Real Krillion uses crowd data, so tiers for ordinary answers are judgment calls. Edit them freely.
- Answers that aren't in a bank score as Schooler by default, so a typo of an ordinary answer might score instead of being corrected. Set `GAME.unlisted.tier` to `null` for strict original behaviour.
- The streak, logbook and wardrobe features from OpenKrillion still work, but they only use this browser's local storage.
- This is an independent, Krillion-inspired fork and isn't affiliated with krillion.io. Keep the `LICENSE` file when you share the code.
