/**
 * DeleteVehicle.js - Caso de uso para eliminar un vehículo
 */

class DeleteVehicle {
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
   * @param {string} id - ID del vehículo a eliminar
   * @returns {Promise<boolean>} true si se eliminó correctamente, false si no existe
   * @throws {Error} Si hay un error en la operación
   */
  async execute(id) {
    // Validar ID
    if (!id) {
      throw new Error('El ID del vehículo es requerido');
    }
    
    try {
      // Verificar si el vehículo existe
      const existingVehicle = await this.vehicleRepository.findById(id);
      
      if (!existingVehicle) {
        return false; // El vehículo no existe
      }
      
      // Eliminar el vehículo del repositorio
      const result = await this.vehicleRepository.delete(id);
      
      return result;
    } catch (error) {
      console.error(`Error en caso de uso DeleteVehicle para ID ${id}:`, error);
      throw new Error(`Error al eliminar el vehículo con ID ${id}`);
    }
  }
}

module.exports = DeleteVehicle;