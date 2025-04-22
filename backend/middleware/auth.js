const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// Middleware para verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    // Intentar obtener el token de diferentes fuentes
    let token;
    
    // 1. Verificar en headers (Authorization: Bearer token)
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    }
    // 2. Si no está en headers, verificar en cookies
    else if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        mensaje: 'Acceso denegado. Se requiere token de autenticación',
        detalles: 'No se encontró token en headers ni cookies'
      });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario en la base de datos
    const usuario = await Usuario.findByPk(decoded.id, {
      attributes: { exclude: ['hashed_password'] }
    });
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        mensaje: 'Token inválido: usuario no encontrado'
      });
    }
    
    // Agregar usuario al objeto request
    req.usuario = usuario.toJSON();
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        mensaje: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        mensaje: 'Token expirado'
      });
    }
    
    res.status(500).json({
      success: false,
      mensaje: 'Error en el servidor',
      error: error.message
    });
  }
};

// Middleware para verificar si el usuario es administrador
const esAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.rol === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      mensaje: 'Acceso denegado. Se requieren privilegios de administrador'
    });
  }
};

// Middleware para verificar rol específico
const tieneRol = (roles) => {
  return (req, res, next) => {
    if (req.usuario && roles.includes(req.usuario.rol)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        mensaje: 'Acceso denegado. No tiene los privilegios necesarios'
      });
    }
  };
};

module.exports = {
  verificarToken,
  esAdmin,
  tieneRol
};