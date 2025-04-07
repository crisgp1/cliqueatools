const express = require('express');
const router = express.Router();

// Importar todas las rutas
const usuarioRoutes = require('./usuarioRoutes');
const clienteRoutes = require('./clienteRoutes');
const vehiculoRoutes = require('./vehiculoRoutes');
const bancoRoutes = require('./bancoRoutes');
const creditoRoutes = require('./creditoRoutes');
const contratoRoutes = require('./contratoRoutes');
const radarRoutes = require('./radarRoutes');
const citaRoutes = require('./citaRoutes');
// Configurar rutas base
router.use('/api/usuarios', usuarioRoutes);
router.use('/api/clientes', clienteRoutes);
router.use('/api/vehiculos', vehiculoRoutes);
router.use('/api/bancos', bancoRoutes);
router.use('/api/creditos', creditoRoutes);
router.use('/api/contratos', contratoRoutes);
router.use('/api/radar', radarRoutes);
router.use('/api/citas', citaRoutes);
// Ruta de prueba
router.get('/api/status', (req, res) => {
  res.json({
    success: true,
    mensaje: 'API funcionando correctamente',
    timestamp: new Date()
  });
});

module.exports = router;