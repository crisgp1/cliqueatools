require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { testConnection, sequelize } = require('./config/configDB');
const routes = require('./routes');

// Configuración de seguridad para JWT
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'clave-secreta-temporal-desarrollo';
  console.log('⚠️ JWT_SECRET no definido, usando valor temporal para desarrollo');
}

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000; // Valor por defecto en caso de que PORT no esté definido

// Middleware
// Configuración de CORS para permitir solicitudes desde el frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174', // Permite configurarlo por variable de entorno
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Servir archivos estáticos si es necesario
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para redirigir solicitudes sin el prefijo /api
app.use((req, res, next) => {
  // Solo procesar solicitudes que no empiecen con /api
  if (!req.path.startsWith('/api') && req.path !== '/uploads' && !req.path.startsWith('/uploads/')) {
    // Crear una nueva ruta con el prefijo /api
    const newPath = `/api${req.path}`;
    console.log(`Redirigiendo solicitud de ${req.path} a ${newPath}`);
    req.url = newPath;
  }
  next();
});

// Rutas
app.use(routes);

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    mensaje: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  
  res.status(statusCode).json({
    success: false,
    mensaje: message,
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Iniciar servidor
const initServer = async () => {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('Error al conectar con la base de datos. Deteniendo la aplicación...');
      process.exit(1);
    }
    
    // 1. Asegurarse de que el esquema inventario existe
    try {
      await sequelize.query('CREATE SCHEMA IF NOT EXISTS inventario');
      console.log('✅ Esquema inventario verificado');
    } catch (schemaError) {
      console.error('Error al verificar el esquema inventario:', schemaError);
      // Continuar de todos modos, ya que el schema podría existir
    }

    // 2. Sincronización de modelos - Modo seguro
    console.log('Sincronizando modelos con la base de datos...');
    try {
      await sequelize.sync({
        force: false,    // No recrear tablas
        alter: false,    // No alterar tablas existentes
        hooks: false     // Desactivar hooks para evitar errores en cascada
      });
      console.log('✅ Modelos sincronizados correctamente');
    } catch (syncError) {
      console.error('Error al sincronizar modelos:', syncError);
      
      // Información detallada del error
      if (syncError.parent) {
        console.error('Detalles del error:', {
          mensaje: syncError.parent.message,
          código: syncError.parent.code,
          sql: syncError.sql || 'No hay SQL disponible'
        });
      }
      
      // Continuar a pesar del error - esto permite que la API funcione parcialmente
      console.warn('⚠️ Continuando con inicialización a pesar de errores en sincronización');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en el puerto ${PORT}`);
      console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Ejecutar la inicialización
initServer();

module.exports = app;