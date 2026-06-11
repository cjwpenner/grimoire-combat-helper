# How to Publish & Test Grimoire

Grimoire is a **Progressive Web App (PWA)**: a website that users can install
to their phone's home screen, where it runs full-screen and works offline.
No app store is required for the primary distribution path.

**Live URL:** https://dandmonsters.com/ (custom domain for the repo's GitHub Pages site)

---

## 1. Deploying to GitHub Pages

Deployment is automated. Every push to `master` triggers the GitHub Actions
workflow in `.github/workflows/deploy.yml`, which:

1. Installs dependencies (`npm ci` in `grimoire-web/`)
2. Builds the production bundle (`npm run build`)
3. Publishes `grimoire-web/dist/` to GitHub Pages

To deploy manually, just push to `master`:

```powershell
git push origin master
```

Watch the run at: https://github.com/cjwpenner/grimoire-combat-helper/actions

> **Important:** `base` in `grimoire-web/vite.config.ts` is `/` because the
> site is served at the root of the custom domain. If the custom domain is
> ever removed, change it to `/grimoire-combat-helper/` (the repo-name path
> GitHub Pages falls back to). Everything else (manifest, service worker,
> router) derives its paths automatically.

## 2. Installing on a phone (PWA)

### iOS (Safari)

1. Open the live URL in **Safari** (other iOS browsers can't install PWAs).
2. Tap the **Share** button (square with arrow).
3. Scroll down, tap **Add to Home Screen**, then **Add**.
4. Launch "Grimoire" from the home screen — it opens full-screen with the
   d20 icon, and works offline after the first load.

### Android (Chrome)

1. Open the live URL in **Chrome**.
2. Chrome may show an **Install app** banner automatically; otherwise open
   the **⋮ menu → Add to Home screen → Install**.
3. Launch from the home screen or app drawer.

## 3. Testing checklist

Run through this after each deploy (DevTools device emulation is fine for
most of it, but do at least one pass on a real phone):

- [ ] **Monster picker** — search, difficulty filter pills, party size/level inputs
- [ ] **Party config sync** — set party size on the home page, open a monster,
      confirm the difficulty badge reflects the same party
- [ ] **Stat block** — AC/HP/speed, ability grid, traits render
- [ ] **Combat tab** — turns generate, Roll Attack/Damage open the dice modal
- [ ] **Dice roller** — formula parsing, animation, result breakdown, history
- [ ] **Theme toggle** — flips light/dark and survives a reload
- [ ] **Back button** — in-app back arrow on the detail page returns home
- [ ] **Offline** — DevTools → Network → Offline, then reload and deep-link
      to a monster page; everything should still render
- [ ] **Install** — Add to Home Screen on iOS and Android, verify the icon
      and full-screen launch

### Verifying the service worker

DevTools → **Application** tab:

- **Service Workers** — `sw.js` should show *activated and running*
- **Cache Storage** — `grimoire-v2` should contain the app shell,
  `grimoire.json`, the icons, and the hashed `assets/*.js` / `*.css` bundles

After deploying a new version, the service worker updates on the next visit
(the page may need one reload to pick up new assets).

## 4. Sharing with playtesters

Send testers the live URL plus the install steps above. Useful extras:

- Generate a QR code for the URL (e.g. `qrencode` or any online generator) —
  easiest way to get it onto phones at the table.
- Pin a GitHub issue as a feedback thread, or share a form link.

## 5. App stores (optional, later)

PWAs cannot be submitted to the stores directly; they need a native wrapper.
Only worth doing if you need store presence or native APIs:

| Path | Tooling | Notes |
|------|---------|-------|
| **Google Play** | [PWABuilder](https://www.pwabuilder.com) or [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) | Generates a Trusted Web Activity (TWA) wrapper around the live URL. Requires a one-time $25 Play developer account and a `assetlinks.json` file served by the site. |
| **iOS App Store** | [Capacitor](https://capacitorjs.com) | Wraps the app in a WKWebView shell built in Xcode (needs a Mac). Requires the $99/yr Apple Developer Program. Distribute betas via **TestFlight**: archive in Xcode → upload → invite testers by email/public link. |

For a D&D table tool, the PWA path covers nearly all use cases — start there,
and only invest in store wrappers if testers ask for them.
