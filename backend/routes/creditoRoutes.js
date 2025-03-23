const express = require('express');
const router = express.Router();
const creditoController = require('../controllers/creditoController');
const { verificarToken, tieneRol } = require('../middleware/auth');

// Todas las rutas de créditos requieren autenticación
router.use(verificarToken);

// Rutas CRUD básicas
router.post('/', tieneRol(['admin', 'creditos', 'gerencia']), creditoController.crear);
router.get('/', creditoController.obtenerTodos);

// Rutas especiales (deben ir antes de las rutas con parámetros)
router.post('/simular', creditoController.simularCredito);

// Rutas con parámetros
router.get('/:id', creditoController.obtenerPorId);
router.get('/:id/amortizacion', creditoController.generarTablaAmortizacion);
router.put('/:id', tieneRol(['admin', 'creditos', 'gerencia']), creditoController.actualizar);
router.delete('/:id', tieneRol(['admin', 'gerencia']), creditoController.eliminar);

module.exports = router;