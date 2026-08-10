/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        campus: {
          navy: '#102235',
          teal: '#087f8c',
          coral: '#d96c4f',
          gold: '#d9a441',
          mist: '#eef5f4',
        },
      },
      boxShadow: {
        soft: '0 16px 40px rgba(16, 34, 53, 0.10)',
      },
    },
  },
  plugins: [],
};

