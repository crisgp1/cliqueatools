import { createContext, useState, useEffect, useCallback } from 'react';
import useNotificationStore from '../store/notificationStore';

// Crear el contexto de autenticación
export const AuthContext = createContext();

// Función para verificar si un token JWT ha expirado
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Extraer la parte del payload del token
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Verificar si tiene fecha de expiración
    if (!payload.exp) return false;
    
    // Comparar con la fecha actual
    const expirationTime = payload.exp * 1000; // Convertir a milisegundos
    const currentTime = Date.now();
    
    return currentTime >= expirationTime;
  } catch (error) {
    console.error('Error al verificar expiración del token:', error);
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  // Acceder al store de notificaciones
  const { addSessionExpiredNotification } = useNotificationStore();
  // Estado para almacenar la información del usuario autenticado
  const [user, setUser] = useState(null);
  // Estado para almacenar el token JWT
  const [token, setToken] = useState(null);
  // Estado para verificar si la autenticación está cargando
  const [loading, setLoading] = useState(true);

  // Estado para controlar redirección forzada
  const [shouldRedirectToLogin, setShouldRedirectToLogin] = useState(false);
  
  // Función para manejar la expiración del token
  const handleTokenExpiration = useCallback(() => {
    // Mostrar notificación
    addSessionExpiredNotification();
    
    // Eliminar token y datos del usuario
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Actualizar el estado
    setToken(null);
    setUser(null);
    
    // Forzar redirección
    setShouldRedirectToLogin(true);
  }, [addSessionExpiredNotification]);
  
  // Función para forzar redirección al login
  const forceRedirectToLogin = useCallback(() => {
    handleTokenExpiration();
  }, [handleTokenExpiration]);
  // Efecto para manejar la redirección forzada
  useEffect(() => {
    if (shouldRedirectToLogin) {
      // Resetear el estado después de que la redirección haya sido manejada
      setShouldRedirectToLogin(false);
    }
  }, [shouldRedirectToLogin]);
  // Efecto para inicializar el estado de autenticación desde localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      // Verificar si el token ha expirado
      if (isTokenExpired(storedToken)) {
        handleTokenExpiration();
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    }
    
    setLoading(false);
  }, [handleTokenExpiration]);
  
  // Efecto para verificar periódicamente si el token ha expirado
  useEffect(() => {
    if (!token) return;
    
    // Verificar el token inmediatamente al montarse el componente
    if (isTokenExpired(token)) {
      handleTokenExpiration();
    }
    
    const checkTokenInterval = setInterval(() => {
      if (isTokenExpired(token)) {
        handleTokenExpiration();
      }
    }, 15000); // Verificar cada 15 segundos para una detección más rápida
    
    return () => clearInterval(checkTokenInterval);
  }, [token, handleTokenExpiration]);

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
  const logout = useCallback(() => {
    // Eliminar token y datos del usuario de localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Actualizar el estado
    setToken(null);
    setUser(null);
  }, []);

  // Función para verificar si el usuario está autenticado
  const isAuthenticated = useCallback(() => {
    // Verificar si hay token y si no ha expirado
    return !!token && !isTokenExpired(token);
  }, [token]);
  // Función utilitaria para manejar respuestas de API y verificar token
  const handleApiResponse = useCallback(async (response) => {
    // Si la respuesta es 401 Unauthorized, puede indicar que el token expiró
    if (response.status === 401) {
      handleTokenExpiration();
      throw new Error('Sesión expirada');
    }
    
    return response;
  }, [handleTokenExpiration]);
  // Proporcionar el contexto a los componentes hijos
  const contextValue = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated,
    handleApiResponse, 
    shouldRedirectToLogin,
    forceRedirectToLogin,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;