import { create } from 'zustand';

/**
 * Store para gestionar notificaciones de la aplicación
 * Permite crear, eliminar y gestionar notificaciones de diferentes tipos
 */
const useNotificationStore = create((set, get) => ({
  // Estado para almacenar las notificaciones
  notifications: [],
  
  // Añadir una nueva notificación
  addNotification: (notification) => {
    const id = Date.now(); // Generar un ID único simple
    const newNotification = {
      id,
      type: notification.type || 'info',
      message: notification.message,
      duration: notification.duration || 5000, // Duración por defecto: 5 segundos
      ...notification
    };
    
    set(state => ({
      notifications: [...state.notifications, newNotification]
    }));
    
    // Auto-eliminar la notificación después de la duración si no es persistente
    if (!newNotification.persistent && newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  },
  
  // Eliminar una notificación por ID
  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
  
  // Limpiar todas las notificaciones
  clearNotifications: () => {
    set({ notifications: [] });
  },
  
  // Añadir una notificación de sesión expirada
  addSessionExpiredNotification: () => {
    return get().addNotification({
      type: 'error',
      message: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
      persistent: false,
      duration: 8000 // Mostrar durante 8 segundos
    });
  }
}));

export default useNotificationStore;