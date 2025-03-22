/**
 * VehicleRepository.js - Interfaz para el repositorio de vehículos
 * Define los métodos que cualquier implementación de repositorio debe proporcionar
 */

class VehicleRepository {
  /**
   * Buscar todos los vehículos
   * 
   * @returns {Promise<Array>} Promise que resuelve a un array de vehículos
   */
  async findAll() {
    throw new Error('Method findAll() not implemented');
  }

  /**
   * Buscar un vehículo por su ID
   * 
   * @param {string} id - ID del vehículo
   * @returns {Promise<Object|null>} Promise que resuelve al vehículo encontrado o null si no existe
   */
  async findById(id) {
    throw new Error('Method findById() not implemented');
  }

  /**
   * Guardar un nuevo vehículo
   * 
   * @param {Object} vehicle - Datos del vehículo a guardar
   * @returns {Promise<Object>} Promise que resuelve al vehículo guardado
   */
  async save(vehicle) {
    throw new Error('Method save() not implemented');
  }

  /**
   * Actualizar un vehículo existente
   * 
   * @param {string} id - ID del vehículo a actualizar
   * @param {Object} vehicle - Datos actualizados del vehículo
   * @returns {Promise<Object|null>} Promise que resuelve al vehículo actualizado o null si no existe
   */
  async update(id, vehicle) {
    throw new Error('Method update() not implemented');
  }

  /**
   * Eliminar un vehículo por su ID
   * 
   * @param {string} id - ID del vehículo a eliminar
   * @returns {Promise<boolean>} Promise que resuelve a true si se eliminó correctamente o false si no existe
   */
  async delete(id) {
    throw new Error('Method delete() not implemented');
  }
}

module.exports = VehicleRepository;