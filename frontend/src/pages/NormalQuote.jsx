import React, { useState, useContext, useEffect } from 'react';
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
  
  // Estado para pasar datos entre componentes
  const [quoteData, setQuoteData] = useState(null);
  const [results, setResults] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
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

  // Manejar los resultados del cálculo de cotización
  const handleCalculateResults = (calculatedResults) => {
    setResults(calculatedResults);
    navigate('comparison');
  };

  // Manejar la selección de banco para ir a la tabla de amortización
  const handleSelectBank = (bank) => {
    setSelectedBank(bank);
    navigate('amortization');
  };

  // Manejador para volver atrás
  const handleBack = () => {
    const path = location.pathname;
    
    if (path.includes('amortization')) {
      navigate('../comparison');
    } else if (path.includes('comparison')) {
      navigate('../');
    } else {
      // Volver al menú principal si estamos en la raíz del cotizador normal
      navigate('/');
    }
  };

  // Manejar cambios en la configuración del crédito
  const handleCreditConfigChange = (config) => {
    setQuoteData(config);
  };

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