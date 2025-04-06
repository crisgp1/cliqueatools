import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../Login';
import { AuthContextMock, createFailedLoginMock } from '../../__mocks__/AuthContextMock';

// Mock de las animaciones de Lottie
jest.mock('lottie-react', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => <div data-testid="lottie-animation" />)
}));

// Mock de framer-motion para evitar problemas con las animaciones
jest.mock('framer-motion', () => ({
  motion: {
    div: jest.fn().mockImplementation(({ children, ...props }) => (
      <div data-testid="motion-div" {...props}>{children}</div>
    )),
    button: jest.fn().mockImplementation(({ children, ...props }) => (
      <button data-testid="motion-button" {...props}>{children}</button>
    ))
  }
}));

// Mock para las imágenes
jest.mock('../../assets/logo.png', () => 'logo-mock');

describe('Componente Login', () => {
  const mockOnCreateAccountClick = jest.fn();
  
  // Configuración común para cada prueba
  const renderLogin = (contextValue = {}) => {
    return render(
      <AuthContextMock customValue={contextValue}>
        <Login onCreateAccountClick={mockOnCreateAccountClick} />
      </AuthContextMock>
    );
  };

  beforeEach(() => {
    // Reiniciar los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  test('Renderiza correctamente el formulario de inicio de sesión', () => {
    renderLogin();
    
    // Verificar que los elementos principales están presentes
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByLabelText(/Usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    expect(screen.getByText(/¿No tienes una cuenta?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear Cuenta/i })).toBeInTheDocument();
  });

  test('Muestra error cuando los campos están vacíos', async () => {
    renderLogin();
    
    // Intentar enviar el formulario sin completar los campos
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));
    
    // Verificar que se muestra el mensaje de error
    expect(await screen.findByText('Por favor, complete todos los campos')).toBeInTheDocument();
  });

  test('Llama a la función login con los datos correctos cuando se envía el formulario', async () => {
    const loginMock = jest.fn().mockResolvedValue({ success: true });
    renderLogin({ login: loginMock });
    
    // Completar los campos del formulario
    await userEvent.type(screen.getByLabelText(/Usuario/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/Contraseña/i), 'password123');
    
    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));
    
    // Verificar que se llamó a la función login con los datos correctos
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  test('Muestra mensaje de error cuando el login falla', async () => {
    const errorMessage = 'Usuario no encontrado';
    renderLogin(createFailedLoginMock(errorMessage));
    
    // Completar los campos del formulario
    await userEvent.type(screen.getByLabelText(/Usuario/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/Contraseña/i), 'password123');
    
    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));
    
    // Verificar que se muestra el mensaje de error
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('Llama a onCreateAccountClick cuando se hace clic en "Crear Cuenta"', () => {
    renderLogin();
    
    // Hacer clic en el botón "Crear Cuenta"
    fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta/i }));
    
    // Verificar que se llamó a la función onCreateAccountClick
    expect(mockOnCreateAccountClick).toHaveBeenCalled();
  });
});