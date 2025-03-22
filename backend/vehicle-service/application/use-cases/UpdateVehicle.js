/**
 * UpdateVehicle.js - Caso de uso para actualizar un vehículo existente
 */

const Vehicle = require('../../domain/entities/Vehicle');

class UpdateVehicle {
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
   * @param {string} id - ID del vehículo a actualizar
   * @param {Object} vehicleData - Nuevos datos del vehículo
   * @returns {Promise<Object|null>} El vehículo actualizado o null si no existe
   * @throws {Error} Si los datos no son válidos o hay un error en la operación
   */
  async execute(id, vehicleData) {
    // Validar ID
    if (!id) {
      throw new Error('El ID del vehículo es requerido');
    }
    
    try {
      // Verificar si el vehículo existe
      const existingVehicle = await this.vehicleRepository.findById(id);
      
      if (!existingVehicle) {
        return null; // No se encontró el vehículo
      }
      
      // Crear un vehículo con los datos actualizados
      // Mantenemos el id y las fechas de creación
      const updatedVehicle = new Vehicle({
        id: existingVehicle.id,
        marca: vehicleData.marca || existingVehicle.marca,
        modelo: vehicleData.modelo || existingVehicle.modelo,
        anio: vehicleData.anio || existingVehicle.anio,
        valor: vehicleData.valor !== undefined ? vehicleData.valor : existingVehicle.valor,
        fechaCreacion: existingVehicle.fechaCreacion,
        fechaActualizacion: new Date()
      });
      
      // Validar el vehículo actualizado
      const errors = updatedVehicle.validate();
      if (Object.keys(errors).length > 0) {
        const errorMessage = Object.values(errors).join(', ');
        throw new Error(`Error de validación: ${errorMessage}`);
      }
      
      // Actualizar en el repositorio
      const result = await this.vehicleRepository.update(id, updatedVehicle);
      
      return result;
    } catch (error) {
      console.error(`Error en caso de uso UpdateVehicle para ID ${id}:`, error);
      
      // Propagar el error de validación o crear uno nuevo
      if (error.message.includes('Error de validación')) {
        throw error;
      }
      
      throw new Error(`Error al actualizar el vehículo con ID ${id}`);
    }
  }
}

module.exports = UpdateVehicle;