import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/logo.png';

/**
 * Componente de página de login con estilo gov.uk y animaciones mejoradas
 * Maneja la autenticación de usuarios contra el backend
 */
const LoginPage = ({ onLogin, onRegisterClick }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  /**
   * Toast animado para mostrar mensajes
   */
  const Toast = ({ message, type }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`mb-6 p-4 rounded shadow-lg border-l-4 ${
          type === 'error' 
            ? 'bg-red-50 border-red-600 text-red-700' 
            : 'bg-green-50 border-green-600 text-green-700'
        }`}
        role="alert"
      >
        <div className="flex items-center">
          <div className={`rounded-full p-1 mr-2 ${
            type === 'error' ? 'bg-red-100' : 'bg-green-100'
          }`}>
            {type === 'error' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="font-medium">{message}</p>
        </div>
      </motion.div>
    );
  };

  /**
   * Maneja el envío del formulario de login
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar entrada
    if (!username.trim() || !password.trim()) {
      setError('Debe ingresar nombre de usuario y contraseña');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Llamada a la API de autenticación
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error de autenticación');
      }

      // Almacenar datos de usuario y token en localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Si hay un token en la respuesta, guardarlo
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Mostrar toast de éxito brevemente antes de redirigir
      setShowSuccessToast(true);
      
      // Esperar un momento para que se vea la animación antes de redirigir
      setTimeout(() => {
        // Notificar al componente padre del login exitoso
        onLogin(data.user);
      }, 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Alterna la visibilidad de la contraseña
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-[#f3f2f1] flex flex-col">
      {/* Header estilo gov.uk */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="bg-[#0b0c0c] py-4"
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center">
            <motion.img 
              src={logoImg} 
              alt="Cliquéalo" 
              className="h-8" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            />
          </div>
        </div>
      </motion.header>
      
      {/* Contenido principal */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white shadow-lg rounded-sm w-full max-w-md p-8 border-l-4 border-l-[#1d70b8]"
        >
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-[#0b0c0c] mb-8"
          >
            Acceder al sistema
          </motion.h1>
          
          <AnimatePresence>
            {error && <Toast message={error} type="error" />}
            {showSuccessToast && <Toast message="Acceso exitoso. Redirigiendo..." type="success" />}
          </AnimatePresence>
          
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {/* Campo de usuario */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <label 
                htmlFor="username" 
                className="block text-xl font-medium text-[#0b0c0c] mb-2"
              >
                Nombre de usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ffdd00] focus:border-[#0b0c0c] transition-all duration-200"
                autoComplete="username"
              />
            </motion.div>
            
            {/* Campo de contraseña */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <label 
                htmlFor="password" 
                className="block text-xl font-medium text-[#0b0c0c] mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ffdd00] focus:border-[#0b0c0c] transition-all duration-200"
                  autoComplete="current-password"
                />
                <motion.button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </motion.button>
              </div>
            </motion.div>
            
            {/* Botón de acceso */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00703c] hover:bg-[#005a30] text-white font-bold py-4 px-6 focus:outline-none focus:ring-2 focus:ring-[#ffdd00] focus:ring-offset-2 transition-all duration-200"
              whileHover={{ scale: 1.02, backgroundColor: "#005a30" }}
              whileTap={{ scale: 0.98 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                delay: 0.9,
                y: { type: "spring", stiffness: 400, damping: 10 }
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    className="h-5 w-5 rounded-full border-2 border-white border-t-transparent mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
                  <span>Accediendo...</span>
                </div>
              ) : 'Acceder'}
            </motion.button>
          </motion.form>

          <motion.div 
            className="mt-8 text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {onRegisterClick && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={onRegisterClick}
                  className="text-[#1d70b8] hover:text-[#003078] hover:underline focus:outline-none focus:ring-2 focus:ring-[#ffdd00]"
                >
                  ¿No tiene una cuenta? Crear cuenta
                </button>
              </div>
            )}
            <p className="text-gray-600">
              USO INTERNO - Este sitio es propiedad de Cliquéalo.mx
            </p>
          </motion.div>
        </motion.div>
      </main>
      
      {/* Footer estilo gov.uk */}
      <motion.footer 
        className="bg-[#f3f2f1] py-10 border-t-2 border-[#1d70b8]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <div className="container mx-auto px-6">
          <div className="text-center text-gray-600">
            <p>© {new Date().getFullYear()} Cliquéalo.mx - Todos los derechos reservados</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LoginPage;