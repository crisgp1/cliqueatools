const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { verificarToken, tieneRol } = require('../middleware/auth');

// Todas las rutas de citas requieren autenticación
router.use(verificarToken);

// Rutas CRUD básicas
router.post('/', citaController.crear);
router.get('/', citaController.obtenerTodas);

// Ruta de búsqueda (debe ir antes de las rutas con parámetros)
router.get('/buscar', citaController.buscar);

// Rutas específicas para citas
router.get('/fecha/:fecha', citaController.obtenerPorFecha);
router.get('/cliente/:clienteId', citaController.obtenerPorCliente);
router.get('/usuario/:usuarioId', citaController.obtenerPorUsuario);

// Rutas con parámetros
router.get('/:id', citaController.obtenerPorId);
router.put('/:id', citaController.actualizar);
router.delete('/:id', citaController.eliminar);

module.exports = router;