import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';

// Importar las animaciones
import loadingAnimation from '../assets/loading-animation.json';
import successAnimation from '../assets/success-animation.json';
import errorAnimation from '../assets/error-animation.json';

// Variantes para animaciones
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const formFieldVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

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
    <div className="min-h-screen flex flex-col justify-center relative overflow-hidden">
      {/* Fondo con gradiente moderno */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-indigo-100 z-0"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgNTYgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGQ9Ik0yOCA2NkwwIDUwTDAgMTZMMjggMEw1NiAxNkw1NiA1MEwyOCA2NkwyOCAxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2VlZWVmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+Cjwvc3ZnPg==')] opacity-5 z-0"></div>
      
      {/* Banner superior estilo gobierno */}
      <div className="absolute top-0 left-0 right-0 bg-blue-800 h-2 w-full z-10"></div>
      <div className="absolute top-2 left-0 right-0 bg-red-600 h-1 w-full z-10"></div>
      
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
            className="w-64 h-64"
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
      
      <div className="max-w-6xl w-full mx-auto px-6 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        >
          {/* Columna izquierda - Información */}
          <div className="order-2 lg:order-1">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col lg:items-start items-center"
            >
              <div className="flex items-center mb-6">
                <img src={logoImg} alt="Cliquéalo" className="h-20 mr-4" />
                <div className="border-l-2 border-blue-800 pl-4 text-left">
                  <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Sistema oficial</h2>
                  <h3 className="text-xs text-slate-600">Plataforma de gestión segura</h3>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent tracking-tight mt-2 mb-4">
                Iniciar sesión
              </h1>
              
              <p className="text-slate-600 text-lg mb-8 max-w-lg">
                Accede a nuestra plataforma de gestión para administrar tus trámites de manera segura y eficiente.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg">
                <motion.div 
                  variants={itemVariants}
                  className="flex items-start space-x-3"
                >
                  <div className="bg-blue-100 rounded-full p-2 mt-1">
                    <svg className="h-5 w-5 text-blue-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-slate-800">Acceso seguro</h3>
                    <p className="text-sm text-slate-600">Seguridad de nivel institucional</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="flex items-start space-x-3"
                >
                  <div className="bg-blue-100 rounded-full p-2 mt-1">
                    <svg className="h-5 w-5 text-blue-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-slate-800">Datos protegidos</h3>
                    <p className="text-sm text-slate-600">Información encriptada y segura</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  variants={itemVariants}
                  className="flex items-start space-x-3"
                >
                  <div className="bg-blue-100 rounded-full p-2 mt-1">
                    <svg className="h-5 w-5 text-blue-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-slate-800">Acceso rápido</h3>
                    <p className="text-sm text-slate-600">Verificación instantánea</p>
                  </div>
                </motion.div>
              </div>
              
              <motion.div
                variants={itemVariants}
                className="mt-10 w-full max-w-lg bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <svg className="h-5 w-5 text-blue-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">¿No tiene una cuenta?</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Si no tiene credenciales de acceso, puede{' '}
                        <motion.button 
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={onCreateAccountClick}
                          className="font-medium underline hover:text-blue-900 transition-colors"
                        >
                          crear una cuenta aquí
                        </motion.button>.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        
          {/* Columna derecha - Formulario */}
          <div className="order-1 lg:order-2">
            <motion.div 
              variants={itemVariants}
              className="bg-white bg-opacity-50 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl p-8 mb-8"
            >
              <div className="border-b border-slate-200/60 pb-4 mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Ingrese sus credenciales</h2>
                <p className="text-sm text-slate-500 mt-1">Toda la información es encriptada y segura</p>
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-red-50 border border-red-200 p-4 mb-6 rounded-lg"
                >
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
                </motion.div>
              )}
          
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div 
                  variants={formFieldVariants}
                  className="mb-4"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="usuario" className="block text-sm font-medium text-slate-700">
                      Identificador de Usuario
                    </label>
                    <span className="text-xs text-red-600 font-medium">* Obligatorio</span>
                  </div>
                  <div className="relative rounded-lg overflow-hidden shadow-sm border border-slate-300/50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white/80 transition-all duration-200">
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
                      className="block w-full pl-10 pr-3 py-3.5 border-0 rounded-lg focus:outline-none text-slate-800 placeholder-slate-400 bg-transparent"
                      placeholder="Ingrese su ID de usuario"
                      autoComplete="username"
                      required
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">Su identificador único en el sistema</p>
                </motion.div>
            
                <motion.div 
                  variants={formFieldVariants}
                  className="mb-4"
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                      Contraseña de Acceso
                    </label>
                    <span className="text-xs text-red-600 font-medium">* Obligatorio</span>
                  </div>
                  <div className="relative rounded-lg overflow-hidden shadow-sm border border-slate-300/50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white/80 transition-all duration-200">
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
                      className="block w-full pl-10 pr-3 py-3.5 border-0 rounded-lg focus:outline-none text-slate-800 placeholder-slate-400 bg-transparent"
                      placeholder="Ingrese su contraseña segura"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">Su contraseña es confidencial y encriptada</p>
                </motion.div>
            
                <motion.div 
                  variants={formFieldVariants}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-700 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                      Mantener sesión iniciada
                    </label>
                  </div>
                  <div>
                    <a href="#" className="text-sm text-blue-700 hover:text-blue-900 transition-colors">
                      ¿Olvidó su contraseña?
                    </a>
                  </div>
                </motion.div>
            
                <motion.div 
                  variants={formFieldVariants}
                  className="pt-4"
                >
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
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-lg text-white font-medium text-base 
                      bg-gradient-to-r from-blue-800 to-blue-700 hover:from-blue-700 hover:to-blue-800
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200
                      ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verificando credenciales...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Iniciar Sesión Segura
                      </span>
                    )}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </div>
          
          {/* Footer */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-2 text-center text-xs text-slate-500 pb-6"
          >
            <div className="flex items-center justify-center space-x-4 mb-3">
              <a href="#" className="hover:text-blue-600 transition-colors">Privacidad</a>
              <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
              <a href="#" className="hover:text-blue-600 transition-colors">Términos</a>
              <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
              <a href="#" className="hover:text-blue-600 transition-colors">Ayuda</a>
            </div>
            <p>© {new Date().getFullYear()} Cliquéalo.mx - Todos los derechos reservados</p>
            <p className="mt-2 border-t border-slate-200/40 pt-2 text-[10px] uppercase tracking-wider font-medium">SISTEMA DE ACCESO OFICIAL - USO AUTORIZADO SOLAMENTE</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;