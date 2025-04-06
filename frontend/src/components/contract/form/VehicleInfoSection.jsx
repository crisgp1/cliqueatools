import { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * Vehicle Information section of the contract form
 * 
 * @param {Object} props
 * @param {Object} props.formData - The contract form data
 * @param {Function} props.handleChange - Function to handle input changes
 */
const VehicleInfoSection = memo(({ formData, handleChange }) => {
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
      <h3 className="govuk-form-section-title">Información del Vehículo</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Marca */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="marca" className="govuk-label">
            Marca <span className="text-royal-red">*</span>
          </label>
          <input
            type="text"
            id="marca"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            className="govuk-input"
            required
          />
        </motion.div>

        {/* Modelo */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="modelo" className="govuk-label">
            Modelo <span className="text-royal-red">*</span>
          </label>
          <input
            type="text"
            id="modelo"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            className="govuk-input"
            required
          />
        </motion.div>

        {/* Color */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="color" className="govuk-label">
            Color <span className="text-royal-red">*</span>
          </label>
          <input
            type="text"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="govuk-input"
            required
          />
        </motion.div>

        {/* Tipo */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="tipo" className="govuk-label">
            Tipo <span className="text-royal-red">*</span>
          </label>
          <input
            type="text"
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="govuk-input"
            required
          />
        </motion.div>

        {/* Número de Motor */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="numeroMotor" className="govuk-label">
            Número de Motor <span className="text-royal-red">*</span>
          </label>
          <input
            type="text"
            id="numeroMotor"
            name="numeroMotor"
            value={formData.numeroMotor}
            onChange={handleChange}
            className="govuk-input"
            required
          />
        </motion.div>

        {/* Número de Serie */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="numeroSerie" className="govuk-label">
            Número de Serie <span className="text-royal-red">*</span>
          </label>
          <input
            type="text"
            id="numeroSerie"
            name="numeroSerie"
            value={formData.numeroSerie}
            onChange={handleChange}
            className="govuk-input"
            required
          />
        </motion.div>

        {/* Placas */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="placas" className="govuk-label">
            Placas <span className="text-royal-red">*</span>
          </label>
          <input
            type="text"
            id="placas"
            name="placas"
            value={formData.placas}
            onChange={handleChange}
            className="govuk-input"
            required
          />
        </motion.div>

        {/* Número de Circulación */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="numeroCirculacion" className="govuk-label">
            No. T. Circulación (Si aplica)
          </label>
          <input
            type="text"
            id="numeroCirculacion"
            name="numeroCirculacion"
            value={formData.numeroCirculacion}
            onChange={handleChange}
            className="govuk-input"
          />
        </motion.div>

        {/* Número de Factura */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="numeroFactura" className="govuk-label">
            No. Factura <span className="text-royal-red">*</span>
          </label>
          <input
            type="text"
            id="numeroFactura"
            name="numeroFactura"
            value={formData.numeroFactura}
            onChange={handleChange}
            className="govuk-input"
            required
          />
        </motion.div>

        {/* Refrendos */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="refrendos" className="govuk-label">
            Refrendos
          </label>
          <input
            type="text"
            id="refrendos"
            name="refrendos"
            value={formData.refrendos}
            onChange={handleChange}
            className="govuk-input"
          />
        </motion.div>

        {/* RFC Vehículo */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="rfcVehiculo" className="govuk-label">
            RFC (Si aplica)
          </label>
          <input
            type="text"
            id="rfcVehiculo"
            name="rfcVehiculo"
            value={formData.rfcVehiculo}
            onChange={handleChange}
            className="govuk-input"
          />
        </motion.div>
      </div>
    </div>
  );
});

export default VehicleInfoSection;