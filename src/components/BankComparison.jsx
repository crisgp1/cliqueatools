import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoArrowUpOutline, 
  IoDocumentTextOutline, 
  IoBusinessOutline 
} from 'react-icons/io5';

const BankComparison = ({ results, onSelectBank }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'monthlyPayment', direction: 'ascending' });
  
  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Formatear porcentaje
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  // Ordenar resultados
  const sortedResults = [...results].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
  
  // Configurar ordenamiento
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Obtener clases para encabezado ordenable
  const getSortButtonClass = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' 
        ? 'text-royal-black' 
        : 'text-royal-black rotate-180';
    }
    return 'text-royal-gray-400';
  };
  
  // Animaciones
  const tableAnimation = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const rowAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 500
      }
    }
  };
  
  return (
    <motion.div 
      className="govuk-form-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 500 }}
    >
      <h3 className="govuk-form-section-title">
        Comparativa de opciones de financiamiento
      </h3>
      <p className="govuk-form-hint mb-4">
        Encuentra la mejor opción entre {results.length} bancos. Haz clic en los encabezados para ordenar la tabla.
      </p>
      
      {/* Sort Controls for Mobile */}
      <div className="flex flex-wrap items-center mb-4 sm:hidden">
        <span className="mr-2 text-sm">Ordenar por:</span>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => requestSort('monthlyPayment')}
            className={`inline-flex items-center px-2 py-1 text-xs rounded border ${
              sortConfig.key === 'monthlyPayment' ? 'bg-royal-black text-white border-royal-black' : 'border-royal-gray-300'
            }`}
          >
            Pago Mensual
            <motion.div 
              className={`ml-1 ${sortConfig.key === 'monthlyPayment' ? 'text-white' : 'text-royal-gray-400'}`}
              animate={{ 
                rotate: sortConfig.key === 'monthlyPayment' && sortConfig.direction === 'descending' ? 180 : 0 
              }}
            >
              <IoArrowUpOutline className="h-3 w-3" />
            </motion.div>
          </button>
          
          <button 
            onClick={() => requestSort('tasa')}
            className={`inline-flex items-center px-2 py-1 text-xs rounded border ${
              sortConfig.key === 'tasa' ? 'bg-royal-black text-white border-royal-black' : 'border-royal-gray-300'
            }`}
          >
            Tasa
            <motion.div 
              className={`ml-1 ${sortConfig.key === 'tasa' ? 'text-white' : 'text-royal-gray-400'}`}
              animate={{ 
                rotate: sortConfig.key === 'tasa' && sortConfig.direction === 'descending' ? 180 : 0 
              }}
            >
              <IoArrowUpOutline className="h-3 w-3" />
            </motion.div>
          </button>
          
          <button 
            onClick={() => requestSort('cat')}
            className={`inline-flex items-center px-2 py-1 text-xs rounded border ${
              sortConfig.key === 'cat' ? 'bg-royal-black text-white border-royal-black' : 'border-royal-gray-300'
            }`}
          >
            CAT
            <motion.div 
              className={`ml-1 ${sortConfig.key === 'cat' ? 'text-white' : 'text-royal-gray-400'}`}
              animate={{ 
                rotate: sortConfig.key === 'cat' && sortConfig.direction === 'descending' ? 180 : 0 
              }}
            >
              <IoArrowUpOutline className="h-3 w-3" />
            </motion.div>
          </button>
        </div>
      </div>
      
      {/* Mobile Card View */}
      <div className="sm:hidden space-y-4">
        <AnimatePresence>
          {sortedResults.map((bank, index) => (
            <motion.div 
              key={bank.id}
              className={`border-2 rounded-none p-4 ${
                index === 0 && sortConfig.key === 'monthlyPayment' && sortConfig.direction === 'ascending'
                  ? "border-royal-black bg-royal-gray-100" 
                  : "border-royal-gray-300"
              }`}
              variants={rowAnimation}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
              layout
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {React.isValidElement(bank.logo) ? (
                    <div className="text-2xl mr-3 text-royal-black">{bank.logo}</div>
                  ) : (
                    <img src={bank.logo} alt={bank.nombre} className="h-8 mr-3" />
                  )}
                  <div>
                    <div className="font-bold">{bank.nombre}</div>
                    {index === 0 && sortConfig.key === 'monthlyPayment' && sortConfig.direction === 'ascending' && (
                      <motion.span 
                        className="inline-block px-2 py-1 text-xs font-bold bg-royal-black text-white"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      >
                        Mejor opción
                      </motion.span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <div className="text-xs text-royal-gray-600">Pago Mensual</div>
                  <div className="font-bold">{formatCurrency(bank.monthlyPayment)}</div>
                </div>
                <div>
                  <div className="text-xs text-royal-gray-600">Tasa</div>
                  <div>{formatPercentage(bank.tasa)}</div>
                </div>
                <div>
                  <div className="text-xs text-royal-gray-600">CAT</div>
                  <div>{formatPercentage(bank.cat)}</div>
                </div>
                <div>
                  <div className="text-xs text-royal-gray-600">Monto Total</div>
                  <div>{formatCurrency(bank.totalAmount)}</div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <motion.button
                  onClick={() => onSelectBank(bank)}
                  className="govuk-button-secondary px-3 py-1 text-sm flex items-center"
                  whileHover={{ scale: 1.05, backgroundColor: "#e5e5e5" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IoDocumentTextOutline className="mr-1 h-4 w-4" />
                  Ver detalles
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <motion.table 
          className="govuk-table"
          variants={tableAnimation}
          initial="hidden"
          animate="visible"
        >
          <caption className="govuk-table__caption sr-only">
            Comparativa de opciones de financiamiento
          </caption>
          <thead>
            <tr>
              <th scope="col" className="govuk-table__header">
                Banco
              </th>
              <th 
                scope="col" 
                className="govuk-table__header cursor-pointer"
                onClick={() => requestSort('tasa')}
              >
                <div className="flex items-center">
                  Tasa
                  <motion.div 
                    className={`ml-1 ${getSortButtonClass('tasa')}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IoArrowUpOutline className="h-4 w-4" />
                  </motion.div>
                </div>
              </th>
              <th 
                scope="col" 
                className="govuk-table__header cursor-pointer"
                onClick={() => requestSort('cat')}
              >
                <div className="flex items-center">
                  CAT
                  <motion.div 
                    className={`ml-1 ${getSortButtonClass('cat')}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IoArrowUpOutline className="h-4 w-4" />
                  </motion.div>
                </div>
              </th>
              <th 
                scope="col" 
                className="govuk-table__header cursor-pointer"
                onClick={() => requestSort('monthlyPayment')}
              >
                <div className="flex items-center">
                  Pago Mensual
                  <motion.div 
                    className={`ml-1 ${getSortButtonClass('monthlyPayment')}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IoArrowUpOutline className="h-4 w-4" />
                  </motion.div>
                </div>
              </th>
              <th 
                scope="col" 
                className="govuk-table__header cursor-pointer"
                onClick={() => requestSort('totalAmount')}
              >
                <div className="flex items-center">
                  Monto Total
                  <motion.div 
                    className={`ml-1 ${getSortButtonClass('totalAmount')}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <IoArrowUpOutline className="h-4 w-4" />
                  </motion.div>
                </div>
              </th>
              <th scope="col" className="govuk-table__header">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {sortedResults.map((bank, index) => (
                <motion.tr 
                  key={bank.id} 
                  className={`govuk-table__row ${index === 0 && sortConfig.key === 'monthlyPayment' && sortConfig.direction === 'ascending' 
                    ? "bg-royal-gray-100 border-l-4 border-royal-black" 
                    : ""}`}
                  variants={rowAnimation}
                  exit={{ opacity: 0, x: -50 }}
                  layout
                >
                <td className="govuk-table__cell">
                  <div className="flex items-center">
                    {React.isValidElement(bank.logo) ? (
                      <div className="text-2xl mr-3 text-royal-black">{bank.logo}</div>
                    ) : (
                      <img src={bank.logo} alt={bank.nombre} className="h-8 mr-3" />
                    )}
                    <div>
                      <div className="font-bold">{bank.nombre}</div>
                      {index === 0 && sortConfig.key === 'monthlyPayment' && sortConfig.direction === 'ascending' && (
                        <motion.span 
                          className="inline-block px-2 py-1 text-xs font-bold bg-royal-black text-white"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        >
                          Mejor opción
                        </motion.span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="govuk-table__cell">
                  {formatPercentage(bank.tasa)}
                </td>
                <td className="govuk-table__cell">
                  {formatPercentage(bank.cat)}
                </td>
                <td className="govuk-table__cell font-bold">
                  {formatCurrency(bank.monthlyPayment)}
                </td>
                <td className="govuk-table__cell">
                  {formatCurrency(bank.totalAmount)}
                </td>
                <td className="govuk-table__cell">
                  <motion.button
                    onClick={() => onSelectBank(bank)}
                    className="govuk-button-secondary px-3 py-1 text-sm flex items-center"
                    whileHover={{ scale: 1.05, backgroundColor: "#e5e5e5" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IoDocumentTextOutline className="mr-1 h-4 w-4" />
                    Ver detalles
                  </motion.button>
                </td>
              </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </motion.table>
      </div>
      
      <div className="govuk-inset-text mt-4">
        <p>
          * Las tasas de interés y CAT son aproximadas y pueden variar. Consulta términos y condiciones con cada institución bancaria.
        </p>
      </div>
    </motion.div>
  );
};

export default BankComparison;