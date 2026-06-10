# Grimoire Mobile Web App Redesign — Design Specification

**Document:** Grimoire Mobile Web App Redesign  
**Author:** Chris Penner  
**Date:** 2026-06-10  
**Status:** Approved  
**Scope:** Mobile-first UI redesign + dice roller + in-app navigation + PWA deployment  

---

## 1. Overview

**Goal:** Transform the existing Grimoire web app into a mobile-first, production-ready web application deployable to iOS (via home screen PWA) and Android (via PWA or HTTP Shortcuts). Improve visual design and usability with color theming, animated dice roller, and proper in-app navigation.

**Current State:**
- React + TypeScript web app (Vite, Tailwind)
- Single-page app with 322 SRD monsters
- Basic UI, no theming, browser back button issues
- No dice roller
- Existing logic reusable: models, difficulty calc, action selector

**Target Outcome:**
- Mobile-optimized, visually cohesive web app
- Home screen installable (PWA)
- Offline-capable (cached Grimoire JSON + graceful image fallback)
- Animated dice roller integrated into combat turn flow
- In-app navigation with working back button
- Free deployment to GitHub Pages
- Zero infrastructure costs

**Success Criteria:**
- Josie can install app on iPad home screen, use it seamlessly
- App works offline (Grimoire JSON cached, images fail gracefully)
- Dice roller feels responsive and fun (animated rolls)
- Back button navigates within app, not to browser history
- Color theming improves visual appeal and readability
- All original functionality preserved (picker, stat blocks, turn display)

---

## 2. Architecture & Deployment

### 2.1 Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend Framework** | React 19 + TypeScript | Existing codebase, Vite already in place |
| **Routing** | React Router v6 | Industry standard, minimal overhead |
| **Styling** | Tailwind CSS | Existing setup, good for theming |
| **State Management** | React Context + local state | Navigation state is simple enough for Context |
| **Offline** | Service Worker (native) | Native browser API, no dependency |
| **PWA** | Web App Manifest + SW | Standard, no extra libraries needed |
| **Hosting** | GitHub Pages | Free, static, fast, auto-deploys on push |
| **Deployment** | GitHub Actions (optional) | Automate build → deploy |

### 2.2 Hosting & Access Model

**Primary:** Web app hosted on GitHub Pages at `https://<github-username>.github.io/grimoire/`

**Installation Methods:**

1. **iOS (iPad):**
   - Open URL in Safari
   - Tap Share → "Add to Home Screen"
   - App appears as home screen icon
   - Launches full-screen, PWA manifest controls appearance

2. **Android:**
   - Open URL in Chrome or Firefox
   - Browser offers "Install app" prompt (or tap menu → "Install app")
   - Appears as home screen icon
   - Same full-screen PWA experience

3. **Optional: HTTP Shortcuts (post-launch QoL)**
   - iOS: Use Shortcuts app to create custom shortcuts (e.g., quick roll d20)
   - Android: Use HTTP Shortcuts app for same
   - Not required for core functionality

### 2.3 Data & Caching Strategy

**Grimoire JSON:**
- Loaded on first app visit
- Cached in service worker (IndexedDB backup)
- On subsequent visits: serve from cache, check for updates in background
- If offline: serve cached version
- Update check: Every session, with user notification if new version available (optional)

**Monster Images:**
- Lazy-loaded from GitHub repo on-demand (not at install time)
- Cached in browser localStorage/cache API after first load
- If offline and image not cached: show placeholder image
- No blocking — app remains fully functional without images

**Local Storage:**
- Theme preference (dark/light)
- Last selected party config (size, level)
- Scroll position in picker (UX polish)
- NOT saved: roll history, selected monster (session-only)

### 2.4 Offline Behavior

**Online:**
- Full functionality
- Images load normally
- Background sync checks for app updates

**Offline (or slow connection):**
- All core functionality works (picker, stat block, turn display, dice roller)
- Images show placeholder or cached version
- Graceful degradation — app is usable, not broken

---

## 3. UI/UX Design

### 3.1 Mobile-First Layout

**Responsive Breakpoints:**
- Phone (320–640px): 1 card per row, optimized for thumb navigation
- Tablet (640–1024px): 2 cards per row, larger text
- Larger tablets (1024px+): 3 cards per row, more spacious

### 3.2 Screen: Monster Picker

**Components:**
- **Header:** App logo/name, theme toggle (sun/moon icon), hamburger menu (optional, for future)
- **Search bar:** Sticky at top, auto-focus on mount. Placeholder: "Search monsters..."
- **Filter pills:** Difficulty buttons (All, Easy, Moderate, Hard, Deadly, Beyond Deadly). Active pill highlighted.
- **Monster grid:** Card layout, each card shows:
  - Monster name (bold, readable)
  - CR (challenge rating)
  - Difficulty badge (colored: green/yellow/orange/red)
  - Size/type (small text)
  - Optional: D&D icon or visual indicator (e.g., skull for deadly)
