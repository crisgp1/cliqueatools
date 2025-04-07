import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import { motion } from 'framer-motion';

const CreateAccount = ({ onLoginClick }) => {
  const navigate = useNavigate();
  
  // Estado para almacenar los datos del formulario
  const [formData, setFormData] = useState({
    numero_empleado: '',
    usuario: '',
    password: '',
    confirmPassword: '',
    rol: 'capturista' // Valor por defecto
  });

  // Estado para manejar errores y carga
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Limpiar mensaje de error al cambiar los datos
    if (error) setError('');
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación de campos
    if (!formData.usuario || !formData.password || !formData.confirmPassword) {
      setError('Por favor, complete todos los campos obligatorios');
      return;
    }
    
    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    // Validar longitud de contraseña
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Preparar datos para enviar (excluir confirmPassword)
      const { confirmPassword, ...dataToSend } = formData;
      
      // Enviar solicitud de registro
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
        credentials: 'include', // Añadir credentials para enviar cookies y headers de autorización
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Mensaje específico si el usuario ya existe
        if (data.mensaje && data.mensaje.includes('ya existe')) {
          throw new Error('Este nombre de usuario ya existe. Por favor, elija otro nombre de usuario.');
        }
        throw new Error(data.mensaje || 'Error al registrar usuario');
      }

      // Mostrar mensaje de éxito
      setSuccess('Usuario registrado exitosamente');
      
      // Redireccionar al login después de 2 segundos
      setTimeout(() => {
        if (onLoginClick) {
          onLoginClick();
        }
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor');
      console.error('Error de registro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center relative overflow-hidden">
      {/* Banner superior estilo gobierno */}
      <div className="absolute top-0 left-0 right-0 bg-blue-900 h-2 w-full"></div>
      <div className="absolute top-2 left-0 right-0 bg-red-700 h-1 w-full"></div>
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
            <h1 className="text-3xl font-bold text-blue-900 tracking-tight mt-6">Registro de Usuario</h1>
            <div className="flex items-center mt-2 justify-center">
              <svg className="h-4 w-4 text-blue-700 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-slate-600 text-sm">Solicitud de acceso al sistema de gestión</p>
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
            <h2 className="text-lg font-semibold text-slate-800">Información de registro</h2>
            <p className="text-sm text-slate-500 mt-1">Todos los datos son verificados y cifrados</p>
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
          
          {success && (
            <div className="bg-green-50 border border-green-200 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Registro completado</h3>
                  <p className="mt-1 text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="numero_empleado" className="block text-sm font-medium text-slate-700">
                  Número de Empleado
                </label>
                <span className="text-xs text-slate-500 font-medium">Opcional</span>
              </div>
              <div className="relative rounded-md shadow-sm border border-slate-300 focus-within:ring-1 focus-within:ring-blue-800 focus-within:border-blue-800 bg-white">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
                <input
                  id="numero_empleado"
                  name="numero_empleado"
                  type="text"
                  value={formData.numero_empleado}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border-0 rounded-md focus:outline-none text-slate-800 placeholder-slate-400 bg-transparent"
                  placeholder="Ingrese su número de identificación"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Para personal autorizado interno</p>
            </div>
            
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
                  placeholder="Elija un nombre de usuario único"
                  required
                  autoComplete="username"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Será su identificador para acceso al sistema</p>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Contraseña de Seguridad
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
                  placeholder="Cree una contraseña segura"
                  required
                  autoComplete="new-password"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Mínimo 6 caracteres, recomendamos incluir símbolos y números</p>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                  Confirmar Contraseña
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
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border-0 rounded-md focus:outline-none text-slate-800 placeholder-slate-400 bg-transparent"
                  placeholder="Repita su contraseña"
                  required
                  autoComplete="new-password"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Debe coincidir exactamente con la contraseña ingresada</p>
            </div>
            
            {/* El rol se establece por defecto como "capturista" y no se permite cambiar */}
            <input 
              type="hidden" 
              name="rol" 
              value="capturista" 
            />
            
            <div className="pt-2">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-700 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="terms" className="text-xs text-slate-700">
                  Acepto los <span className="text-blue-700 font-medium">términos y condiciones</span> y la <span className="text-blue-700 font-medium">política de privacidad</span>
                </label>
              </div>
              
              <div className="flex items-center justify-center mb-4 text-xs text-slate-500">
                <svg className="h-4 w-4 text-blue-700 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sus datos están protegidos y encriptados
              </div>
              
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-white font-medium text-base bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Procesando solicitud...' : 'Solicitar Cuenta de Acceso'}
              </motion.button>
              
              <div className="mt-5 text-center border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-600">
                  ¿Ya tiene credenciales de acceso?{' '}
                  <button
                    type="button"
                    onClick={onLoginClick}
                    className="text-blue-700 hover:text-blue-900 font-semibold transition-colors"
                  >
                    Iniciar Sesión Segura
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

export default CreateAccount;
