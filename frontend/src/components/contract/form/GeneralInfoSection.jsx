import { memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import RadarAddressAutocomplete from '../../common/RadarAddressAutocomplete';
import useAddressStore from '../../../store/addressStore';

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
  // Obtener estado y acciones del store
  const {
    addressValue,
    suggestions,
    isSearching,
    radarInitialized,
    setAddressValue,
    checkRadarInitialization,
    searchAddresses,
    clearSuggestions
  } = useAddressStore();
  
  // Inicializar dirección desde formData al montar el componente
  useEffect(() => {
    if (formData.direccionCompleta) {
      setAddressValue(formData.direccionCompleta);
    }
    
    // Verificar inicialización de Radar
    checkRadarInitialization();
    
    // Limpiar sugerencias al desmontar
    return () => clearSuggestions();
  }, [formData.direccionCompleta, setAddressValue, checkRadarInitialization, clearSuggestions]);
  
  // Animation variants
  const itemAnimation = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 20 }
    }
  };
  
  // Función para manejar la selección de dirección del autocompletado
  const handleAddressSelection = (e) => {
    const addressValue = e.target.value;
    setAddressValue(addressValue);
    
    // Verificar si tenemos el objeto de dirección completo
    if (e.target && e.target.addressObject) {
      const addr = e.target.addressObject;
      updateAddressFields(addr, addressValue);
    } else {
      // Si solo tenemos el texto, actualizar direccionCompleta
      if (handleChange) {
        handleChange({ target: { name: 'direccionCompleta', value: addressValue } });
      }
      
      // Si el texto tiene longitud suficiente, también intentar buscar direcciones
      if (addressValue && addressValue.length >= 3) {
        searchAddresses(addressValue);
      }
    }
  };
  
  // Función para manejar el cambio de texto en el input de búsqueda fallback
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setAddressValue(value);
    
    // Buscar direcciones si hay suficiente texto
    if (value && value.length >= 3) {
      searchAddresses(value);
      console.log("Buscando direcciones con:", value);
    }
    
    // Actualizar direccionCompleta
    handleChange({ 
      target: { 
        name: 'direccionCompleta', 
        value
      } 
    });
  };
  
  // Función para manejar la selección de una sugerencia
  const handleSuggestionSelect = (suggestion) => {
    if (suggestion && suggestion.raw) {
      const addr = suggestion.raw;
      const fullAddress = addr.formattedAddress || suggestion.description;
      
      updateAddressFields(addr, fullAddress);
      setAddressValue(fullAddress);
      clearSuggestions();
    }
  };
  
  // Función para actualizar todos los campos de dirección
  const updateAddressFields = (addr, addressValue) => {
    // Actualizar campos de ubicación con handleLocationChange
    handleLocationChange({
      state: addr.state || formData.estado,
      city: addr.city || formData.ciudad,
      colony: addr.colony || formData.colonia,
      zipCode: addr.zipCode || formData.codigoPostal,
      street: addr.street || formData.calle,
      houseNumber: addr.houseNumber || formData.numeroExterior,
      fullAddress: addr.formattedAddress || addressValue
    });
    
    // Actualizar campos individuales en el estado formData
    if (handleChange) {
      const fieldsToUpdate = [
        { name: 'calle', value: addr.street || '' },
        { name: 'numeroExterior', value: addr.houseNumber || '' },
        { name: 'colonia', value: addr.colony || '' },
        { name: 'ciudad', value: addr.city || '' },
        { name: 'estado', value: addr.state || '' },
        { name: 'codigoPostal', value: addr.zipCode || '' },
        { name: 'direccionCompleta', value: addr.formattedAddress || addressValue }
      ];
      
      // Actualizar cada campo individualmente
      fieldsToUpdate.forEach(field => {
        if (field.value) {
          handleChange({ target: { name: field.name, value: field.value } });
        }
      });
    }
  };

  return (
    <div className="govuk-form-section">
      <h3 className="govuk-form-section-title">Información General</h3>
      <div className="grid grid-cols-1 gap-4">
        {/* Domicilio Autocomplete */}
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="domicilio" className="govuk-label">
            Domicilio <span className="text-royal-red">*</span>
          </label>
          {radarInitialized !== false ? (
            // Usar RadarAddressAutocomplete si está disponible
            <RadarAddressAutocomplete
              value={addressValue}
              onChange={handleAddressSelection}
              required={true}
              inputId="domicilio"
              className="w-full"
              showMap={false}
            />
          ) : (
            // Fallback input con autocompletado básico
            <div className="address-fallback">
              <input
                type="text"
                id="domicilio-fallback"
                value={addressValue}
                onChange={handleSearchInputChange}
                className="govuk-input w-full"
                placeholder="Buscar dirección..."
                required
              />
              
              {isSearching && (
                <p className="text-sm text-gray-500 mt-1">Buscando...</p>
              )}
              
              {/* Sugerencias de direcciones */}
              {suggestions.length > 0 && (
                <div className="address-suggestions mt-2 border rounded-md shadow-sm">
                  <ul className="max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion, index) => {
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