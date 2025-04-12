import React from 'react';
import { motion } from 'framer-motion';
import { 
  IoAddCircleOutline, 
  IoCheckmarkCircle, 
  IoTrashOutline,
  IoInformationCircleOutline,
  IoGitCompareOutline
} from 'react-icons/io5';
import { BANCOS } from './constants/BankData';
import { formatPercentage } from './utils/CreditUtils';

/**
 * Componente para la selección de bancos a comparar
 * @param {Object} props - Propiedades del componente
 * @param {number} props.selectedBankId - ID del banco seleccionado para vista previa
 * @param {Array<number>} props.selectedBanks - Array de IDs de bancos seleccionados para comparación
 * @param {Object} props.customizedBanks - Objeto con configuraciones personalizadas por banco
 * @param {boolean} props.useCustomRate - Indicador de uso de tasa personalizada
 * @param {number|string} props.customRate - Valor de tasa personalizada
 * @param {boolean} props.useCustomCat - Indicador de uso de CAT personalizado
 * @param {number|string} props.customCat - Valor de CAT personalizado
 * @param {Function} props.onSelectBank - Manejador para seleccionar banco para vista previa
 * @param {Function} props.onToggleBankSelection - Manejador para agregar/remover banco de comparación
 * @param {Function} props.onSaveCustomConfig - Manejador para guardar configuración personalizada
 * @param {number} props.effectiveVehiclesValue - Valor total de vehículos seleccionados
 * @returns {JSX.Element} - Componente de selección de bancos
 */
const BankSelectionGrid = ({
  selectedBankId,
  selectedBanks,
  customizedBanks,
  useCustomRate,
  customRate,
  useCustomCat,
  customCat,
  onSelectBank,
  onToggleBankSelection,
  onSaveCustomConfig,
  effectiveVehiclesValue
}) => {
  return (
    <div className="govuk-form-group mb-8">
      <div className="flex justify-between items-center mb-4">
        <label className="govuk-label mb-0">
          Selecciona bancos para comparar
        </label>
        <div className="text-sm text-royal-gray-600">
          <span className="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
            {selectedBanks.length} seleccionados
          </span>
        </div>
      </div>
      
      <div className="border-2 border-gray-300 rounded-md p-4 bg-gray-50 mb-4">
        <div className="flex items-center text-sm text-royal-gray-600 mb-4">
          <IoInformationCircleOutline className="h-5 w-5 mr-2 text-blue-600" />
          <p>Selecciona hasta 5 bancos para comparar sus ofertas. Puedes personalizar la configuración del crédito para cada banco.</p>
        </div>
        
        {selectedBanks.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
              <IoGitCompareOutline className="h-5 w-5 mr-1" />
              Bancos seleccionados para comparación
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedBanks.map(bankId => {
                const bank = BANCOS.find(b => b.id === bankId);
                const hasCustomConfig = !!customizedBanks[bankId];
                
                return (
                  <div 
                    key={`selected-${bankId}`} 
                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                      hasCustomConfig ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {bank.nombre}
                    {hasCustomConfig && (
                      <span className="ml-1 text-xs">(Personalizado)</span>
                    )}
                    <button 
                      onClick={() => onToggleBankSelection(bankId)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <IoTrashOutline className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {BANCOS.map((bank) => {
          const isSelected = selectedBankId === bank.id;
          const isCompared = selectedBanks.includes(bank.id);
          const hasCustomConfig = !!customizedBanks[bank.id];
          
          return (
            <motion.div
              key={bank.id}
              className={`p-4 border-2 ${
                isSelected 
                  ? 'border-royal-black bg-royal-gray-100' 
                  : isCompared
                    ? hasCustomConfig 
                      ? 'border-green-500 bg-green-50'
                      : 'border-blue-500 bg-blue-50'
                    : 'border-royal-gray-300 hover:border-royal-black/50'
              } rounded transition-all`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex flex-col items-center">
                {React.isValidElement(bank.logo) ? (
                  <div className="mb-2 text-royal-black">{bank.logo}</div>
                ) : typeof bank.logo === 'function' ? (
                  <div className="mb-2 text-royal-black">
                    {React.createElement(bank.logo, { className: "h-8 w-8" })}
                  </div>
                ) : typeof bank.logo === 'string' && bank.logo.includes('.svg') ? (
                  <img src={bank.logo} alt={bank.nombre} className="h-8 mb-2 object-contain" />
                ) : (
                  <img 
                    src={bank.logo} 
                    alt={bank.nombre} 
                    className="h-8 mb-2 object-contain" 
                    onError={(e) => {
                      console.warn(`Error loading logo for ${bank.nombre}`, e);
                      // Fallback a un texto si la imagen no carga
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = `<div class="h-8 w-8 flex items-center justify-center bg-gray-200 rounded-full mb-2">
                        <span class="text-lg font-bold">${bank.nombre.charAt(0)}</span>
                      </div>`;
                    }}
                  />
                )}
                <span className="text-base font-bold">{bank.nombre}</span>
                <div className="mt-1 flex flex-wrap justify-center gap-1">
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                    {useCustomRate && hasCustomConfig 
                      ? formatPercentage(customizedBanks[bank.id].customRate) 
                      : useCustomRate 
                        ? formatPercentage(customRate) 
                        : formatPercentage(bank.tasa)
                    }
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                    CAT: {
                      useCustomCat && hasCustomConfig 
                        ? formatPercentage(customizedBanks[bank.id].customCat)
                        : useCustomCat 
                          ? formatPercentage(customCat)
                          : useCustomRate && hasCustomConfig
                            ? `~${formatPercentage(customizedBanks[bank.id].customRate * 1.3)}`
                            : useCustomRate
                              ? `~${formatPercentage(customRate * 1.3)}`
                              : formatPercentage(bank.cat)
                    }
                  </span>
                </div>
              </div>
              
              <div className="flex justify-center mt-3 gap-2">
                <motion.button
                  type="button"
                  onClick={() => onSelectBank(bank.id)}
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    isSelected 
                      ? 'bg-royal-black text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  {isSelected ? 'Seleccionado' : 'Vista previa'}
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={() => onToggleBankSelection(bank.id)}
                  className={`px-2 py-1 text-xs font-medium rounded flex items-center ${
                    isCompared 
                      ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  {isCompared ? (
                    <>
                      <IoTrashOutline className="h-3 w-3 mr-1" />
                      Quitar
                    </>
                  ) : (
                    <>
                      <IoAddCircleOutline className="h-3 w-3 mr-1" />
                      Comparar
                    </>
                  )}
                </motion.button>
              </div>
              
              {isCompared && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <motion.button
                    type="button"
                    onClick={() => onSaveCustomConfig(bank.id)}
                    className={`w-full px-2 py-1 text-xs font-medium rounded flex items-center justify-center ${
                      hasCustomConfig 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    {hasCustomConfig ? (
                      <>
                        <IoCheckmarkCircle className="h-3 w-3 mr-1" />
                        Configuración guardada
                      </>
                    ) : (
                      <>
                        <IoAddCircleOutline className="h-3 w-3 mr-1" />
                        Guardar configuración actual
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BankSelectionGrid;