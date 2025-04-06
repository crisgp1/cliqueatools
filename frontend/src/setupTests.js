// Este archivo se ejecutará antes de todas las pruebas
// Configura extensiones para Jest como @testing-library/jest-dom

// Importar extensiones de jest-dom para matchers adicionales
import '@testing-library/jest-dom';

// Mock para window.matchMedia (utilizado por algunos componentes de React)
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Configuración global para tests
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock para window.scrollTo (utilizado a menudo en componentes con navegación o scroll)
window.scrollTo = jest.fn();

// Suprimir mensajes de consola durante los tests (opcional)
// Descomenta esto si quieres silenciar logs específicos durante los tests
// console.error = jest.fn();
// console.warn = jest.fn();