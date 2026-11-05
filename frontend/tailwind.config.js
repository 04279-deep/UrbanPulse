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
          dark: '#0B132B',
          navy: '#1C2541',
          slate: '#3A506B',
          cyan: '#5BC0BE',
          electric: '#00F2FE',
          electricBlue: '#0284C7',
          accent: '#48CAE4',
          surface: '#0F172A',
          card: '#1E293B',
          cardBorder: '#334155'
        }
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(0, 242, 254, 0.4)',
        'glow-sm': '0 0 15px -3px rgba(0, 242, 254, 0.3)',
      }
    },
  },
  plugins: [],
}
