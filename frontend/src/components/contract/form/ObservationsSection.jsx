import { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * Observations section of the contract form for additional notes
 * 
 * @param {Object} props
 * @param {Object} props.formData - The contract form data
 * @param {Function} props.handleChange - Function to handle input changes
 */
const ObservationsSection = memo(({ formData, handleChange }) => {
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
      <h3 className="govuk-form-section-title">Observaciones Adicionales</h3>
      <motion.div className="govuk-form-group" variants={itemAnimation}>
        <textarea
          id="observaciones"
          name="observaciones"
          value={formData.observaciones}
          onChange={handleChange}
          className="govuk-textarea"
          rows="3"
          placeholder="Ingrese cualquier observación o detalle adicional aquí..."
        ></textarea>
      </motion.div>
    </div>
  );
});

export default ObservationsSection;