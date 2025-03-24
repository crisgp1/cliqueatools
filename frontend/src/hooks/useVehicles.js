import { useState, useEffect, useCallback } from 'react';
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } from '../services/VehicleService';

/**
 * Hook personalizado para gestionar el estado y operaciones relacionadas con vehículos
 * @param {string} token - Token de autenticación del usuario
 * @param {Function} onVehicleChange - Función opcional para sincronizar con estado externo
 * @returns {Object} - Estado y funciones para gestionar vehículos
 */
const useVehicles = (token, onVehicleChange = null) => {
  // Estado para la lista de vehículos
  const [vehicles, setVehicles] = useState([]);
  // Estado para indicar carga
  const [loading, setLoading] = useState(false);
  // Estado para manejar errores
  const [error, setError] = useState(null);
  // Estado para paginación
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });

  /**
   * Carga la lista de vehículos desde la API
   * @param {Object} options - Opciones de paginación
   */
  const loadVehicles = useCallback(async (options = {}) => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchVehicles(token, options);
      
      // Extraer vehículos y metadata de paginación de la respuesta
      const { vehicles: vehiclesList, pagination: paginationData } = response;
      
      // Limpiar para evitar duplicados usando un Map por ID
      const vehicleMap = new Map();
      vehiclesList.forEach(vehicle => {
        vehicleMap.set(vehicle.id, vehicle);
      });
      const uniqueVehicles = Array.from(vehicleMap.values());
      
      setVehicles(uniqueVehicles || []);
      setPagination(paginationData || pagination);
      setLoading(false);
      
      // Sincronizar con estado externo si es necesario
      if (onVehicleChange && typeof onVehicleChange === 'function') {
        // Pasar la lista completa de vehículos una sola vez, más eficiente
        onVehicleChange('load', { vehicles: uniqueVehicles });
      }
    } catch (err) {
      console.error('Error en hook useVehicles:', err);
      setError(err.message || 'Error al cargar los vehículos');
      setLoading(false);
    }
  }, [token, onVehicleChange, pagination]);

  /**
   * Añade un nuevo vehículo
   * @param {Object} vehicleData - Datos del vehículo a crear
   * @returns {Promise} - Promesa con el resultado de la operación
   */
  const addVehicle = async (vehicleData) => {
    if (!token) {
      setError('No hay sesión activa');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const newVehicle = await createVehicle(token, vehicleData);
      
      // Actualizar la lista local
      setVehicles(prev => [...prev, newVehicle]);
      
      // Sincronizar con estado externo si es necesario
      if (onVehicleChange && typeof onVehicleChange === 'function') {
        onVehicleChange('add', newVehicle);
      }
      
      setLoading(false);
      return newVehicle;
    } catch (err) {
      console.error('Error al añadir vehículo:', err);
      setError(err.message || 'Error al crear el vehículo');
      setLoading(false);
      return null;
    }
  };

  /**
   * Actualiza un vehículo existente
   * @param {Object} vehicleData - Datos del vehículo con ID
   * @returns {Promise} - Promesa con el resultado de la operación
   */
  const updateVehicleById = async (vehicleData) => {
    if (!token) {
      setError('No hay sesión activa');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedVehicle = await updateVehicle(token, vehicleData);
      
      // Actualizar la lista local
      setVehicles(prev => 
        prev.map(vehicle => vehicle.id === vehicleData.id ? updatedVehicle : vehicle)
      );
      
      // Sincronizar con estado externo si es necesario
      if (onVehicleChange && typeof onVehicleChange === 'function') {
        onVehicleChange('update', updatedVehicle);
      }
      
      setLoading(false);
      return updatedVehicle;
    } catch (err) {
      console.error('Error al actualizar vehículo:', err);
      setError(err.message || 'Error al actualizar el vehículo');
      setLoading(false);
      return null;
    }
  };

  /**
   * Elimina un vehículo por su ID
   * @param {string|number} id - ID del vehículo a eliminar
   * @returns {Promise} - Promesa con el resultado de la operación
   */
  const removeVehicle = async (id) => {
    if (!token) {
      setError('No hay sesión activa');
      return false;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await deleteVehicle(token, id);
      
      // Actualizar la lista local
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
      
      // Sincronizar con estado externo si es necesario
      if (onVehicleChange && typeof onVehicleChange === 'function') {
        onVehicleChange('remove', { id });
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Error al eliminar vehículo:', err);
      setError(err.message || 'Error al eliminar el vehículo');
      setLoading(false);
      return false;
    }
  };

  /**
   * Limpia los errores
   */
  const clearError = () => setError(null);

  // Cargar vehículos al montar el componente si hay token
  useEffect(() => {
    if (token) {
      loadVehicles();
    }
  }, [token, loadVehicles]);

  return {
    vehicles,
    loading,
    error,
    pagination,
    loadVehicles,
    addVehicle,
    updateVehicle: updateVehicleById,
    removeVehicle,
    clearError
  };
};

export default useVehicles;