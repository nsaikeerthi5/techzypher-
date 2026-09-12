/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        rpg: {
          darkest: '#05070D',
          darker: '#0B0F19',
          dark: '#111827',
          surface: '#1E293B',
          surfaceHover: '#334155',
          border: '#2A364F',
          gold: '#F59E0B',
          goldGlow: '#FBBF24',
          goldDark: '#B45309',
          crimson: '#EF4444',
          emerald: '#10B981',
          arcane: '#8B5CF6',
          cyan: '#06B6D4',
          amber: '#D97706',
        }
      },
      fontFamily: {
        sans: ['var(--font-cinzel)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-once': 'bounce 0.5s ease-in-out 1',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(245, 158, 11, 0.4)' },
          '100%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.8)' },
        }
      }
    },
  },
  plugins: [],
};
