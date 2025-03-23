import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';

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
      const response = await fetch('/api/usuarios/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      
      if (!response.ok) {
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
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-6">
          <img src={logoImg} alt="Cliquéalo" className="h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Crear Cuenta</h2>
          <p className="text-gray-600 mt-2">Complete el formulario para registrarse en el sistema</p>
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
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="numero_empleado" className="block text-gray-700 text-sm font-medium mb-2">
                Número de Empleado (opcional)
              </label>
              <input
                id="numero_empleado"
                name="numero_empleado"
                type="text"
                value={formData.numero_empleado}
                onChange={handleChange}
                className="appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                placeholder="Ingrese su número de empleado"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="usuario" className="block text-gray-700 text-sm font-medium mb-2">
                Usuario <span className="text-red-500">*</span>
              </label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                value={formData.usuario}
                onChange={handleChange}
                className="appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                placeholder="Ingrese su nombre de usuario"
                required
                autoComplete="username"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                placeholder="Ingrese su contraseña"
                required
                autoComplete="new-password"
              />
              <p className="text-xs text-gray-500 mt-1">La contraseña debe tener al menos 6 caracteres</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                placeholder="Confirme su contraseña"
                required
                autoComplete="new-password"
              />
            </div>
            
            {/* El rol se establece por defecto como "capturista" y no se permite cambiar */}
            <input 
              type="hidden" 
              name="rol" 
              value="capturista" 
            />
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg shadow-md focus:outline-none ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Iniciar Sesión
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

export default CreateAccount;
