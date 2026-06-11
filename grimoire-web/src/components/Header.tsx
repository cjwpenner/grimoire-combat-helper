import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="bg-[var(--header-bg)] text-[#F8F7F4] px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] flex items-center justify-between">
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
