import React, { useState } from 'react';
import Modal from './Modal';
import { motion } from 'framer-motion';

const CreditEvolutionModal = ({ isOpen, onClose, amortizationData, vehicleValue, financingAmount, term, rate, downPaymentAmount, cat, bankComision }) => {
  const [activeTab, setActiveTab] = useState('evolution');
  
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
  
  // Calcular depreciación del vehículo (aproximación)
  const calculateVehicleDepreciation = () => {
    // Depreciación promedio de un vehículo nuevo: 15-20% primer año, luego 10-15% anual
    const monthlyData = [];
    let currentValue = vehicleValue;
    
    // Depreciación mensual (aproximada)
    const firstYearMonthlyRate = 0.15 / 12; // 15% anual dividido por 12 meses
    const subsequentMonthlyRate = 0.10 / 12; // 10% anual dividido por 12 meses
    
    for (let i = 0; i <= term; i++) {
      if (i === 0) {
        monthlyData.push({
          month: i,
          value: currentValue
        });
      } else {
        // Mayor depreciación en el primer año
        const depreciationRate = i <= 12 ? firstYearMonthlyRate : subsequentMonthlyRate;
        currentValue = currentValue * (1 - depreciationRate);
        
        monthlyData.push({
          month: i,
          value: currentValue
        });
      }
    }
    
    return monthlyData;
  };
  
  // Datos de depreciación del vehículo
  const vehicleDepreciationData = calculateVehicleDepreciation();
  
  // Calcular el valor total pagado en cada mes
  const calculateTotalPaidByMonth = () => {
    const monthlyData = [];
    let totalPaid = downPaymentAmount;
    
    // Valor inicial (enganche)
    monthlyData.push({
      month: 0,
      totalPaid,
      principal: 0,
      interest: 0
    });
    
    // Acumular pagos mensuales
    let principalPaid = 0;
    let interestPaid = 0;
    
    for (let i = 0; i < amortizationData.length; i++) {
      const payment = amortizationData[i];
      principalPaid += payment.principalPayment;
      interestPaid += payment.interestPayment;
      totalPaid += payment.payment;
      
      monthlyData.push({
        month: i + 1,
        totalPaid,
        principal: principalPaid,
        interest: interestPaid
      });
    }
    
    return monthlyData;
  };
  
  // Datos de pagos acumulados por mes
  const totalPaidData = calculateTotalPaidByMonth();
  
  // Calcular costos reales del crédito
  const calculateRealCosts = () => {
    // Monto financiado
    const principal = financingAmount;
    
    // Interés total
    const totalInterest = amortizationData.reduce((sum, payment) => sum + payment.interestPayment, 0);
    
    // Comisión por apertura
    const openingFee = (financingAmount * bankComision) / 100;
    
    // Costo total del crédito
    const totalCost = totalInterest + openingFee;
    
    // Porcentaje del costo adicional respecto al monto financiado
    const costPercentage = (totalCost / principal) * 100;
    
    return {
      principal,
      totalInterest,
      openingFee,
      totalCost,
      costPercentage
    };
  };
  
  // Datos de costos reales
  const realCosts = calculateRealCosts();
  
  // Generar puntos de tiempo clave para mostrar en gráficas (inicio, 25%, 50%, 75%, final)
  const getKeyTimepoints = () => {
    return [
      0,
      Math.floor(term * 0.25),
      Math.floor(term * 0.5),
      Math.floor(term * 0.75),
      term
    ];
  };
  
  const keyTimepoints = getKeyTimepoints();
  
  // Determinar en qué momento el total pagado supera el valor del vehículo
  const getBreakEvenPoint = () => {
    for (let i = 0; i < totalPaidData.length; i++) {
      if (totalPaidData[i].totalPaid >= vehicleValue) {
        return i;
      }
    }
    return term; // Si nunca se alcanza (improbable)
  };
  
  const breakEvenPoint = getBreakEvenPoint();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Evolución del Crédito" size="lg">
      <div className="space-y-6">
        {/* Pestañas de navegación */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'evolution' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('evolution')}
          >
            Evolución del Crédito
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'vehicleValue' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('vehicleValue')}
          >
            Valor Real del Vehículo
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'trueCost' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('trueCost')}
          >
            Costo Real del Crédito
          </button>
        </div>
        
        {/* Contenido de la pestaña: Evolución del Crédito */}
        {activeTab === 'evolution' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Evolución del Saldo e Intereses</h3>
              <p className="text-sm text-gray-600 mb-4">
                Visualiza cómo evoluciona el saldo de tu deuda y la acumulación de intereses a lo largo del tiempo.
              </p>
              
              {/* Gráfico de evolución del saldo */}
              <div className="bg-white p-4 border border-gray-200 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Saldo del crédito a lo largo del tiempo</span>
                  <span className="text-sm text-blue-600 font-medium">
                    Plazo: {term} meses
                  </span>
                </div>
                
                <div className="h-60 relative">
                  {/* Eje Y - Montos */}
                  <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
                    <span>{formatCurrency(financingAmount)}</span>
                    <span>{formatCurrency(financingAmount * 0.75)}</span>
                    <span>{formatCurrency(financingAmount * 0.5)}</span>
                    <span>{formatCurrency(financingAmount * 0.25)}</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                  
                  {/* Área principal del gráfico */}
                  <div className="ml-16 h-full flex items-end relative">
                    {/* Líneas de referencia horizontales */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      <div className="h-px bg-gray-200 w-full"></div>
                      <div className="h-px bg-gray-200 w-full"></div>
                      <div className="h-px bg-gray-200 w-full"></div>
                      <div className="h-px bg-gray-200 w-full"></div>
                      <div className="h-px bg-gray-200 w-full"></div>
                    </div>
                    
                    {/* Barras para cada punto clave del tiempo */}
                    <div className="w-full h-full flex justify-between items-end">
                      {keyTimepoints.map((month, index) => {
                        // Ensure amortizationData has elements
                        if (amortizationData.length === 0 && month !== 0) {
                          return null;
                        }
                        
                        const dataIndex = Math.min(month, amortizationData.length - 1);
                        let balance = month === 0 ? financingAmount : 0;
                        
                        // Safely access the amortizationData
                        if (month !== 0 && dataIndex >= 0 && dataIndex < amortizationData.length) {
                          const paymentData = amortizationData[dataIndex > 0 ? dataIndex - 1 : 0];
                          if (paymentData && typeof paymentData.balance !== 'undefined') {
                            balance = paymentData.balance;
                          }
                        }
                        
                        const heightPercentage = (balance / financingAmount) * 100;
                        
                        return (
                          <div key={`balance-${month}`} className="flex flex-col items-center">
                            <div className="relative flex-1 w-16">
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPercentage}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm"
                              ></motion.div>
                              <div className="absolute bottom-0 left-0 w-full text-center">
                                <div className="text-xs font-medium text-blue-700 mt-1">
                                  {formatCurrency(balance)}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              {month === 0 ? 'Inicio' : `Mes ${month}`}
                              {month === term ? ' (Final)' : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-sm text-gray-600">
                  <h4 className="font-medium mb-1">Progresión del Saldo</h4>
                  <p>Al inicio de tu crédito, la mayor parte de tu pago mensual se destina a intereses. A medida que avanza el plazo, una porción cada vez mayor se aplica al capital, acelerando la reducción del saldo.</p>
                </div>
              </div>
              
              {/* Gráfico de composición de pagos a lo largo del tiempo */}
              <div className="bg-white p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Composición del pago mensual a lo largo del tiempo</span>
                </div>
                
                <div className="h-60 relative">
                  {/* Eje Y - Porcentajes */}
                  <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>
                  
                  {/* Área principal del gráfico */}
                  <div className="ml-12 h-full flex items-end relative">
                    {/* Líneas de referencia horizontales */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      <div className="h-px bg-gray-200 w-full"></div>
                      <div className="h-px bg-gray-200 w-full"></div>
                      <div className="h-px bg-gray-200 w-full"></div>
                      <div className="h-px bg-gray-200 w-full"></div>
                      <div className="h-px bg-gray-200 w-full"></div>
                    </div>
                    
                    {/* Barras apiladas para cada punto clave del tiempo */}
                    <div className="w-full h-full flex justify-between items-end">
                      {keyTimepoints.filter(month => month > 0).map((month, index) => {
                        // Skip if no data is available
                        if (amortizationData.length === 0) {
                          return null;
                        }
                        
                        const dataIndex = Math.min(month, amortizationData.length) - 1;
                        
                        // Check if we have valid data at this index
                        if (dataIndex < 0 || dataIndex >= amortizationData.length || !amortizationData[dataIndex]) {
                          return null;
                        }
                        
                        const payment = amortizationData[dataIndex];
                        const principalPercentage = payment.payment ? (payment.principalPayment / payment.payment) * 100 : 0;
                        const interestPercentage = payment.payment ? (payment.interestPayment / payment.payment) * 100 : 0;
                        
                        return (
                          <div key={`payment-${month}`} className="flex flex-col items-center">
                            <div className="h-full w-16">
                              <div className="h-full w-full flex flex-col-reverse">
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${principalPercentage}%` }}
                                  transition={{ duration: 1, delay: index * 0.1 }}
                                  className="w-full bg-teal-500"
                                ></motion.div>
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${interestPercentage}%` }}
                                  transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                                  className="w-full bg-amber-500"
                                ></motion.div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Mes {month}
                              {month === term ? ' (Final)' : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Leyenda */}
                <div className="flex justify-center mt-4 gap-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-teal-500 mr-1"></div>
                    <span className="text-xs">Capital</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-amber-500 mr-1"></div>
                    <span className="text-xs">Interés</span>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>Observa cómo la proporción de capital vs. interés cambia con el tiempo. Al inicio del crédito pagas más intereses, mientras que hacia el final pagas principalmente capital.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Contenido de la pestaña: Valor Real del Vehículo */}
        {activeTab === 'vehicleValue' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Valor Real del Vehículo vs. Saldo del Crédito</h3>
              <p className="text-sm text-gray-600 mb-4">
                Compara el valor de tu vehículo a lo largo del tiempo con el saldo pendiente de tu crédito.
              </p>
              
              {/* Gráfico comparativo: Valor del vehículo vs. Saldo del crédito */}
              <div className="bg-white p-4 border border-gray-200 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Valor del vehículo vs. Saldo pendiente</span>
                  <span className="text-sm text-blue-600 font-medium">
                    Valor inicial: {formatCurrency(vehicleValue)}
                  </span>
                </div>
                
                <div className="h-64 relative">
                  {/* Eje Y - Valores */}
                  <div className="absolute top-0 left-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
                    <span>{formatCurrency(vehicleValue)}</span>
                    <span>{formatCurrency(vehicleValue * 0.75)}</span>
                    <span>{formatCurrency(vehicleValue * 0.5)}</span>
                    <span>{formatCurrency(vehicleValue * 0.25)}</span>
                    <span>{formatCurrency(0)}</span>
                  </div>
                  
                  {/* Área principal del gráfico */}
                  <div className="ml-20 h-full relative flex">
                    {/* Líneas de referencia horizontales */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      <div className="h-px bg-gray-200 w-full"></div>
                      <div className="h-px bg-gray-200 w-full"></div>
                      <div className="h-px bg-gray-200 w-full"></div>
                      <div className="h-px bg-gray-200 w-full"></div>
                      <div className="h-px bg-gray-200 w-full"></div>
                    </div>
                    
                    {/* Líneas del gráfico */}
                    <div className="w-full h-full flex">
                      {/* Línea para el valor del vehículo */}
                      <svg className="w-full h-full" viewBox={`0 0 ${term} 100`} preserveAspectRatio="none">
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 2 }}
                          d={`M 0,0 ${vehicleDepreciationData.map((point, index) => 
                            `L ${point.month},${100 - (point.value / vehicleValue) * 100}`
                          ).join(' ')}`}
                          fill="none"
                          stroke="#4f46e5"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      {/* Línea para el saldo del crédito */}
                      <svg className="w-full h-full absolute inset-0" viewBox={`0 0 ${term} 100`} preserveAspectRatio="none">
                        {amortizationData && amortizationData.length > 0 && (
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 0.5 }}
                            d={`M 0,${100 - 0} ${amortizationData.map((point, index) => 
                              point && typeof point.balance !== 'undefined' 
                                ? `L ${index + 1},${100 - (point.balance / vehicleValue) * 100}`
                                : ''
                            ).join(' ')}`}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="5,5"
                          />
                        )}
                      </svg>
                    </div>
                    
                    {/* Marcador del punto de equilibrio */}
                    {breakEvenPoint > 0 && breakEvenPoint < term && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.5 }}
                        className="absolute"
                        style={{
                          left: `${(breakEvenPoint / term) * 100}%`,
                          bottom: 0,
                          height: '100%'
                        }}
                      >
                        <div className="h-full border-l-2 border-dashed border-green-500 flex flex-col justify-center">
                          <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            Punto de equilibrio<br />
                            Mes {breakEvenPoint}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
                
                {/* Leyenda */}
                <div className="flex justify-center mt-4 gap-6">
                  <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-indigo-600 mr-1"></div>
                    <span className="text-xs">Valor del vehículo</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-0.5 bg-red-500 mr-1 border-b border-dashed"></div>
                    <span className="text-xs">Saldo del crédito</span>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>El gráfico muestra la depreciación estimada del vehículo comparada con la reducción del saldo del crédito. El punto donde las líneas se cruzan (punto de equilibrio) indica cuando dejas de deber más de lo que vale tu vehículo.</p>
                </div>
              </div>
              
              {/* Tabla de valores clave */}
              <div className="bg-white p-4 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-semibold mb-3">Valores clave en momentos específicos</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Momento</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor del vehículo</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Saldo del crédito</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Diferencia</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[0, Math.floor(term * 0.25), Math.floor(term * 0.5), Math.floor(term * 0.75), term].map(month => {
                        const vehicleValueAtMonth = vehicleDepreciationData[month]?.value || 0;
                        const loanBalanceAtMonth = month === 0 
                          ? financingAmount 
                          : (amortizationData[month - 1]?.balance || 0);
                        const difference = vehicleValueAtMonth - loanBalanceAtMonth;
                        
                        return (
                          <tr key={`month-${month}`}>
                            <td className="px-4 py-2 text-sm">
                              {month === 0 ? 'Inicio' : `Mes ${month}`}
                              {month === term ? ' (Final)' : ''}
                            </td>
                            <td className="px-4 py-2 text-sm">{formatCurrency(vehicleValueAtMonth)}</td>
                            <td className="px-4 py-2 text-sm">{formatCurrency(loanBalanceAtMonth)}</td>
                            <td className={`px-4 py-2 text-sm font-medium ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(difference)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>La tabla muestra los valores del vehículo y el saldo del crédito en momentos clave del plazo. Una diferencia positiva (verde) significa que el vehículo vale más que lo que debes. Una diferencia negativa (roja) indica que debes más de lo que vale tu vehículo ("underwater" o con capital negativo).</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Contenido de la pestaña: Costo Real del Crédito */}
        {activeTab === 'trueCost' && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Costo Real del Crédito</h3>
              <p className="text-sm text-gray-600 mb-4">
                Análisis detallado de todos los costos asociados a tu crédito automotriz.
              </p>
              
              {/* Resumen de costos */}
              <div className="bg-white p-4 border border-gray-200 rounded-lg mb-6">
                <h4 className="text-sm font-semibold mb-4">Desglose del costo total</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-xs text-blue-700 uppercase font-medium">Monto financiado</div>
                    <div className="text-2xl font-bold text-blue-800 mt-1">
                      {formatCurrency(realCosts.principal)}
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <div className="text-xs text-amber-700 uppercase font-medium">Intereses totales</div>
                    <div className="text-2xl font-bold text-amber-800 mt-1">
                      {formatCurrency(realCosts.totalInterest)}
                    </div>
                    <div className="text-xs text-amber-600 mt-1">
                      ({((realCosts.totalInterest / realCosts.principal) * 100).toFixed(1)}% del monto financiado)
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-xs text-purple-700 uppercase font-medium">Comisión por apertura</div>
                    <div className="text-2xl font-bold text-purple-800 mt-1">
                      {formatCurrency(realCosts.openingFee)}
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      ({bankComision}% del monto financiado)
                    </div>
                  </div>
                </div>
                
                {/* Gráfico circular de distribución de costos */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-6">
                  <div className="w-full max-w-xs">
                    <h5 className="text-sm font-medium text-center mb-4">Distribución del costo total</h5>
                    
                    {/* Gráfico con proporción visual */}
                    <div className="w-full h-10 bg-gray-200 rounded-full overflow-hidden flex">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(realCosts.principal / (realCosts.principal + realCosts.totalCost)) * 100}%` }}
                        transition={{ duration: 1.5 }}
                        className="h-full bg-blue-600 flex items-center justify-center text-xs text-white font-medium"
                      >
                        Principal
                      </motion.div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(realCosts.totalInterest / (realCosts.principal + realCosts.totalCost)) * 100}%` }}
                        transition={{ duration: 1.5, delay: 0.3 }}
                        className="h-full bg-amber-500 flex items-center justify-center text-xs text-white font-medium"
                      >
                        Intereses
                      </motion.div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(realCosts.openingFee / (realCosts.principal + realCosts.totalCost)) * 100}%` }}
                        transition={{ duration: 1.5, delay: 0.6 }}
                        className="h-full bg-purple-500 flex items-center justify-center text-xs text-white font-medium"
                      >
                        Comisión
                      </motion.div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  <div className="w-full max-w-xs">
                    <h5 className="text-sm font-medium text-center mb-4">¿Cuánto pagas adicionalmente?</h5>
                    
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800">
                          {((realCosts.totalCost / realCosts.principal) * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          adicional sobre el monto financiado
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div>
                          <div className="text-xs text-gray-500">Monto financiado</div>
                          <div className="font-medium">{formatCurrency(realCosts.principal)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Costo adicional</div>
                          <div className="font-medium">{formatCurrency(realCosts.totalCost)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Total a pagar</div>
                          <div className="font-medium">{formatCurrency(realCosts.principal + realCosts.totalCost)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Información sobre CAT */}
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-sm font-medium">CAT (Costo Anual Total)</h5>
                    <div className="px-3 py-1 bg-gray-800 text-white text-sm font-bold rounded-full">
                      {formatPercentage(cat)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    El CAT (Costo Anual Total) es un indicador que representa el costo total del crédito expresado en términos porcentuales anuales. Incluye la tasa de interés, comisiones y otros costos asociados al crédito.
                  </p>
                  
                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-gray-600">Tasa de interés anual:</span>
                      <span className="font-medium ml-1">{formatPercentage(rate)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Diferencia:</span>
                      <span className="font-medium ml-1">{formatPercentage(cat - rate)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Comparativa con otros productos */}
              <div className="bg-white p-4 border border-gray-200 rounded-lg">
                <h4 className="text-sm font-semibold mb-4">Lo que debes considerar</h4>
                
                <div className="space-y-4 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">El costo real va más allá de la tasa de interés.</span> Los intereses totales que pagarás durante la vida del crédito representan un {((realCosts.totalInterest / realCosts.principal) * 100).toFixed(1)}% adicional sobre el monto financiado.
                  </p>
                  
                  <p>
                    <span className="font-medium">El CAT es más alto que la tasa de interés anual.</span> Esto se debe a que incluye otros costos como la comisión por apertura y seguros obligatorios. Siempre compara el CAT (no solo la tasa) entre diferentes opciones de financiamiento.
                  </p>
                  
                  <p>
                    <span className="font-medium">En los créditos automotrices, el valor del vehículo disminuye más rápido que tu deuda al inicio.</span> Esto puede resultar en un período donde debes más de lo que vale tu vehículo. Es recomendable dar un enganche mayor para evitar esta situación.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end mt-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreditEvolutionModal;