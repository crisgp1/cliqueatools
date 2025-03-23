import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';

const BankComparison = ({ results, onSelectBank }) => {
  const [expandedBankId, setExpandedBankId] = useState(null);
  
  // Estado para controlar la vista compacta o detallada
  const [compactView, setCompactView] = useState(true);
  
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
    if (value === "" || value === null || value === undefined || isNaN(value)) {
      return "0.00%";
    }
    return `${Number(value).toFixed(2)}%`;
  };
  
  // Función para alternar la expansión de un banco
  const toggleExpand = (bankId) => {
    if (expandedBankId === bankId) {
      setExpandedBankId(null);
    } else {
      setExpandedBankId(bankId);
    }
  };
  
  // Animaciones
  const listAnimation = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    }
  };
  
  // Calcular el ahorro respecto al banco más caro
  const calculateSavings = (bankPayment) => {
    if (results.length < 2) return 0;
    
    // Banco más caro (último en la lista, ya que está ordenada por pago mensual)
    const mostExpensivePayment = results[results.length - 1].monthlyPayment;
    
    // Diferencia mensual
    const monthlySavings = mostExpensivePayment - bankPayment;
    
    return monthlySavings;
  };
  
  // Calcular porcentaje de ahorro
  const calculateSavingsPercentage = (bankPayment) => {
    if (results.length < 2) return 0;
    
    const mostExpensivePayment = results[results.length - 1].monthlyPayment;
    const difference = mostExpensivePayment - bankPayment;
    
    return (difference / mostExpensivePayment) * 100;
  };
  
  return (
    <div className="space-y-6">
      {results.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-royal-gray-300">
          <p className="text-royal-gray-600 mb-4">
            Aún no hay resultados para mostrar. Configura tu crédito y calcula las opciones.
          </p>
          <div className="govuk-inset-text mb-0">
            <p>Presiona "Calcular todas las opciones" o selecciona bancos específicos para comparar.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Comparativa de {results.length} opciones</h3>
              <p className="text-sm text-royal-gray-600">
                Ordenadas de menor a mayor por pago mensual
              </p>
            </div>
            <button
              onClick={() => setCompactView(!compactView)}
              className="px-3 py-1.5 rounded-md bg-royal-gray-100 text-royal-gray-800 text-sm flex items-center"
            >
              <span className="mr-1">Vista {compactView ? 'Compacta' : 'Detallada'}</span>
              {compactView ? (
                <IoChevronDownOutline className="h-4 w-4" />
              ) : (
                <IoChevronUpOutline className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {/* Información sobre configuraciones personalizadas */}
          {results.some(bank => bank.hasCustomConfig) && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <div className="flex items-start">
                <IoInformationCircleOutline className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Configuraciones personalizadas</h4>
                  <p className="text-xs text-blue-700">
                    Algunos bancos utilizan configuraciones personalizadas que definiste. Estas se marcan con <span className="inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-xs">Personalizado</span> e incluyen tus ajustes específicos de enganche, plazo, tasa y/o CAT.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Mejores opciones (Top 3) */}
          {results.length >= 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {results.slice(0, 3).map((bank, index) => (
                <motion.div
                  key={`top-${bank.id}`}
                  className={`border-2 ${
                    index === 0 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-royal-gray-300'
                  } p-4 rounded-md`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center mb-2">
                    {React.isValidElement(bank.logo) ? (
                      <div className="mr-2 text-royal-black">{bank.logo}</div>
                    ) : (
                      <img src={bank.logo} alt={bank.nombre} className="h-8 mr-2" />
                    )}
                    <div>
                      <div className="font-bold">{bank.nombre}</div>
                      <div className="flex items-center">
                        <span className="text-xs text-royal-gray-600">
                          {index === 0 ? 'Mejor opción' : `Top ${index + 1}`}
                        </span>
                        {bank.hasCustomConfig && (
                          <span className="ml-2 inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                            <IoCheckmarkCircleOutline className="h-3 w-3 mr-0.5" />
                            Personalizado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Pago mensual</span>
                      <span className="text-lg font-bold">{formatCurrency(bank.monthlyPayment)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-royal-gray-600">Tasa anual:</span>
                        <span className="font-medium ml-1">{formatPercentage(bank.tasa)}</span>
                      </div>
                      <div>
                        <span className="text-royal-gray-600">CAT:</span>
                        <span className="font-medium ml-1">{formatPercentage(bank.cat)}</span>
                      </div>
                      <div>
                        <span className="text-royal-gray-600">Plazo:</span>
                        <span className="font-medium ml-1">{bank.term} meses</span>
                      </div>
                      <div>
                        <span className="text-royal-gray-600">Comisión:</span>
                        <span className="font-medium ml-1">{formatCurrency(bank.openingCommission)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <motion.button
                      onClick={() => onSelectBank(bank)}
                      className="w-full px-4 py-2 bg-royal-black text-white text-sm rounded-md flex items-center justify-center"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Ver amortización
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Lista completa de resultados */}
          <motion.div
            className="space-y-4"
            variants={listAnimation}
            initial="hidden"
            animate="visible"
          >
            {results.map((bank, index) => {
              const isExpanded = expandedBankId === bank.id || !compactView;
              const monthlySavings = calculateSavings(bank.monthlyPayment);
              const savingsPercentage = calculateSavingsPercentage(bank.monthlyPayment);
              
              return (
                <motion.div
                  key={bank.id}
                  className={`border-2 ${
                    index === 0 
                      ? 'border-green-500' 
                      : bank.hasCustomConfig
                        ? 'border-blue-500'
                        : 'border-royal-gray-300'
                  } rounded-md overflow-hidden`}
                  variants={itemAnimation}
                >
                  <div 
                    className={`p-4 cursor-pointer ${
                      index === 0 
                        ? 'bg-green-50' 
                        : bank.hasCustomConfig
                          ? 'bg-blue-50'
                          : 'bg-white'
                    }`}
                    onClick={() => toggleExpand(bank.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {React.isValidElement(bank.logo) ? (
                          <div className="mr-3 text-royal-black">{bank.logo}</div>
                        ) : (
                          <img src={bank.logo} alt={bank.nombre} className="h-8 mr-3" />
                        )}
                        <div>
                          <div className="font-bold text-lg">
                            {bank.nombre}
                            {bank.hasCustomConfig && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                                <IoCheckmarkCircleOutline className="h-3 w-3 mr-0.5" />
                                Personalizado
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-sm text-royal-gray-600">
                              Tasa: {formatPercentage(bank.tasa)}
                            </span>
                            <span className="text-sm text-royal-gray-600">
                              CAT: {formatPercentage(bank.cat)}
                            </span>
                            <span className="text-sm text-royal-gray-600">
                              Plazo: {bank.term} meses
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <div className="text-xl font-bold">{formatCurrency(bank.monthlyPayment)}</div>
                        <div className="text-sm text-royal-gray-600">mensual</div>
                        
                        {index === 0 && results.length > 1 && (
                          <div className="mt-1 text-xs text-green-600 font-medium">
                            La mejor opción
                          </div>
                        )}
                        
                        {index > 0 && savingsPercentage > 0 && (
                          <div className="mt-1 text-xs text-red-600">
                            {formatPercentage(savingsPercentage)} más caro que la mejor opción
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <motion.div
                      className="p-4 bg-white border-t border-royal-gray-200"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-bold mb-2">Detalles del crédito</h4>
                          <dl className="grid grid-cols-2 gap-y-2 text-sm">
                            <dt className="text-royal-gray-600">Monto financiado:</dt>
                            <dd className="font-medium">{formatCurrency(bank.financingAmount)}</dd>
                            
                            <dt className="text-royal-gray-600">Enganche:</dt>
                            <dd className="font-medium">{formatCurrency(bank.downPaymentAmount)} ({bank.downPaymentPercentage}%)</dd>
                            
                            <dt className="text-royal-gray-600">Tasa anual:</dt>
                            <dd className="font-medium">{formatPercentage(bank.tasa)}</dd>
                            
                            <dt className="text-royal-gray-600">CAT:</dt>
                            <dd className="font-medium">{formatPercentage(bank.cat)}</dd>
                            
                            <dt className="text-royal-gray-600">Plazo:</dt>
                            <dd className="font-medium">{bank.term} meses</dd>
                            
                            <dt className="text-royal-gray-600">Comisión apertura:</dt>
                            <dd className="font-medium">{formatCurrency(bank.openingCommission)} ({bank.comision}%)</dd>
                          </dl>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-bold mb-2">Resumen de pagos</h4>
                          <dl className="grid grid-cols-2 gap-y-2 text-sm">
                            <dt className="text-royal-gray-600">Pago mensual:</dt>
                            <dd className="font-medium">{formatCurrency(bank.monthlyPayment)}</dd>
                            
                            <dt className="text-royal-gray-600">Total a pagar:</dt>
                            <dd className="font-medium">{formatCurrency(bank.totalAmount)}</dd>
                            
                            <dt className="text-royal-gray-600">Intereses totales:</dt>
                            <dd className="font-medium">{formatCurrency(bank.totalInterest)}</dd>
                            
                            {monthlySavings > 0 && (
                              <>
                                <dt className="text-royal-gray-600">Ahorro mensual vs peor opción:</dt>
                                <dd className="font-medium text-green-600">{formatCurrency(monthlySavings)}</dd>
                                
                                <dt className="text-royal-gray-600">Ahorro total vs peor opción:</dt>
                                <dd className="font-medium text-green-600">{formatCurrency(monthlySavings * bank.term)}</dd>
                              </>
                            )}
                          </dl>
                        </div>
                      </div>
                      
                      {/* Barra visual de distribución del pago total */}
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-bold">Distribución del pago total</h4>
                          <span className="text-sm font-medium">{formatCurrency(bank.totalAmount)}</span>
                        </div>
                        
                        <div className="w-full h-8 bg-gray-200 rounded-md overflow-hidden flex">
                          <div 
                            className="h-full bg-blue-600 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(bank.financingAmount / bank.totalAmount) * 100}%` }}
                          >
                            Capital ({((bank.financingAmount / bank.totalAmount) * 100).toFixed(1)}%)
                          </div>
                          <div 
                            className="h-full bg-amber-500 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(bank.totalInterest / bank.totalAmount) * 100}%` }}
                          >
                            Interés ({((bank.totalInterest / bank.totalAmount) * 100).toFixed(1)}%)
                          </div>
                          <div 
                            className="h-full bg-purple-500 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(bank.openingCommission / bank.totalAmount) * 100}%` }}
                          >
                            Comisión ({((bank.openingCommission / bank.totalAmount) * 100).toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <motion.button
                          onClick={() => onSelectBank(bank)}
                          className="px-4 py-2 bg-royal-black text-white text-sm rounded-md flex items-center justify-center"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          Ver tabla de amortización
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default BankComparison;