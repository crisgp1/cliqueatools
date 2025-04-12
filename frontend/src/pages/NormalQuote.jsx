import React, { useState, useContext, useEffect } from 'react';
import useNavigationStore from '../store/navigationStore';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

// Componentes
import CreditForm from './CreditForm';
import BankComparison from './BankComparison';
import AmortizationTable from './AmortizationTable';

const NormalQuote = () => {
  // Autenticación
  const { user } = useContext(AuthContext);
  
  // Usar el store de navegación con persistencia
  const {
    normalQuote,
    setNormalQuoteData,
    setNormalQuoteResults,
    setNormalQuoteSelectedBank,
    setNormalQuoteActiveComponent
  } = useNavigationStore();
  
  // Usar estados del store si existen, o inicializar con los valores por defecto
  const [quoteData, setQuoteDataLocal] = useState(() => normalQuote.quoteData || null);
  const [results, setResultsLocal] = useState(() => normalQuote.results || []);
  const [selectedBank, setSelectedBankLocal] = useState(() => normalQuote.selectedBank || null);
  const [vehicles, setVehicles] = useState([]);
  const [client, setClient] = useState(null);
  
  // Navegación
  const navigate = useNavigate();
  const location = useLocation();
  
  // Efecto para cargar datos necesarios
  useEffect(() => {
    // Aquí se cargaría la información de vehículos y cliente si es necesario
    // Código para cargar vehículos y datos del cliente...
  }, [user]);

  // Efecto para actualizar el store cuando cambian los estados locales
  useEffect(() => {
    setNormalQuoteData(quoteData);
  }, [quoteData, setNormalQuoteData]);

  useEffect(() => {
    setNormalQuoteResults(results);
  }, [results, setNormalQuoteResults]);

  useEffect(() => {
    setNormalQuoteSelectedBank(selectedBank);
  }, [selectedBank, setNormalQuoteSelectedBank]);

  // Manejar los resultados del cálculo de cotización
  const handleCalculateResults = (calculatedResults) => {
    setResultsLocal(calculatedResults);
    setNormalQuoteActiveComponent('comparison');
    navigate('comparison');
  };

  // Manejar la selección de banco para ir a la tabla de amortización
  const handleSelectBank = (bank) => {
    setSelectedBankLocal(bank);
    setNormalQuoteActiveComponent('amortization');
    navigate('amortization');
  };

  // Manejador para volver atrás - actualiza el store y usa React Router
  const handleBack = () => {
    const path = location.pathname;
    
    if (path.includes('amortization')) {
      setNormalQuoteActiveComponent('comparison');
      navigate('../comparison');
    } else if (path.includes('comparison')) {
      setNormalQuoteActiveComponent('/');
      navigate('../');
    } else {
      // Volver al menú principal si estamos en la raíz del cotizador normal
      navigate('/');
    }
  };

  // Manejar cambios en la configuración del crédito
  const handleCreditConfigChange = (config) => {
    setQuoteDataLocal(config);
  };

  // Efecto para actualizar el componente activo en el store cuando cambia la ruta
  useEffect(() => {
    const path = location.pathname.split('/').pop() || '/';
    setNormalQuoteActiveComponent(path);
  }, [location, setNormalQuoteActiveComponent]);

  // Variantes para animaciones
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 }
  };

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Página principal - Formulario de cotización */}
        <Route 
          path="/" 
          element={
            <motion.div
              key="credit-form"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            >
              <CreditForm 
                vehiclesValue={vehicles.reduce((sum, v) => sum + v.valor, 0)}
                vehicles={vehicles}
                onCreditConfigChange={handleCreditConfigChange}
                onCalculateResults={handleCalculateResults}
              />
            </motion.div>
          } 
        />
        
        {/* Página de comparación de bancos */}
        <Route 
          path="comparison" 
          element={
            <motion.div
              key="bank-comparison"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            >
              <BankComparison 
                results={results} 
                onSelectBank={handleSelectBank} 
                onBack={handleBack}
              />
            </motion.div>
          } 
        />
        
        {/* Página de tabla de amortización */}
        <Route 
          path="amortization" 
          element={
            <motion.div
              key="amortization-table"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            >
              <AmortizationTable 
                bank={selectedBank}
                client={client}
                vehicles={vehicles}
                creditConfig={quoteData}
                onBack={handleBack}
              />
            </motion.div>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
};

export default NormalQuote;