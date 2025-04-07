import { create } from 'zustand';
import { fetchVehicles, createVehicle, updateVehicle, deleteVehicle } from '../services/VehicleService';

const useVehicleStore = create((set, get) => ({
  vehicles: [],
  loading: false,
  error: null,
  
  // Cargar vehículos desde la API
  loadVehicles: async (token, options = {}) => {
    if (!token) return;
    
    set({ loading: true, error: null });
    
    try {
      const response = await fetchVehicles(token, options);
      
      // Extraer vehículos
      const { vehicles: vehiclesList } = response;
      
      // Limpiar para evitar duplicados usando un Map por ID
      const vehicleMap = new Map();
      vehiclesList.forEach(vehicle => {
        vehicleMap.set(vehicle.id, vehicle);
      });
      const uniqueVehicles = Array.from(vehicleMap.values());
      
      // Actualizar el estado
      set({ 
        vehicles: uniqueVehicles || [],
        loading: false 
      });
    } catch (err) {
      console.error('Error al cargar vehículos:', err);
      set({ 
        error: err.message || 'Error al cargar los vehículos',
        loading: false
      });
    }
  },
  
  // Añadir un nuevo vehículo
  addVehicle: async (token, vehicleData) => {
    if (!token) {
      set({ error: 'No hay sesión activa' });
      return null;
    }
    
    set({ loading: true, error: null });
    
    try {
      const newVehicle = await createVehicle(token, vehicleData);
      
      // Actualizar el estado añadiendo el nuevo vehículo
      set(state => ({
        vehicles: [...state.vehicles, newVehicle],
        loading: false
      }));
      
      return newVehicle;
    } catch (err) {
      console.error('Error al añadir vehículo:', err);
      set({ 
        error: err.message || 'Error al crear el vehículo',
        loading: false
      });
      return null;
    }
  },
  
  // Actualizar un vehículo existente
  updateVehicle: async (token, vehicleData) => {
    if (!token) {
      set({ error: 'No hay sesión activa' });
      return null;
    }
    
    set({ loading: true, error: null });
    
    try {
      const updatedVehicle = await updateVehicle(token, vehicleData);
      
      // Actualizar el estado reemplazando el vehículo actualizado
      set(state => ({
        vehicles: state.vehicles.map(vehicle => 
          vehicle.id === vehicleData.id ? updatedVehicle : vehicle
        ),
        loading: false
      }));
      
      return updatedVehicle;
    } catch (err) {
      console.error('Error al actualizar vehículo:', err);
      set({ 
        error: err.message || 'Error al actualizar el vehículo',
        loading: false
      });
      return null;
    }
  },
  
  // Eliminar un vehículo
  removeVehicle: async (token, id) => {
    if (!token) {
      set({ error: 'No hay sesión activa' });
      return false;
    }
    
    set({ loading: true, error: null });
    
    try {
      await deleteVehicle(token, id);
      
      // Actualizar el estado filtrando el vehículo eliminado
      set(state => ({
        vehicles: state.vehicles.filter(vehicle => vehicle.id !== id),
        loading: false
      }));
      
      return true;
    } catch (err) {
      console.error('Error al eliminar vehículo:', err);
      set({ 
        error: err.message || 'Error al eliminar el vehículo',
        loading: false
      });
      return false;
    }
  },
  
  // Calcular el valor total de los vehículos
  getTotalValue: () => {
    return get().vehicles.reduce((sum, vehicle) => sum + vehicle.valor, 0);
  },
  
  // Limpiar errores
  clearError: () => set({ error: null })
}));

export default useVehicleStore;