- **Pagination:** If many results, "Load more" button or infinite scroll

**Interaction:**
- Tap a card → navigate to detail screen
- Search/filter → update results in real-time
- Scroll → smooth, no jank

### 3.3 Screen: Monster Detail (Stat Block) + Combat Turn

**Layout:** Two tabs or stack view:
1. **Stat Block tab:** Read-only monster stats (AC, HP, abilities, traits, actions)
2. **Combat tab:** Turn display + dice roller button

**Stat Block:**
- Organized in scrollable cards:
  - Basic info (name, size, type, CR, difficulty)
  - AC, HP, Speed
  - Ability scores (STR, DEX, CON, etc., with modifiers)
  - Damage resistances/immunities
  - Condition immunities
  - Senses, languages
  - Traits (passive abilities)
  - Actions (attack list, not the rolled turn yet)
  - Reactions (if any)
  - Warning banner if spellcaster/legendary (existing v1_unsupported_features)

**Combat Turn Display:**
- Large, scannable format
- Turn counter (Turn 1, Turn 2, etc.)
- If multiattack:
  - Multiattack description (prominent, quoted)
  - "Available attacks:" list below (each with attack bonus, damage, rider effect)
- If single action:
  - Action name and description
  - Attack bonus, damage, rider effect
- Buttons:
  - **"Roll Attack"** → opens dice roller with attack formula pre-filled
  - **"Roll Damage"** → opens dice roller with damage formula pre-filled
  - **"Next Turn"** → generates new random action (or next multiattack)
  - **Back** → returns to picker

**Header:**
- Monster name (with CR badge)
- Back button (arrow icon, in-app navigation, not browser back)

### 3.4 Screen: Dice Roller Modal

**Trigger:** User taps "Roll Attack" or "Roll Damage" from combat turn display, or directly from an action card

**Modal Layout:**
- Full-screen modal or bottom sheet (iOS-style)
- Header: "Roll Dice" title, close button (X)
- **Formula input:** Pre-filled with the action's attack or damage formula (editable)
  - Examples: "1d8+2", "2d6", "1d20+5"
  - Allow manual editing
- **"Roll" button:** Large, prominent, tappable
- **Rolling animation:** Dice tumble/spin on screen (3–5 sec)
- **Result display:** Large, bold number (e.g., "14"), with breakdown:
  - "3 (from 1d8) + 4 (from 1d6) + 2 (bonus) = 9"
- **History section:** Show last 5 rolls in compact list (scrollable)
  - Each row: formula + result + timestamp
- **Buttons below result:**
  - **"Roll Again"** → re-roll same formula immediately
  - **"Close"** → dismiss modal, return to combat turn
  - **"Copy to Clipboard"** (optional) → copy result as "9"

**Animation Details:**
- Dice graphic(s) tumble/spin (CSS animation or simple canvas)
- Landing effect (bounce, settle)
- Haptic feedback if device supports (vibration on result)
- No lag — should feel snappy (max 5 sec total)

### 3.5 Color Theming

**Design System:**

| Element | Light Mode | Dark Mode | Notes |
|---------|-----------|-----------|-------|
| **Background** | #F8F7F4 (off-white) | #1A1A1A (charcoal) | Warm off-white in light, cool dark in dark |
| **Text (primary)** | #1A1A1A | #F8F7F4 | High contrast for readability |
| **Text (secondary)** | #666666 | #AAAAAA | Muted for secondary info |
| **Accent (primary)** | #D4AF37 (D&D gold) | #D4AF37 (same gold) | Consistent across themes, evokes D&D |
| **Header/Dividers** | #2C1B47 (deep purple) | #3D2E5F (lighter purple) | D&D aesthetic |
| **Cards** | #FFFFFF | #2D2D2D | Contrast against background |
| **Difficulty badges** | See below | See below | Consistent across themes |

**Difficulty Badge Colors:**

| Difficulty | Background | Text |
|-----------|-----------|------|
| **Easy** | #4CAF50 (green) | White |
| **Moderate** | #FFC107 (amber) | Dark |
| **Hard** | #FF9800 (orange) | White |
| **Deadly** | #F44336 (red) | White |
| **Beyond Deadly** | #B71C1C (dark red) | White |

**Theme Toggle:**
- Sun icon (light mode), Moon icon (dark mode)
- Placed in header
- Click toggles theme immediately
- Preference persisted in localStorage

