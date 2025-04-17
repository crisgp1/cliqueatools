import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/logo.png';

// Variantes para animaciones sutiles
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4 }
  }
};

const CreateAccount = ({ onLoginClick }) => {
  const navigate = useNavigate();
  
  // Estado para datos del formulario
  const [formData, setFormData] = useState({
    numero_empleado: '',
    usuario: '',
    password: '',
    confirmPassword: '',
    correo: '',
    rol: 'capturista'
  });
  
  // Opciones de rol según init.sql
  const roleOptions = [
    'capturista',
    'director',
    'creditos',
    'gerencia',
    'administrador',
    'vendedor',
    'mecanico',
    'valuador',
    'contador',
    'atencion_cliente',
    'logistica',
    'marketing',
    'legal',
    'rh'
  ];

  // Estados para UI
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Para navegación en pasos

  // Función para manejar cambios en inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    if (error) setError('');
  };

  // Validar formulario
  const validateForm = () => {
    if (!formData.usuario) {
      setError('Ingresa un nombre de usuario');
      return false;
    }
    
    if (!formData.password) {
      setError('Ingresa una contraseña');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    
    if (!formData.correo) {
      setError('Ingresa tu correo electrónico');
      return false;
    }
    
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(formData.correo)) {
      setError('Ingresa un correo electrónico válido');
      return false;
    }
    
    return true;
  };

  // Avanzar al siguiente paso
  const handleNextStep = () => {
    if (validateForm()) {
      setStep(2);
    }
  };

  // Volver al paso anterior
  const handlePrevStep = () => {
    setStep(1);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Eliminar confirmPassword para envío
      const { confirmPassword, ...dataToSend } = formData;
      
      // Simular retraso para mostrar loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Enviar solicitud de registro
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.mensaje && data.mensaje.includes('ya existe')) {
          throw new Error('Este nombre de usuario ya existe. Por favor, elija otro.');
        }
        throw new Error(data.mensaje || 'Error al registrar usuario');
      }

      // Simular retraso antes de redireccionar
      setTimeout(() => {
        setLoading(false);
        if (onLoginClick) {
          onLoginClick();
        }
      }, 1000);
      
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor');
      console.error('Error de registro:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header minimalista */}
      <header className="fixed top-0 left-0 w-full bg-white z-10 py-5 px-6 border-b border-gray-100">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <img src={logoImg} alt="Logo" className="h-6" />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLoginClick}
            className="text-sm font-medium hover:text-gray-600"
          >
            Iniciar sesión
          </motion.button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-3xl font-bold mb-2">Crea tu cuenta</h1>
                  <p className="text-gray-500 mb-6">Ingresa tus datos para registrarte</p>
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border-l-4 border-red-500 p-4 mb-6"
                    >
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="usuario">
                        Usuario
                      </label>
                      <input
                        id="usuario"
                        name="usuario"
                        type="text"
                        value={formData.usuario}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                        placeholder="Elige un nombre de usuario"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="correo">
                        Correo electrónico
                      </label>
                      <input
                        id="correo"
                        name="correo"
                        type="email"
                        value={formData.correo}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                        placeholder="ejemplo@correo.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="password">
                        Contraseña
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="confirmPassword">
                        Confirmar contraseña
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                        placeholder="Repite tu contraseña"
                      />
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleNextStep}
                      className="w-full py-3 bg-black text-white rounded-md font-medium"
                    >
                      Continuar
                    </motion.button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Al crear una cuenta, aceptas nuestros <a href="#" className="underline">Términos de servicio</a> y <a href="#" className="underline">Política de privacidad</a>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center mb-6">
                    <button 
                      onClick={handlePrevStep}
                      className="p-2 mr-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <h1 className="text-3xl font-bold">Completa tu registro</h1>
                  </div>
                  
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border-l-4 border-red-500 p-4 mb-6"
                    >
                      <p className="text-sm text-red-700">{error}</p>
                    </motion.div>
                  )}
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="numero_empleado">
                        Número de empleado <span className="text-gray-500 text-xs">(opcional)</span>
                      </label>
                      <input
                        id="numero_empleado"
                        name="numero_empleado"
                        type="text"
                        value={formData.numero_empleado}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                        placeholder="Si aplica"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="rol">
                        Rol
                      </label>
                      <select
                        id="rol"
                        name="rol"
                        value={formData.rol}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-black focus:border-black"
                      >
                        {roleOptions.map(role => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        className="h-4 w-4 border-gray-300 rounded text-black focus:ring-black"
                      />
                      <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                        Acepto recibir comunicaciones sobre actualizaciones y ofertas
                      </label>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <div className="flex items-start">
                        <svg className="flex-shrink-0 w-5 h-5 text-gray-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="ml-2 text-sm text-gray-600">
                          Tu información será protegida según nuestra política de privacidad. Nunca compartiremos tus datos sin tu consentimiento.
                        </p>
                      </div>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleSubmit}
                      disabled={loading}
                      className={`w-full py-3 bg-black text-white rounded-md font-medium flex items-center justify-center ${loading ? 'opacity-70' : ''}`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                        </>
                      ) : (
                        'Crear cuenta'
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="fixed bottom-0 left-0 w-full bg-white py-4 px-6 border-t border-gray-100 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <a href="#" className="hover:text-black">Ayuda</a>
            <a href="#" className="hover:text-black">Términos</a>
            <a href="#" className="hover:text-black">Privacidad</a>
          </div>
          <p className="text-xs text-gray-400 mt-2">© {new Date().getFullYear()} Cliquéalo.mx</p>
        </div>
      </footer>
    </div>
  );
};

export default CreateAccount;