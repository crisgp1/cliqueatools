import React from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';

/**
 * Componente para la configuración de tasas personalizadas
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.useCustomRate - Flag para usar tasa personalizada
 * @param {number|string} props.customRate - Valor de la tasa personalizada
 * @param {boolean} props.useCustomCat - Flag para usar CAT personalizado
 * @param {number|string} props.customCat - Valor del CAT personalizado
 * @param {string|null} props.validationError - Error de validación, si existe
 * @param {Function} props.onToggleCustomRate - Manejador para activar/desactivar tasa personalizada
 * @param {Function} props.onCustomRateChange - Manejador para cambio de tasa personalizada
 * @param {Function} props.onToggleCustomCat - Manejador para activar/desactivar CAT personalizado
 * @param {Function} props.onCustomCatChange - Manejador para cambio de CAT personalizado
 * @returns {JSX.Element} - Componente de configuración de tasas personalizadas
 */
const CustomRateConfig = ({
  useCustomRate,
  customRate,
  useCustomCat,
  customCat,
  validationError,
  onToggleCustomRate,
  onCustomRateChange,
  onToggleCustomCat,
  onCustomCatChange
}) => {
  return (
    <div className="govuk-form-group">
      <div className="flex items-center justify-between">
        <label htmlFor="useCustomRate" className="govuk-label mb-0">
          Usar tasa de interés personalizada
        </label>
        <motion.div 
          className="relative h-6 w-12 cursor-pointer"
          whileTap={{ scale: 0.95 }}
          onClick={onToggleCustomRate}
        >
          <input
            type="checkbox"
            id="useCustomRate"
            checked={useCustomRate}
            onChange={onToggleCustomRate}
            className="sr-only"
          />
          <div className={`block w-12 h-6 rounded-full transition ${useCustomRate ? 'bg-royal-black' : 'bg-royal-gray-300'}`}></div>
          <motion.div 
            className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full`}
            animate={{ 
              x: useCustomRate ? 24 : 0 
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
          </motion.div>
        </motion.div>
      </div>
      
      {useCustomRate && (
        <motion.div 
          className="mt-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <label htmlFor="customRate" className="govuk-label">
            Tasa de interés anual (%)
          </label>
          <div className="flex justify-between mb-1">
            <span className="govuk-form-hint">Ajuste la tasa de interés</span>
            <div className="flex items-center">
              <motion.input
                type="number"
                min="5"
                max="25"
                step="0.1"
                value={customRate}
                onChange={(e) => onCustomRateChange(Number(e.target.value))}
                className={`w-16 h-8 border ${validationError ? 'border-red-500 bg-red-50' : 'border-royal-gray-300'} rounded text-center mr-1`}
                whileTap={{ scale: 1.05 }}
              />
              <span className="font-bold">%</span>
            </div>
          </div>
          
          {/* Gráfico de línea para tasa de interés */}
          <div className="w-full h-12 my-3">
            <Line 
              data={{
                labels: ['5%', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '25%'],
                datasets: [
                  {
                    label: 'Tasa de interés',
                    data: Array(20).fill(null).map((_, i) => i === Math.floor((customRate - 5) / 20 * 19) ? customRate : null),
                    borderColor: 'rgba(217, 119, 6, 1)',
                    backgroundColor: 'rgba(245, 158, 11, 0.8)',
                    pointBackgroundColor: 'rgba(217, 119, 6, 1)',
                    pointBorderColor: '#fff',
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    tension: 0.1,
                    fill: false
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
                    },
                    ticks: {
                      maxRotation: 0,
                      autoSkip: true,
                      maxTicksLimit: 2,
                      font: {
                        size: 10
                      }
                    }
                  },
                  y: {
                    display: false,
                    min: 0,
                    max: 30
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `Tasa: ${context.raw}%`;
                      }
                    }
                  }
                }
              }}
            />
          </div>

          {/* Configuración de CAT personalizado */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label htmlFor="useCustomCat" className="govuk-label mb-0">
                Ajustar CAT manualmente
              </label>
              <motion.div 
                className="relative h-6 w-12 cursor-pointer"
                whileTap={{ scale: 0.95 }}
                onClick={onToggleCustomCat}
              >
                <input
                  type="checkbox"
                  id="useCustomCat"
                  checked={useCustomCat}
                  onChange={onToggleCustomCat}
                  className="sr-only"
                />
                <div className={`block w-12 h-6 rounded-full transition ${useCustomCat ? 'bg-royal-black' : 'bg-royal-gray-300'}`}></div>
                <motion.div 
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full`}
                  animate={{ 
                    x: useCustomCat ? 24 : 0 
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                </motion.div>
              </motion.div>
            </div>
          </div>

          {useCustomCat && (
            <motion.div 
              className="mt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label htmlFor="customCat" className="govuk-label">
                CAT (%)
              </label>
              <div className="flex justify-between mb-1">
                <span className="govuk-form-hint">Ajuste el CAT</span>
                <div className="flex items-center">
                  <motion.input
                    type="number"
                    min="6"
                    max="30"
                    step="0.1"
                    value={customCat}
                    onChange={(e) => onCustomCatChange(Number(e.target.value))}
                    className={`w-16 h-8 border ${validationError ? 'border-red-500 bg-red-50' : 'border-royal-gray-300'} rounded text-center mr-1`}
                    whileTap={{ scale: 1.05 }}
                  />
                  <span className="font-bold">%</span>
                </div>
              </div>
              
              {/* Gráfico de línea para CAT */}
              <div className="w-full h-12 my-3">
                <Line 
                  data={{
                    labels: ['6%', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '30%'],
                    datasets: [
                      {
                        label: 'CAT',
                        data: Array(20).fill(null).map((_, i) => i === Math.floor((customCat - 6) / 24 * 19) ? customCat : null),
                        borderColor: 'rgba(220, 38, 38, 1)',
                        backgroundColor: 'rgba(248, 113, 113, 0.8)',
                        pointBackgroundColor: 'rgba(220, 38, 38, 1)',
                        pointBorderColor: '#fff',
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        tension: 0.1,
                        fill: false
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
                        },
                        ticks: {
                          maxRotation: 0,
                          autoSkip: true,
                          maxTicksLimit: 2,
                          font: {
                            size: 10
                          }
                        }
                      },
                      y: {
                        display: false,
                        min: 0,
                        max: 35
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `CAT: ${context.raw}%`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CustomRateConfig;