**CSS Approach:**
- CSS custom properties for colors (`:root[data-theme="light"]` / `[data-theme="dark"]`)
- Tailwind's `dark:` modifier for conditional styling
- Smooth transition on theme switch (100–200ms)

### 3.6 Navigation Structure

**Navigation Stack (Simplified):**
```
picker (home)
  ├── monster/{id} (stat block + combat turn)
  │     ├── dice-roller (modal, overlays monster screen)
  └── [back button returns to picker]
```

**In-App Back Button:**
- Rendered as `<` icon in header (or labeled "Back")
- Disabled on picker screen (nowhere to go)
- Tapping back:
  - From monster detail → returns to picker
  - From any screen → pops navigation stack
- Not the browser back button — prevents accidental app exit

**URL Sync (Optional Nice-to-Have):**
- URL reflects navigation: `/`, `/monster/werewolf`, etc.
- Allows bookmarking and browser history within the app
- Not critical for MVP, but easy to add with React Router

---

## 4. Feature: Dice Roller

### 4.1 Functionality

**Input:**
- Dice formula string (e.g., "1d8+2", "2d6+5", "1d20")
- Can be pre-filled from action data (attack_bonus, damage formula)
- User can edit before rolling

**Parsing & Validation:**
- Support standard D&D dice notation: `NdM+B` (N dice, M sides, B bonus)
- Examples: `1d20+5`, `2d6`, `1d8+2`, `3d6+1d4+2`
- Validate on input (show error if malformed)

**Rolling Algorithm:**
- Generate random integers for each die
- Sum with bonus
- Return result and breakdown

**Result Display:**
- Large, bold number (primary result)
- Breakdown: "2 (from 1d6) + 3 (from 1d6) + 2 (bonus) = 7"
- Timestamp (for history)

**History:**
- Store last 5 rolls in component state (session-only, not persisted)
- Each entry: formula, result, time
- User can see previous rolls at a glance

### 4.2 Integration with Combat Turn

**From Action Display:**
- User views a monster action (e.g., Werewolf Bite: +4 to hit, 1d8+2 piercing)
- Button: **"Roll Attack"** (uses attack_bonus, e.g., "1d20+4")
- Button: **"Roll Damage"** (uses damage formula, e.g., "1d8+2")
- Tapping either opens dice roller modal with formula pre-filled

**Interaction Flow:**
1. User sees turn display (multiattack or single action)
2. Taps "Roll Damage" button
3. Dice roller modal opens, pre-filled with "1d8+2"
4. User taps "Roll"
5. Animation plays (3–5 sec)
6. Result displayed: "You rolled 7"
7. User taps "Roll Again" for next roll, or "Close" to return

### 4.3 No Persistence

- Rolls not saved between sessions
- History cleared on app refresh
- This keeps scope small and matches the "session-only" ethos of the original tool

---

## 5. Technical Implementation Notes

### 5.1 Component Structure (Sketch)

```
App
├── Layout (header, footer, theme toggle)
├── Router
│   ├── Picker (monster list)
│   │   ├── SearchBar
│   │   ├── FilterPills
│   │   ├── MonsterGrid
│   │   │   └── MonsterCard (clickable)
│   │
│   ├── MonsterDetail
│   │   ├── Header (with back button)
│   │   ├── StatBlock (read-only)
│   │   ├── CombatTurn
│   │   │   ├── TurnDisplay
│   │   │   ├── RollButtons
│   │   │   └── DiceRoller (modal/overlay)
│   │   │       ├── FormulaInput
│   │   │       ├── RollButton
│   │   │       ├── ResultDisplay
│   │   │       └── RollHistory
```

### 5.2 State Management

**Global (Context or simple Redux):**
- `appTheme` (light/dark)
- `partyConfig` (size, level)
- `selectedMonsterId`
- `grimoire` (loaded monsters)

**Local (Component):**
- `searchTerm` (in picker)
- `filterDifficulty` (in picker)
- `rollHistory` (in dice roller)
- `currentFormula` (in dice roller)

### 5.3 Service Worker & PWA

**Service Worker:**
- Register on app load
- Intercept fetch requests:
  - Grimoire JSON: cache-first with fallback
  - Images: cache-first with fallback
  - Other assets: network-first
- Update strategy: Check for new version on each session, notify user if available (optional)

