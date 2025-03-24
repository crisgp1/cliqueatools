import React from 'react';
import { motion } from 'framer-motion';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import { formatCurrency, formatPercentage, calculateCreditRatings } from './utils/CreditUtils';

/**
 * Componente para mostrar la vista previa del crédito seleccionado
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.calculationPreview - Objeto con datos calculados para vista previa
 * @param {number} props.vehiclesValue - Valor total de los vehículos
 * @param {number} props.term - Plazo seleccionado en meses
 * @param {boolean} props.useCustomRate - Indicador de uso de tasa personalizada
 * @param {number|string} props.customRate - Valor de tasa personalizada
 * @param {boolean} props.useCustomCat - Indicador de uso de CAT personalizado
 * @param {number|string} props.customCat - Valor de CAT personalizado
 * @returns {JSX.Element} - Componente de vista previa del crédito
 */
const CreditPreview = ({
  calculationPreview,
  vehiclesValue,
  term,
  useCustomRate,
  customRate,
  useCustomCat,
  customCat
}) => {
  if (!calculationPreview) return null;

  // Animaciones
  const previewAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    }
  };
  
  // Calcular calificaciones para la evaluación del crédito
  const ratings = calculateCreditRatings(
    calculationPreview, 
    vehiclesValue, 
    term, 
    useCustomRate, 
    customRate, 
    useCustomCat, 
    customCat
  );
  
  return (
    <motion.div 
      className="govuk-form-section"
      variants={previewAnimation}
      initial="hidden"
      animate="visible"
    >
      {/* Gráfica progresiva de valor del vehículo vs valor total pagado */}
      <div className="mb-6 border-2 border-gray-300 rounded-md p-4 bg-gray-50">
        <h4 className="govuk-form-section-subtitle mb-3 flex justify-between">
          <span>Comparativa de costos del vehículo</span>
          <span className="text-sm font-bold bg-gray-700 text-white px-3 py-1 rounded-full">
            {formatCurrency(vehiclesValue)}
          </span>
        </h4>
        
        <div className="flex flex-col space-y-6">
          {/* Comparación del valor del vehículo vs costo total - Reemplazo con gráfico de barras */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Costo total vs. Valor del vehículo</span>
              <span className="text-sm font-medium text-indigo-600">
                +{((calculationPreview.totalAmount - vehiclesValue) / vehiclesValue * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-40">
              <Bar
                data={{
                  labels: ['Valor del vehículo', 'Total a pagar'],
                  datasets: [
                    {
                      label: 'Vehículo',
                      data: [vehiclesValue, vehiclesValue],
                      backgroundColor: 'rgba(59, 130, 246, 0.7)',
                      borderColor: 'rgba(37, 99, 235, 1)',
                      borderWidth: 1
                    },
                    {
                      label: 'Intereses y comisiones',
                      data: [0, calculationPreview.totalAmount - vehiclesValue],
                      backgroundColor: 'rgba(147, 51, 234, 0.7)',
                      borderColor: 'rgba(126, 34, 206, 1)',
                      borderWidth: 1
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      grid: {
                        display: false
                      }
                    },
                    y: {
                      beginAtZero: true,
                      grid: {
                        borderDash: [2, 4]
                      },
                      ticks: {
                        callback: function(value) {
                          return formatCurrency(value);
                        }
                      }
                    }
                  },
                  plugins: {
                    legend: {
                      position: 'bottom'
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.dataset.label || '';
                          const value = context.raw;
                          const percentage = (value / calculationPreview.totalAmount * 100).toFixed(1);
                          return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
          
          {/* Evaluación cualitativa del crédito */}
          <div className="border-t border-gray-300 pt-4 mt-4">
            <div className="text-sm font-medium mb-3">Evaluación del crédito</div>
            
            <div className="space-y-6">
              {/* Gráfico de radar para evaluación general */}
              <div className="h-64">
                <Radar
                  data={{
                    labels: ['Costo Total', 'CAT vs Tasa', 'Plazo', 'Calificación General'],
                    datasets: [
                      {
                        label: 'Puntuación (Mayor es mejor)',
                        data: [ratings.costScore, ratings.rateScore, ratings.termScore, ratings.overallScore],
                        backgroundColor: 'rgba(79, 70, 229, 0.2)',
                        borderColor: 'rgba(79, 70, 229, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: [
                          ratings.costRating === 'Bueno' ? 'rgba(16, 185, 129, 1)' : 
                          ratings.costRating === 'Enorme' ? 'rgba(245, 158, 11, 1)' : 
                          ratings.costRating === 'Terrible' ? 'rgba(249, 115, 22, 1)' : 'rgba(239, 68, 68, 1)',
                          
                          ratings.rateRating === 'Bueno' ? 'rgba(16, 185, 129, 1)' : 
                          ratings.rateRating === 'Enorme' ? 'rgba(245, 158, 11, 1)' : 
                          ratings.rateRating === 'Terrible' ? 'rgba(249, 115, 22, 1)' : 'rgba(239, 68, 68, 1)',
                          
                          ratings.termRating === 'Bueno' ? 'rgba(16, 185, 129, 1)' : 
                          ratings.termRating === 'Enorme' ? 'rgba(245, 158, 11, 1)' : 
                          ratings.termRating === 'Terrible' ? 'rgba(249, 115, 22, 1)' : 'rgba(239, 68, 68, 1)',
                          
                          ratings.overallRating === 'Bueno' ? 'rgba(16, 185, 129, 1)' : 
                          ratings.overallRating === 'Enorme' ? 'rgba(245, 158, 11, 1)' : 
                          ratings.overallRating === 'Terrible' ? 'rgba(249, 115, 22, 1)' : 'rgba(239, 68, 68, 1)'
                        ],
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(79, 70, 229, 1)',
                        pointRadius: 5,
                        pointHoverRadius: 7
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        min: 0,
                        max: 100,
                        ticks: {
                          display: false
                        },
                        pointLabels: {
                          font: {
                            size: 12,
                            weight: 'bold'
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const index = context.dataIndex;
                            const value = context.raw;
                            const labels = ['Costo Total', 'CAT vs Tasa', 'Plazo', 'Calificación General'];
                            const ratings = [
                              ratings.costRating, 
                              ratings.rateRating, 
                              ratings.termRating, 
                              ratings.overallRating
                            ];
                            return `${labels[index]}: ${value.toFixed(1)}/100 (${ratings[index]})`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
              
              {/* Calificaciones resumidas en tarjetas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Calificación general */}
                <div className={`p-3 rounded-lg ${
                  ratings.overallRating === 'Bueno' ? 'bg-emerald-50 border border-emerald-200' :
                  ratings.overallRating === 'Enorme' ? 'bg-amber-50 border border-amber-200' :
                  ratings.overallRating === 'Terrible' ? 'bg-orange-50 border border-orange-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <div className="text-xs uppercase font-medium mb-1 text-gray-500">Calificación General</div>
                  <div className={`text-lg font-bold ${
                    ratings.overallRating === 'Bueno' ? 'text-emerald-600' :
                    ratings.overallRating === 'Enorme' ? 'text-amber-600' :
                    ratings.overallRating === 'Terrible' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {ratings.overallRating}
                  </div>
                  <div className="text-xs mt-1 text-gray-600">
                    Coste: {ratings.costPercentage.toFixed(1)}% adicional
                  </div>
                </div>
                
                {/* Desglose de los factores */}
                <div className={`p-3 rounded-lg ${
                  ratings.costRating === 'Bueno' ? 'bg-emerald-50 border border-emerald-200' :
                  ratings.costRating === 'Enorme' ? 'bg-amber-50 border border-amber-200' :
                  ratings.costRating === 'Terrible' ? 'bg-orange-50 border border-orange-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <div className="text-xs uppercase font-medium mb-1 text-gray-500">Costo Total</div>
                  <div className={`text-lg font-bold ${
                    ratings.costRating === 'Bueno' ? 'text-emerald-600' :
                    ratings.costRating === 'Enorme' ? 'text-amber-600' :
                    ratings.costRating === 'Terrible' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {ratings.costRating}
                  </div>
                  <div className="text-xs mt-1 text-gray-600">
                    {formatCurrency(ratings.totalCost)}
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg ${
                  ratings.rateRating === 'Bueno' ? 'bg-emerald-50 border border-emerald-200' :
                  ratings.rateRating === 'Enorme' ? 'bg-amber-50 border border-amber-200' :
                  ratings.rateRating === 'Terrible' ? 'bg-orange-50 border border-orange-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <div className="text-xs uppercase font-medium mb-1 text-gray-500">CAT vs Tasa</div>
                  <div className={`text-lg font-bold ${
                    ratings.rateRating === 'Bueno' ? 'text-emerald-600' :
                    ratings.rateRating === 'Enorme' ? 'text-amber-600' :
                    ratings.rateRating === 'Terrible' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {ratings.rateRating}
                  </div>
                  <div className="text-xs mt-1 text-gray-600">
                    Diferencia: {formatPercentage(ratings.catVsRateDiff)}
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg ${
                  ratings.termRating === 'Bueno' ? 'bg-emerald-50 border border-emerald-200' :
                  ratings.termRating === 'Enorme' ? 'bg-amber-50 border border-amber-200' :
                  ratings.termRating === 'Terrible' ? 'bg-orange-50 border border-orange-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <div className="text-xs uppercase font-medium mb-1 text-gray-500">Plazo</div>
                  <div className={`text-lg font-bold ${
                    ratings.termRating === 'Bueno' ? 'text-emerald-600' :
                    ratings.termRating === 'Enorme' ? 'text-amber-600' :
                    ratings.termRating === 'Terrible' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {ratings.termRating}
                  </div>
                  <div className="text-xs mt-1 text-gray-600">
                    {term} meses
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desglose detallado */}
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Desglose de pagos</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-100 p-2 rounded">
                  <div className="text-xs text-blue-800">Valor del vehículo</div>
                  <div className="font-bold text-blue-600">{formatCurrency(vehiclesValue)}</div>
                </div>
                <div className="bg-purple-100 p-2 rounded">
                  <div className="text-xs text-purple-800">Intereses</div>
                  <div className="font-bold text-purple-600">{formatCurrency(calculationPreview.totalInterest)}</div>
                </div>
                <div className="bg-amber-100 p-2 rounded">
                  <div className="text-xs text-amber-800">Comisión</div>
                  <div className="font-bold text-amber-600">{formatCurrency(calculationPreview.openingCommission)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Título de la sección con el banco seleccionado */}
      <h3 className="govuk-form-section-title">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {React.isValidElement(calculationPreview.bank.logo) ? (
              <div className="mr-2 text-royal-black">{calculationPreview.bank.logo}</div>
            ) : (
              <img src={calculationPreview.bank.logo} alt={calculationPreview.bank.nombre} className="h-8 mr-2" />
            )}
            Vista previa con {calculationPreview.bank.nombre}
            {useCustomRate && (
              <span className="ml-2 text-sm">
                (Tasa personalizada: {(customRate === "" || isNaN(customRate)) ? "0.00" : Number(customRate).toFixed(2)}%)
              </span>
            )}
          </div>
          
          {/* Calificación de costo en forma de distintivo */}
          {(() => {
            // Determinar calificación
            let bgColor = "";
            let textColor = "";
            
            if (ratings.costRating === 'Bueno') {
              bgColor = "bg-emerald-100";
              textColor = "text-emerald-800";
            } else if (ratings.costRating === 'Enorme') {
              bgColor = "bg-amber-100";
              textColor = "text-amber-800";
            } else if (ratings.costRating === 'Terrible') {
              bgColor = "bg-orange-100";
              textColor = "text-orange-800";
            } else {
              bgColor = "bg-red-100";
              textColor = "text-red-800";
            }
            
            return (
              <div className={`px-3 py-1 rounded-full ${bgColor} ${textColor} text-sm font-bold`}>
                Costo: {ratings.costRating} ({ratings.costPercentage.toFixed(1)}%)
              </div>
            );
          })()}
        </div>
      </h3>
      
      {/* Resumen de costos principales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div 
          className="border-2 border-royal-black p-4"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="text-sm">Pago mensual</div>
          <div className="text-xl font-bold">{formatCurrency(calculationPreview.monthlyPayment)}</div>
        </motion.div>
        
        <motion.div 
          className="border-2 border-royal-black p-4"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="text-sm">Tasa anual</div>
          <div className="text-xl font-bold">{formatPercentage(calculationPreview.bank.tasa)}</div>
        </motion.div>
        
        <motion.div 
          className="border-2 border-royal-black p-4"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="text-sm">CAT</div>
          <div className="text-xl font-bold">
            {useCustomCat 
              ? formatPercentage(customCat)
              : useCustomRate 
                ? `~${formatPercentage(customRate * 1.3)}` // Estimación aproximada del CAT
                : formatPercentage(calculationPreview.bank.cat)
            }
          </div>
        </motion.div>
      </div>
      
      {/* Desglose detallado de costos */}
      <div className="govuk-summary-list space-y-3 sm:space-y-0">
        <div className="govuk-summary-list__row flex flex-col sm:flex-row sm:items-center">
          <dt className="govuk-summary-list__key text-base sm:text-sm sm:w-1/2">Comisión por apertura:</dt>
          <dd className="govuk-summary-list__value text-base sm:text-sm font-medium sm:font-normal">{formatCurrency(calculationPreview.openingCommission)}</dd>
        </div>
        <div className="govuk-summary-list__row flex flex-col sm:flex-row sm:items-center">
          <dt className="govuk-summary-list__key text-base sm:text-sm sm:w-1/2">Monto total a pagar:</dt>
          <dd className="govuk-summary-list__value text-base sm:text-sm font-medium sm:font-normal">{formatCurrency(calculationPreview.totalAmount)}</dd>
        </div>
        <div className="govuk-summary-list__row flex flex-col sm:flex-row sm:items-center">
          <dt className="govuk-summary-list__key text-base sm:text-sm sm:w-1/2">Intereses totales:</dt>
          <dd className="govuk-summary-list__value text-base sm:text-sm font-medium sm:font-normal">{formatCurrency(calculationPreview.totalInterest)}</dd>
        </div>
      </div>
    </motion.div>
  );
};

export default CreditPreview;