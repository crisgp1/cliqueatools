/**
 * API Gateway entry point
 * Manages routing to the appropriate microservices
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Import routes
const authRoutes = require('./routes/authRoutes');
// Import other routes as they are implemented
// const clientRoutes = require('./routes/clientRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
// const bankRoutes = require('./routes/bankRoutes');
// const creditRoutes = require('./routes/creditRoutes');
// const amortizationRoutes = require('./routes/amortizationRoutes');

// Apply routes
app.use('/api/auth', authRoutes);
// Apply other routes as they are implemented
// app.use('/api/clients', clientRoutes);
app.use('/api/vehicles', vehicleRoutes);
// app.use('/api/banks', bankRoutes);
// app.use('/api/credits', creditRoutes);
// app.use('/api/amortization', amortizationRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ service: 'API Gateway', status: 'running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Gateway error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handling
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

/**
 * Graceful shutdown function
 */
function shutdown() {
  console.log('Shutting down API Gateway...');
  process.exit(0);
}

module.exports = app; // Export for testing