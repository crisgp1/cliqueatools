/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        royal: {
          navy: '#00247D',     // Azul marino/royal blue
          red: '#CF142B',      // Rojo brillante
          gold: '#FCDF4F',     // Dorado/amarillo
          burgundy: '#850B3C', // Borgoña/granate
          black: '#0A0A0A',
          cream: '#F8F4E9',
          gray: {
            100: '#F5F5F5',
            200: '#E5E5E5',
            300: '#D4D4D4',
            400: '#A3A3A3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
          }
        }
      },
      fontFamily: {
        'serif': ['Baskerville', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        'sans': ['Gill Sans', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderWidth: {
        '3': '3px',
      },
      backgroundImage: {
        'royal-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23000000\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
      },
    },
  },
  plugins: [],
}