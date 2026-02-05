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
      fontFamily: {
        sans: ['IBM Plex Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'elixra': {
          'cream': 'var(--bg-cream)',
          'warm-gray': 'var(--bg-warm-gray)',
          'charcoal': '#2A2D3A', // Keeping this fixed for dark backgrounds
          'text-primary': 'var(--text-charcoal)', // Adaptive text color
          'text-secondary': 'var(--text-secondary)', // Adaptive secondary text
          'bunsen': {
            DEFAULT: '#2E6B6B',
            dark: '#265959',
            light: '#4A9E9E',
          },
          'copper': {
            DEFAULT: '#C97B49',
            light: '#E8A87C',
            dark: '#A65F3A',
          },
          'indicator': '#C9A9C9',
          'success': '#7A9E7E',
          'error': '#B85450',
        },
        // Mapped semantic colors for backward compatibility or easier usage
        primary: {
          50: '#F5F1E8', // cream
          500: '#2E6B6B', // bunsen
          600: '#265959', // bunsen-dark
          700: '#1F2937', // charcoal
        },
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
