/**
 * CreateVehicle.js - Caso de uso para crear un nuevo vehículo
 */

const Vehicle = require('../../domain/entities/Vehicle');

class CreateVehicle {
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
   * @param {Object} vehicleData - Datos del vehículo a crear
   * @returns {Promise<Object>} El vehículo creado
   * @throws {Error} Si los datos no son válidos o hay un error en la operación
   */
  async execute(vehicleData) {
    try {
      // Crear instancia de Vehicle
      const vehicle = new Vehicle(vehicleData);
      
      // Validar el vehículo
      const errors = vehicle.validate();
      if (Object.keys(errors).length > 0) {
        const errorMessage = Object.values(errors).join(', ');
        throw new Error(`Error de validación: ${errorMessage}`);
      }
      
      // Guardar en el repositorio
      const savedVehicle = await this.vehicleRepository.save(vehicle);
      
      return savedVehicle;
    } catch (error) {
      console.error('Error en caso de uso CreateVehicle:', error);
      
      // Propagar el error de validación o crear uno nuevo
      if (error.message.includes('Error de validación')) {
        throw error;
      }
      
      throw new Error('Error al crear el vehículo');
    }
  }
}

module.exports = CreateVehicle;