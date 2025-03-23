const express = require('express');
const router = express.Router();
const contratoController = require('../controllers/contratoController');
const { verificarToken, tieneRol } = require('../middleware/auth');

// Todas las rutas de contratos requieren autenticación
router.use(verificarToken);

// Rutas CRUD básicas
router.post('/', contratoController.crear);
router.get('/', contratoController.obtenerTodos);

// Rutas para gestionar la relación muchos a muchos con vehículos
router.post('/vehiculo', contratoController.agregarVehiculo);
router.delete('/:contrato_id/vehiculo/:vehiculo_id', contratoController.quitarVehiculo);

// Rutas con parámetros
router.get('/:id', contratoController.obtenerPorId);
router.put('/:id', contratoController.actualizar);
router.delete('/:id', tieneRol(['admin', 'gerencia']), contratoController.eliminar);

module.exports = router;