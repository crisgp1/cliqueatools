import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Carga las variables de entorno según el modo (development, production, etc)
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL.replace('/api', ''), // Evitar duplicación de /api
          changeOrigin: true,
          secure: false,
          ws: true
        }
      }
    }
  }
})