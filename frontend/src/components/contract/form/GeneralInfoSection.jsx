import { memo } from 'react';
import { motion } from 'framer-motion';
import CityStateSelector from '../../common/CityStateSelector';

/**
 * General Information section of the contract form
 * 
 * @param {Object} props
 * @param {Object} props.formData - The contract form data
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Function} props.handleLocationChange - Function to handle location changes
 */
const GeneralInfoSection = memo(({ 
  formData, 
  handleChange, 
  handleLocationChange 
}) => {
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
      <h3 className="govuk-form-section-title">Información General</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* City and State Selector */}
        <motion.div className="govuk-form-group md:col-span-2" variants={itemAnimation}>
          <CityStateSelector 
            selectedState={formData.estado}
            selectedCity={formData.ciudad}
            onChange={handleLocationChange}
            stateLabel="Estado"
            cityLabel="Ciudad"
            required={true}
          />
        </motion.div>

        {/* Date */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="fecha" className="govuk-label">
            Fecha <span className="text-royal-red">*</span>
          </label>
          <input
            type="text"
            id="fecha"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className="govuk-input"
            placeholder="DD/MM/AAAA"
            required
          />
        </motion.div>

        {/* Time */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="hora" className="govuk-label">
            Hora <span className="text-royal-red">*</span>
          </label>
          <input
            type="text"
            id="hora"
            name="hora"
            value={formData.hora}
            onChange={handleChange}
            className="govuk-input"
            placeholder="HH:MM"
            required
          />
        </motion.div>
      </div>
    </div>
  );
});

export default GeneralInfoSection;