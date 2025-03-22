/**
 * Rutas para la API de vehículos
 */

const express = require('express');
const router = express.Router();

/**
 * Configura las rutas de vehículos
 * 
 * @param {Object} vehicleController - Controlador de vehículos
 * @returns {Object} Rutas configuradas
 */
module.exports = (vehicleController) => {
  /**
   * @route GET /api/vehicles
   * @desc Obtener todos los vehículos
   * @access Public
   */
  router.get('/', (req, res) => vehicleController.getAllVehicles(req, res));

  /**
   * @route GET /api/vehicles/:id
   * @desc Obtener un vehículo por ID
   * @access Public
   */
  router.get('/:id', (req, res) => vehicleController.getVehicleById(req, res));

  /**
   * @route POST /api/vehicles
   * @desc Crear un nuevo vehículo
   * @access Public
   */
  router.post('/', (req, res) => vehicleController.createVehicle(req, res));

  /**
   * @route PUT /api/vehicles/:id
   * @desc Actualizar un vehículo existente
   * @access Public
   */
  router.put('/:id', (req, res) => vehicleController.updateVehicle(req, res));

  /**
   * @route DELETE /api/vehicles/:id
   * @desc Eliminar un vehículo
   * @access Public
   */
  router.delete('/:id', (req, res) => vehicleController.deleteVehicle(req, res));

  return router;
};