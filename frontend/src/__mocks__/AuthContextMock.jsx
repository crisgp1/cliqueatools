import React from 'react';
import { AuthContext } from '../context/AuthContext';

// Valores predeterminados para el contexto mock
const defaultContextValue = {
  user: null,
  token: null,
  loading: false,
  login: jest.fn().mockResolvedValue({ success: true }),
  logout: jest.fn(),
  isAuthenticated: jest.fn().mockReturnValue(false)
};

// Proveedor de contexto mock para pruebas
export const AuthContextMock = ({ children, customValue = {} }) => {
  // Combinar valores por defecto con valores personalizados
  const value = { ...defaultContextValue, ...customValue };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Función de utilidad para crear un contexto con login fallido
export const createFailedLoginMock = (errorMessage = 'Error al iniciar sesión') => ({
  login: jest.fn().mockResolvedValue({ 
    success: false, 
    error: errorMessage 
  })
});

// Función de utilidad para crear un contexto con usuario autenticado
export const createAuthenticatedMock = (userData = { id: 1, nombre: 'Usuario Test' }) => ({
  user: userData,
  token: 'test-token-123',
  isAuthenticated: jest.fn().mockReturnValue(true)
});

export default AuthContextMock;