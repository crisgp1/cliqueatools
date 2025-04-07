/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uber: {
          black: '#000000',
          white: '#FFFFFF',
          gray: {
            50: '#F8F8F8',
            100: '#F2F2F2',
            200: '#E6E6E6',
            300: '#D9D9D9',
            400: '#BDBDBD',
            500: '#9E9E9E',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
          },
          accent: {
            blue: '#276EF1',    // Acento principal
            green: '#05A357',   // Para estados de éxito
            red: '#E11900',     // Para errores
            yellow: '#FFC043',  // Para advertencias
          }
        },
        // Mantenemos la paleta original para compatibilidad
        royal: {
          navy: '#00247D',      // Azul marino/royal blue
          red: '#CF142B',       // Rojo brillante
          gold: '#FCDF4F',      // Dorado/amarillo
          burgundy: '#850B3C',  // Borgoña/granate
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
        'sans': ['Inter', 'Gill Sans', 'Helvetica', 'Arial', 'sans-serif'],
        'serif': ['Baskerville', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      borderRadius: {
        'uber': '8px',
        'uber-lg': '12px',
        'uber-xl': '16px',
      },
      boxShadow: {
        'uber-sm': '0 2px 4px rgba(0, 0, 0, 0.05)',
        'uber': '0 4px 8px rgba(0, 0, 0, 0.08)',
        'uber-md': '0 6px 16px rgba(0, 0, 0, 0.08)',
        'uber-lg': '0 12px 24px rgba(0, 0, 0, 0.12)',
      },
      spacing: {
        '18': '4.5rem',
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