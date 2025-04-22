/**
 * Middleware de autenticación para la API de medios
 * Este archivo reexporta el middleware de autenticación de auth.js
 */

const { verificarToken } = require('./auth');

// Exportar el middleware de verificación de token como middleware por defecto
module.exports = verificarToken;