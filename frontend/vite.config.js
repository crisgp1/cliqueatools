import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Carga las variables de entorno según el modo (development, production, etc)
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()], 
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'), // Alias para la carpeta src
        '@assets': path.resolve(__dirname, 'src/assets'), // Alias para la carpeta assets
        '@components': path.resolve(__dirname, 'src/components'), // Alias para la carpeta components
        '@hooks': path.resolve(__dirname, 'src/hooks'), // Alias para la carpeta hooks
        '@utils': path.resolve(__dirname, 'src/utils'), // Alias para la carpeta utils
      }
    },
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