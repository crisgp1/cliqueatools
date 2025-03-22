/**
 * Vehicle service client
 * Handles communication with the vehicle-service microservice
 */

const axios = require('axios');

// Service configuration
const VEHICLE_SERVICE_URL = process.env.VEHICLE_SERVICE_URL || 'http://vehicle-service:3000';

/**
 * Vehicle service client with methods to interact with the vehicle microservice
 */
const vehicleService = {
  /**
   * Get all vehicles
   * 
   * @returns {Promise<Array>} - List of vehicles
   */
  async getAllVehicles() {
    try {
      const response = await axios.get(`${VEHICLE_SERVICE_URL}/api/vehicles`);
      return response.data;
    } catch (error) {
      console.error('Vehicle service getAllVehicles error:', error.message);
      
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || 'Error al obtener vehículos');
      }
      
      throw new Error('Servicio de vehículos no disponible');
    }
  },
  
  /**
   * Get vehicle by ID
   * 
   * @param {string} id - Vehicle ID
   * @returns {Promise<Object>} - Vehicle data
   */
  async getVehicleById(id) {
    try {
      const response = await axios.get(`${VEHICLE_SERVICE_URL}/api/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Vehicle service getVehicleById error:', error.message);
      
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || 'Error al obtener el vehículo');
      }
      
      throw new Error('Servicio de vehículos no disponible');
    }
  },
  
  /**
   * Create a new vehicle
   * 
   * @param {Object} vehicleData - Vehicle data
   * @returns {Promise<Object>} - Created vehicle data
   */
  async createVehicle(vehicleData) {
    try {
      const response = await axios.post(`${VEHICLE_SERVICE_URL}/api/vehicles`, vehicleData);
      return response.data;
    } catch (error) {
      console.error('Vehicle service createVehicle error:', error.message);
      
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || 'Error al crear el vehículo');
      }
      
      throw new Error('Servicio de vehículos no disponible');
    }
  },
  
  /**
   * Update an existing vehicle
   * 
   * @param {string} id - Vehicle ID
   * @param {Object} vehicleData - Updated vehicle data
   * @returns {Promise<Object>} - Updated vehicle data
   */
  async updateVehicle(id, vehicleData) {
    try {
      const response = await axios.put(`${VEHICLE_SERVICE_URL}/api/vehicles/${id}`, vehicleData);
      return response.data;
    } catch (error) {
      console.error('Vehicle service updateVehicle error:', error.message);
      
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || 'Error al actualizar el vehículo');
      }
      
      throw new Error('Servicio de vehículos no disponible');
    }
  },
  
  /**
   * Delete a vehicle
   * 
   * @param {string} id - Vehicle ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteVehicle(id) {
    try {
      const response = await axios.delete(`${VEHICLE_SERVICE_URL}/api/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Vehicle service deleteVehicle error:', error.message);
      
      if (error.response && error.response.data) {
        throw new Error(error.response.data.error || 'Error al eliminar el vehículo');
      }
      
      throw new Error('Servicio de vehículos no disponible');
    }
  }
};

module.exports = vehicleService;