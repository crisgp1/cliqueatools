/**
 * InMemoryVehicleRepository.js - Implementación en memoria del repositorio de vehículos
 * Para uso en desarrollo y pruebas
 */

const VehicleRepository = require('../../../domain/repositories/VehicleRepository');
const Vehicle = require('../../../domain/entities/Vehicle');

class InMemoryVehicleRepository extends VehicleRepository {
  constructor() {
    super();
    this.vehicles = [];
    this.nextId = 1;
  }

  /**
   * Buscar todos los vehículos
   * 
   * @returns {Promise<Array>} Promise que resuelve a un array de vehículos
   */
  async findAll() {
    return [...this.vehicles];
  }

  /**
   * Buscar un vehículo por su ID
   * 
   * @param {string} id - ID del vehículo
   * @returns {Promise<Object|null>} Promise que resuelve al vehículo encontrado o null si no existe
   */
  async findById(id) {
    const vehicle = this.vehicles.find(v => v.id === id);
    return vehicle || null;
  }

  /**
   * Guardar un nuevo vehículo
   * 
   * @param {Object} vehicle - Datos del vehículo a guardar
   * @returns {Promise<Object>} Promise que resuelve al vehículo guardado
   */
  async save(vehicle) {
    // Asignar ID secuencial
    const newVehicle = new Vehicle({
      ...vehicle,
      id: (this.nextId++).toString(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    });
    
    this.vehicles.push(newVehicle);
    return newVehicle;
  }

  /**
   * Actualizar un vehículo existente
   * 
   * @param {string} id - ID del vehículo a actualizar
   * @param {Object} vehicleData - Datos actualizados del vehículo
   * @returns {Promise<Object|null>} Promise que resuelve al vehículo actualizado o null si no existe
   */
  async update(id, vehicleData) {
    const index = this.vehicles.findIndex(v => v.id === id);
    
    if (index === -1) {
      return null;
    }
    
    // Actualizar el vehículo existente preservando su ID y fechas
    const updatedVehicle = new Vehicle({
      ...vehicleData,
      id: id,
      fechaCreacion: this.vehicles[index].fechaCreacion,
      fechaActualizacion: new Date()
    });
    
    this.vehicles[index] = updatedVehicle;
    return updatedVehicle;
  }

  /**
   * Eliminar un vehículo por su ID
   * 
   * @param {string} id - ID del vehículo a eliminar
   * @returns {Promise<boolean>} Promise que resuelve a true si se eliminó correctamente o false si no existe
   */
  async delete(id) {
    const index = this.vehicles.findIndex(v => v.id === id);
    
    if (index === -1) {
      return false;
    }
    
    this.vehicles.splice(index, 1);
    return true;
  }

  /**
   * Agregar vehículos de muestra para desarrollo
   */
  addSampleVehicles() {
    const sampleVehicles = [
      {
        marca: 'Toyota',
        modelo: 'Corolla',
        anio: 2022,
        valor: 350000
      },
      {
        marca: 'Honda',
        modelo: 'Civic',
        anio: 2021,
        valor: 320000
      },
      {
        marca: 'Volkswagen',
        modelo: 'Golf',
        anio: 2023,
        valor: 400000
      }
    ];
    
    sampleVehicles.forEach(vehicleData => {
      this.save(new Vehicle(vehicleData));
    });
    
    console.log('Added sample vehicles for development');
  }
}

module.exports = InMemoryVehicleRepository;