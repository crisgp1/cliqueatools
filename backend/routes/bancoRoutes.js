const express = require('express');
const router = express.Router();
const bancoController = require('../controllers/bancoController');
const { verificarToken, tieneRol } = require('../middleware/auth');

// Todas las rutas de bancos requieren autenticación
router.use(verificarToken);

// Rutas CRUD básicas
router.post('/', tieneRol(['admin', 'gerencia']), bancoController.crear);
router.get('/', bancoController.obtenerTodos);

// Ruta de comparación de bancos
router.get('/comparar', bancoController.compararBancos);

// Rutas con parámetros
router.get('/:id', bancoController.obtenerPorId);
router.put('/:id', tieneRol(['admin', 'gerencia']), bancoController.actualizar);
router.delete('/:id', tieneRol(['admin', 'gerencia']), bancoController.eliminar);

module.exports = router;