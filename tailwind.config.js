/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        lab: {
          table: '#f8fafc',
          glass: 'rgba(255, 255, 255, 0.1)',
          liquid: {
            clear: '#e0f2fe',
            blue: '#0ea5e9',
            red: '#ef4444',
            green: '#22c55e',
            yellow: '#eab308',
            purple: '#a855f7',
          }
        }
      },
      animation: {
        'bubble': 'bubble 2s infinite',
        'precipitate': 'precipitate 3s ease-out',
        'pour': 'pour 1s ease-in-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        bubble: {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.7' },
          '50%': { transform: 'translateY(-10px) scale(1.1)', opacity: '1' },
        },
        precipitate: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pour: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(45deg)' },
        }
      }
    },
  },
  plugins: [],
}