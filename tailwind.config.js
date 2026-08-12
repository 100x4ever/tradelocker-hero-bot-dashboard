/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0b0f19',
          800: '#111827',
          700: '#1f293d',
          600: '#374151',
        },
        profit: {
          500: '#10b981',
          400: '#34d399',
          bg: 'rgba(16, 185, 129, 0.12)',
        },
        loss: {
          500: '#ef4444',
          400: '#f87171',
          bg: 'rgba(239, 68, 68, 0.12)',
        },
        accent: {
          500: '#6366f1',
          600: '#4f46e5',
        }
      }
    },
  },
  plugins: [],
}
