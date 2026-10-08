# Token Ledger — GitHub Pages build

This is the **publishable** copy of the site. It is the whole repo root: push it to
`jphermans/OpenRouter-Tracker-Support` and GitHub Pages serves it as-is.

It is also the working source — edit these files directly, there is no build step.

```
index.html
css/style.css
js/main.js
assets/
  icon-96.png          12 KB   header + footer logo
  icon-192.png         40 KB   favicon
  icon-512.png        232 KB   social share image (og:image)
  apple-touch-icon.png 36 KB   iOS home-screen shortcut
  app-store-badge.svg  12 KB   App Store badge (vector, paths only)
.nojekyll              empty; stops Jekyll from filtering the site
.gitignore
```

Total ≈ 350 KB, versus 1.1 MB before icon optimization.

## Publish

```bash
cd ~/Desktop
rm -rf OpenRouter-Tracker-Support
git clone https://github.com/jphermans/OpenRouter-Tracker-Support.git
# keep the repo's .gitignore history if you prefer; otherwise:
rsync -a --exclude '.git' token-ledger-github-pages/ OpenRouter-Tracker-Support/

cd OpenRouter-Tracker-Support
git add -A
git commit -m "Modern redesign of the Token Ledger site"
git push
```

Live at <https://jphermans.github.io/OpenRouter-Tracker-Support/> within a minute.

**If Pages is not yet enabled:** repo → Settings → Pages → Source: *Deploy from a
branch* → `main` / `/ (root)`.

## Before you publish

One item is still a placeholder — search `index.html` for `TODO`:

```
https://www.buymeacoffee.com/yourname
```

Replace it with your real donation link. The instructional note that used to sit under
that button is gone; only the HTML comment marks it, so visitors don't see it.

## Notes for later

- **og:image uses an absolute URL** (`https://jphermans.github.io/...`). Social crawlers
  need a full URL. If you ever move the site to a new repo/path, update the `og:image`,
  `twitter:image` and `canonical` tags in `index.html`.
- **Fonts load from the Google Fonts CDN**, so visitors make one third-party request. To
  go fully self-hosted, download the two families into `assets/fonts/` and swap the
  `<link>` for a `@font-face` block — optional, and everything works as-is without it.
- The upstream working copy with the generated design system lives at
  `~/Desktop/token-ledger-modern`. Keep changes in one place or copy them across;
  this folder is the one that gets pushed.

## Editing

- **Copy/headings/FAQ/privacy text** → `index.html`
- **Sample data** (spend series, account-log rows, model catalog, price table,
  changelog) → the five objects at the top of `js/main.js`
- **Colors/branding** → the `--blue` / `--orange` variables in `:root` at the top of
  `css/style.css`; everything re-themes from there