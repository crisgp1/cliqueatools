const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, esAdmin } = require('../middleware/auth');

// Rutas públicas
router.post('/registro', usuarioController.registro);
router.post('/login', usuarioController.login);

// Rutas protegidas (requieren autenticación)
router.get('/', verificarToken, esAdmin, usuarioController.obtenerTodos);
router.get('/:id', verificarToken, usuarioController.obtenerPorId);
router.put('/:id', verificarToken, usuarioController.actualizar);
router.delete('/:id', verificarToken, esAdmin, usuarioController.eliminar);

module.exports = router;