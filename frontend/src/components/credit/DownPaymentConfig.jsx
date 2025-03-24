import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Doughnut, Bar } from 'react-chartjs-2';
import { IoAlertCircleOutline } from 'react-icons/io5';
import { formatCurrency, formatNumber } from './utils/CreditUtils';

/**
 * Componente para configuración de enganche y distribución del financiamiento
 * 
 * @param {Object} props - Propiedades del componente
 * @param {number} props.downPaymentPercentage - Porcentaje de enganche
 * @param {number|string} props.downPaymentAmount - Monto de enganche
 * @param {number} props.effectiveVehiclesValue - Valor total de vehículos
 * @param {number} props.financingAmount - Monto a financiar calculado
 * @param {string|null} props.validationError - Error de validación, si existe
 * @param {Function} props.onPercentageChange - Manejador para cambio de porcentaje
 * @param {Function} props.onAmountChange - Manejador para cambio de monto
 * @returns {JSX.Element} - Componente de configuración de enganche
 */
const DownPaymentConfig = ({ 
  downPaymentPercentage, 
  downPaymentAmount, 
  effectiveVehiclesValue, 
  financingAmount,
  validationError,
  onPercentageChange, 
  onAmountChange 
}) => {
  return (
    <div className="govuk-form-group">
      <label className="govuk-label">
        Distribución del financiamiento
      </label>
      <div className="flex justify-between mb-1">
        <span className="govuk-form-hint">Ajuste el porcentaje de enganche (0% - 100%)</span>
        <div className="flex items-center">
          <motion.input
            type="number"
            step="1"
            value={downPaymentPercentage}
            onChange={(e) => onPercentageChange(e.target.value)}
            className={`w-16 h-8 border ${validationError ? 'border-red-500 bg-red-50' : 'border-royal-gray-300'} rounded text-center mr-1`}
            whileTap={{ scale: 1.05 }}
          />
          <span className="font-bold">%</span>
        </div>
      </div>
      
      {/* Gráfico de donut - solo mostrar si hay valor efectivo mayor que 0 */}
      {effectiveVehiclesValue > 0 && (
        <div className="w-full h-20 mb-2">
          <Doughnut 
            data={{
              labels: ['Enganche', 'A financiar'],
              datasets: [
                {
                  data: [downPaymentPercentage, 100 - downPaymentPercentage],
                  backgroundColor: validationError 
                    ? [
                        'rgba(239, 68, 68, 0.8)',  // Rojo para indicar error
                        'rgba(239, 68, 68, 0.5)'
                      ]
                    : [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(20, 184, 166, 0.8)'
                      ],
                  borderColor: validationError 
                    ? [
                        'rgba(220, 38, 38, 1)',
                        'rgba(220, 38, 38, 0.7)'
                      ]
                    : [
                        'rgba(79, 70, 229, 1)',
                        'rgba(13, 148, 136, 1)'
                      ],
                  borderWidth: 1,
                  cutout: '65%',
                  hoverOffset: 5
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: 5
              },
              plugins: {
                legend: {
                  display: true,
                  position: 'bottom',
                  labels: {
                    generateLabels: (chart) => {
                      const data = chart.data;
                      if (data.labels.length && data.datasets.length) {
                        return data.labels.map((label, i) => {
                          const value = data.datasets[0].data[i];
                          return {
                            text: `${label}: ${value}%`,
                            fillStyle: data.datasets[0].backgroundColor[i],
                            strokeStyle: data.datasets[0].borderColor[i],
                            lineWidth: 1,
                            hidden: false,
                            index: i
                          };
                        });
                      }
                      return [];
                    }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.formattedValue || '';
                      return `${label}: ${value}%`;
                    }
                  }
                }
              }
            }}
          />
        </div>
      )}
      
      {effectiveVehiclesValue > 0 && (
        <div className="flex justify-between text-sm text-royal-gray-600 mt-2">
          <div className="flex flex-col">
            <span className="font-medium text-indigo-600">Enganche</span>
            <span>{formatCurrency(downPaymentAmount)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-medium text-teal-600">Monto a financiar</span>
            <span>{formatCurrency(financingAmount)}</span>
          </div>
        </div>
      )}

      {/* Progresión del valor reemplazada con un gráfico de barras horizontales */}
      {effectiveVehiclesValue > 0 && (
        <div className="mt-4 border-t border-gray-300 pt-3">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Distribución del valor</span>
            <span className="text-sm font-bold">{formatCurrency(effectiveVehiclesValue)}</span>
          </div>
          <div className="w-full h-14">
            <Bar
              data={{
                labels: ['Distribución'],
                datasets: [
                  {
                    label: 'Pago inicial',
                    data: [downPaymentAmount],
                    backgroundColor: validationError 
                      ? 'rgba(239, 68, 68, 0.8)' 
                      : 'rgba(79, 70, 229, 0.8)',
                    borderColor: validationError 
                      ? 'rgba(220, 38, 38, 1)' 
                      : 'rgba(67, 56, 202, 1)',
                    borderWidth: 1,
                    barPercentage: 0.9,
                    categoryPercentage: 0.9
                  },
                  {
                    label: 'A financiar',
                    data: [financingAmount],
                    backgroundColor: validationError 
                      ? 'rgba(239, 68, 68, 0.5)' 
                      : 'rgba(20, 184, 166, 0.8)',
                    borderColor: validationError 
                      ? 'rgba(220, 38, 38, 0.7)' 
                      : 'rgba(13, 148, 136, 1)',
                    borderWidth: 1,
                    barPercentage: 0.9,
                    categoryPercentage: 0.9
                  }
                ]
              }}
              options={{
                indexAxis: 'y',
                scales: {
                  x: {
                    stacked: true,
                    grid: {
                      display: false
                    },
                    ticks: {
                      display: false
                    }
                  },
                  y: {
                    stacked: true,
                    grid: {
                      display: false
                    },
                    ticks: {
                      display: false
                    }
                  }
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.raw;
                        const percentage = context.dataset.label === 'Pago inicial' 
                          ? ((downPaymentAmount / effectiveVehiclesValue) * 100).toFixed(1) 
                          : ((financingAmount / effectiveVehiclesValue) * 100).toFixed(1);
                        return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Pago inicial: {formatCurrency(downPaymentAmount)}</span>
            <span>A financiar: {formatCurrency(financingAmount)}</span>
          </div>
        </div>
      )}
      
      {/* Mensaje de error de validación */}
      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 bg-red-50 border border-red-200 rounded-md p-3 mt-3"
          >
            <div className="flex items-center text-red-700">
              <IoAlertCircleOutline className="h-5 w-5 mr-2" />
              <p className="text-sm">{validationError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {effectiveVehiclesValue > 0 && (
        <div className="govuk-summary-list mt-3">
          <div className="govuk-summary-list__row flex items-center justify-between">
            <dt className="govuk-summary-list__key mr-2">Monto de enganche:</dt>
            <dd className="govuk-summary-list__value flex items-center">
              <span className="mr-2">$</span>
              <div className="flex flex-col">
                <motion.input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder=""
                  value={typeof downPaymentAmount === 'number' ? downPaymentAmount.toString() : downPaymentAmount}
                  onChange={(e) => onAmountChange(e.target.value)}
                  onBlur={() => {
                    // Si el campo está vacío al perder el foco, restaurar al valor calculado del porcentaje
                    if (downPaymentAmount === '' || downPaymentAmount === null) {
                      onAmountChange(Math.round((effectiveVehiclesValue * downPaymentPercentage) / 100));
                    }
                  }}
                  className={`w-32 h-8 border ${validationError ? 'border-red-500 bg-red-50' : 'border-royal-gray-300'} rounded text-center font-bold`}
                  whileTap={{ scale: 1.05 }}
                />
                {typeof downPaymentAmount === 'number' && (
                  <div className="text-xs text-royal-gray-600 mt-1 text-center w-32">
                    {formatNumber(downPaymentAmount)}
                  </div>
                )}
              </div>
            </dd>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownPaymentConfig;