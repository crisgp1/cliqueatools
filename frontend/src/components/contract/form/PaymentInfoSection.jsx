import { memo } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formasDePago } from '../utils/ContractUtils';

/**
 * Payment Information section of the contract form
 * 
 * @param {Object} props
 * @param {Object} props.formData - The contract form data
 * @param {Function} props.handleChange - Function to handle input changes
 */
const PaymentInfoSection = memo(({ formData, handleChange }) => {
  // Animation variants
  const itemAnimation = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 20 }
    }
  };

  return (
    <div className="govuk-form-section">
      <h3 className="govuk-form-section-title">Información de Pago</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Precio Total */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="precioTotal" className="govuk-label">
            Precio Total <span className="text-royal-red">*</span>
          </label>
          <div className="relative">
            <div className="govuk-input-prefix">$</div>
            <input
              type="number"
              id="precioTotal"
              name="precioTotal"
              value={formData.precioTotal}
              onChange={handleChange}
              className="govuk-input govuk-input-with-prefix text-right"
              required
            />
          </div>
          <div className="text-sm mt-1 text-gray-600">
            {formatCurrency(formData.precioTotal)}
          </div>
        </motion.div>

        {/* Forma de Pago */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="formaPago" className="govuk-label">
            Forma de Pago <span className="text-royal-red">*</span>
          </label>
          <select
            id="formaPago"
            name="formaPago"
            value={formData.formaPago}
            onChange={handleChange}
            className="govuk-input"
            required
          >
            {formasDePago.map((formaPago, index) => (
              <option key={index} value={formaPago}>
                {formaPago}
              </option>
            ))}
          </select>
        </motion.div>
      </div>
    </div>
  );
});

export default PaymentInfoSection;