**Web App Manifest:**
```json
{
  "name": "Grimoire Combat Helper",
  "short_name": "Grimoire",
  "description": "D&D 5e monster stat blocks and combat helper for DMs",
  "start_url": "/grimoire/",
  "display": "standalone",
  "background_color": "#1A1A1A",
  "theme_color": "#D4AF37",
  "icons": [
    {
      "src": "/grimoire/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/grimoire/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 6. Deployment & Distribution

### 6.1 GitHub Pages

- Source code in `main` branch, `/grimoire-web` folder
- Build output pushed to `gh-pages` branch (or `docs/` folder, depending on repo settings)
- GitHub Pages auto-deploys
- URL: `https://<github-username>.github.io/grimoire/`

### 6.2 Optional: GitHub Actions CI/CD

- Trigger: Push to `main`
- Steps:
  1. Install dependencies
  2. Run linter, tests (if any)
  3. Build with Vite
  4. Deploy to GitHub Pages
- Result: Auto-deployment on every push

### 6.3 iOS PWA (No App Store)

- Josie opens Safari on iPad
- Navigates to the web app URL
- Taps Share → "Add to Home Screen"
- App appears as icon
- Launches full-screen, behaves like a native app (no address bar)
- Updates happen server-side (on your GitHub Pages)

### 6.4 Android PWA (No App Store)

- Josie opens Chrome or Firefox on phone
- Navigates to the web app URL
- Browser detects PWA manifest, shows "Install app" prompt (or tap menu → "Install app")
- App appears as home screen icon
- Same behavior as iOS

### 6.5 Optional: HTTP Shortcuts (Post-Launch Polish)

Not required for MVP, but available as QoL enhancement:

**iOS Shortcuts:**
- Create a shortcut in the Shortcuts app
- Shortcut opens the web app URL with custom home screen icon
- Examples: "Open Grimoire", "Roll d20"

**Android HTTP Shortcuts App:**
- Use the HTTP Shortcuts app to create custom shortcuts
- Can trigger web app actions or display results in app
- Examples: "Roll d20", "Open Grimoire Picker"

These are optional — PWA is the primary distribution method.

---

## 7. Testing & Quality Assurance

**Manual Testing Checklist (Pre-Release):**
- [ ] Picker loads all 322 monsters, search works
- [ ] Filtering by difficulty works on all bands
- [ ] Selecting a monster displays stat block correctly
- [ ] Combat turn display shows multiattack OR single action as expected
- [ ] Dice roller opens, formula pre-fills, roll animation plays
- [ ] Roll result correct and displayed
- [ ] Back button navigates correctly, doesn't exit app
- [ ] Theme toggle switches light/dark, preference persists
- [ ] App works offline (cache Grimoire JSON, images fail gracefully)
- [ ] App installable on iOS (home screen) and Android
- [ ] Images load on desktop/fast connection
- [ ] Images show placeholder when offline
- [ ] No console errors or warnings

**Browser/Device Testing:**
- iPhone/iPad Safari (iOS 15+)
- Chrome/Firefox Android (recent versions)
- Desktop Safari, Chrome, Firefox (responsive mode)

---

## 8. Out of Scope (Phase 2+)

- Server-side persistence (saved encounters, party history)
- Multi-user sync (one DM to multiple players)
- Structured multiattack patterns (advanced feature, PRD section 15)
- Spellcasting & legendary action logic (existing v1_unsupported_features handled with warning)
- Custom monster editing in UI (JSON-only for now)
- Dice rolling as part of the action system (roller is standalone tool)

---

## 9. Success Criteria & Validation

**Functional:**
- All original Grimoire features work (picker, stat blocks, turn display)
- Dice roller works, animates, displays results
- Back button works, app doesn't get lost in browser history
- Offline (Grimoire cached, images fail gracefully)
- Installable as home screen app (iOS + Android)

**Visual/UX:**
- Color theming improves readability and appeal
- Mobile layout is touch-friendly (large targets, proper spacing)
- Animations feel smooth and responsive (no jank)
- Theme toggle works and persists

**Deployment:**
- GitHub Pages hosting works, app loads from URL
- PWA manifest is valid
- Service worker caches correctly
- Updates deploy automatically on push

---

## 10. Glossary

| Term | Definition |
|------|-----------|
| **PWA** | Progressive Web App — web app that works offline and can be installed to home screen |
| **Service Worker** | Browser API for intercepting network requests and caching |
| **Grimoire** | JSON file with 322 D&D 5e monsters and their stats |
| **Stat Block** | A monster's structured data (AC, HP, abilities, actions, etc.) |
| **Multiattack** | An action that allows a monster to make multiple attacks per turn |
| **CR** | Challenge Rating — D&D measure of a monster's difficulty |
| **Difficulty Badge** | Visual indicator (colored label) showing whether a monster is Easy/Moderate/Hard/Deadly for the party |

---

*End of Design Specification.*
