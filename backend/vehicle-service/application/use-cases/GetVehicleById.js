/**
 * GetVehicleById.js - Caso de uso para obtener un vehículo por su ID
 */

class GetVehicleById {
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
   * @param {string} id - ID del vehículo a buscar
   * @returns {Promise<Object|null>} El vehículo encontrado o null si no existe
   * @throws {Error} Si el ID no es válido o hay un error en la operación
   */
  async execute(id) {
    // Validar ID
    if (!id) {
      throw new Error('El ID del vehículo es requerido');
    }

    try {
      // Buscar el vehículo en el repositorio
      const vehicle = await this.vehicleRepository.findById(id);
      
      return vehicle;
    } catch (error) {
      console.error(`Error en caso de uso GetVehicleById para ID ${id}:`, error);
      throw new Error(`Error al obtener el vehículo con ID ${id}`);
    }
  }
}

module.exports = GetVehicleById;