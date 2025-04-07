import { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { identificacionesComunes } from '../utils/ContractUtils';
import RadarAddressAutocomplete from '../../common/RadarAddressAutocomplete';
import { ErrorMessage, addErrorClass } from '../utils/ErrorSummary';
import { validateMexicanField } from '../utils/ValidationSchema';

/**
 * Buyer Information section of the contract form
 * 
 * @param {Object} props
 * @param {Object} props.formData - The contract form data
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {boolean} props.idModalShown - Whether ID modal has been shown
 * @param {Function} props.setIdModalShown - Function to set ID modal shown state
 * @param {Function} props.setShowIdCopyModal - Function to show ID copy modal
 * @param {Function} props.setShowAddressProofModal - Function to show address proof modal
 * @param {Object} props.errors - Field-specific error messages
 */
const BuyerInfoSection = memo(({ 
  formData, 
  handleChange,
  idModalShown,
  setIdModalShown,
  setShowIdCopyModal,
  setShowAddressProofModal,
  errors = {}
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
  // Estado local para validación en tiempo real
  const [idValidation, setIdValidation] = useState({
    isValid: true,
    idType: '',
    message: ''
  });

  // Validar el número de identificación según el tipo seleccionado
  const validateIdentification = (value, type) => {
    // Si no hay valor o tipo, no validamos
    if (!value || !type) return { isValid: true, message: '' };

    let validationType = '';
    
    // Detectar tipo de identificación basado en el tipo seleccionado
    if (type.toLowerCase().includes('rfc')) {
      validationType = 'RFC';
    } else if (type.toLowerCase().includes('curp')) {
      validationType = 'CURP';
    } else if (type.toLowerCase().includes('ine') || type.toLowerCase().includes('elector')) {
      validationType = 'INE_CLAVE';
      
      // Verificar si parece ser un OCR (solo dígitos)
      if (/^\d+$/.test(value) && value.length === 13) {
        validationType = 'INE_OCR';
      }
    }
    
    // Si no tenemos un tipo específico para validar, no mostramos error
    if (!validationType) return { isValid: true, message: '' };
    
    // Validar según el tipo detectado
    const isValid = validateMexicanField(value, validationType);
    
    let message = '';
    if (!isValid) {
      switch (validationType) {
        case 'RFC':
          message = 'El RFC debe tener formato ABCD123456XXX para personas físicas o ABC123456XXX para morales';
          break;
        case 'CURP':
          message = 'La CURP debe tener 18 caracteres con el formato correcto';
          break;
        case 'INE_CLAVE':
          message = 'La clave de elector debe tener 18 caracteres alfanuméricos';
          break;
        case 'INE_OCR':
          message = 'El OCR debe tener 13 dígitos numéricos';
          break;
      }
    }
    
    return { isValid, message, idType: validationType };
  };

  // Manejar cambio en el campo de número de identificación
  const handleIdentificationChange = (e) => {
    const { value } = e.target;
    handleChange(e);
    
    // Validar identificación en tiempo real
    const result = validateIdentification(value, formData.identificacionComprador);
    setIdValidation(result);
  };

  // Manejar cambio en el tipo de identificación
  const handleIdTypeChange = (e) => {
    handleChange(e);
    
    // Volver a validar el número con el nuevo tipo
    if (formData.numeroIdentificacion) {
      const result = validateIdentification(
        formData.numeroIdentificacion,
        e.target.value
      );
      setIdValidation(result);
    }
  };
  // Mostrar modal de recordatorio de copia de ID
  const showIdCopyReminder = () => {
    if (!idModalShown) {
      setIdModalShown(true);
      setShowIdCopyModal(true);
    }
  };

  // Mostrar modal de recordatorio de comprobante de domicilio
  const showAddressProofReminder = () => {
    setShowAddressProofModal(true);
  };

  // Verificar si la dirección está completa
  const checkAddressComplete = () => {
    if (!formData.domicilioComprador || formData.domicilioComprador.trim() === '') {
      showAddressProofReminder();
    }
  };

  // Efecto para añadir event listeners a los campos de identificación y domicilio
  useEffect(() => {
    // Referencias a los campos de formulario
    const idTypeField = document.getElementById('identificacionComprador');
    const idNumberField = document.getElementById('numeroIdentificacion');
    const addressField = document.getElementById('domicilioComprador');

    // Funciones para los event listeners
    const handleIdTypeFieldFocus = () => {
      // Solo mostrar el modal si no se ha mostrado antes
      if (!idModalShown && (!formData.identificacionComprador || !formData.numeroIdentificacion)) {
        showIdCopyReminder();
      }
    };

    const handleAddressFieldBlur = () => {
      if (!formData.domicilioComprador || formData.domicilioComprador.trim() === '') {
        showAddressProofReminder();
      }
    };

    // Añadir event listeners
    if (idTypeField) idTypeField.addEventListener('focus', handleIdTypeFieldFocus);
    if (idNumberField) idNumberField.addEventListener('focus', handleIdTypeFieldFocus);
    if (addressField) addressField.addEventListener('blur', handleAddressFieldBlur);

    // Limpiar event listeners al desmontar
    return () => {
      if (idTypeField) idTypeField.removeEventListener('focus', handleIdTypeFieldFocus);
      if (idNumberField) idNumberField.removeEventListener('focus', handleIdTypeFieldFocus);
      if (addressField) addressField.removeEventListener('blur', handleAddressFieldBlur);
    };
  }, [formData.identificacionComprador, formData.numeroIdentificacion, formData.domicilioComprador, idModalShown]);

  return (
    <div className="govuk-form-section">
      <h3 className="govuk-form-section-title">Información del Comprador</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Buyer Name */}
        <motion.div className={`govuk-form-group ${errors.nombreComprador ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="nombreComprador" className="govuk-label">
            Nombre o Razón Social <span className="text-royal-red">*</span>
          </label>
          <ErrorMessage message={errors.nombreComprador} />
          <input
            type="text"
            id="nombreComprador"
            name="nombreComprador"
            value={formData.nombreComprador}
            onChange={handleChange}
            className={addErrorClass("govuk-input", errors.nombreComprador)}
            required
          />
        </motion.div>

        {/* Buyer Address with Radar Autocomplete */}
        <motion.div className={`govuk-form-group ${errors.domicilioComprador ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="domicilioComprador" className="govuk-label">
            Domicilio <span className="text-royal-red">*</span>
          </label>
          <ErrorMessage message={errors.domicilioComprador} />
          <RadarAddressAutocomplete
            value={formData.domicilioComprador}
            onChange={handleChange}
            required={true}
            error={errors.domicilioComprador}
            inputId="domicilioComprador"
            showMap={false}
          />
        </motion.div>

        {/* Buyer Phone */}
        <motion.div className={`govuk-form-group ${errors.telefonoComprador ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="telefonoComprador" className="govuk-label">
            Teléfono <span className="text-royal-red">*</span>
          </label>
          <ErrorMessage message={errors.telefonoComprador} />
          <input
            type="text"
            id="telefonoComprador"
            name="telefonoComprador"
            value={formData.telefonoComprador}
            onChange={handleChange}
            className={addErrorClass("govuk-input", errors.telefonoComprador)}
            required
          />
        </motion.div>

        {/* Buyer Email */}
        <motion.div className={`govuk-form-group ${errors.emailComprador ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="emailComprador" className="govuk-label">
            Correo Electrónico
          </label>
          <ErrorMessage message={errors.emailComprador} />
          <input
            type="email"
            id="emailComprador"
            name="emailComprador"
            value={formData.emailComprador}
            onChange={handleChange}
            className={addErrorClass("govuk-input", errors.emailComprador)}
          />
        </motion.div>

        {/* Buyer ID Type */}
        <motion.div className={`govuk-form-group ${errors.identificacionComprador ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="identificacionComprador" className="govuk-label">
            Tipo de Identificación <span className="text-royal-red">*</span>
          </label>
          <ErrorMessage message={errors.identificacionComprador} />
          <div className="flex items-center">
            <input
              type="text"
              id="identificacionComprador"
              name="identificacionComprador"
              value={formData.identificacionComprador}
              onChange={handleIdTypeChange}
              className={addErrorClass("govuk-input w-full", errors.identificacionComprador)}
              placeholder="INE, Pasaporte, RFC, CURP, etc."
              required
            />
            <button 
              type="button"
              onClick={showIdCopyReminder}
              className="ml-2 text-blue-600 hover:text-blue-800"
              title="Ver opciones de identificación"
            >
              <IoInformationCircleOutline className="w-6 h-6" />
            </button>
          </div>
        </motion.div>

        {/* Buyer ID Number */}
        <motion.div 
          className={`govuk-form-group ${errors.numeroIdentificacion || !idValidation.isValid ? 'govuk-form-group--error' : ''}`} 
          variants={itemAnimation}
        >
          <label htmlFor="numeroIdentificacion" className="govuk-label">
            Número de Identificación <span className="text-royal-red">*</span>
          </label>
          <ErrorMessage message={errors.numeroIdentificacion || (!idValidation.isValid ? idValidation.message : '')} />
          <input
            type="text"
            id="numeroIdentificacion"
            name="numeroIdentificacion"
            value={formData.numeroIdentificacion}
            onChange={handleIdentificationChange}
            className={addErrorClass("govuk-input", errors.numeroIdentificacion || !idValidation.isValid)}
            required
          />
          {idValidation.idType && idValidation.isValid && (
            <div className="text-sm text-green-600 mt-1">
              ✓ Formato de {idValidation.idType.replace('_', ' ')} válido
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
});

export default BuyerInfoSection;