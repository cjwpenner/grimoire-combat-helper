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
