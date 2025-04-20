const express = require('express');
const router = express.Router();
const mediasController = require('../controllers/mediasController');

// Aplicar el controlador como middleware
router.use('/', mediasController);

module.exports = router;