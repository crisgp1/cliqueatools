import { memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoInformationCircleOutline, IoWarningOutline } from 'react-icons/io5';
import { identificacionesComunes } from '../utils/ContractUtils';

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
 */
const BuyerInfoSection = memo(({ 
  formData, 
  handleChange,
  idModalShown,
  setIdModalShown,
  setShowIdCopyModal,
  setShowAddressProofModal
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
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="nombreComprador" className="govuk-label">
            Nombre o Razón Social <span className="text-royal-red">*</span>
          </label>
          <input
            type="text"
            id="nombreComprador"
            name="nombreComprador"
            value={formData.nombreComprador}
            onChange={handleChange}
            className="govuk-input"
            required
          />
        </motion.div>

        {/* Buyer Address */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="domicilioComprador" className="govuk-label">
            Domicilio <span className="text-royal-red">*</span>
          </label>
          <input
            type="text"
            id="domicilioComprador"
            name="domicilioComprador"
            value={formData.domicilioComprador}
            onChange={handleChange}
            className="govuk-input"
            required
          />
        </motion.div>

        {/* Buyer Phone */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="telefonoComprador" className="govuk-label">
            Teléfono <span className="text-royal-red">*</span>
          </label>
          <input
            type="text"
            id="telefonoComprador"
            name="telefonoComprador"
            value={formData.telefonoComprador}
            onChange={handleChange}
            className="govuk-input"
            required
          />
        </motion.div>

        {/* Buyer Email */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="emailComprador" className="govuk-label">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="emailComprador"
            name="emailComprador"
            value={formData.emailComprador}
            onChange={handleChange}
            className="govuk-input"
          />
        </motion.div>

        {/* Buyer ID Type */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="identificacionComprador" className="govuk-label">
            Tipo de Identificación <span className="text-royal-red">*</span>
          </label>
          <div className="flex items-center">
            <input
              type="text"
              id="identificacionComprador"
              name="identificacionComprador"
              value={formData.identificacionComprador}
              onChange={handleChange}
              className="govuk-input w-full"
              placeholder="INE, Pasaporte, etc."
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
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="numeroIdentificacion" className="govuk-label">
            Número de Identificación <span className="text-royal-red">*</span>
          </label>
          <input
            type="text"
            id="numeroIdentificacion"
            name="numeroIdentificacion"
            value={formData.numeroIdentificacion}
            onChange={handleChange}
            className="govuk-input"
            required
          />
        </motion.div>
      </div>
    </div>
  );
});

export default BuyerInfoSection;