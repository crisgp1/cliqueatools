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
          target: env.VITE_API_URL ? env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000', // Fallback to localhost if not defined
          changeOrigin: true,
          secure: false,
          ws: true
        }
      }
    }
  }
})