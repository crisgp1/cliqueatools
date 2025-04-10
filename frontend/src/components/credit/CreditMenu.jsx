import React from 'react';
import { motion } from 'framer-motion';
import { IoCalculatorOutline, IoFlashOutline, IoInformationCircleOutline } from 'react-icons/io5';

const CreditMenu = ({ onOptionSelect }) => {
  // Define animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Define animation variants for items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    }
  };

  // Define animation for hover effect
  const hoverMotion = {
    rest: { scale: 1 },
    hover: { scale: 1.03, transition: { duration: 0.2 } },
    tap: { scale: 0.97, transition: { duration: 0.1 } }
  };

  return (
    <div className="py-6">
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Simulador de Crédito Automotriz</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Selecciona una de las siguientes opciones para comenzar a cotizar tu crédito automotriz.
        </p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Normal Quoter Option */}
        <motion.div 
          className="relative overflow-hidden"
          variants={itemVariants}
        >
          <motion.div
            className="p-6 rounded-xl shadow-md border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 h-full"
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            variants={hoverMotion}
          >
            <div 
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"
              style={{ borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem' }}
            ></div>

            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
                <IoCalculatorOutline className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-blue-800 mb-2 text-center">Cotizador Normal</h3>
            
            <p className="text-gray-700 mb-4 text-center">
              Utiliza nuestra herramienta completa de cotización con todas las funciones y guardado en base de datos.
            </p>

            <ul className="mb-6 space-y-2">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span className="text-gray-700">Múltiples vehículos en una cotización</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span className="text-gray-700">Guardado automático en el sistema</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span className="text-gray-700">Comparación detallada entre bancos</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">✓</span>
                <span className="text-gray-700">Integración con contratos y citas</span>
              </li>
            </ul>

            <motion.button
              onClick={() => onOptionSelect('normal')}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <IoCalculatorOutline className="mr-2" />
              Usar Cotizador Normal
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Quick Quoter Option */}
        <motion.div 
          className="relative overflow-hidden"
          variants={itemVariants}
        >
          <motion.div
            className="p-6 rounded-xl shadow-md border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 h-full"
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            variants={hoverMotion}
          >
            <div 
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"
              style={{ borderTopLeftRadius: '0.75rem', borderTopRightRadius: '0.75rem' }}
            ></div>

            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center shadow-inner">
                <IoFlashOutline className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-amber-800 mb-2 text-center">Cotizador Rápido</h3>
            
            <p className="text-gray-700 mb-4 text-center">
              Genera cotizaciones instantáneas sin necesidad de guardar datos. Ideal para comparaciones rápidas.
            </p>

            <ul className="mb-6 space-y-2">
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                <span className="text-gray-700">Cotización rápida sin registro</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                <span className="text-gray-700">Formulario simplificado</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                <span className="text-gray-700">Generación de PDF para imprimir</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-2">✓</span>
                <span className="text-gray-700">Visualización gráfica de resultados</span>
              </li>
            </ul>

            <motion.button
              onClick={() => onOptionSelect('quick')}
              className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <IoFlashOutline className="mr-2" />
              Usar Cotizador Rápido
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex items-start">
          <IoInformationCircleOutline className="text-gray-500 w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p className="mb-1"><strong>¿Cuál es la diferencia?</strong></p>
            <p>El Cotizador Normal guarda toda la información en nuestra base de datos, permitiendo gestionar contratos y dar seguimiento. El Cotizador Rápido ofrece los mismos cálculos pero sin almacenar información permanentemente, ideal para presentaciones rápidas al cliente.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreditMenu;