/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // Emerald Duolingo green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        duo: {
          green: '#58cc02',
          greenDark: '#46a302',
          yellow: '#ffc800',
          yellowDark: '#e5a500',
          blue: '#1cb0f6',
          blueDark: '#1899d6',
          red: '#ff4b4b',
          redDark: '#ea2b2b',
          purple: '#ce82ff',
          purpleDark: '#a545e8',
          orange: '#ff9600',
          orangeDark: '#e58500',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'duo': '0 4px 0 0 rgba(0, 0, 0, 0.15)',
        'duo-lg': '0 6px 0 0 rgba(0, 0, 0, 0.18)',
        'duo-btn': '0 4px 0 0 currentColor',
      }
    },
  },
  plugins: [],
}
