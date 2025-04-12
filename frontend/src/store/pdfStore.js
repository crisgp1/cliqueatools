import { create } from 'zustand';
import { PDFDownloadLink } from '@react-pdf/renderer';

// Store para gestionar la generación de PDFs
const usePdfStore = create((set, get) => ({
  // Estado para almacenar datos de PDF
  quickPdfData: null,
  normalPdfData: null,
  loading: false,
  error: null,
  
  // Establecer datos para PDF del cotizador rápido
  setQuickPdfData: (data) => {
    set({ quickPdfData: data });
  },
  
  // Establecer datos para PDF del cotizador normal
  setNormalPdfData: (data) => {
    set({ normalPdfData: data });
  },
  
  // Limpiar datos de PDF
  clearPdfData: () => {
    set({ 
      quickPdfData: null,
      normalPdfData: null,
      error: null
    });
  },
  
  // Manejar errores
  setError: (errorMessage) => {
    set({ 
      error: errorMessage,
      loading: false 
    });
  },
  
  // Establecer estado de carga
  setLoading: (isLoading) => {
    set({ loading: isLoading });
  }
}));

export default usePdfStore;