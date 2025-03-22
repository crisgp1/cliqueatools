/**
 * Authentication routes for the API Gateway
 * Handles routing of authentication requests to the auth-service
 */

const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate request body
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Se requieren nombre de usuario y contraseña' 
      });
    }

    // Forward authentication request to auth service
    const authResult = await authService.login({ username, password });
    
    // Return the auth service response
    res.json(authResult);
  } catch (error) {
    console.error('Login route error:', error.message);
    
    // Determine appropriate status code
    const statusCode = error.message.includes('unavailable') ? 503 : 401;
    
    res.status(statusCode).json({ 
      error: error.message || 'Error de autenticación' 
    });
  }
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, nombre, apellidos, rol } = req.body;
    
    // Validate request body
    if (!username || !password || !email || !nombre || !apellidos) {
      return res.status(400).json({ 
        error: 'Faltan campos obligatorios' 
      });
    }
    
    // Forward registration request to auth service
    const registrationResult = await authService.register(req.body);
    
    // Return the auth service response with 201 Created status
    res.status(201).json(registrationResult);
  } catch (error) {
    console.error('Register route error:', error.message);
    
    // Determine appropriate status code
    let statusCode = 500;
    if (error.message.includes('ya está en uso') || error.message.includes('ya está registrado')) {
      statusCode = 409; // Conflict
    } else if (error.message.includes('Faltan campos') || error.message.includes('La contraseña debe')) {
      statusCode = 400; // Bad Request
    } else if (error.message.includes('unavailable')) {
      statusCode = 503; // Service Unavailable
    }
    
    res.status(statusCode).json({ 
      error: error.message || 'Error al registrar usuario' 
    });
  }
});

/**
 * @route POST /api/auth/verify
 * @desc Verify JWT token
 * @access Public
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token no proporcionado' });
    }
    
    // Forward token verification request to auth service
    const verificationResult = await authService.verifyToken(token);
    
    // Return the auth service response
    res.json(verificationResult);
  } catch (error) {
    console.error('Token verification route error:', error.message);
    
    // Determine appropriate status code
    const statusCode = error.message.includes('unavailable') ? 503 : 401;
    
    res.status(statusCode).json({ 
      error: error.message || 'Error de verificación de token' 
    });
  }
});

module.exports = router;