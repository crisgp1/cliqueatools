import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { getLocationByZipCode } from '../../services/SepomexService';
import mexicanStatesAndCities from './MexicanStatesData';

/**
 * Componente para seleccionar ubicación por código postal con autocompletado
 * mediante la API de Sepomex
 * 
 * @param {Object} props
 * @param {string} props.selectedState - Estado seleccionado
 * @param {string} props.selectedCity - Ciudad seleccionada
 * @param {string} props.selectedColony - Colonia seleccionada
 * @param {string} props.zipCode - Código postal
 * @param {Function} props.onChange - Callback para cambios en la selección
 * @param {boolean} props.required - Si los campos son requeridos
 * @param {string} props.className - Clases CSS adicionales
 */
const ZipCodeSelector = memo(({
  selectedState = '',
  selectedCity = '',
  selectedColony = '',
  zipCode = '',
  onChange,
  required = false,
  className = '',
}) => {
  // Estado local
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [postalCode, setPostalCode] = useState(zipCode);
  const [state, setState] = useState(selectedState);
  const [city, setCity] = useState(selectedCity);
  const [colony, setColony] = useState(selectedColony);
  const [colonies, setColonies] = useState([]);
  const [zipCodeLocked, setZipCodeLocked] = useState(false);

  // Inicializar el componente con los valores iniciales
  useEffect(() => {
    setPostalCode(zipCode);
    setState(selectedState);
    setCity(selectedCity);
    setColony(selectedColony);
    
    // Si tenemos código postal, habilitar el bloqueo
    if (zipCode && zipCode.length === 5) {
      setZipCodeLocked(true);
    }
  }, [zipCode, selectedState, selectedCity, selectedColony]);

  // Manejar el cambio de código postal
  const handleZipCodeChange = useCallback(async (e) => {
    const value = e.target.value;
    setPostalCode(value);
    setError(null);

    // Validar que sea un código postal válido (5 dígitos)
    if (value && value.length === 5 && /^\d+$/.test(value)) {
      setLoading(true);
      try {
        const response = await getLocationByZipCode(value);
        
        if (response && response.zip_codes && response.zip_codes.length > 0) {
          // Extraer datos relevantes del primer resultado
          const location = response.zip_codes[0];
          const newState = location.d_estado;
          const newCity = location.d_ciudad || location.d_mnpio;
          
          setState(newState);
          setCity(newCity);
          setZipCodeLocked(true);
          
          // Extraer todas las colonias únicas para este código postal
          const uniqueColonies = [...new Set(
            response.zip_codes.map(item => item.d_asenta)
          )];
          
          setColonies(uniqueColonies);
          
          // Si solo hay una colonia, seleccionarla automáticamente
          if (uniqueColonies.length === 1) {
            setColony(uniqueColonies[0]);
          } else {
            setColony('');
          }
          
          // Notificar al componente padre sobre los cambios
          if (onChange) {
            onChange({
              state: newState,
              city: newCity,
              colony: uniqueColonies.length === 1 ? uniqueColonies[0] : '',
              zipCode: value
            });
          }
        } else {
          setError('No se encontraron resultados para este código postal');
          setColonies([]);
          setColony('');
          setZipCodeLocked(false);
        }
      } catch (err) {
        console.error('Error al buscar código postal:', err);
        setError('Ocurrió un error al buscar el código postal');
        setColonies([]);
        setColony('');
        setZipCodeLocked(false);
      } finally {
        setLoading(false);
      }
    } else if (value && value.length === 5) {
      setError('El código postal debe contener solo dígitos');
      setZipCodeLocked(false);
    } else if (value && value.length > 5) {
      setError('El código postal no puede tener más de 5 dígitos');
      setZipCodeLocked(false);
    } else {
      // Reiniciar colonias si se borra el código postal
      setColonies([]);
      setColony('');
      setZipCodeLocked(false);
    }
  }, [onChange]);

  // Manejar el cambio de colonia
  const handleColonyChange = useCallback((e) => {
    const selectedColony = e.target.value;
    setColony(selectedColony);
    
    // Notificar al padre sobre el cambio de colonia
    if (onChange) {
      onChange({
        state,
        city,
        colony: selectedColony,
        zipCode: postalCode
      });
    }
  }, [onChange, postalCode, state, city]);

  // Manejar cambios en la selección de estado
  const handleStateChange = useCallback((e) => {
    const newState = e.target.value;
    setState(newState);
    setCity('');
    
    // Reiniciar colonia y código postal si se cambia manualmente el estado
    setColony('');
    setPostalCode('');
    setColonies([]);
    setZipCodeLocked(false);
    
    // Notificar al padre sobre los cambios
    if (onChange) {
      onChange({
        state: newState,
        city: '',
        colony: '',
        zipCode: ''
      });
    }
  }, [onChange]);
  
  // Manejar cambios en la selección de ciudad
  const handleCityChange = useCallback((e) => {
    const newCity = e.target.value;
    setCity(newCity);
    
    // Reiniciar colonia y código postal si se cambia manualmente la ciudad
    setColony('');
    setPostalCode('');
    setColonies([]);
    setZipCodeLocked(false);
    
    // Notificar al padre sobre los cambios
    if (onChange) {
      onChange({
        state,
        city: newCity,
        colony: '',
        zipCode: ''
      });
    }
  }, [onChange, state]);
  
  // Obtener ciudades disponibles según el estado seleccionado
  const getAvailableCities = useCallback(() => {
    if (state) {
      const stateData = mexicanStatesAndCities.find(s => s.state === state);
      return stateData ? stateData.cities : [];
    }
    return [];
  }, [state]);

  // Animación
  const itemAnimation = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 20 }
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-4" variants={itemAnimation}>
        {/* Campo de Código Postal */}
        <div className="govuk-form-group">
          <label htmlFor="zip-code" className="govuk-label">
            Código Postal {required && <span className="text-royal-red">*</span>}
          </label>
          <input
            id="zip-code"
            type="text"
            value={postalCode}
            onChange={handleZipCodeChange}
            className="govuk-input"
            placeholder="Ingrese código postal"
            maxLength={5}
            required={required}
          />
          {loading && <p className="text-gray-500 text-sm mt-1">Buscando...</p>}
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          {zipCodeLocked && <p className="text-green-500 text-sm mt-1">Código postal verificado</p>}
        </div>

        {/* Campo de Estado */}
        <div className="govuk-form-group">
          <label htmlFor="state-selector" className="govuk-label">
            Estado {required && <span className="text-royal-red">*</span>}
          </label>
          <select
            id="state-selector"
            name="state"
            value={state}
            onChange={handleStateChange}
            className="govuk-input"
            required={required}
            disabled={zipCodeLocked}
          >
            <option value="">Seleccione un estado</option>
            {mexicanStatesAndCities.map((stateOption) => (
              <option key={stateOption.state} value={stateOption.state}>
                {stateOption.state}
              </option>
            ))}
          </select>
          {zipCodeLocked && <p className="text-green-500 text-sm mt-1">Bloqueado por código postal</p>}
        </div>
        
        {/* Campo de Ciudad */}
        <div className="govuk-form-group">
          <label htmlFor="city-selector" className="govuk-label">
            Ciudad {required && <span className="text-royal-red">*</span>}
          </label>
          <select
            id="city-selector"
            name="city"
            value={city}
            onChange={handleCityChange}
            className="govuk-input"
            required={required}
            disabled={!state || zipCodeLocked}
          >
            <option value="">
              {state ? 'Seleccione una ciudad' : 'Primero seleccione un estado'}
            </option>
            {getAvailableCities().map((cityOption) => (
              <option key={cityOption} value={cityOption}>
                {cityOption}
              </option>
            ))}
          </select>
          {zipCodeLocked && <p className="text-green-500 text-sm mt-1">Bloqueado por código postal</p>}
        </div>
      </motion.div>
      
      <motion.div className="govuk-form-group" variants={itemAnimation}>
        <label htmlFor="colony-selector" className="govuk-label">
          Colonia {required && <span className="text-royal-red">*</span>}
        </label>
        <select
          id="colony-selector"
          value={colony}
          onChange={handleColonyChange}
          className="govuk-input"
          required={required}
          disabled={colonies.length === 0}
        >
          <option value="">
            {colonies.length > 0 
              ? 'Seleccione una colonia' 
              : 'Primero ingrese un código postal válido'}
          </option>
          {colonies.map((colonyOption) => (
            <option key={colonyOption} value={colonyOption}>
              {colonyOption}
            </option>
          ))}
        </select>
      </motion.div>
    </div>
  );
});

export default ZipCodeSelector;