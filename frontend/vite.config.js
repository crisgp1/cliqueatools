import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuración del servidor de desarrollo
  server: {
    // Puerto en el que se ejecutará el servidor de desarrollo
    port: 5173,
    
    // Configuración de proxy para redirigir las solicitudes API al backend
    proxy: {
      // Redirigir todas las solicitudes que comiencen con /api al backend
      '/api': {
        // URL del servicio de backend (ajustar según la configuración real)
        // Si estás usando Docker Compose, podría ser http://auth-service:3000
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // Reescribir las rutas si es necesario
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
