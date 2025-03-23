require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { testConnection, sequelize } = require('./config/configDB');
const routes = require('./routes');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Configuración de CORS para permitir solicitudes desde el frontend
app.use(cors({
  origin: 'http://localhost:5173', // URL específica del frontend (Vite)
  credentials: true, // Permitir credenciales (cookies, headers authorization, etc)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'] // Headers permitidos
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Servir archivos estáticos si es necesario
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    
    // Sincronizar modelos con la base de datos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development' && process.env.SYNC_DB === 'true') {
      console.log('Sincronizando modelos con la base de datos...');
      await sequelize.sync({ alter: true });
      console.log('Sincronización completada.');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en el puerto ${PORT}`);
      console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Ejecutar la inicialización
initServer();

module.exports = app;