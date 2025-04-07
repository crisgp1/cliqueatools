import { create } from 'zustand';
import { 
  fetchAppointments, 
  createAppointment, 
  updateAppointment, 
  deleteAppointment,
  searchAppointments,
  fetchAppointmentById
} from '../services/AppointmentService';

const useAppointmentStore = create((set, get) => ({
  appointments: [],
  selectedAppointment: null,
  loading: false,
  error: null,
  
  // Cargar citas desde la API
  loadAppointments: async (token, options = {}) => {
    if (!token) return;
    
    set({ loading: true, error: null });
    
    try {
      const response = await fetchAppointments(token, options);
      
      // Extraer citas
      const { appointments: appointmentsList } = response;
      
      // Limpiar para evitar duplicados usando un Map por ID
      const appointmentMap = new Map();
      appointmentsList.forEach(appointment => {
        appointmentMap.set(appointment.id, appointment);
      });
      const uniqueAppointments = Array.from(appointmentMap.values());
      
      // Actualizar el estado
      set({ 
        appointments: uniqueAppointments || [],
        loading: false 
      });
      
      return uniqueAppointments;
    } catch (err) {
      console.error('Error al cargar citas:', err);
      set({ 
        error: err.message || 'Error al cargar las citas',
        loading: false
      });
      return [];
    }
  },
  
  // Cargar citas por fecha
  loadAppointmentsByDate: async (token, date) => {
    return await get().loadAppointments(token, { fecha: date });
  },
  
  // Cargar citas por cliente
  loadAppointmentsByClient: async (token, clientId) => {
    return await get().loadAppointments(token, { clienteId: clientId });
  },
  
  // Cargar citas por usuario
  loadAppointmentsByUser: async (token, userId) => {
    return await get().loadAppointments(token, { usuarioId: userId });
  },
  
  // Obtener una cita por su ID
  getAppointmentById: async (token, id) => {
    if (!token) {
      set({ error: 'No hay sesión activa' });
      return null;
    }
    
    set({ loading: true, error: null });
    
    try {
      // Primero verificar si ya lo tenemos en el estado
      const existingAppointment = get().appointments.find(a => a.id === Number(id));
      if (existingAppointment) {
        set({ selectedAppointment: existingAppointment, loading: false });
        return existingAppointment;
      }
      
      // Si no está en el estado, buscarlo en la API
      const appointment = await fetchAppointmentById(token, id);
      set({ selectedAppointment: appointment, loading: false });
      return appointment;
    } catch (err) {
      console.error('Error al obtener cita por ID:', err);
      set({ 
        error: err.message || 'Error al obtener la cita',
        loading: false
      });
      return null;
    }
  },
  
  // Añadir una nueva cita
  addAppointment: async (token, appointmentData) => {
    if (!token) {
      set({ error: 'No hay sesión activa' });
      return null;
    }
    
    set({ loading: true, error: null });
    
    try {
      const newAppointment = await createAppointment(token, appointmentData);
      
      // Actualizar el estado añadiendo la nueva cita
      set(state => ({
        appointments: [...state.appointments, newAppointment],
        loading: false
      }));
      
      return newAppointment;
    } catch (err) {
      console.error('Error al añadir cita:', err);
      set({ 
        error: err.message || 'Error al crear la cita',
        loading: false
      });
      return null;
    }
  },
  
  // Actualizar una cita existente
  updateAppointment: async (token, appointmentData) => {
    if (!token) {
      set({ error: 'No hay sesión activa' });
      return null;
    }
    
    set({ loading: true, error: null });
    
    try {
      const updatedAppointment = await updateAppointment(token, appointmentData);
      
      // Actualizar el estado reemplazando la cita actualizada
      set(state => ({
        appointments: state.appointments.map(appointment => 
          appointment.id === appointmentData.id ? updatedAppointment : appointment
        ),
        loading: false,
        selectedAppointment: updatedAppointment
      }));
      
      return updatedAppointment;
    } catch (err) {
      console.error('Error al actualizar cita:', err);
      set({ 
        error: err.message || 'Error al actualizar la cita',
        loading: false
      });
      return null;
    }
  },
  
  // Eliminar una cita
  removeAppointment: async (token, id) => {
    if (!token) {
      set({ error: 'No hay sesión activa' });
      return false;
    }
    
    set({ loading: true, error: null });
    
    try {
      await deleteAppointment(token, id);
      
      // Actualizar el estado filtrando la cita eliminada
      set(state => ({
        appointments: state.appointments.filter(appointment => appointment.id !== id),
        loading: false,
        selectedAppointment: state.selectedAppointment?.id === id ? null : state.selectedAppointment
      }));
      
      return true;
    } catch (err) {
      console.error('Error al eliminar cita:', err);
      set({ 
        error: err.message || 'Error al eliminar la cita',
        loading: false
      });
      return false;
    }
  },
  
  // Buscar citas
  searchAppointments: async (token, term, type = '') => {
    if (!token) {
      set({ error: 'No hay sesión activa' });
      return [];
    }
    
    set({ loading: true, error: null });
    
    try {
      const results = await searchAppointments(token, term, type);
      set({ loading: false });
      return results;
    } catch (err) {
      console.error('Error al buscar citas:', err);
      set({ 
        error: err.message || 'Error al buscar citas',
        loading: false
      });
      return [];
    }
  },
  
  // Seleccionar una cita para edición o visualización
  selectAppointment: (appointment) => {
    set({ selectedAppointment: appointment });
  },
  
  // Limpiar la selección
  clearSelectedAppointment: () => {
    set({ selectedAppointment: null });
  },
  
  // Limpiar errores
  clearError: () => set({ error: null })
}));

export default useAppointmentStore;