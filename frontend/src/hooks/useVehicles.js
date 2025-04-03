import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } from '../services/VehicleService';

/**
 * Hook personalizado para gestionar el estado y operaciones relacionadas con vehículos
 * @param {string} token - Token de autenticación del usuario
 * @param {Function} onVehicleChange - Función opcional para sincronizar con estado externo (ahora optimizada con useRef)
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

  // Crear una referencia para onVehicleChange
  const onVehicleChangeRef = useRef(onVehicleChange);
  
  // Actualizar la referencia cuando cambie onVehicleChange
  useEffect(() => {
    onVehicleChangeRef.current = onVehicleChange;
  }, [onVehicleChange]);

  // Referencia para controlar actualizaciones en progreso
  const updatingStateRef = useRef(false);
  
  /**
   * Función para comparar vehículos y determinar si son iguales
   * @param {Object} vehicle1 - Primer vehículo a comparar
   * @param {Object} vehicle2 - Segundo vehículo a comparar
   * @returns {boolean} - Verdadero si los vehículos son iguales
   */
  const isVehicleEqual = (vehicle1, vehicle2) => {
    if (!vehicle1 || !vehicle2) return false;
    return (
      vehicle1.id === vehicle2.id &&
      vehicle1.marca === vehicle2.marca &&
      vehicle1.modelo === vehicle2.modelo &&
      vehicle1.año === vehicle2.año &&
      vehicle1.valor === vehicle2.valor &&
      vehicle1.descripcion === vehicle2.descripcion
    );
  };

  /**
   * Carga la lista de vehículos desde la API
   * @param {Object} options - Opciones de paginación
   */
  const loadVehicles = useCallback(async (options = {}) => {
    if (!token || updatingStateRef.current) return;
    
    try {
      setLoading(true);
      setError(null);
      updatingStateRef.current = true;
      
      const response = await fetchVehicles(token, options);
      
      // Extraer vehículos y metadata de paginación de la respuesta
      const { vehicles: vehiclesList, pagination: paginationData } = response;
      
      // Limpiar para evitar duplicados usando un Map por ID
      const vehicleMap = new Map();
      vehiclesList.forEach(vehicle => {
        vehicleMap.set(vehicle.id, vehicle);
      });
      const uniqueVehicles = Array.from(vehicleMap.values());
      
      // Verificar si realmente hay cambios antes de actualizar el estado
      const hasChanges = uniqueVehicles.length !== vehicles.length || 
        uniqueVehicles.some(newVehicle => 
          !vehicles.some(existingVehicle => isVehicleEqual(existingVehicle, newVehicle))
        );
        
      if (hasChanges) {
        console.log('[useVehicles] Actualizando lista de vehículos con cambios detectados');
        setVehicles(uniqueVehicles || []);
        setPagination(paginationData || pagination);
      } else {
        console.log('[useVehicles] Omitiendo actualización redundante de vehículos');
      }
      
      setLoading(false);
      
      // No sincronizamos con estado externo durante la carga inicial
      // Esto evita logs redundantes y procesamiento innecesario
      // La sincronización solo se realizará en operaciones individuales (add, update, remove)
      
      // Permitir actualizaciones futuras después de un breve retraso
      setTimeout(() => {
        updatingStateRef.current = false;
      }, 100);
    } catch (err) {
      console.error('Error en hook useVehicles:', err);
      setError(err.message || 'Error al cargar los vehículos');
      setLoading(false);
      updatingStateRef.current = false;
    }
  }, [token, vehicles, pagination]); // Añadimos vehicles para comparar si hay cambios

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
    
    if (updatingStateRef.current) {
      console.log('[useVehicles] Bloqueando operación de añadir durante otra actualización');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      updatingStateRef.current = true;
      
      const newVehicle = await createVehicle(token, vehicleData);
      
      // Verificar que el vehículo no exista ya en la lista
      if (!vehicles.some(v => v.id === newVehicle.id)) {
        // Actualizar la lista local
        setVehicles(prev => [...prev, newVehicle]);
        
        // Sincronizar con estado externo si es necesario (usando la referencia)
        if (onVehicleChangeRef.current && typeof onVehicleChangeRef.current === 'function') {
          console.log('[useVehicles] Notificando adición de vehículo:', newVehicle.id);
          onVehicleChangeRef.current('add', newVehicle);
        }
      } else {
        console.log('[useVehicles] Evitando añadir vehículo duplicado:', newVehicle.id);
      }
      
      setLoading(false);
      
      // Permitir actualizaciones futuras después de un breve retraso
      setTimeout(() => {
        updatingStateRef.current = false;
      }, 100);
      
      return newVehicle;
    } catch (err) {
      console.error('Error al añadir vehículo:', err);
      setError(err.message || 'Error al crear el vehículo');
      setLoading(false);
      updatingStateRef.current = false;
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
    
    if (updatingStateRef.current) {
      console.log('[useVehicles] Bloqueando operación de actualizar durante otra actualización');
      return null;
    }
    
    try {
      // Verificar si el vehículo ya tiene los mismos datos
      const existingVehicle = vehicles.find(v => v.id === vehicleData.id);
      if (existingVehicle && isVehicleEqual(existingVehicle, vehicleData)) {
        console.log('[useVehicles] Evitando actualización redundante:', vehicleData.id);
        return vehicleData; // Devolver los mismos datos sin hacer cambios
      }
      
      setLoading(true);
      setError(null);
      updatingStateRef.current = true;
      
      const updatedVehicle = await updateVehicle(token, vehicleData);
      
      // Actualizar la lista local
      setVehicles(prev => 
        prev.map(vehicle => vehicle.id === vehicleData.id ? updatedVehicle : vehicle)
      );
      
      // Sincronizar con estado externo si es necesario (usando la referencia)
      if (onVehicleChangeRef.current && typeof onVehicleChangeRef.current === 'function') {
        console.log('[useVehicles] Notificando actualización de vehículo:', updatedVehicle.id);
        onVehicleChangeRef.current('update', updatedVehicle);
      }
      
      setLoading(false);
      
      // Permitir actualizaciones futuras después de un breve retraso
      setTimeout(() => {
        updatingStateRef.current = false;
      }, 100);
      
      return updatedVehicle;
    } catch (err) {
      console.error('Error al actualizar vehículo:', err);
      setError(err.message || 'Error al actualizar el vehículo');
      setLoading(false);
      updatingStateRef.current = false;
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
    
    if (updatingStateRef.current) {
      console.log('[useVehicles] Bloqueando operación de eliminar durante otra actualización');
      return false;
    }
    
    try {
      // Verificar que el vehículo exista antes de intentar eliminarlo
      const vehicleExists = vehicles.some(v => v.id === id);
      if (!vehicleExists) {
        console.log('[useVehicles] Vehículo ya eliminado o inexistente:', id);
        return true; // Consideramos exitoso porque ya no existe
      }
      
      setLoading(true);
      setError(null);
      updatingStateRef.current = true;
      
      await deleteVehicle(token, id);
      
      // Actualizar la lista local
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
      
      // Sincronizar con estado externo si es necesario (usando la referencia)
      if (onVehicleChangeRef.current && typeof onVehicleChangeRef.current === 'function') {
        console.log('[useVehicles] Notificando eliminación de vehículo:', id);
        onVehicleChangeRef.current('remove', { id });
      }
      
      setLoading(false);
      
      // Permitir actualizaciones futuras después de un breve retraso
      setTimeout(() => {
        updatingStateRef.current = false;
      }, 100);
      
      return true;
    } catch (err) {
      console.error('Error al eliminar vehículo:', err);
      setError(err.message || 'Error al eliminar el vehículo');
      setLoading(false);
      updatingStateRef.current = false;
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