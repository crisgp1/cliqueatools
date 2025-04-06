import { createContext, useState, useEffect } from 'react';

// Crear el contexto de autenticación
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estado para almacenar la información del usuario autenticado
  const [user, setUser] = useState(null);
  // Estado para almacenar el token JWT
  const [token, setToken] = useState(null);
  // Estado para verificar si la autenticación está cargando
  const [loading, setLoading] = useState(true);

  // Efecto para inicializar el estado de autenticación desde localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  // Función para iniciar sesión
  const login = async (usuario, password) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, password }),
        credentials: 'include', // Añadir credentials para enviar cookies y headers de autorización
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al iniciar sesión');
      }

      // Almacenar el token y los datos del usuario en localStorage
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.data.usuario));
      
      // Actualizar el estado
      setToken(data.data.token);
      setUser(data.data.usuario);
      
      return { success: true };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    // Eliminar token y datos del usuario de localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Actualizar el estado
    setToken(null);
    setUser(null);
  };

  // Función para verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return !!token;
  };

  // Proporcionar el contexto a los componentes hijos
  const contextValue = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;