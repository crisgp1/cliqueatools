import { create } from 'zustand';
import { searchAddressByText } from '../services/RadarService';

/**
 * Store para gestionar el estado y la lógica del autocompletado de direcciones.
 * Centraliza la lógica para evitar bucles de renderizado y efectos infinitos.
 * Permite manejar múltiples contextos de direcciones de forma independiente.
 */
const useAddressStore = create((set, get) => ({
  // Estado
  addressValues: {
    buyer: '',
    seller: '',
    // otros contextos según sea necesario
  },
  suggestions: {
    buyer: [],
    seller: [],
    // otros contextos según sea necesario
  },
  isSearching: {
    buyer: false,
    seller: false,
    // otros contextos según sea necesario
  },
  radarInitialized: null, // null = no verificado, true = inicializado, false = fallo
  
  // Compatibilidad con código anterior (usar solo para migración)
  get addressValue() {
    return get().addressValues.buyer || '';
  },
  
  // Acciones
  setAddressValue: (value, context = 'buyer') => {
    const newValues = {...get().addressValues};
    newValues[context] = value;
    set({ addressValues: newValues });
  },
  
  checkRadarInitialization: () => {
    // Solo verificar una vez
    if (get().radarInitialized !== null) return;
    
    const radarElement = document.querySelector('.radar-autocomplete-container');
    set({ radarInitialized: radarElement && radarElement.children.length > 0 });
    
    // Programar una verificación posterior si aún no está inicializado
    if (!radarElement || radarElement.children.length === 0) {
      setTimeout(() => {
        const radarElementRetry = document.querySelector('.radar-autocomplete-container');
        set({ radarInitialized: radarElementRetry && radarElementRetry.children.length > 0 });
      }, 3000);
    }
  },
  
  // Buscar direcciones (para modo fallback)
  searchAddresses: async (query, context = 'buyer') => {
    // No buscar si la consulta es muy corta o ya estamos buscando
    if (query.length < 3 || get().isSearching[context]) return;
    
    // Actualizar estado de búsqueda para el contexto específico
    const newIsSearching = {...get().isSearching};
    newIsSearching[context] = true;
    set({ isSearching: newIsSearching });
    
    try {
      const results = await searchAddressByText(query);
      
      // Actualizar sugerencias para el contexto específico
      const newSuggestions = {...get().suggestions};
      newSuggestions[context] = results || [];
      set({ suggestions: newSuggestions });
    } catch (error) {
      console.error(`Error al buscar direcciones para ${context}:`, error);
      
      // Limpiar sugerencias para este contexto en caso de error
      const newSuggestions = {...get().suggestions};
      newSuggestions[context] = [];
      set({ suggestions: newSuggestions });
    } finally {
      // Finalizar búsqueda para este contexto
      const newIsSearching = {...get().isSearching};
      newIsSearching[context] = false;
      set({ isSearching: newIsSearching });
    }
  },
  
  // Limpiar sugerencias para un contexto específico
  clearSuggestions: (context = 'buyer') => {
    const newSuggestions = {...get().suggestions};
    newSuggestions[context] = [];
    set({ suggestions: newSuggestions });
  },
  
  // Reiniciar estado para un contexto específico
  reset: (context = 'buyer') => {
    const newValues = {...get().addressValues};
    newValues[context] = '';
    
    const newSuggestions = {...get().suggestions};
    newSuggestions[context] = [];
    
    const newIsSearching = {...get().isSearching};
    newIsSearching[context] = false;
    
    set({
      addressValues: newValues,
      suggestions: newSuggestions,
      isSearching: newIsSearching,
    });
  },
  
  // Reiniciar todo el estado
  resetAll: () => set({
    addressValues: {
      buyer: '',
      seller: '',
    },
    suggestions: {
      buyer: [],
      seller: [],
    },
    isSearching: {
      buyer: false,
      seller: false,
    },
    radarInitialized: null
  })
}));

export default useAddressStore;