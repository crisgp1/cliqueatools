const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculoController');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas de vehículos requieren autenticación
router.use(verificarToken);

// Rutas CRUD básicas
router.post('/', vehiculoController.crear);
router.get('/', vehiculoController.obtenerTodos);

// Ruta de búsqueda (debe ir antes de las rutas con parámetros)
router.get('/buscar', vehiculoController.buscar);

// Rutas con parámetros
router.get('/:id', vehiculoController.obtenerPorId);
router.put('/:id', vehiculoController.actualizar);
router.delete('/:id', vehiculoController.eliminar);

module.exports = router;