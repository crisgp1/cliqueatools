import React from 'react';
import { motion } from 'framer-motion';
import { IoPlayCircleOutline, IoGitCompareOutline } from 'react-icons/io5';

/**
 * Componente para botones de acción del formulario de crédito
 * @param {Object} props - Propiedades del componente
 * @param {Array<number>} props.selectedBanks - Array de IDs de bancos seleccionados para comparar
 * @param {number} props.effectiveVehiclesValue - Valor total de vehículos seleccionados
 * @param {string|null} props.validationError - Error de validación, si existe
 * @param {Function} props.onCalculate - Manejador para acción de calcular
 * @returns {JSX.Element} - Componente de botones de acción
 */
const ActionButtons = ({
  selectedBanks,
  effectiveVehiclesValue,
  validationError,
  onCalculate
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <div>
        {selectedBanks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm p-4 bg-blue-50 border border-blue-200 rounded-md"
          >
            <p className="font-medium text-blue-800">
              {selectedBanks.length} banco{selectedBanks.length !== 1 ? 's' : ''} seleccionado{selectedBanks.length !== 1 ? 's' : ''} para comparación
            </p>
          </motion.div>
        )}
      </div>
      <div className="flex gap-2">
        {selectedBanks.length > 0 && (
          <motion.button
            onClick={onCalculate}
            disabled={validationError !== null}
            className={`govuk-button-secondary flex items-center ${validationError !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={validationError === null ? { scale: 1.03 } : {}}
            whileTap={validationError === null ? { scale: 0.97 } : {}}
          >
            <IoGitCompareOutline className="h-5 w-5 mr-2" />
            Comparar seleccionados
          </motion.button>
        )}
        <motion.button
          onClick={onCalculate}
          disabled={effectiveVehiclesValue <= 0 || validationError !== null}
          className={`govuk-button flex items-center ${effectiveVehiclesValue <= 0 || validationError !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
          whileHover={effectiveVehiclesValue > 0 && validationError === null ? { scale: 1.05 } : {}}
          whileTap={effectiveVehiclesValue > 0 && validationError === null ? { scale: 0.95 } : {}}
        >
          <IoPlayCircleOutline className="h-5 w-5 mr-2" />
          Calcular todas las opciones
        </motion.button>
      </div>
    </div>
  );
};

export default ActionButtons;