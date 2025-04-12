import { memo, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { identificacionesComunes } from '../utils/ContractUtils';
import RadarAddressAutocomplete from '../../common/RadarAddressAutocomplete';
import { ErrorMessage, addErrorClass } from '../utils/ErrorSummary';
import { validateMexicanField } from '../utils/ValidationSchema';
import useAddressStore from '../../../store/addressStore';

/**
 * Buyer Information section of the contract form
 * 
 * @param {Object} props
 * @param {Object} props.formData - The contract form data
 * @param {Function} props.handleChange - Function to handle input changes
 * @param {Function} props.handleLocationChange - Function to handle location changes
 * @param {boolean} props.idModalShown - Whether ID modal has been shown
 * @param {Function} props.setIdModalShown - Function to set ID modal shown state
 * @param {Function} props.setShowIdCopyModal - Function to show ID copy modal
 * @param {Function} props.setShowAddressProofModal - Function to show address proof modal
 * @param {Object} props.errors - Field-specific error messages
 */
const BuyerInfoSection = memo(({ 
  formData, 
  handleChange,
  handleLocationChange,
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

  // Obtener estado y acciones del store
  const {
    addressValue: buyerAddressValue,
    suggestions,
    isSearching,
    radarInitialized,
    setAddressValue: setBuyerAddressValue,
    checkRadarInitialization,
    searchAddresses,
    clearSuggestions
  } = useAddressStore();
  
  // Estado local para la dirección
  const [addressValue, setAddressValue] = useState('');

  // Inicializar dirección desde formData al montar el componente
  useEffect(() => {
    if (formData.domicilioComprador) {
      // Usar 'buyer' como contexto específico
      setBuyerAddressValue(formData.domicilioComprador);
      setAddressValue(formData.domicilioComprador);
    }
    
    // Verificar inicialización de Radar
    checkRadarInitialization();
    
    // Limpiar sugerencias al desmontar
    return () => clearSuggestions();
  }, [formData.domicilioComprador, setBuyerAddressValue, checkRadarInitialization]);

  // Mantener sincronizado el estado local con el formData
  useEffect(() => {
    if (formData.domicilioComprador !== addressValue) {
      setAddressValue(formData.domicilioComprador);
    }
  }, [formData.domicilioComprador, setAddressValue]);

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

  // Función para manejar la selección de dirección del autocompletado
  const handleAddressSelection = (e) => {
    const addressValue = e.target.value;
    setBuyerAddressValue(addressValue);
    setAddressValue(addressValue);
    
    // Verificar si tenemos el objeto de dirección completo
    if (e.target && e.target.addressObject) {
      const addr = e.target.addressObject;
      updateBuyerAddressFields(addr, addressValue);
    } else {
      // Si solo tenemos el texto, actualizar domicilioComprador
      if (handleChange) {
        handleChange({ target: { name: 'domicilioComprador', value: addressValue } });
      }
      
      // Si el texto tiene longitud suficiente, también intentar buscar direcciones
      if (addressValue && addressValue.length >= 3) {
        addressStore.searchAddresses(addressValue, 'buyer');
      }
    }
  };

  // Función para actualizar todos los campos de dirección
  const updateBuyerAddressFields = (addr, addressValue) => {
    // Actualizar campos de ubicación con handleLocationChange
    if (handleLocationChange) {
      handleLocationChange({
        // Solo actualizamos los campos relacionados con el comprador
        buyerState: addr.state || '',
        buyerCity: addr.city || '',
        buyerColony: addr.colony || '',
        buyerZipCode: addr.zipCode || '',
        buyerStreet: addr.street || '',
        buyerHouseNumber: addr.houseNumber || '',
        buyerFullAddress: addr.formattedAddress || addressValue
      });
    }
    
    // Actualizar el campo domicilioComprador en el estado formData
    if (handleChange) {
      handleChange({ 
        target: { 
          name: 'domicilioComprador', 
          value: addr.formattedAddress || addressValue 
        } 
      });
    }
  };
  
  // Función para manejar el cambio de texto en el input de búsqueda fallback
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setBuyerAddressValue(value);
    setAddressValue(value);
    
    // Buscar direcciones si hay suficiente texto
    if (value && value.length >= 3) {
      addressStore.searchAddresses(value, 'buyer');
    }
    
    // Actualizar domicilioComprador
    handleChange({ 
      target: { 
        name: 'domicilioComprador', 
        value
      } 
    });
  };
  
  // Función para manejar la selección de una sugerencia
  const handleSuggestionSelect = (suggestion) => {
    if (suggestion && suggestion.raw) {
      const addr = suggestion.raw;
      const fullAddress = addr.formattedAddress || suggestion.description;
      
      updateBuyerAddressFields(addr, fullAddress);
      setBuyerAddressValue(fullAddress);
      clearSuggestions();
      setAddressValue(fullAddress);
    }
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

        {/* Buyer Address with Radar Autocomplete - Ahora con tamaño completo */}
        <motion.div className={`govuk-form-group ${errors.domicilioComprador ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
          <label htmlFor="domicilioComprador" className="govuk-label">
            Domicilio <span className="text-royal-red">*</span>
          </label>
          <ErrorMessage message={errors.domicilioComprador} />
          
          {/* Usamos el mismo estilos que los demás campos para consistencia visual */}
          {radarInitialized !== false ? (
            // Usar RadarAddressAutocomplete si está disponible
            <div className="w-full">
              <RadarAddressAutocomplete
                value={buyerAddressValue || ''}
                onChange={handleAddressSelection}
                required={true}
                error={errors.domicilioComprador}
                inputId="domicilioComprador"
                showMap={false}
                className="w-full h-full"
              />
            </div>
          ) : (
            // Fallback input con autocompletado básico, altura ajustada para consistencia
            <div className="address-fallback w-full">
              <input
                type="text"
                id="domicilioComprador"
                value={addressValue}
                onChange={handleSearchInputChange}
                className={addErrorClass("govuk-input w-full", errors.domicilioComprador)}
                placeholder="Buscar dirección..."
                required
                style={{ minHeight: '42px' }}
              />
              
              {isBuyerSearching && (
                <p className="text-sm text-gray-500 mt-1">Buscando...</p>
              )}
              
              {/* Sugerencias de direcciones */}
              {buyerSuggestions.length > 0 && (
                <div className="address-suggestions mt-2 border rounded-md shadow-sm">
                  <ul className="max-h-60 overflow-y-auto">
                    {buyerSuggestions.map((suggestion, index) => {
                      const formattedAddr = suggestion.raw?.formattedAddress || suggestion.description;
                      return (
                        <li 
                          key={index} 
                          className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                          onClick={() => handleSuggestionSelect(suggestion)}
                        >
                          {formattedAddr}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Ingresa tu dirección para autocompletar
          </p>
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