/**
 * VehicleController.js - Controlador para las rutas de vehículos
 * Maneja las solicitudes HTTP y utiliza los casos de uso apropiados
 */

class VehicleController {
  /**
   * Constructor
   * 
   * @param {Object} useCases - Casos de uso para operaciones de vehículos
   * @param {Function} useCases.getAllVehicles - Caso de uso para obtener todos los vehículos
   * @param {Function} useCases.getVehicleById - Caso de uso para obtener un vehículo por ID
   * @param {Function} useCases.createVehicle - Caso de uso para crear un vehículo
   * @param {Function} useCases.updateVehicle - Caso de uso para actualizar un vehículo
   * @param {Function} useCases.deleteVehicle - Caso de uso para eliminar un vehículo
   */
  constructor(useCases) {
    this.useCases = useCases;
  }

  /**
   * Obtener todos los vehículos
   * 
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getAllVehicles(req, res) {
    try {
      const vehicles = await this.useCases.getAllVehicles.execute();
      res.json(vehicles);
    } catch (error) {
      console.error('Error al obtener todos los vehículos:', error);
      res.status(500).json({ error: error.message || 'Error al obtener vehículos' });
    }
  }

  /**
   * Obtener un vehículo por ID
   * 
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async getVehicleById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'Se requiere ID del vehículo' });
      }
      
      const vehicle = await this.useCases.getVehicleById.execute(id);
      
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehículo no encontrado' });
      }
      
      res.json(vehicle);
    } catch (error) {
      console.error('Error al obtener vehículo por ID:', error);
      
      if (error.message.includes('es requerido')) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: error.message || 'Error al obtener el vehículo' });
    }
  }

  /**
   * Crear un nuevo vehículo
   * 
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async createVehicle(req, res) {
    try {
      const { marca, modelo, anio, valor } = req.body;
      
      // Validar campos obligatorios
      if (!marca || !modelo || !valor) {
        return res.status(400).json({ 
          error: 'Se requieren marca, modelo y valor para crear un vehículo' 
        });
      }
      
      const vehicle = await this.useCases.createVehicle.execute(req.body);
      
      res.status(201).json(vehicle);
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      
      if (error.message.includes('Error de validación')) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: error.message || 'Error al crear el vehículo' });
    }
  }

  /**
   * Actualizar un vehículo existente
   * 
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async updateVehicle(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'Se requiere ID del vehículo' });
      }
      
      const vehicle = await this.useCases.updateVehicle.execute(id, req.body);
      
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehículo no encontrado' });
      }
      
      res.json(vehicle);
    } catch (error) {
      console.error('Error al actualizar vehículo:', error);
      
      if (error.message.includes('Error de validación') || error.message.includes('es requerido')) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: error.message || 'Error al actualizar el vehículo' });
    }
  }

  /**
   * Eliminar un vehículo
   * 
   * @param {Object} req - Objeto de solicitud Express
   * @param {Object} res - Objeto de respuesta Express
   */
  async deleteVehicle(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'Se requiere ID del vehículo' });
      }
      
      const result = await this.useCases.deleteVehicle.execute(id);
      
      if (!result) {
        return res.status(404).json({ error: 'Vehículo no encontrado' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error al eliminar vehículo:', error);
      
      if (error.message.includes('es requerido')) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: error.message || 'Error al eliminar el vehículo' });
    }
  }
}

module.exports = VehicleController;