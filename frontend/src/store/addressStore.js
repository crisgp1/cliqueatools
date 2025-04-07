import { create } from 'zustand';
import { searchAddressByText } from '../services/RadarService';

/**
 * Store para gestionar el estado y la lógica del autocompletado de direcciones.
 * Centraliza la lógica para evitar bucles de renderizado y efectos infinitos.
 */
const useAddressStore = create((set, get) => ({
  // Estado
  addressValue: '',
  suggestions: [],
  isSearching: false,
  radarInitialized: null, // null = no verificado, true = inicializado, false = fallo
  
  // Acciones
  setAddressValue: (value) => set({ addressValue: value }),
  
  checkRadarInitialization: () => {
    // Solo verificar una vez
    if (get().radarInitialized !== null) return;
    
    const radarElement = document.querySelector('.radar-autocomplete');
    set({ radarInitialized: radarElement && radarElement.children.length > 0 });
    
    // Programar una verificación posterior si aún no está inicializado
    if (!radarElement || radarElement.children.length === 0) {
      setTimeout(() => {
        const radarElementRetry = document.querySelector('.radar-autocomplete');
        set({ radarInitialized: radarElementRetry && radarElementRetry.children.length > 0 });
      }, 3000);
    }
  },
  
  // Buscar direcciones (para modo fallback)
  searchAddresses: async (query) => {
    // No buscar si la consulta es muy corta o ya estamos buscando
    if (query.length < 3 || get().isSearching) return;
    
    set({ isSearching: true });
    
    try {
      const results = await searchAddressByText(query);
      set({ suggestions: results || [] });
    } catch (error) {
      console.error('Error al buscar direcciones:', error);
      set({ suggestions: [] });
    } finally {
      set({ isSearching: false });
    }
  },
  
  // Limpiar sugerencias
  clearSuggestions: () => set({ suggestions: [] }),
  
  // Reiniciar estado
  reset: () => set({
    addressValue: '',
    suggestions: [],
    isSearching: false,
    radarInitialized: null
  })
}));

export default useAddressStore;