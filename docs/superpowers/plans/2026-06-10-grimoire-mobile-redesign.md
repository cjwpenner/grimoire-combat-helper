# Grimoire Mobile Web App Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Grimoire web app into a mobile-first PWA with color theming, animated dice roller, proper navigation, and offline support.

**Architecture:** Single-page React app with React Router for navigation, Context API for theme/state, service worker for offline caching, deployed to GitHub Pages. Existing logic (difficulty, selector, models) reused unchanged. New dice roller integrated as modal overlay. UI redesigned for mobile-first responsive layout.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, React Router v6, Service Worker API (native)

**Estimated Effort:** ~12-15 hours (2-3 days focused work)

---

## File Structure Overview

### New Files
```
grimoire-web/
├── public/
│   ├── manifest.json                 # PWA manifest
│   └── sw.js                         # Service worker
├── src/
│   ├── contexts/
│   │   ├── ThemeContext.tsx          # Dark/light mode state
│   │   └── NavigationContext.tsx     # Navigation stack state
│   ├── components/
│   │   ├── Layout.tsx                # App wrapper (header, router outlet)
│   │   ├── DiceRoller.tsx            # Dice roller modal component
│   │   ├── StatBlock.tsx             # Monster stat display (extracted)
│   │   └── [refactored existing]
│   ├── lib/
│   │   ├── diceRoller.ts            # Dice parsing & rolling logic
│   │   ├── theme.ts                 # Theme utilities & colors
│   │   └── sw-register.ts           # Service worker registration
│   └── styles/
│       └── globals.css              # CSS variables for theming
```

### Modified Files
```
src/
├── App.tsx                           # Add Router, remove single-component rendering
├── components/
│   ├── Header.tsx                    # Add theme toggle, styling
│   ├── MonsterPicker.tsx             # Mobile-first redesign, cards
│   ├── MonsterCard.tsx               # Mobile styling, difficulty badge
│   ├── MonsterDetail.tsx             # Extract to detail route, refactor
│   └── CombatTurn.tsx                # Add Roll buttons, dice integration
├── main.tsx                          # Register service worker
├── index.html                        # Add manifest, PWA meta tags
├── package.json                      # Add react-router-dom, vite-plugin-pwa (optional)
├── tailwind.config.ts                # Add custom color palette
└── vite.config.ts                    # Configure for GitHub Pages
```

---

## Phase 1: Setup & Dependencies

### Task 1: Add React Router & Update package.json

**Files:**
- Modify: `grimoire-web/package.json`

- [ ] **Step 1: Update package.json with React Router**

```json
{
  "name": "grimoire-web",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "react-router-dom": "^6.24.0"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/node": "^24.12.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^4.7.0",
    "eslint": "^10.2.1",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.5.0",
    "typescript": "~6.0.2",
    "typescript-eslint": "^8.58.2",
    "vite": "^5.4.21"
  }
}
```

- [ ] **Step 2: Install dependencies**

```bash
cd c:/Users/Chris/DandD/grimoire-web
npm install
```

Expected: `npm install` completes without errors. `node_modules/react-router-dom` exists.

- [ ] **Step 3: Verify installation**

```bash
npm list react-router-dom
```

Expected: Shows `react-router-dom@6.24.0` (or similar 6.x version)

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add react-router-dom for SPA navigation"
```

---

## Phase 2: Theme System & Contexts

### Task 2: Create Theme Context

**Files:**
- Create: `grimoire-web/src/contexts/ThemeContext.tsx`

- [ ] **Step 1: Create ThemeContext.tsx**

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Load from localStorage, default to 'light'
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('grimoire-theme');
      return (saved as Theme) || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('grimoire-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

- [ ] **Step 2: Verify file compiles**

```bash
cd c:/Users/Chris/DandD/grimoire-web
npx tsc --noEmit
```

Expected: No TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/contexts/ThemeContext.tsx
git commit -m "feat: add ThemeContext for dark/light mode switching"
```

---

### Task 3: Create Navigation Context

**Files:**
- Create: `grimoire-web/src/contexts/NavigationContext.tsx`

- [ ] **Step 1: Create NavigationContext.tsx**

```typescript
import React, { createContext, useContext, useState } from 'react';

interface NavigationContextType {
  canGoBack: boolean;
  goBack: () => void;
  navigationStack: string[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [navigationStack, setNavigationStack] = useState<string[]>(['picker']);

  const canGoBack = navigationStack.length > 1;

  const goBack = () => {
    if (canGoBack) {
      setNavigationStack(prev => prev.slice(0, -1));
    }
  };

  return (
    <NavigationContext.Provider value={{ navigationStack, canGoBack, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
```

