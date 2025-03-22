/**
 * GetAllVehicles.js - Caso de uso para obtener todos los vehículos
 */

class GetAllVehicles {
  /**
   * Constructor
   * 
   * @param {Object} vehicleRepository - Repositorio de vehículos
   */
  constructor(vehicleRepository) {
    this.vehicleRepository = vehicleRepository;
  }

  /**
   * Ejecuta el caso de uso
   * 
   * @returns {Promise<Array>} Array de vehículos
   */
  async execute() {
    try {
      // Obtener todos los vehículos del repositorio
      const vehicles = await this.vehicleRepository.findAll();
      return vehicles;
    } catch (error) {
      console.error('Error en caso de uso GetAllVehicles:', error);
      throw new Error('Error al obtener los vehículos');
    }
  }
}

module.exports = GetAllVehicles;