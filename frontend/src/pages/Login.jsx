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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center relative overflow-hidden">
      {/* Banner superior estilo gobierno */}
      <div className="absolute top-0 left-0 right-0 bg-blue-900 h-2 w-full"></div>
      <div className="absolute top-2 left-0 right-0 bg-red-700 h-1 w-full"></div>
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
              animationState === 'loading' ? 'text-blue-700' :
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
              animationState === 'loading' ? 'text-slate-600' :
              animationState === 'success' ? 'text-green-600' :
              'text-red-500'
            }`}
          >
            {statusMessage}
          </motion.div>
        </motion.div>
      )}
      
      <div className="max-w-lg w-full mx-auto px-6 relative z-10">
        <div className="text-center mb-8">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center justify-center mb-2">
              <img src={logoImg} alt="Cliquéalo" className="h-16 mr-3" />
              <div className="border-l-2 border-blue-800 pl-3 text-left">
                <h2 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Sistema oficial</h2>
                <h3 className="text-xs text-slate-600">Plataforma de gestión segura</h3>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-blue-900 tracking-tight mt-6">Autenticación Segura</h1>
            <div className="flex items-center mt-2 justify-center">
              <svg className="h-4 w-4 text-blue-700 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-slate-600 text-sm">Acceda al sistema con credenciales autorizadas</p>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-md border border-slate-200 shadow-lg p-8 mb-8"
        >
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Ingrese sus credenciales</h2>
            <p className="text-sm text-slate-500 mt-1">Toda la información es encriptada y segura</p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">No se pudo procesar la solicitud</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="usuario" className="block text-sm font-medium text-slate-700">
                  Identificador de Usuario
                </label>
                <span className="text-xs text-red-600 font-medium">* Obligatorio</span>
              </div>
              <div className="relative rounded-md shadow-sm border border-slate-300 focus-within:ring-1 focus-within:ring-blue-800 focus-within:border-blue-800 bg-white">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <input
                  id="usuario"
                  name="usuario"
                  type="text"
                  value={formData.usuario}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border-0 rounded-md focus:outline-none text-slate-800 placeholder-slate-400 bg-transparent"
                  placeholder="Ingrese su ID de usuario"
                  autoComplete="username"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Su identificador único en el sistema</p>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Contraseña de Acceso
                </label>
                <span className="text-xs text-red-600 font-medium">* Obligatorio</span>
              </div>
              <div className="relative rounded-md shadow-sm border border-slate-300 focus-within:ring-1 focus-within:ring-blue-800 focus-within:border-blue-800 bg-white">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border-0 rounded-md focus:outline-none text-slate-800 placeholder-slate-400 bg-transparent"
                  placeholder="Ingrese su contraseña segura"
                  autoComplete="current-password"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Su contraseña es confidencial y encriptada</p>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-700 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                  Sesión persistente
                </label>
              </div>
            </div>
            
            <div className="pt-2">
              <div className="flex items-center justify-center mb-4 text-xs text-slate-500">
                <svg className="h-4 w-4 text-blue-700 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Conexión cifrada y segura
              </div>
              
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-white font-medium text-base bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Verificando credenciales...' : 'Iniciar Sesión Segura'}
              </motion.button>
              
              <div className="mt-5 text-center border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-600">
                  ¿No tiene acceso al sistema?{' '}
                  <button
                    type="button"
                    onClick={onCreateAccountClick}
                    className="text-blue-700 hover:text-blue-900 font-semibold transition-colors"
                  >
                    Solicitar Cuenta
                  </button>
                </p>
              </div>
            </div>
          </form>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-xs text-slate-500"
        >
          <div className="flex items-center justify-center space-x-4 mb-3">
            <span>Privacidad</span>
            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
            <span>Términos</span>
            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
            <span>Ayuda</span>
          </div>
          <p>© {new Date().getFullYear()} Cliquéalo.mx - Todos los derechos reservados</p>
          <p className="mt-2 border-t border-slate-200 pt-2 text-[10px] uppercase tracking-wider font-medium">SISTEMA DE ACCESO OFICIAL - USO AUTORIZADO SOLAMENTE</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
