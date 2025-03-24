import React from 'react';
import { motion } from 'framer-motion';
import { PLAZOS } from './constants/BankData';
import { formatCurrency } from './utils/CreditUtils';

/**
 * Componente para selección de plazo del crédito
 * @param {Object} props - Propiedades del componente
 * @param {number} props.term - Plazo seleccionado en meses
 * @param {number} props.financingAmount - Monto a financiar
 * @param {Function} props.onTermChange - Manejador para cambio de plazo
 * @param {boolean} props.showSummary - Indicador para mostrar resumen de financiamiento
 * @returns {JSX.Element} - Componente de selección de plazo
 */
const TermSelector = ({ 
  term, 
  financingAmount, 
  onTermChange,
  showSummary = true 
}) => {
  return (
    <div className="govuk-form-group">
      <label htmlFor="term" className="govuk-label">
        Plazo (meses)
      </label>
      <motion.select
        id="term"
        value={term}
        onChange={(e) => onTermChange(Number(e.target.value))}
        className="govuk-select"
        whileTap={{ scale: 1.02 }}
      >
        {PLAZOS.map(p => (
          <option key={p} value={p}>{p} meses</option>
        ))}
      </motion.select>
      
      {showSummary && (
        <div className="govuk-summary-list mt-3">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Monto a financiar:</dt>
            <dd className="govuk-summary-list__value font-bold">{formatCurrency(financingAmount)}</dd>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermSelector;