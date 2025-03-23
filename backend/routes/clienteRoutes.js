const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verificarToken, tieneRol } = require('../middleware/auth');

// Todas las rutas de clientes requieren autenticación
router.use(verificarToken);

// Rutas CRUD básicas
router.post('/', clienteController.crear);
router.get('/', clienteController.obtenerTodos);

// Ruta de búsqueda (debe ir antes de las rutas con parámetros)
router.get('/buscar', clienteController.buscar);

// Rutas con parámetros
router.get('/:id', clienteController.obtenerPorId);
router.put('/:id', clienteController.actualizar);
router.delete('/:id', clienteController.eliminar);

module.exports = router;