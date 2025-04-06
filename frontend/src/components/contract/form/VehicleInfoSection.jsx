import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { ErrorMessage, addErrorClass } from '../utils/ErrorSummary';
import { validateMexicanField } from '../utils/ValidationSchema';

/**
 * Vehicle Information section of the contract form
 * 
 * @param {Object} props
 * @param {Object} props.formData - The contract form data
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Object} props.errors - Field-specific error messages
 */
const VehicleInfoSection = memo(({ formData, handleChange, errors = {} }) => {
  // Estado local para validación en tiempo real
  const [plateValidation, setPlateValidation] = useState({
    isValid: true,
    message: ''
  });
  
  const [vinValidation, setVinValidation] = useState({
    isValid: true,
    message: ''
  });

  // Validar placas en tiempo real
  const handlePlateChange = (e) => {
    const { value } = e.target;
    handleChange(e);
    
    if (value) {
      const isValid = validateMexicanField(value, 'PLACAS');
      setPlateValidation({
        isValid,
        message: isValid ? '' : 'Las placas no tienen un formato válido (5-7 caracteres alfanuméricos)'
      });
    } else {
      setPlateValidation({ isValid: true, message: '' });
    }
  };

  // Validar número de serie (VIN) en tiempo real
  const handleVinChange = (e) => {
    const { value } = e.target;
    handleChange(e);
    
    if (value) {
      const isValid = validateMexicanField(value, 'VIN');
      setVinValidation({
        isValid,
        message: isValid ? '' : 'El número de serie debe tener 17 caracteres alfanuméricos (formato VIN/NIV)'
      });
    } else {
      setVinValidation({ isValid: true, message: '' });
    }
  };
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
        <motion.div className={`govuk-form-group ${errors.marca ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="marca" className="govuk-label">
            Marca <span className="text-royal-red">*</span>
          </label>
          <ErrorMessage message={errors.marca} />
          <input
            type="text"
            id="marca"
            name="marca"
            value={formData.marca}
            onChange={handleChange}
            className={addErrorClass("govuk-input", errors.marca)}
            required
          />
        </motion.div>

        {/* Modelo */}
        <motion.div className={`govuk-form-group ${errors.modelo ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="modelo" className="govuk-label">
            Modelo <span className="text-royal-red">*</span>
          </label>
          <ErrorMessage message={errors.modelo} />
          <input
            type="text"
            id="modelo"
            name="modelo"
            value={formData.modelo}
            onChange={handleChange}
            className={addErrorClass("govuk-input", errors.modelo)}
            required
          />
        </motion.div>

        {/* Color */}
        <motion.div className={`govuk-form-group ${errors.color ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="color" className="govuk-label">
            Color <span className="text-royal-red">*</span>
          </label>
          <ErrorMessage message={errors.color} />
          <input
            type="text"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className={addErrorClass("govuk-input", errors.color)}
            required
          />
        </motion.div>

        {/* Tipo */}
        <motion.div className={`govuk-form-group ${errors.tipo ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="tipo" className="govuk-label">
            Tipo <span className="text-royal-red">*</span>
          </label>
          <ErrorMessage message={errors.tipo} />
          <input
            type="text"
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className={addErrorClass("govuk-input", errors.tipo)}
            required
          />
        </motion.div>

        {/* Número de Motor */}
        <motion.div className={`govuk-form-group ${errors.numeroMotor ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="numeroMotor" className="govuk-label">
            Número de Motor <span className="text-royal-red">*</span>
          </label>
          <ErrorMessage message={errors.numeroMotor} />
          <input
            type="text"
            id="numeroMotor"
            name="numeroMotor"
            value={formData.numeroMotor}
            onChange={handleChange}
            className={addErrorClass("govuk-input", errors.numeroMotor)}
            required
          />
        </motion.div>

        {/* Número de Serie */}
        <motion.div className={`govuk-form-group ${errors.numeroSerie || !vinValidation.isValid ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="numeroSerie" className="govuk-label">
            Número de Serie (VIN/NIV) <span className="text-royal-red">*</span>
          </label>
          <ErrorMessage message={errors.numeroSerie || (!vinValidation.isValid ? vinValidation.message : '')} />
          <input
            type="text"
            id="numeroSerie"
            name="numeroSerie"
            value={formData.numeroSerie}
            onChange={handleVinChange}
            className={addErrorClass("govuk-input", errors.numeroSerie || !vinValidation.isValid)}
            placeholder="17 caracteres alfanuméricos"
            required
          />
          {formData.numeroSerie && vinValidation.isValid && formData.numeroSerie.length === 17 && (
            <div className="text-sm text-green-600 mt-1">
              ✓ Formato VIN/NIV válido
            </div>
          )}
        </motion.div>

        {/* Placas */}
        <motion.div className={`govuk-form-group ${errors.placas || !plateValidation.isValid ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="placas" className="govuk-label">
            Placas <span className="text-royal-red">*</span>
          </label>
          <ErrorMessage message={errors.placas || (!plateValidation.isValid ? plateValidation.message : '')} />
          <input
            type="text"
            id="placas"
            name="placas"
            value={formData.placas}
            onChange={handlePlateChange}
            className={addErrorClass("govuk-input", errors.placas || !plateValidation.isValid)}
            placeholder="Ej: ABC123, 123ABC"
            required
          />
          {formData.placas && plateValidation.isValid && formData.placas.length >= 5 && (
            <div className="text-sm text-green-600 mt-1">
              ✓ Formato de placas válido
            </div>
          )}
        </motion.div>

        {/* Número de Circulación */}
        <motion.div className={`govuk-form-group ${errors.numeroCirculacion ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="numeroCirculacion" className="govuk-label">
            No. T. Circulación (Si aplica)
          </label>
          <ErrorMessage message={errors.numeroCirculacion} />
          <input
            type="text"
            id="numeroCirculacion"
            name="numeroCirculacion"
            value={formData.numeroCirculacion}
            onChange={handleChange}
            className={addErrorClass("govuk-input", errors.numeroCirculacion)}
          />
        </motion.div>

        {/* Número de Factura */}
        <motion.div className={`govuk-form-group ${errors.numeroFactura ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="numeroFactura" className="govuk-label">
            No. Factura <span className="text-royal-red">*</span>
          </label>
          <ErrorMessage message={errors.numeroFactura} />
          <input
            type="text"
            id="numeroFactura"
            name="numeroFactura"
            value={formData.numeroFactura}
            onChange={handleChange}
            className={addErrorClass("govuk-input", errors.numeroFactura)}
            required
          />
        </motion.div>

        {/* Refrendos */}
        <motion.div className={`govuk-form-group ${errors.refrendos ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="refrendos" className="govuk-label">
            Refrendos
          </label>
          <ErrorMessage message={errors.refrendos} />
          <input
            type="text"
            id="refrendos"
            name="refrendos"
            value={formData.refrendos}
            onChange={handleChange}
            className={addErrorClass("govuk-input", errors.refrendos)}
          />
        </motion.div>

        {/* RFC Vehículo */}
        <motion.div className={`govuk-form-group ${errors.rfcVehiculo ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="rfcVehiculo" className="govuk-label">
            RFC (Si aplica)
          </label>
          <ErrorMessage message={errors.rfcVehiculo} />
          <input
            type="text"
            id="rfcVehiculo"
            name="rfcVehiculo"
            value={formData.rfcVehiculo}
            onChange={handleChange}
            className={addErrorClass("govuk-input", errors.rfcVehiculo)}
            placeholder="Ej: ABCD123456XXX"
          />
        </motion.div>
      </div>
    </div>
  );
});

export default VehicleInfoSection;