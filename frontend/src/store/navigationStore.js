import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store para mantener el estado de navegación de los cotizadores
const useNavigationStore = create(
  persist(
    (set, get) => ({
      // Estado para el cotizador rápido
      quickCredit: {
        activeComponent: 'menu',
        history: ['menu'],
        cotizacionData: null
      },
      
      // Estado para el cotizador normal
      normalQuote: {
        activeComponent: '/',
        history: ['/'],
        quoteData: null,
        results: [],
        selectedBank: null
      },
      
      // Setters para el cotizador rápido
      setQuickCreditActiveComponent: (component) => {
        const { quickCredit } = get();
        const newHistory = [...quickCredit.history];
        
        // Solo añadir al historial si es un componente distinto al actual
        if (quickCredit.activeComponent !== component) {
          newHistory.push(component);
        }
        
        set({ 
          quickCredit: { 
            ...quickCredit, 
            activeComponent: component,
            history: newHistory
          } 
        });
      },
      
      setQuickCreditData: (data) => {
        set(state => ({ 
          quickCredit: { 
            ...state.quickCredit, 
            cotizacionData: data 
          } 
        }));
      },
      
      // Navegar hacia atrás en el cotizador rápido
      goBackQuickCredit: () => {
        const { quickCredit } = get();
        const history = [...quickCredit.history];
        
        // Si solo queda un elemento en el historial, mantenemos ese estado
        if (history.length <= 1) {
          return;
        }
        
        // Eliminamos el estado actual y volvemos al anterior
        history.pop();
        const previousComponent = history[history.length - 1];
        
        set({
          quickCredit: {
            ...quickCredit,
            activeComponent: previousComponent,
            history
          }
        });
      },
      
      // Resetear el cotizador rápido
      resetQuickCredit: () => {
        set({
          quickCredit: {
            activeComponent: 'menu',
            history: ['menu'],
            cotizacionData: null
          }
        });
      },
      
      // Setters para el cotizador normal
      setNormalQuoteActiveComponent: (component) => {
        const { normalQuote } = get();
        const newHistory = [...normalQuote.history];
        
        // Solo añadir al historial si es un componente distinto al actual
        if (normalQuote.activeComponent !== component) {
          newHistory.push(component);
        }
        
        set({ 
          normalQuote: { 
            ...normalQuote, 
            activeComponent: component,
            history: newHistory
          } 
        });
      },
      
      setNormalQuoteData: (data) => {
        set(state => ({ 
          normalQuote: { 
            ...state.normalQuote, 
            quoteData: data 
          } 
        }));
      },
      
      setNormalQuoteResults: (results) => {
        set(state => ({ 
          normalQuote: { 
            ...state.normalQuote, 
            results 
          } 
        }));
      },
      
      setNormalQuoteSelectedBank: (bank) => {
        set(state => ({ 
          normalQuote: { 
            ...state.normalQuote, 
            selectedBank: bank 
          } 
        }));
      },
      
      // Navegar hacia atrás en el cotizador normal
      goBackNormalQuote: () => {
        const { normalQuote } = get();
        const history = [...normalQuote.history];
        
        // Si solo queda un elemento en el historial, mantenemos ese estado
        if (history.length <= 1) {
          return;
        }
        
        // Eliminamos el estado actual y volvemos al anterior
        history.pop();
        const previousComponent = history[history.length - 1];
        
        set({
          normalQuote: {
            ...normalQuote,
            activeComponent: previousComponent,
            history
          }
        });
      },
      
      // Resetear el cotizador normal
      resetNormalQuote: () => {
        set({
          normalQuote: {
            activeComponent: '/',
            history: ['/'],
            quoteData: null,
            results: [],
            selectedBank: null
          }
        });
      }
    }),
    {
      name: 'cotizador-navigation-storage', // Nombre para localStorage
      getStorage: () => localStorage,       // Usar localStorage como almacenamiento
    }
  )
);

export default useNavigationStore;