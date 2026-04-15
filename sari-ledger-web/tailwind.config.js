/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'money-green': '#10B981',
        'dark-slate': '#0F172A',
        'soft-coral': '#F87171',
      },
      borderRadius: {
        '2xl': '1rem',
        'xl': '0.75rem',
      }
    },
  },
  plugins: [],
}