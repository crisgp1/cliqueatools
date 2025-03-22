import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../assets/logo.png';

/**
 * Componente de página de creación de cuenta con estilo gov.uk y animaciones
 * Maneja el registro de nuevos usuarios
 */
const CreateAccountPage = ({ onLogin, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nombre: '',
    apellidos: '',
    password: '',
    confirmPassword: '',
    rol: 'asesor' // Cambiar a asesor para evitar requerir clienteId
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
   * Maneja los cambios en los campos del formulario
   * @param {Event} e - Evento de cambio
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  /**
   * Valida los campos del formulario
   * @returns {boolean} - true si la validación es exitosa
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Validar username
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'El formato del correo electrónico es inválido';
      }
    }
    
    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    // Validar apellidos
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    }
    
    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debe confirmar su contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario de registro
   * @param {Event} e - Evento del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setFormError(null);
    
    try {
      // Preparar datos para enviar (sin confirmPassword)
      // Si el rol es cliente, se debe proporcionar un clienteId
      const { confirmPassword, ...userData } = formData;
      
      // Modificamos los datos según el rol para asegurar que cumpla los requisitos del backend
      if (userData.rol === 'cliente' && !userData.clienteId) {
        userData.clienteId = 'temp-' + Math.random().toString(36).substr(2, 9);
      }
      
      // Llamada a la API de registro
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }
      
      // Mostrar toast de éxito brevemente antes de iniciar sesión
      setShowSuccessToast(true);
      
      // Esperar un momento para que se vea la animación antes de redirigir
      setTimeout(() => {
        // Si hay un usuario y token en la respuesta, iniciar sesión automáticamente
        if (data.user && data.token) {
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.token);
          onLogin(data.user);
        } else {
          // Si no hay datos de inicio de sesión, volver a la página de login
          onBackToLogin();
        }
      }, 1500);
    } catch (err) {
      setFormError(err.message);
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

  /**
   * Alterna la visibilidad de la confirmación de contraseña
   */
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-10 bg-gradient-to-b from-[#f3f2f1] to-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white shadow-xl rounded-md w-full max-w-2xl p-8 border-l-4 border-l-[#1d70b8] relative overflow-hidden"
        >
          {/* Elemento decorativo */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#1d70b8]/10 to-transparent rounded-bl-full -z-10"></div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-[#0b0c0c] mb-2 relative"
          >
            Crear cuenta
            <div className="absolute w-12 h-1 bg-[#1d70b8] rounded bottom-0 left-0 mt-2"></div>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600 mb-8"
          >
            Complete el formulario para registrarse en el sistema
          </motion.p>
          
          <AnimatePresence>
            {formError && <Toast message={formError} type="error" />}
            {showSuccessToast && <Toast message="Cuenta creada exitosamente. Redirigiendo..." type="success" />}
          </AnimatePresence>
          
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {/* Grid de campos del formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campo de usuario */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className={`${errors.username ? 'border-l-4 border-l-red-600 pl-2' : ''}`}
              >
                <label 
                  htmlFor="username" 
                  className="block text-xl font-medium text-[#0b0c0c] mb-2"
                >
                  Nombre de usuario <span className="text-red-600">*</span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full p-4 border-2 ${errors.username ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ffdd00] focus:border-[#0b0c0c] transition-all duration-200 rounded-sm`}
                  autoComplete="username"
                />
                {errors.username && (
                  <p className="text-red-600 text-sm mt-1">{errors.username}</p>
                )}
              </motion.div>
              
              {/* Campo de email */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className={`${errors.email ? 'border-l-4 border-l-red-600 pl-2' : ''}`}
              >
                <label 
                  htmlFor="email" 
                  className="block text-xl font-medium text-[#0b0c0c] mb-2"
                >
                  Correo electrónico <span className="text-red-600">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-4 border-2 ${errors.email ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ffdd00] focus:border-[#0b0c0c] transition-all duration-200 rounded-sm`}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </motion.div>
              
              {/* Campo de nombre */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className={`${errors.nombre ? 'border-l-4 border-l-red-600 pl-2' : ''}`}
              >
                <label 
                  htmlFor="nombre" 
                  className="block text-xl font-medium text-[#0b0c0c] mb-2"
                >
                  Nombre <span className="text-red-600">*</span>
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`w-full p-4 border-2 ${errors.nombre ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ffdd00] focus:border-[#0b0c0c] transition-all duration-200 rounded-sm`}
                  autoComplete="given-name"
                />
                {errors.nombre && (
                  <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>
                )}
              </motion.div>
              
              {/* Campo de apellidos */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.0 }}
                className={`${errors.apellidos ? 'border-l-4 border-l-red-600 pl-2' : ''}`}
              >
                <label 
                  htmlFor="apellidos" 
                  className="block text-xl font-medium text-[#0b0c0c] mb-2"
                >
                  Apellidos <span className="text-red-600">*</span>
                </label>
                <input
                  id="apellidos"
                  name="apellidos"
                  type="text"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className={`w-full p-4 border-2 ${errors.apellidos ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ffdd00] focus:border-[#0b0c0c] transition-all duration-200 rounded-sm`}
                  autoComplete="family-name"
                />
                {errors.apellidos && (
                  <p className="text-red-600 text-sm mt-1">{errors.apellidos}</p>
                )}
              </motion.div>
            </div>
            
            {/* Campos de contraseña - ocupan todo el ancho */}
            <div className="mt-2">
              {/* Campo de contraseña */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
                className={`mb-6 ${errors.password ? 'border-l-4 border-l-red-600 pl-2' : ''}`}
              >
                <label 
                  htmlFor="password" 
                  className="block text-xl font-medium text-[#0b0c0c] mb-2"
                >
                  Contraseña <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full p-4 border-2 ${errors.password ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ffdd00] focus:border-[#0b0c0c] transition-all duration-200 rounded-sm`}
                    autoComplete="new-password"
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
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
                <p className="text-gray-600 text-sm mt-1">La contraseña debe tener al menos 6 caracteres</p>
              </motion.div>
              
              {/* Campo de confirmación de contraseña */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2 }}
                className={`${errors.confirmPassword ? 'border-l-4 border-l-red-600 pl-2' : ''}`}
              >
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-xl font-medium text-[#0b0c0c] mb-2"
                >
                  Confirmar contraseña <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full p-4 border-2 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#ffdd00] focus:border-[#0b0c0c] transition-all duration-200 rounded-sm`}
                    autoComplete="new-password"
                  />
                  <motion.button 
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showConfirmPassword ? "Ocultar" : "Mostrar"}
                  </motion.button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </motion.div>
            </div>
            
            {/* Separador decorativo */}
            <div className="relative py-3 flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <div className="flex-shrink mx-4 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Botón de registro */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#00703c] hover:bg-[#005a30] text-white font-bold py-4 px-6 focus:outline-none focus:ring-2 focus:ring-[#ffdd00] focus:ring-offset-2 transition-all duration-200 rounded-md shadow-md relative overflow-hidden group"
              whileHover={{ scale: 1.02, backgroundColor: "#005a30" }}
              whileTap={{ scale: 0.98 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                delay: 1.3,
                y: { type: "spring", stiffness: 400, damping: 10 }
              }}
            >
              {/* Efecto de brillo en hover */}
              <span className="absolute top-0 left-0 w-full h-full bg-white transform -skew-x-12 -translate-x-full opacity-30 group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
              
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <motion.div
                    className="h-5 w-5 rounded-full border-2 border-white border-t-transparent mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
                  <span>Creando cuenta...</span>
                </div>
              ) : (
                <span className="flex items-center justify-center">
                  Crear cuenta
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </motion.button>
            
            {/* Enlace para volver al login */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="text-center mt-4"
            >
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-[#1d70b8] hover:text-[#003078] hover:underline focus:outline-none focus:ring-2 focus:ring-[#ffdd00] inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                ¿Ya tiene una cuenta? Acceder
              </button>
            </motion.div>
          </motion.form>
        </motion.div>
      </main>
      
      {/* Footer estilo gov.uk */}
      <motion.footer 
        className="bg-[#f3f2f1] py-10 border-t-2 border-[#1d70b8]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
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

export default CreateAccountPage;