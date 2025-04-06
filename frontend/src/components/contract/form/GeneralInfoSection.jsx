import { memo } from 'react';
import { motion } from 'framer-motion';
import ZipCodeSelector from '../../common/ZipCodeSelector';

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

  // Función para manejar cambios en la ubicación incluyendo código postal y colonia
  const handleLocationComplete = (locationData) => {
    // Usar la función handleLocationChange existente y agregar los campos adicionales si es necesario
    handleLocationChange({
      state: locationData.state || formData.estado,
      city: locationData.city || formData.ciudad,
      // Incluir nuevos campos
      colony: locationData.colony,
      zipCode: locationData.zipCode
    });
    
    // Si hay un cambio de código postal también actualizar ese campo directamente
    if (locationData.zipCode && handleChange) {
      const event = { 
        target: { 
          name: 'codigoPostal', 
          value: locationData.zipCode 
        } 
      };
      handleChange(event);
    }
    
    // Si hay un cambio de colonia también actualizar ese campo directamente
    if (locationData.colony && handleChange) {
      const event = { 
        target: { 
          name: 'colonia', 
          value: locationData.colony 
        } 
      };
      handleChange(event);
    }
  };

  return (
    <div className="govuk-form-section">
      <h3 className="govuk-form-section-title">Información General</h3>
      <div className="grid grid-cols-1 gap-4">
        {/* Zip Code, Colony, City and State Selector */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <ZipCodeSelector 
            selectedState={formData.estado}
            selectedCity={formData.ciudad}
            selectedColony={formData.colonia || ''}
            zipCode={formData.codigoPostal || ''}
            onChange={handleLocationComplete}
            required={true}
          />
        </motion.div>

        {/* Date */}
        <motion.div className="govuk-form-group mt-4" variants={itemAnimation}>
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