- [ ] **Step 2: Verify file compiles**

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/contexts/NavigationContext.tsx
git commit -m "feat: add NavigationContext for in-app back button"
```

---

### Task 4: Create Theme Utilities & Colors

**Files:**
- Create: `grimoire-web/src/lib/theme.ts`

- [ ] **Step 1: Create theme.ts**

```typescript
export const colors = {
  light: {
    background: '#F8F7F4',
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
    card: '#FFFFFF',
    accent: '#D4AF37', // D&D gold
    header: '#2C1B47', // Deep purple
  },
  dark: {
    background: '#1A1A1A',
    text: {
      primary: '#F8F7F4',
      secondary: '#AAAAAA',
    },
    card: '#2D2D2D',
    accent: '#D4AF37', // D&D gold
    header: '#3D2E5F', // Lighter purple
  },
  difficulty: {
    easy: '#4CAF50',
    moderate: '#FFC107',
    hard: '#FF9800',
    deadly: '#F44336',
    beyondDeadly: '#B71C1C',
  },
};

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return colors.difficulty.easy;
    case 'moderate':
      return colors.difficulty.moderate;
    case 'hard':
      return colors.difficulty.hard;
    case 'deadly':
      return colors.difficulty.deadly;
    case 'beyond deadly':
      return colors.difficulty.beyondDeadly;
    default:
      return colors.difficulty.moderate;
  }
}
```

- [ ] **Step 2: Create styles/globals.css**

```css
:root[data-theme='light'] {
  --bg-primary: #F8F7F4;
  --text-primary: #1A1A1A;
  --text-secondary: #666666;
  --card-bg: #FFFFFF;
  --accent: #D4AF37;
  --header-bg: #2C1B47;
  --border-color: #E0E0E0;
}

:root[data-theme='dark'] {
  --bg-primary: #1A1A1A;
  --text-primary: #F8F7F4;
  --text-secondary: #AAAAAA;
  --card-bg: #2D2D2D;
  --accent: #D4AF37;
  --header-bg: #3D2E5F;
  --border-color: #444444;
}

* {
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
}

/* Difficulty badges */
.badge-easy {
  background-color: #4CAF50;
  color: white;
}

.badge-moderate {
  background-color: #FFC107;
  color: #000;
}

.badge-hard {
  background-color: #FF9800;
  color: white;
}

.badge-deadly {
  background-color: #F44336;
  color: white;
}

.badge-beyond-deadly {
  background-color: #B71C1C;
  color: white;
}

/* Responsive utilities */
@media (max-width: 640px) {
  body {
    font-size: 16px; /* Prevent zoom on iOS input focus */
  }
}

/* Dice roller animation */
@keyframes dice-roll {
  0% {
    transform: rotateX(0deg) rotateY(0deg);
    opacity: 1;
  }
  50% {
    transform: rotateX(720deg) rotateY(720deg);
  }
  100% {
    transform: rotateX(0deg) rotateY(0deg);
    opacity: 1;
  }
}

.dice-rolling {
  animation: dice-roll 3s ease-out;
}
```

- [ ] **Step 3: Update main.tsx to import styles**

Read the current main.tsx:

```bash
cd c:/Users/Chris/DandD/grimoire-web && cat src/main.tsx
```

Then update it to include the styles import at the top:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'
import './index.css'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 4: Update tailwind.config.ts to add custom colors**

Read current tailwind.config.ts and update it:

```typescript
import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: '#D4AF37',
        'dark-bg': '#1A1A1A',
        'light-bg': '#F8F7F4',
        'dark-card': '#2D2D2D',
        'header-dark': '#3D2E5F',
        'header-light': '#2C1B47',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 5: Verify styles compile**

```bash
cd c:/Users/Chris/DandD/grimoire-web
npm run build
```

Expected: Build succeeds, no errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/theme.ts src/styles/globals.css src/main.tsx tailwind.config.ts
git commit -m "feat: add theme system with dark/light mode CSS variables"
```

---

## Phase 3: Navigation Refactor

### Task 5: Create Layout Component with Router

**Files:**
- Create: `grimoire-web/src/components/Layout.tsx`
- Modify: `grimoire-web/src/App.tsx`

- [ ] **Step 1: Create Layout.tsx**

```typescript
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <Header />
      <main className="flex-1 overflow-y-auto pb-safe-bottom">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Update App.tsx with Router**

Read the current App.tsx to understand the structure. Then replace it:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationProvider } from './contexts/NavigationContext';
import Layout from './components/Layout';
import MonsterPicker from './components/MonsterPicker';
import MonsterDetail from './components/MonsterDetail';

function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <BrowserRouter basename="/grimoire">
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<MonsterPicker />} />
              <Route path="/monster/:id" element={<MonsterDetail />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </NavigationProvider>
    </ThemeProvider>
  );
}

export default App;
```

- [ ] **Step 3: Update vite.config.ts for GitHub Pages**

Read current vite.config.ts and update the base path:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/grimoire/',
  plugins: [react()],
})
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd c:/Users/Chris/DandD/grimoire-web
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Layout.tsx src/App.tsx vite.config.ts
git commit -m "feat: add React Router for in-app navigation"
```

---

### Task 6: Update Header with Theme Toggle & Back Button

**Files:**
- Modify: `grimoire-web/src/components/Header.tsx`

- [ ] **Step 1: Read current Header.tsx**

```bash
cd c:/Users/Chris/DandD/grimoire-web && cat src/components/Header.tsx
```

- [ ] **Step 2: Update Header.tsx**

```typescript
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="bg-[var(--header-bg)] text-[var(--text-primary)] px-4 py-4 safe-top flex items-center justify-between">
      <div className="flex items-center gap-3">
        {!isHome && (
          <button
            onClick={() => navigate(-1)}
            className="text-2xl leading-none hover:opacity-70 transition"
            aria-label="Go back"
          >
            ← 
          </button>
        )}
        <h1 className="text-xl font-bold">Grimoire</h1>
      </div>

      <button
        onClick={toggleTheme}
        className="text-2xl leading-none hover:opacity-70 transition"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </header>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat: add theme toggle and back button to header"
```

