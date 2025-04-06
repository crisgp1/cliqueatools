import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';

// Importar las animaciones
import loadingAnimation from '../assets/loading-animation.json';
import successAnimation from '../assets/success-animation.json';
import errorAnimation from '../assets/error-animation.json';

const Login = ({ onCreateAccountClick }) => {
  // Estado para almacenar los datos del formulario
  const [formData, setFormData] = useState({
    usuario: '',
    password: ''
  });

  // Estado para manejar errores y carga
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);
  const [animationState, setAnimationState] = useState('loading'); // 'loading', 'success', 'error'
  const [statusMessage, setStatusMessage] = useState('');

  // Obtener función de login del contexto
  const { login } = useContext(AuthContext);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Limpiar mensaje de error al cambiar los datos
    if (error) setError('');
  };

  // Efecto para cerrar el preloader después de un login exitoso
  useEffect(() => {
    if (animationState === 'success') {
      const timer = setTimeout(() => {
        setShowPreloader(false);
      }, 1500); // Dar tiempo para que se vea la animación de éxito
      return () => clearTimeout(timer);
    }
  }, [animationState]);

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación simple
    if (!formData.usuario || !formData.password) {
      setError('Por favor, complete todos los campos');
      return;
    }
    
    setLoading(true);
    setShowPreloader(true);
    setAnimationState('loading');
    setStatusMessage('Verificando credenciales...');
    setError('');
    
    try {
      // Intentar inicio de sesión
      const result = await login(formData.usuario, formData.password);
      
      if (result.success) {
        setAnimationState('success');
        setStatusMessage('¡Acceso exitoso!');
        // El preloader se cerrará automáticamente después de la animación (ver useEffect)
      } else {
        setAnimationState('error');
        
        // Mensajes específicos según el tipo de error
        if (result.error) {
          if (result.error.toLowerCase().includes('no encontrado')) {
            setStatusMessage('Usuario no encontrado');
            setError('El usuario ingresado no existe en el sistema');
          } else if (result.error.toLowerCase().includes('contraseña') || result.error.toLowerCase().includes('credenciales')) {
            setStatusMessage('Contraseña incorrecta');
            setError('La contraseña ingresada es incorrecta');
          } else {
            setStatusMessage('Error de acceso');
            setError(result.error);
          }
        } else {
          setStatusMessage('Error de acceso');
          setError('Credenciales inválidas');
        }
        
        // Cerrar el preloader de error después de un tiempo
        setTimeout(() => {
          setLoading(false);
          setTimeout(() => {
            setShowPreloader(false);
          }, 300);
        }, 1500);
      }
    } catch (err) {
      setAnimationState('error');
      setStatusMessage('Error de conexión');
      setError('Error al conectar con el servidor');
      console.error('Error de conexión:', err);
      
      // Cerrar el preloader de error después de un tiempo
      setTimeout(() => {
        setLoading(false);
        setTimeout(() => {
          setShowPreloader(false);
        }, 300);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center relative">
      {/* Preloader overlay con animaciones Lottie */}
      {showPreloader && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-52 h-52"
          >
            {animationState === 'loading' && (
              <Lottie 
                animationData={loadingAnimation} 
                loop={true}
                className="w-full h-full"
              />
            )}
            {animationState === 'success' && (
              <Lottie 
                animationData={successAnimation} 
                loop={false} 
                className="w-full h-full"
              />
            )}
            {animationState === 'error' && (
              <Lottie 
                animationData={errorAnimation} 
                loop={false}
                className="w-full h-full"
              />
            )}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className={`mt-6 font-semibold text-xl ${
              animationState === 'loading' ? 'text-blue-800' :
              animationState === 'success' ? 'text-green-700' :
              'text-red-600'
            }`}
          >
            {animationState === 'loading' ? 'Iniciando sesión' :
             animationState === 'success' ? '¡Acceso exitoso!' :
             'Error de acceso'}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className={`mt-4 text-sm ${
              animationState === 'loading' ? 'text-gray-600' :
              animationState === 'success' ? 'text-green-600' :
              'text-red-500'
            }`}
          >
            {statusMessage}
          </motion.div>
        </motion.div>
      )}
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-6">
          <img src={logoImg} alt="Cliquéalo" className="h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="text-gray-600 mt-2">Ingrese sus credenciales para acceder al sistema</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="usuario" className="block text-gray-700 text-sm font-medium mb-2">
                Usuario
              </label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                value={formData.usuario}
                onChange={handleChange}
                className="appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                placeholder="Ingrese su nombre de usuario"
                autoComplete="username"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
              />
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Recordarme
                </label>
              </div>
            </div>
            
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 px-4 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg shadow-md focus:outline-none ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Procesando...' : 'Iniciar Sesión'}
            </motion.button>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={onCreateAccountClick}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Crear Cuenta
                </button>
              </p>
            </div>
          </form>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Cliquéalo.mx - Todos los derechos reservados</p>
          <p className="mt-1">USO INTERNO - Este sitio es propiedad de Cliquéalo.mx</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
