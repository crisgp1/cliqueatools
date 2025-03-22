/**
 * Vehicle routes for the API Gateway
 * Handles routing of vehicle requests to the vehicle-service
 */

const express = require('express');
const router = express.Router();
const vehicleService = require('../services/vehicleService');

/**
 * @route GET /api/vehicles
 * @desc Get all vehicles
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    res.json(vehicles);
  } catch (error) {
    console.error('Get vehicles route error:', error.message);
    
    const statusCode = error.message.includes('no disponible') ? 503 : 500;
    
    res.status(statusCode).json({ 
      error: error.message || 'Error al obtener vehículos' 
    });
  }
});

/**
 * @route GET /api/vehicles/:id
 * @desc Get vehicle by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Se requiere ID del vehículo' });
    }
    
    const vehicle = await vehicleService.getVehicleById(id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    res.json(vehicle);
  } catch (error) {
    console.error('Get vehicle by ID route error:', error.message);
    
    let statusCode = 500;
    if (error.message.includes('no disponible')) {
      statusCode = 503;
    } else if (error.message.includes('no encontrado')) {
      statusCode = 404;
    }
    
    res.status(statusCode).json({ 
      error: error.message || 'Error al obtener el vehículo' 
    });
  }
});

/**
 * @route POST /api/vehicles
 * @desc Create a new vehicle
 * @access Public
 */
router.post('/', async (req, res) => {
  try {
    const { marca, modelo, anio, valor } = req.body;
    
    // Validar campos obligatorios
    if (!marca || !modelo || !valor) {
      return res.status(400).json({ 
        error: 'Se requieren marca, modelo y valor para crear un vehículo' 
      });
    }
    
    // Validar valor mínimo
    if (valor < 50000) {
      return res.status(400).json({ 
        error: 'El valor del vehículo debe ser mayor a $50,000' 
      });
    }
    
    const vehicle = await vehicleService.createVehicle(req.body);
    
    // Return the vehicle service response with 201 Created status
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Create vehicle route error:', error.message);
    
    let statusCode = 500;
    if (error.message.includes('no disponible')) {
      statusCode = 503;
    } else if (error.message.includes('validación')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      error: error.message || 'Error al crear el vehículo' 
    });
  }
});

/**
 * @route PUT /api/vehicles/:id
 * @desc Update an existing vehicle
 * @access Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Se requiere ID del vehículo' });
    }
    
    const { marca, modelo, anio, valor } = req.body;
    
    // Validar campos obligatorios
    if (!marca || !modelo || !valor) {
      return res.status(400).json({ 
        error: 'Se requieren marca, modelo y valor para actualizar un vehículo' 
      });
    }
    
    // Validar valor mínimo
    if (valor < 50000) {
      return res.status(400).json({ 
        error: 'El valor del vehículo debe ser mayor a $50,000' 
      });
    }
    
    const vehicle = await vehicleService.updateVehicle(id, req.body);
    
    res.json(vehicle);
  } catch (error) {
    console.error('Update vehicle route error:', error.message);
    
    let statusCode = 500;
    if (error.message.includes('no disponible')) {
      statusCode = 503;
    } else if (error.message.includes('no encontrado')) {
      statusCode = 404;
    } else if (error.message.includes('validación')) {
      statusCode = 400;
    }
    
    res.status(statusCode).json({ 
      error: error.message || 'Error al actualizar el vehículo' 
    });
  }
});

/**
 * @route DELETE /api/vehicles/:id
 * @desc Delete a vehicle
 * @access Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Se requiere ID del vehículo' });
    }
    
    await vehicleService.deleteVehicle(id);
    
    res.status(204).end();
  } catch (error) {
    console.error('Delete vehicle route error:', error.message);
    
    let statusCode = 500;
    if (error.message.includes('no disponible')) {
      statusCode = 503;
    } else if (error.message.includes('no encontrado')) {
      statusCode = 404;
    }
    
    res.status(statusCode).json({ 
      error: error.message || 'Error al eliminar el vehículo' 
    });
  }
});

module.exports = router;