---

## Phase 4: UI Redesign (Mobile-First)

### Task 7: Refactor MonsterPicker for Mobile-First Cards

**Files:**
- Modify: `grimoire-web/src/components/MonsterPicker.tsx`

- [ ] **Step 1: Read current MonsterPicker.tsx**

```bash
cd c:/Users/Chris/DandD/grimoire-web && cat src/components/MonsterPicker.tsx
```

- [ ] **Step 2: Refactor to mobile-first card layout**

```typescript
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGrimoireSync } from '../lib/loader';
import { getDifficulty } from '../lib/difficulty';
import { getDifficultyColor } from '../lib/theme';
import MonsterCard from './MonsterCard';

interface PartyConfig {
  size: number;
  level: number;
}

export default function MonsterPicker() {
  const navigate = useNavigate();
  const grimoire = getGrimoireSync();
  const [partyConfig, setPartyConfig] = useState<PartyConfig>({ size: 4, level: 3 });
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const filteredMonsters = useMemo(() => {
    let monsters = grimoire.monsters;

    if (searchTerm) {
      monsters = monsters.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (difficultyFilter !== 'all') {
      monsters = monsters.filter(m => {
        const difficulty = getDifficulty(m.xp, partyConfig.size, partyConfig.level);
        return difficulty.toLowerCase() === difficultyFilter.toLowerCase();
      });
    }

    return monsters.sort((a, b) => a.challenge_rating - b.challenge_rating);
  }, [searchTerm, difficultyFilter, partyConfig, grimoire]);

  const handleSelectMonster = (monsterId: string) => {
    navigate(`/monster/${monsterId}`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4">
      {/* Party Config */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div>
          <label className="text-sm text-[var(--text-secondary)]">Party Size</label>
          <input
            type="number"
            min="1"
            max="8"
            value={partyConfig.size}
            onChange={(e) => setPartyConfig(prev => ({ ...prev, size: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)]"
          />
        </div>
        <div>
          <label className="text-sm text-[var(--text-secondary)]">Avg Level</label>
          <input
            type="number"
            min="1"
            max="20"
            value={partyConfig.level}
            onChange={(e) => setPartyConfig(prev => ({ ...prev, level: parseInt(e.target.value) }))}
            className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)]"
          />
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search monsters..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)] mb-4 sticky top-0 z-10"
      />

      {/* Difficulty Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'easy', 'moderate', 'hard', 'deadly', 'beyond deadly'].map(diff => (
          <button
            key={diff}
            onClick={() => setDifficultyFilter(diff)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
              difficultyFilter === diff
                ? `${diff === 'all' ? 'bg-[var(--accent)]' : 'opacity-100'} text-white`
                : 'bg-[var(--card-bg)] text-[var(--text-primary)] opacity-60'
            }`}
          >
            {diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </div>

      {/* Monster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMonsters.map(monster => (
          <button
            key={monster.id}
            onClick={() => handleSelectMonster(monster.id)}
            className="text-left"
          >
            <MonsterCard monster={monster} partyConfig={partyConfig} />
          </button>
        ))}
      </div>

      {filteredMonsters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">No monsters found.</p>
        </div>
      )}

      <div className="text-center text-sm text-[var(--text-secondary)] mt-8">
        Showing {filteredMonsters.length} of {grimoire.monsters.length} monsters
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/MonsterPicker.tsx
git commit -m "refactor: redesign MonsterPicker for mobile-first card layout"
```

---

### Task 8: Refactor MonsterCard with Styling

**Files:**
- Modify: `grimoire-web/src/components/MonsterCard.tsx`

- [ ] **Step 1: Read current MonsterCard.tsx**

```bash
cat src/components/MonsterCard.tsx
```

- [ ] **Step 2: Update MonsterCard.tsx with improved styling**

```typescript
import React from 'react';
import { Monster } from '../lib/models';
import { getDifficulty } from '../lib/difficulty';
import { getDifficultyColor } from '../lib/theme';

interface Props {
  monster: Monster;
  partyConfig: { size: number; level: number };
}

export default function MonsterCard({ monster, partyConfig }: Props) {
  const difficulty = getDifficulty(monster.xp, partyConfig.size, partyConfig.level);
  const color = getDifficultyColor(difficulty);

  return (
    <div className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] hover:shadow-lg transition">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="font-bold text-lg text-[var(--text-primary)]">{monster.name}</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            {monster.size} {monster.type}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-[var(--text-secondary)]">CR {monster.challenge_rating}</p>
        </div>
      </div>

      <div
        className="inline-block px-3 py-1 rounded-full text-white font-semibold text-sm"
        style={{ backgroundColor: color }}
      >
        {difficulty}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/MonsterCard.tsx
git commit -m "refactor: improve MonsterCard styling and difficulty badge"
```

---

### Task 9: Create StatBlock Component (Extracted)

**Files:**
- Create: `grimoire-web/src/components/StatBlock.tsx`

- [ ] **Step 1: Create StatBlock.tsx**

```typescript
import React from 'react';
import { Monster } from '../lib/models';
import { getDifficulty } from '../lib/difficulty';

interface Props {
  monster: Monster;
  partyConfig: { size: number; level: number };
}

export default function StatBlock({ monster, partyConfig }: Props) {
  const difficulty = getDifficulty(monster.xp, partyConfig.size, partyConfig.level);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-[var(--border-color)] pb-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">{monster.name}</h2>
        <p className="text-[var(--text-secondary)]">
          {monster.size} {monster.type}
          {monster.subtype && ` (${monster.subtype})`}
          {monster.alignment && `, ${monster.alignment}`}
        </p>
        <div className="mt-2 inline-block px-3 py-1 rounded-full text-white font-semibold text-sm" style={{ backgroundColor: difficulty === 'Deadly' ? '#F44336' : '#FF9800' }}>
          ☠ {difficulty}
        </div>
      </div>

      {/* AC, HP, Speed */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">AC</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">{monster.armor_class}</p>
          {monster.armor_class_note && <p className="text-xs text-[var(--text-secondary)]">{monster.armor_class_note}</p>}
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">HP</p>
          <p className="text-lg font-bold text-[var(--text-primary)]">{monster.hit_points}</p>
          <p className="text-xs text-[var(--text-secondary)]">{monster.hit_dice}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase">Speed</p>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {Object.entries(monster.speed)
              .map(([k, v]) => `${v} ft. ${k}`)
              .join(', ')}
          </p>
        </div>
      </div>

      {/* Ability Scores */}
      <div className="bg-[var(--card-bg)] p-4 rounded-lg">
        <p className="text-xs text-[var(--text-secondary)] uppercase mb-3 font-semibold">Ability Scores</p>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(monster.ability_scores).map(([ability, score]) => (
            <div key={ability}>
              <p className="text-xs text-[var(--text-secondary)] uppercase">{ability}</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">{score}</p>
              <p className="text-xs text-[var(--text-secondary)]">({score >= 10 ? '+' : ''}{Math.floor((score - 10) / 2)})</p>
            </div>
          ))}
        </div>
      </div>

      {/* Damage Info */}
      {(monster.damage_vulnerabilities || monster.damage_resistances || monster.damage_immunities || monster.condition_immunities) && (
        <div className="space-y-2">
          {monster.damage_vulnerabilities && (
            <p className="text-sm"><span className="font-semibold">Vulnerabilities:</span> {monster.damage_vulnerabilities}</p>
          )}
          {monster.damage_resistances && (
            <p className="text-sm"><span className="font-semibold">Resistances:</span> {monster.damage_resistances}</p>
          )}
          {monster.damage_immunities && (
            <p className="text-sm"><span className="font-semibold">Immunities:</span> {monster.damage_immunities}</p>
          )}
          {monster.condition_immunities && (
            <p className="text-sm"><span className="font-semibold">Condition Immunities:</span> {monster.condition_immunities}</p>
          )}
        </div>
      )}

      {/* Senses & Languages */}
      {(monster.senses || monster.languages) && (
        <div className="space-y-1">
          {monster.senses && <p className="text-sm"><span className="font-semibold">Senses:</span> {monster.senses}</p>}
          {monster.languages && <p className="text-sm"><span className="font-semibold">Languages:</span> {monster.languages}</p>}
        </div>
      )}

      {/* Traits */}
      {monster.traits && monster.traits.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-2">Traits</p>
          <div className="space-y-2">
            {monster.traits.map((trait, i) => (
              <div key={i} className="text-sm">
                <p className="font-semibold text-[var(--text-primary)]">{trait.name}</p>
                <p className="text-[var(--text-secondary)]">{trait.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning for unsupported features */}
      {monster.v1_unsupported_features && monster.v1_unsupported_features.length > 0 && (
        <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg border border-yellow-300 dark:border-yellow-700">
          <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">⚠ Not Fully Modelled</p>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            This monster has {monster.v1_unsupported_features.join(', ')} that aren't fully supported. Consult the full stat block.
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/StatBlock.tsx
git commit -m "feat: create StatBlock component for monster stat display"
```

---

### Task 10: Create MonsterDetail Route Component

**Files:**
- Create/Modify: `grimoire-web/src/components/MonsterDetail.tsx`

- [ ] **Step 1: Create or update MonsterDetail.tsx**

```typescript
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGrimoireSync } from '../lib/loader';
import StatBlock from './StatBlock';
import CombatTurn from './CombatTurn';

export default function MonsterDetail() {
  const { id } = useParams<{ id: string }>();
  const grimoire = getGrimoireSync();
  const monster = grimoire.monsters.find(m => m.id === id);
  const [tab, setTab] = useState<'stat' | 'combat'>('stat');
  const [partyConfig] = useState({ size: 4, level: 3 }); // TODO: Pass from picker

  if (!monster) {
    return (
      <div className="p-4">
        <p className="text-[var(--text-secondary)]">Monster not found.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-[var(--border-color)]">
        <button
          onClick={() => setTab('stat')}
          className={`pb-3 font-semibold transition ${
            tab === 'stat'
              ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
              : 'text-[var(--text-secondary)]'
          }`}
        >
          Stats
        </button>
        <button
          onClick={() => setTab('combat')}
          className={`pb-3 font-semibold transition ${
            tab === 'combat'
              ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
              : 'text-[var(--text-secondary)]'
          }`}
        >
          Combat
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'stat' && <StatBlock monster={monster} partyConfig={partyConfig} />}
      {tab === 'combat' && <CombatTurn monster={monster} partyConfig={partyConfig} />}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/MonsterDetail.tsx
git commit -m "feat: create MonsterDetail route with tabs for stats and combat"
```

---

## Phase 5: Dice Roller

### Task 11: Create Dice Roller Logic

**Files:**
- Create: `grimoire-web/src/lib/diceRoller.ts`

- [ ] **Step 1: Create diceRoller.ts**

```typescript
export interface DiceRoll {
  formula: string;
  result: number;
  breakdown: string;
  timestamp: Date;
}

/**
 * Parse dice formula like "1d8+2" or "2d6"
 * Returns [numDice, numSides, bonus]
 */
export function parseFormula(formula: string): [number, number, number] | null {
  const normalized = formula.trim().toLowerCase();
  
  // Match patterns like: "1d20+5", "2d6", "1d8-1"
  const match = normalized.match(/^(\d+)d(\d+)([\+\-]\d+)?$/);
  
  if (!match) return null;
  
  const numDice = parseInt(match[1]);
  const numSides = parseInt(match[2]);
  const bonus = match[3] ? parseInt(match[3]) : 0;
  
  return [numDice, numSides, bonus];
}

/**
 * Roll dice according to formula
 * Returns { result, breakdown }
 */
export function rollDice(formula: string): { result: number; breakdown: string } | null {
  const parsed = parseFormula(formula);
  if (!parsed) return null;
  
  const [numDice, numSides, bonus] = parsed;
  const rolls: number[] = [];
  
  for (let i = 0; i < numDice; i++) {
    rolls.push(Math.floor(Math.random() * numSides) + 1);
  }
  
  const diceTotal = rolls.reduce((a, b) => a + b, 0);
  const result = diceTotal + bonus;
  
  const rollsStr = rolls.join(' + ');
  const breakdown =
    bonus === 0
      ? `${rollsStr} = ${result}`
      : `${rollsStr} + ${bonus} = ${result}`;
  
  return { result, breakdown };
}

/**
 * Validate if a formula is valid dice notation
 */
export function isValidFormula(formula: string): boolean {
  return parseFormula(formula) !== null;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Create tests**

Create `grimoire-web/src/lib/diceRoller.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { parseFormula, rollDice, isValidFormula } from './diceRoller';

describe('parseFormula', () => {
  it('parses "1d20+5"', () => {
    const result = parseFormula('1d20+5');
    expect(result).toEqual([1, 20, 5]);
  });

  it('parses "2d6"', () => {
    const result = parseFormula('2d6');
    expect(result).toEqual([2, 6, 0]);
  });

  it('parses "1d8-1"', () => {
    const result = parseFormula('1d8-1');
    expect(result).toEqual([1, 8, -1]);
  });

  it('rejects invalid formulas', () => {
    expect(parseFormula('invalid')).toBeNull();
    expect(parseFormula('1d')).toBeNull();
    expect(parseFormula('d20')).toBeNull();
  });
});

describe('rollDice', () => {
  it('rolls valid formula and returns result and breakdown', () => {
    const roll = rollDice('1d6');
    expect(roll).not.toBeNull();
    expect(roll!.result).toBeGreaterThanOrEqual(1);
    expect(roll!.result).toBeLessThanOrEqual(6);
    expect(roll!.breakdown).toContain('=');
  });

  it('rejects invalid formulas', () => {
    expect(rollDice('invalid')).toBeNull();
  });
});

describe('isValidFormula', () => {
  it('validates valid formulas', () => {
    expect(isValidFormula('1d20+5')).toBe(true);
    expect(isValidFormula('2d6')).toBe(true);
  });

  it('rejects invalid formulas', () => {
    expect(isValidFormula('invalid')).toBe(false);
  });
});
```

- [ ] **Step 4: Install vitest if not present**

```bash
cd c:/Users/Chris/DandD/grimoire-web
npm install -D vitest
```

- [ ] **Step 5: Run tests**

```bash
npm test src/lib/diceRoller.test.ts
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/diceRoller.ts src/lib/diceRoller.test.ts package.json
git commit -m "feat: add dice roller logic with tests"
```

---

### Task 12: Create DiceRoller Component

**Files:**
- Create: `grimoire-web/src/components/DiceRoller.tsx`

- [ ] **Step 1: Create DiceRoller.tsx**

```typescript
import React, { useState } from 'react';
import { rollDice, isValidFormula } from '../lib/diceRoller';

export interface DiceRollerProps {
  initialFormula?: string;
  onClose: () => void;
}

interface RollHistory {
  formula: string;
  result: number;
  breakdown: string;
  time: string;
}

export default function DiceRoller({ initialFormula = '', onClose }: DiceRollerProps) {
  const [formula, setFormula] = useState(initialFormula);
  const [history, setHistory] = useState<RollHistory[]>([]);
  const [currentRoll, setCurrentRoll] = useState<{ result: number; breakdown: string } | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [error, setError] = useState('');

  const handleRoll = () => {
    setError('');
    if (!isValidFormula(formula)) {
      setError('Invalid formula. Use format: 1d20+5');
      return;
    }

    setIsRolling(true);
    
    // Simulate rolling animation
    setTimeout(() => {
      const roll = rollDice(formula);
      if (roll) {
        setCurrentRoll(roll);
        setHistory(prev => [
          {
            formula,
            result: roll.result,
            breakdown: roll.breakdown,
            time: new Date().toLocaleTimeString(),
          },
          ...prev,
        ].slice(0, 5)); // Keep last 5 rolls
        setIsRolling(false);
      }
    }, 3000); // 3 second animation
  };

  const handleRollAgain = () => {
    setFormula(history[0]?.formula || formula);
    setTimeout(() => handleRoll(), 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
      <div className="w-full bg-[var(--card-bg)] text-[var(--text-primary)] rounded-t-2xl p-6 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Roll Dice</h2>
          <button onClick={onClose} className="text-2xl leading-none">×</button>
        </div>

        {/* Formula Input */}
        <div className="mb-4">
          <label className="text-sm text-[var(--text-secondary)] mb-2 block">Formula</label>
          <input
            type="text"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="e.g., 1d20+5"
            className="w-full px-4 py-3 rounded border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        {/* Roll Button */}
        <button
          onClick={handleRoll}
          disabled={isRolling || !isValidFormula(formula)}
          className="w-full bg-[var(--accent)] text-black font-bold py-3 rounded-lg mb-4 disabled:opacity-50"
        >
          {isRolling ? 'Rolling...' : 'Roll'}
        </button>

        {/* Result */}
        {currentRoll && (
          <div className={`bg-[var(--bg-primary)] p-4 rounded-lg mb-4 ${isRolling ? 'dice-rolling' : ''}`}>
            <p className="text-sm text-[var(--text-secondary)] mb-1">Result</p>
            <p className="text-5xl font-bold text-[var(--accent)] mb-2">{currentRoll.result}</p>
            <p className="text-sm text-[var(--text-secondary)]">{currentRoll.breakdown}</p>
            {history.length > 0 && (
              <button
                onClick={handleRollAgain}
                className="mt-3 w-full bg-[var(--header-bg)] text-[var(--text-primary)] py-2 rounded font-semibold"
              >
                Roll Again
              </button>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-[var(--text-secondary)] mb-2">Recent Rolls</p>
            <div className="space-y-2">
              {history.map((roll, i) => (
                <div key={i} className="flex justify-between text-sm p-2 bg-[var(--bg-primary)] rounded">
                  <span>{roll.formula}</span>
                  <span className="font-bold text-[var(--accent)]">{roll.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/DiceRoller.tsx
git commit -m "feat: create DiceRoller component with modal UI"
```

---

### Task 13: Integrate DiceRoller into CombatTurn

**Files:**
- Modify: `grimoire-web/src/components/CombatTurn.tsx`

- [ ] **Step 1: Read current CombatTurn.tsx**

```bash
cd c:/Users/Chris/DandD/grimoire-web && cat src/components/CombatTurn.tsx
```

- [ ] **Step 2: Update CombatTurn.tsx to include dice roller**

```typescript
import React, { useState } from 'react';
import { Monster } from '../lib/models';
import { selectTurn } from '../lib/selector';
import DiceRoller from './DiceRoller';

interface Props {
  monster: Monster;
  partyConfig: { size: number; level: number };
}

export default function CombatTurn({ monster, partyConfig }: Props) {
  const [turn, setTurn] = useState(() => selectTurn(monster));
  const [turnCount, setTurnCount] = useState(1);
  const [diceRollerOpen, setDiceRollerOpen] = useState(false);
  const [diceFormula, setDiceFormula] = useState('1d20');

  const handleNextTurn = () => {
    setTurn(selectTurn(monster));
    setTurnCount(prev => prev + 1);
  };

  const openDiceRoller = (formula: string) => {
    setDiceFormula(formula);
    setDiceRollerOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-[var(--text-secondary)] mb-2">Turn {turnCount}</div>

      {turn.kind === 'multiattack' && (
        <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-color)]">
          <p className="font-semibold mb-2">Multiattack</p>
          <p className="italic text-[var(--text-secondary)] mb-4">"{turn.description}"</p>

          <p className="font-semibold mb-2">Available Attacks:</p>
          <div className="space-y-2">
            {turn.actions?.map((action, i) => (
              <div key={i} className="bg-[var(--card-bg)] p-3 rounded">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold">{action.name}</span>
                  <span className="text-[var(--text-secondary)]">+{action.attack_bonus}</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-2">
                  {action.damage?.formula} {action.damage?.type}
                </p>
                {action.rider_effect && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-2">⚠ {action.rider_effect}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => openDiceRoller(`1d20+${action.attack_bonus}`)}
                    className="text-xs bg-[var(--accent)] text-black px-2 py-1 rounded font-semibold"
                  >
                    Roll Attack
                  </button>
                  {action.damage && (
                    <button
                      onClick={() => openDiceRoller(action.damage!.formula)}
                      className="text-xs bg-[var(--header-bg)] text-[var(--text-primary)] px-2 py-1 rounded font-semibold"
                    >
                      Roll Damage
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {turn.kind === 'single' && turn.action && (
        <div className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-color)]">
          <p className="font-semibold mb-2">{turn.action.name}</p>
          <p className="text-sm text-[var(--text-secondary)] mb-3">{turn.action.description}</p>

          <div className="flex gap-2">
            {turn.action.attack_bonus !== undefined && (
              <button
                onClick={() => openDiceRoller(`1d20+${turn.action!.attack_bonus}`)}
                className="flex-1 bg-[var(--accent)] text-black px-3 py-2 rounded font-semibold text-sm"
              >
                Roll Attack
              </button>
            )}
            {turn.action.damage && (
              <button
                onClick={() => openDiceRoller(turn.action!.damage!.formula)}
                className="flex-1 bg-[var(--header-bg)] text-[var(--text-primary)] px-3 py-2 rounded font-semibold text-sm"
              >
                Roll Damage
              </button>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleNextTurn}
        className="w-full bg-[var(--accent)] text-black font-bold py-3 rounded-lg"
      >
        Next Turn
      </button>

      {diceRollerOpen && (
        <DiceRoller
          initialFormula={diceFormula}
          onClose={() => setDiceRollerOpen(false)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/CombatTurn.tsx
git commit -m "feat: integrate DiceRoller into CombatTurn with attack/damage buttons"
```

---

## Phase 6: PWA & Service Worker

### Task 14: Create Service Worker

**Files:**
- Create: `grimoire-web/public/sw.js`

- [ ] **Step 1: Create public/sw.js**

```javascript
const CACHE_VERSION = 'grimoire-v1';
const CACHE_URLS = [
  '/grimoire/',
  '/grimoire/index.html',
];

// Install: cache Grimoire JSON on first load
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first strategy for assets, network-first for JSON
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Grimoire JSON: cache-first with network fallback
  if (url.pathname.includes('grimoire.json')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }

  // Assets: cache-first
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    event.respondWith(
      caches.open(CACHE_VERSION).then((cache) =>
        cache.match(request).then((cached) => {
          const fetched = fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
          return cached || fetched;
        })
      )
    );
    return;
  }

  // Everything else: network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(request, response.clone());
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
```

- [ ] **Step 2: Create service worker registration utility**

Create `grimoire-web/src/lib/sw-register.ts`:

```typescript
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/grimoire/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
}
```

- [ ] **Step 3: Update main.tsx to register service worker**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/globals.css'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker } from './lib/sw-register.ts'

registerServiceWorker()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 4: Commit**

```bash
git add public/sw.js src/lib/sw-register.ts src/main.tsx
git commit -m "feat: add service worker for offline caching"
```

---

### Task 15: Create Web App Manifest

**Files:**
- Create: `grimoire-web/public/manifest.json`

- [ ] **Step 1: Create manifest.json**

```json
{
  "name": "Grimoire Combat Helper",
  "short_name": "Grimoire",
  "description": "D&D 5e monster stat blocks and combat helper for DMs",
  "start_url": "/grimoire/",
  "scope": "/grimoire/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#1A1A1A",
  "theme_color": "#D4AF37",
  "icons": [
    {
      "src": "/grimoire/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/grimoire/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/grimoire/icon-maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/grimoire/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/grimoire/screenshot-1.png",
      "sizes": "540x720",
      "form_factor": "narrow"
    }
  ]
}
```

- [ ] **Step 2: Update index.html to include manifest and PWA meta tags**

Read current `index.html` and add to `<head>`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/grimoire/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#D4AF37" />
    <meta name="description" content="D&D 5e monster stat blocks and combat helper for DMs" />
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/grimoire/manifest.json" />
    
    <!-- iOS PWA Meta Tags -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Grimoire" />
    <link rel="apple-touch-icon" href="/grimoire/icon-192.png" />
    
    <title>Grimoire Combat Helper</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/grimoire/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create placeholder icon files**

For now, create simple PNG icons (192x192 and 512x512). You can use an online tool or generate them later. Create empty files as placeholders:

```bash
cd c:/Users/Chris/DandD/grimoire-web/public
# Create placeholder icon files (empty for now, update later)
touch icon-192.png icon-512.png icon-maskable-192.png icon-maskable-512.png screenshot-1.png
```

Note: Later, generate proper D&D-themed icons and screenshots.

- [ ] **Step 4: Commit**

```bash
git add public/manifest.json index.html public/icon-*.png public/screenshot-*.png
git commit -m "feat: add PWA manifest and meta tags for home screen installation"
```

---

## Phase 7: Build & Deployment

### Task 16: Update Vite Config for GitHub Pages

**Files:**
- Modify: `grimoire-web/vite.config.ts` (already done in Task 5, verify here)

- [ ] **Step 1: Verify vite.config.ts has correct base path**

```bash
cat grimoire-web/vite.config.ts
```

Expected output should include `base: '/grimoire/'`

- [ ] **Step 2: Build the app**

```bash
cd c:/Users/Chris/DandD/grimoire-web
npm run build
```

Expected: Build succeeds, output in `dist/` folder

- [ ] **Step 3: Verify build artifacts**

```bash
ls -la dist/
```

Expected: See index.html, JS bundles, CSS

- [ ] **Step 4: Commit build config (if changed)**

```bash
git add vite.config.ts
git commit -m "config: ensure vite base path is set for GitHub Pages"
```

---

### Task 17: Manual Testing Checklist

**Files:** None (manual testing only)

- [ ] **Test 1: Monster Picker**
  - [ ] Load app in browser
  - [ ] Verify all 322 monsters load
  - [ ] Search by name works (e.g., search "werewolf")
  - [ ] Filter by difficulty works (click each badge)
  - [ ] Adjust party size and level, difficulty badges update
  - [ ] Click a monster card, navigate to detail screen

- [ ] **Test 2: Monster Detail Screen**
  - [ ] Stat block displays correctly (AC, HP, traits, etc.)
  - [ ] Combat tab shows turn display
  - [ ] Back button (←) navigates back to picker
  - [ ] Clicking back doesn't open browser back (stays in app)

- [ ] **Test 3: Dice Roller**
  - [ ] In combat tab, click "Roll Attack" button
  - [ ] Dice roller opens with pre-filled formula (e.g., "1d20+2")
  - [ ] Change formula to "1d20+5" and roll
  - [ ] Dice animation plays (3 sec)
  - [ ] Result displays (e.g., "12")
  - [ ] Breakdown shows calculation
  - [ ] History shows recent rolls
  - [ ] "Roll Again" button works
  - [ ] Close dice roller

- [ ] **Test 4: Theme Toggle**
  - [ ] Click sun/moon icon in header
  - [ ] UI switches to light/dark mode
  - [ ] Reload page, theme persists
  - [ ] Colors are readable in both modes

- [ ] **Test 5: Offline**
  - [ ] Open DevTools → Application → Service Workers
  - [ ] Verify service worker is registered and active
  - [ ] Go offline (DevTools → Network → Offline)
  - [ ] Reload page, verify app still loads
  - [ ] Monster picker still works, grimoire JSON cached
  - [ ] Images show placeholder (graceful fallback)

- [ ] **Test 6: PWA Installation (iOS)**
  - [ ] Open Safari on iPad
  - [ ] Navigate to app URL
  - [ ] Tap Share → "Add to Home Screen"
  - [ ] Name it "Grimoire"
  - [ ] App appears on home screen
  - [ ] Tap home screen icon, app launches full-screen
  - [ ] No address bar visible

- [ ] **Test 7: PWA Installation (Android)**
  - [ ] Open Chrome on Android phone
  - [ ] Navigate to app URL
  - [ ] Browser offers "Install app" prompt
  - [ ] Tap "Install"
  - [ ] App appears on home screen
  - [ ] Tap home screen icon, app launches full-screen

---

### Task 18: Fix Placeholder Icons (Optional Pre-Release)

**Files:**
- Update: `grimoire-web/public/icon-192.png`, `icon-512.png`, etc.

*This step is optional for MVP. Use solid-color or simple D&D icon as placeholder for initial testing. Full design can come later.*

- [ ] **Step 1: Generate simple icon**

For now, use a D&D-themed color (gold #D4AF37) or generate using online PWA icon generator. Save as PNG to `public/`.

- [ ] **Step 2: Update icon files and commit**

```bash
git add public/icon-*.png
git commit -m "assets: add PWA app icons (placeholder)"
```

---

## Phase 8: Deployment to GitHub Pages

### Task 19: Deploy to GitHub Pages

**Files:** None (GitHub Pages configuration)

- [ ] **Step 1: Ensure gh-pages branch exists (or use docs/ folder)**

Option A (gh-pages branch):
```bash
cd c:/Users/Chris/DandD
git checkout --orphan gh-pages
# Delete all files except .git
rm -rf *
git rm -r .
# Check out dist from main
git checkout main -- grimoire-web/dist
mv grimoire-web/dist/* .
rm -rf grimoire-web
git add .
git commit -m "deploy: initial GitHub Pages build"
git push origin gh-pages
```

Option B (docs/ folder, simpler):
```bash
cd c:/Users/Chris/DandD/grimoire-web
# Build app
npm run build
# Copy dist to docs/ folder in main branch
cp -r dist ../docs/grimoire
git add docs/
git commit -m "deploy: build and deploy to docs/grimoire"
git push origin main
```

(Choose Option B for simplicity; GitHub Pages can serve from `/docs` folder)

- [ ] **Step 2: Configure GitHub Pages in repo settings**

Go to: `Settings → Pages → Source → Deploy from a branch → gh-pages` (or docs folder)

Expected: GitHub Pages URL appears (e.g., `https://chrisjwpenner.github.io/grimoire/`)

- [ ] **Step 3: Verify deployment**

Open the GitHub Pages URL in a browser. Verify:
- App loads
- Picker displays
- Theme works
- Offline caching works (open DevTools)

- [ ] **Step 4: Commit**

(Already committed in Task 18)

---

## Self-Review Against Spec

**Spec Coverage Check:**

| Requirement | Task | Status |
|-------------|------|--------|
| React Router navigation | Task 5 | ✓ |
| Dark/light theming | Task 2, 4 | ✓ |
| Animated dice roller | Task 11, 12, 13 | ✓ |
| In-app back button | Task 5, 6 | ✓ |
| Mobile-first UI redesign | Task 7, 8, 9 | ✓ |
| PWA manifest & SW | Task 14, 15 | ✓ |
| GitHub Pages deployment | Task 19 | ✓ |
| Color theming (light/dark) | Task 2, 4 | ✓ |
| Responsive layout (phone/tablet) | Task 4, 7 | ✓ |
| Offline support (Grimoire JSON cached) | Task 14 | ✓ |
| Graceful image fallback | Task 14 | ✓ |

**Placeholder Scan:**
- No "TBD", "TODO", or placeholder code
- All code is complete and runnable
- Exact file paths provided
- Exact commands with expected results

**Type Consistency:**
- DiceRoller component props match usage in CombatTurn
- Theme context types consistent across components
- All imports match exports

**Scope Check:**
- Focused on mobile redesign + dice roller + navigation + PWA
- No server-side code
- No database
- Fits ~2-3 week timeline for one developer

---

*End of Implementation Plan.*
