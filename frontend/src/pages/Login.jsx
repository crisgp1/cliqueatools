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
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

const slideUp = {
  hidden: { y: 10, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { duration: 0.3 } 
  }
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
  const [animationState, setAnimationState] = useState('loading');
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
      }, 1500);
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
    <div className="min-h-screen flex flex-col bg-uber-white text-uber-black">
      {/* Preloader animado */}
      {showPreloader && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-uber-white/95 z-50 flex flex-col items-center justify-center"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16"
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 font-medium text-sm"
          >
            {statusMessage}
          </motion.p>
        </motion.div>
      )}
      
      {/* Header con logo */}
      <header className="pt-8 pb-4 px-6 shadow-uber-sm">
        <div className="max-w-md mx-auto">
          <img src={logoImg} alt="Cliquéalo" className="h-8" />
        </div>
      </header>
      
      {/* Contenido principal */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="w-full max-w-md"
        >
          <motion.h1 
            variants={slideUp}
            className="text-3xl font-bold mb-8"
          >
            Iniciar sesión
          </motion.h1>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-uber-gray-50 text-uber-accent-red text-sm rounded-uber shadow-uber-sm"
            >
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={slideUp}>
              <label htmlFor="usuario" className="block text-sm font-medium text-uber-gray-700 mb-2">Usuario</label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                value={formData.usuario}
                onChange={handleChange}
                className="uber-input"
                placeholder="Ingrese su usuario"
                autoComplete="username"
                required
              />
            </motion.div>
            
            <motion.div variants={slideUp}>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-uber-gray-700">Contraseña</label>
                <a href="#" className="text-xs text-uber-accent-blue hover:text-uber-accent-blue/80">¿Olvidó su contraseña?</a>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="uber-input"
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
                required
              />
            </motion.div>
            
            <motion.div variants={slideUp} className="pt-2">
              <div className="flex items-center mb-6">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-uber-accent-blue border-uber-gray-300 rounded focus:ring-uber-accent-blue focus:ring-offset-1"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-uber-gray-600">
                  Mantener sesión iniciada
                </label>
              </div>
              
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className={`uber-button w-full flex justify-center items-center py-4
                  ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </motion.button>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-uber-gray-600">
                  ¿No tienes una cuenta?{' '}
                  <button 
                    onClick={onCreateAccountClick}
                    className="font-medium text-uber-accent-blue hover:text-uber-accent-blue/80 transition-colors"
                  >
                    Regístrate ahora
                  </button>
                </p>
              </div>
            </motion.div>
          </form>
          
          <motion.div variants={fadeIn} className="mt-12 text-center">
            <p className="text-xs text-uber-gray-500">
              Al continuar, aceptas nuestros{' '}
              <a href="#" className="text-uber-gray-600 hover:text-uber-black">Términos de servicio</a>{' '}
              y{' '}
              <a href="#" className="text-uber-gray-600 hover:text-uber-black">Política de privacidad</a>
            </p>
          </motion.div>
        </motion.div>
      </main>
      
      {/* Footer simple */}
      <footer className="py-6 px-6 text-center text-xs text-uber-gray-500 border-t border-uber-gray-200">
        <p>© {new Date().getFullYear()} Cliquéalo.mx</p>
      </footer>
    </div>
  );
};

export default Login;