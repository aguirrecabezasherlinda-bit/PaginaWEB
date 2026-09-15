/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './components/**/*.html',
    './pages/**/*.html',
    './js/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9f0ff',
          500: '#0ea5e9',
          700: '#0369a1',
          900: '#0f172a'
        }
      },
      boxShadow: {
        soft: '0 20px 45px -24px rgba(15, 23, 42, 0.3)'
      }
    }
  },
  plugins: []
};
