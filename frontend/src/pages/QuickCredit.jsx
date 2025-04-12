import React, { useEffect } from 'react';
import useNavigationStore from '../store/navigationStore';
import { motion, AnimatePresence } from 'framer-motion';
import CreditMenu from '../components/credit/CreditMenu';
import QuickCreditForm from '../components/credit/QuickCreditForm';
import QuickCreditResults from '../components/credit/QuickCreditResults';
import { FaChevronLeft } from 'react-icons/fa';

const QuickCredit = () => {
  // Usar el store de navegación con persistencia
  const { 
    quickCredit, 
    setQuickCreditActiveComponent, 
    setQuickCreditData, 
    goBackQuickCredit 
  } = useNavigationStore();
  
  // Extraer estados del store
  const { activeComponent, cotizacionData } = quickCredit;
  
  // Efecto para cargar datos persistentes al iniciar
  useEffect(() => {
    // El estado se carga automáticamente desde localStorage gracias a Zustand/persist
  }, []);

  // Manejar selección de opción en el menú
  const handleMenuSelection = (option) => {
    if (option === 'quick') {
      setQuickCreditActiveComponent('form');
    } else if (option === 'normal') {
      // En una aplicación real, aquí se redireccionaría al cotizador normal
      setQuickCreditActiveComponent('normal');
    }
  };
  
  // Manejar envío del formulario
  const handleFormSubmit = (data) => {
    setQuickCreditData(data);
    setQuickCreditActiveComponent('results');
  };
  
  // Manejar el botón de volver, usando el historial guardado
  const handleBack = () => {
    // Usar la función de navegación atrás del store
    goBackQuickCredit();
  };
  
  // Animaciones para transiciones
  const pageTransition = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Renderizar componente según el estado */}
      <AnimatePresence mode="wait">
        {activeComponent === 'menu' && (
          <motion.div
            key="menu"
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            transition={pageTransition.transition}
          >
            <CreditMenu onOptionSelect={handleMenuSelection} />
          </motion.div>
        )}
        
        {activeComponent === 'form' && (
          <motion.div
            key="form"
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            transition={pageTransition.transition}
          >
            <QuickCreditForm onSubmitForm={handleFormSubmit} onBack={goBackQuickCredit} />
          </motion.div>
        )}
        
        {activeComponent === 'results' && cotizacionData && (
          <motion.div
            key="results"
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            transition={pageTransition.transition}
          >
            <QuickCreditResults cotizacion={cotizacionData} onBack={goBackQuickCredit} />
          </motion.div>
        )}
        
        {activeComponent === 'normal' && (
          <motion.div
            key="normal"
            initial={pageTransition.initial}
            animate={pageTransition.animate}
            exit={pageTransition.exit}
            transition={pageTransition.transition}
            className="text-center py-10"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Cotizador Normal</h2>
              <p className="text-gray-600">
                Esta opción te llevará al cotizador completo con guardado en base de datos.
              </p>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleBack}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                <FaChevronLeft className="mr-2" />
                Volver al menú
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickCredit;