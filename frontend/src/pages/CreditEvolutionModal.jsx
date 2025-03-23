import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, PolarArea } from 'react-chartjs-2';

// Registrar los componentes que necesitamos de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
    
    // Evaluación cualitativa del costo
    let costRating = "";
    if (costPercentage <= 15) {
      costRating = "Bueno";
    } else if (costPercentage <= 25) {
      costRating = "Enorme";
    } else if (costPercentage <= 35) {
      costRating = "Terrible";
    } else {
      costRating = "Feo";
    }
    
    // Puntuación numérica para el gráfico de radar (0-100)
    const costScore = Math.max(0, Math.min(100, 100 - (costPercentage * 2)));
    
    // Evaluación según CAT vs tasa nominal
    const catVsRateDiff = cat - rate;
    let rateRating = "";
    if (catVsRateDiff <= 3) {
      rateRating = "Bueno";
    } else if (catVsRateDiff <= 5) {
      rateRating = "Enorme";
    } else if (catVsRateDiff <= 8) {
      rateRating = "Terrible";
    } else {
      rateRating = "Feo";
    }
    
    // Puntuación de la diferencia entre CAT y tasa (0-100)
    const rateScore = Math.max(0, Math.min(100, 100 - (catVsRateDiff * 10)));
    
    // Evaluación según plazo vs depreciación
    const termRating = term <= 36 ? "Bueno" : term <= 48 ? "Enorme" : term <= 60 ? "Terrible" : "Feo";
    
    // Puntuación del plazo (0-100)
    const termScore = Math.max(0, Math.min(100, 100 - ((term / 60) * 100)));
    
    // Puntuación general del crédito (promedio ponderado)
    const overallScore = (costScore * 0.5) + (rateScore * 0.3) + (termScore * 0.2);
    let overallRating = "";
    if (overallScore >= 75) {
      overallRating = "Bueno";
    } else if (overallScore >= 50) {
      overallRating = "Enorme";
    } else if (overallScore >= 25) {
      overallRating = "Terrible";
    } else {
      overallRating = "Feo";
    }
    
    return {
      principal,
      totalInterest,
      openingFee,
      totalCost,
      costPercentage,
      costRating,
      costScore,
      rateRating,
      rateScore,
      termRating,
      termScore,
      overallRating,
      overallScore
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

  // Obtener datos para la gráfica de evolución del saldo
  const getLoanBalanceChartData = () => {
    const labels = Array.from({ length: term + 1 }, (_, i) => i);
    
    // Datos del saldo del crédito
    const balances = [];
    balances.push(financingAmount); // Saldo inicial
    
    for (let i = 0; i < amortizationData.length; i++) {
      if (amortizationData[i] && typeof amortizationData[i].balance !== 'undefined') {
        balances.push(amortizationData[i].balance);
      }
    }
    
    // Rellenar con el último valor si faltan datos
    while (balances.length <= term) {
      balances.push(balances[balances.length - 1] || 0);
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Saldo del crédito',
          data: balances,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 1)',
          tension: 0.3,
          pointRadius: (ctx) => {
            const index = ctx.dataIndex;
            return keyTimepoints.includes(index) ? 5 : 0;
          },
          pointBackgroundColor: 'white',
          pointBorderColor: 'rgba(59, 130, 246, 1)',
          pointBorderWidth: 2
        }
      ]
    };
  };
  
  // Obtener datos para la gráfica de composición del pago mensual
  const getPaymentCompositionChartData = () => {
    const labels = keyTimepoints.filter(month => month > 0).map(month => `Mes ${month}`);
    
    const principalData = [];
    const interestData = [];
    
    keyTimepoints.filter(month => month > 0).forEach(month => {
      const dataIndex = Math.min(month, amortizationData.length) - 1;
      
      if (dataIndex >= 0 && dataIndex < amortizationData.length && amortizationData[dataIndex]) {
        const payment = amortizationData[dataIndex];
        principalData.push(payment.principalPayment);
        interestData.push(payment.interestPayment);
      } else {
        principalData.push(0);
        interestData.push(0);
      }
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Capital',
          data: principalData,
          backgroundColor: 'rgba(20, 184, 166, 0.8)',
          borderColor: 'rgba(20, 184, 166, 1)',
          borderWidth: 1
        },
        {
          label: 'Interés',
          data: interestData,
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: 'rgba(245, 158, 11, 1)',
          borderWidth: 1
        }
      ]
    };
  };
  
  // Obtener datos para la gráfica de Valor del Vehículo vs. Saldo del Crédito
  const getVehicleVsLoanChartData = () => {
    const labels = Array.from({ length: term + 1 }, (_, i) => i);
    
    // Datos del valor del vehículo
    const vehicleValues = vehicleDepreciationData.map(data => data.value);
    
    // Datos del saldo del crédito
    const loanBalances = [financingAmount];
    
    for (let i = 0; i < amortizationData.length; i++) {
      if (amortizationData[i] && typeof amortizationData[i].balance !== 'undefined') {
        loanBalances.push(amortizationData[i].balance);
      }
    }
    
    // Rellenar con el último valor si faltan datos
    while (loanBalances.length <= term) {
      loanBalances.push(loanBalances[loanBalances.length - 1] || 0);
    }
    
    // Calcular la diferencia para mostrar área sombreada
    const differenceData = vehicleValues.map((vehicleValue, index) => {
      return vehicleValue - (loanBalances[index] || 0);
    });
    
    return {
      labels,
      datasets: [
        {
          label: 'Valor del vehículo',
          data: vehicleValues,
          fill: false,
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          borderColor: 'rgba(79, 70, 229, 1)',
          tension: 0.2,
          pointRadius: (ctx) => {
            const index = ctx.dataIndex;
            return keyTimepoints.includes(index) ? 5 : 0;
          },
          pointBackgroundColor: 'white',
          pointBorderColor: 'rgba(79, 70, 229, 1)',
          pointBorderWidth: 2,
          order: 1
        },
        {
          label: 'Saldo del crédito',
          data: loanBalances,
          fill: false,
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderDash: [5, 5],
          tension: 0.2,
          pointRadius: (ctx) => {
            const index = ctx.dataIndex;
            return keyTimepoints.includes(index) ? 5 : 0;
          },
          pointBackgroundColor: 'white',
          pointBorderColor: 'rgba(239, 68, 68, 1)',
          pointBorderWidth: 2,
          order: 2
        },
        {
          label: 'Diferencia',
          data: differenceData,
          fill: true,
          backgroundColor: (ctx) => {
            const value = ctx.raw;
            return value >= 0 
              ? 'rgba(16, 185, 129, 0.1)' 
              : 'rgba(239, 68, 68, 0.1)';
          },
          borderColor: 'transparent',
          pointRadius: 0,
          order: 0
        }
      ]
    };
  };
  
  // Obtener datos para la gráfica de distribución de costos
  const getCostDistributionChartData = () => {
    return {
      labels: ['Monto financiado', 'Intereses totales', 'Comisión por apertura'],
      datasets: [
        {
          data: [realCosts.principal, realCosts.totalInterest, realCosts.openingFee],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(139, 92, 246, 1)'
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Opciones comunes para gráficos de Chart.js
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 15,
          padding: 10,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#333',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 4,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + formatCurrency(context.raw);
          }
        }
      }
    }
  };
  
  // Opciones específicas para el gráfico de balance del préstamo
  const loanBalanceOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          title: function(context) {
            return `Mes ${context[0].label}`;
          },
          label: function(context) {
            return `Saldo: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Mes',
          font: {
            size: 12
          }
        },
        grid: {
          display: false
        },
        ticks: {
          callback: function(value) {
            if (keyTimepoints.includes(value)) {
              return value === 0 ? 'Inicio' : 
                     value === term ? 'Final' :
                     `Mes ${value}`;
            }
            return '';
          }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Saldo (MXN)',
          font: {
            size: 12
          }
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };
  
  // Opciones específicas para el gráfico de composición de pagos
  const paymentCompositionOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        stacked: true,
        title: {
          display: true,
          text: 'Monto (MXN)',
          font: {
            size: 12
          }
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };
  
  // Opciones específicas para el gráfico de valor del vehículo vs saldo
  const vehicleVsLoanOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          title: function(context) {
            return `Mes ${context[0].label}`;
          },
          label: function(context) {
            if (context.dataset.label === 'Diferencia') {
              const value = context.raw;
              const sign = value >= 0 ? '+' : '';
              return `Diferencia: ${sign}${formatCurrency(value)}`;
            }
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          },
          labelTextColor: function(context) {
            if (context.dataset.label === 'Diferencia') {
              return context.raw >= 0 ? '#10b981' : '#ef4444';
            }
            return '#333';
          }
        }
      },
      annotation: {
        annotations: {
          breakEvenPoint: {
            type: 'line',
            mode: 'vertical',
            scaleID: 'x',
            value: breakEvenPoint,
            borderColor: 'rgba(16, 185, 129, 0.7)',
            borderWidth: 2,
            borderDash: [6, 3],
            label: {
              display: true,
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'rgba(16, 185, 129, 1)',
              content: `Punto de equilibrio (Mes ${breakEvenPoint})`,
              position: 'top'
            }
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Mes',
          font: {
            size: 12
          }
        },
        grid: {
          display: false
        },
        ticks: {
          callback: function(value) {
            if (keyTimepoints.includes(value)) {
              return value === 0 ? 'Inicio' : 
                     value === term ? 'Final' :
                     `Mes ${value}`;
            }
            return '';
          }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Valor (MXN)',
          font: {
            size: 12
          }
        },
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };
  
  // Opciones específicas para el gráfico de distribución de costos
  const costDistributionOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '50%'
  };

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
              
              {/* Gráfico de evolución del saldo - CHART.JS */}
              <div className="bg-white p-4 border border-gray-200 rounded-lg mb-6">
                <div className="flex justify-between mb-4">
                  <span className="text-sm font-medium">Saldo del crédito a lo largo del tiempo</span>
                  <span className="text-sm text-blue-600 font-medium">
                    Plazo: {term} meses
                  </span>
                </div>
                
                <motion.div 
                  className="h-64 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Line 
                    data={getLoanBalanceChartData()}
                    options={loanBalanceOptions}
                  />
                </motion.div>
                
                <div className="mt-6 text-sm text-gray-600">
                  <h4 className="font-medium mb-1">Progresión del Saldo</h4>
                  <p>Al inicio de tu crédito, la mayor parte de tu pago mensual se destina a intereses. A medida que avanza el plazo, una porción cada vez mayor se aplica al capital, acelerando la reducción del saldo.</p>
                </div>
              </div>
              
              {/* Gráfico de composición de pagos a lo largo del tiempo - CHART.JS */}
              <div className="bg-white p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Composición del pago mensual a lo largo del tiempo</span>
                </div>
                
                <motion.div 
                  className="h-64 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Bar 
                    data={getPaymentCompositionChartData()}
                    options={paymentCompositionOptions}
                  />
                </motion.div>
                
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
              
              {/* Gráfico comparativo: Valor del vehículo vs. Saldo del crédito - CHART.JS */}
              <div className="bg-white p-4 border border-gray-200 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Valor del vehículo vs. Saldo pendiente</span>
                  <span className="text-sm text-blue-600 font-medium">
                    Valor inicial: {formatCurrency(vehicleValue)}
                  </span>
                </div>
                
                <motion.div 
                  className="h-64 w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Line 
                    data={getVehicleVsLoanChartData()}
                    options={vehicleVsLoanOptions}
                  />
                </motion.div>
                
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
              
              {/* Evaluación cualitativa del crédito - NUEVA SECCIÓN */}
              <div className="bg-white p-4 border border-gray-200 rounded-lg mb-6">
                <h4 className="text-sm font-semibold mb-3">Evaluación cualitativa de tu crédito</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Calificación general */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h5 className="text-xs uppercase font-medium text-gray-500 mb-2">Calificación general</h5>
                    
                    <div className="flex flex-col items-center justify-center">
                      <div className={`text-4xl font-bold mb-2 ${
                        realCosts.overallRating === 'Bueno' ? 'text-emerald-600' :
                        realCosts.overallRating === 'Enorme' ? 'text-amber-600' :
                        realCosts.overallRating === 'Terrible' ? 'text-orange-600' :
                        'text-red-600'
                      }`}>
                        {realCosts.overallRating}
                      </div>
                      
                      {/* Medidor visual */}
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                        <motion.div 
                          className={`h-4 rounded-full ${
                            realCosts.overallRating === 'Bueno' ? 'bg-emerald-500' :
                            realCosts.overallRating === 'Enorme' ? 'bg-amber-500' :
                            realCosts.overallRating === 'Terrible' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${realCosts.overallScore}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        ></motion.div>
                      </div>
                      
                      <div className="text-sm text-gray-600 text-center">
                        Este crédito tiene un costo adicional de <span className="font-medium">{((realCosts.totalCost / realCosts.principal) * 100).toFixed(1)}%</span> sobre el monto financiado.
                      </div>
                    </div>
                  </div>
                  
                  {/* Gráfico PolarArea con los factores de evaluación */}
                  <div className="h-64">
                    <PolarArea 
                      data={{
                        labels: ['Costo Adicional', 'CAT vs Tasa', 'Plazo'],
                        datasets: [
                          {
                            label: 'Calificación (mayor es mejor)',
                            data: [realCosts.costScore, realCosts.rateScore, realCosts.termScore],
                            backgroundColor: [
                              'rgba(16, 185, 129, 0.7)',
                              'rgba(245, 158, 11, 0.7)',
                              'rgba(99, 102, 241, 0.7)'
                            ],
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          r: {
                            max: 100,
                            min: 0,
                            ticks: {
                              display: false
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              boxWidth: 12,
                              padding: 15,
                              font: {
                                size: 11
                              }
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const value = context.raw;
                                let rating = "";
                                if (value >= 75) rating = "Bueno";
                                else if (value >= 50) rating = "Enorme";
                                else if (value >= 25) rating = "Terrible";
                                else rating = "Feo";
                                
                                return `${context.label}: ${rating} (${value.toFixed(1)}/100)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                {/* Detalles de la calificación */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className={`p-3 rounded-lg ${
                    realCosts.costRating === 'Bueno' ? 'bg-emerald-50 border border-emerald-200' :
                    realCosts.costRating === 'Enorme' ? 'bg-amber-50 border border-amber-200' :
                    realCosts.costRating === 'Terrible' ? 'bg-orange-50 border border-orange-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    <div className="text-xs uppercase font-medium mb-1 text-gray-500">Costo Adicional</div>
                    <div className={`text-lg font-bold ${
                      realCosts.costRating === 'Bueno' ? 'text-emerald-600' :
                      realCosts.costRating === 'Enorme' ? 'text-amber-600' :
                      realCosts.costRating === 'Terrible' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {realCosts.costRating}
                    </div>
                    <div className="text-xs mt-1 text-gray-600">
                      {realCosts.costPercentage.toFixed(1)}% sobre monto financiado
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${
                    realCosts.rateRating === 'Bueno' ? 'bg-emerald-50 border border-emerald-200' :
                    realCosts.rateRating === 'Enorme' ? 'bg-amber-50 border border-amber-200' :
                    realCosts.rateRating === 'Terrible' ? 'bg-orange-50 border border-orange-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    <div className="text-xs uppercase font-medium mb-1 text-gray-500">CAT vs Tasa Nominal</div>
                    <div className={`text-lg font-bold ${
                      realCosts.rateRating === 'Bueno' ? 'text-emerald-600' :
                      realCosts.rateRating === 'Enorme' ? 'text-amber-600' :
                      realCosts.rateRating === 'Terrible' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {realCosts.rateRating}
                    </div>
                    <div className="text-xs mt-1 text-gray-600">
                      Diferencia: {formatPercentage(cat - rate)}
                    </div>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${
                    realCosts.termRating === 'Bueno' ? 'bg-emerald-50 border border-emerald-200' :
                    realCosts.termRating === 'Enorme' ? 'bg-amber-50 border border-amber-200' :
                    realCosts.termRating === 'Terrible' ? 'bg-orange-50 border border-orange-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    <div className="text-xs uppercase font-medium mb-1 text-gray-500">Plazo del Crédito</div>
                    <div className={`text-lg font-bold ${
                      realCosts.termRating === 'Bueno' ? 'text-emerald-600' :
                      realCosts.termRating === 'Enorme' ? 'text-amber-600' :
                      realCosts.termRating === 'Terrible' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {realCosts.termRating}
                    </div>
                    <div className="text-xs mt-1 text-gray-600">
                      {term} meses
                    </div>
                  </div>
                </div>
              </div>
              
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
                
                {/* Gráfico circular de distribución de costos - CHART.JS */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-6">
                  <motion.div 
                    className="w-full md:w-1/2 h-60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Doughnut 
                      data={getCostDistributionChartData()}
                      options={costDistributionOptions}
                    />
                  </motion.div>
                  
                  <div className="w-full md:w-1/2">
                    <h5 className="text-sm font-medium text-center mb-4">¿Cuánto pagas adicionalmente?</h5>
                    
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <div className="text-center">
                        <motion.div 
                          className="text-3xl font-bold text-gray-800"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          {((realCosts.totalCost / realCosts.principal) * 100).toFixed(1)}%
                        </motion.div>
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