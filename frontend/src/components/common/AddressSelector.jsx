import React, { useState, useEffect, useCallback, memo } from 'react';
import { AutoComplete, Input, Select, Tabs, Spin, Typography, Space } from 'antd';
import { motion } from 'framer-motion';
import { searchAddressByText, getLocationByZipCode, formatAddressData } from '../../services/RadarService';
import mexicanStatesAndCities from './MexicanStatesData';

const { Option } = Select;
const { Text } = Typography;
const { TabPane } = Tabs;

/**
 * Componente para seleccionar dirección con dos métodos:
 * 1. Búsqueda por texto con autocompletado
 * 2. Búsqueda por código postal (CP)
 * 
 * @param {Object} props
 * @param {string} props.selectedState - Estado seleccionado
 * @param {string} props.selectedCity - Ciudad seleccionada
 * @param {string} props.selectedColony - Colonia seleccionada
 * @param {string} props.zipCode - Código postal
 * @param {string} props.street - Calle
 * @param {string} props.houseNumber - Número exterior
 * @param {Function} props.onChange - Callback para cambios en la selección
 * @param {boolean} props.required - Si los campos son requeridos
 * @param {string} props.className - Clases CSS adicionales
 */
const AddressSelector = memo(({
  selectedState = '',
  selectedCity = '',
  selectedColony = '',
  zipCode = '',
  street = '',
  houseNumber = '',
  onChange,
  required = false,
  className = '',
}) => {
  // Estado local
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [activeSearchMode, setActiveSearchMode] = useState('autocomplete');
  
  // Estado para el método de código postal
  const [postalCode, setPostalCode] = useState(zipCode);
  const [state, setState] = useState(selectedState);
  const [city, setCity] = useState(selectedCity);
  const [colony, setColony] = useState(selectedColony);
  const [colonies, setColonies] = useState([]);
  const [zipCodeLocked, setZipCodeLocked] = useState(false);

  // Inicializar el componente con valores iniciales
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

  // Función debounce para limitar llamadas a la API
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Búsqueda de direcciones por texto
  const searchAddresses = async (text) => {
    if (!text || text.length < 3) {
      setAddressOptions([]);
      return;
    }
    
    setLoading(true);
    try {
      const results = await searchAddressByText(text);
      
      // Formatear resultados para el autocompletado
      const options = results.map(item => {
        const addressData = formatAddressData(item);
        return {
          value: addressData.formattedAddress,
          label: (
            <div>
              <Text strong>{addressData.street} {addressData.houseNumber}</Text>
              <div>
                <Text type="secondary">
                  {addressData.colony}, {addressData.city}, {addressData.state}, CP {addressData.zipCode}
                </Text>
              </div>
            </div>
          ),
          addressData: addressData
        };
      });
      
      setAddressOptions(options);
    } catch (err) {
      console.error('Error al buscar direcciones:', err);
      setError('Error al buscar direcciones. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Debounce para la búsqueda
  const debouncedSearch = useCallback(
    debounce(searchAddresses, 300),
    []
  );

  // Manejar cambio en la búsqueda de texto
  const handleSearchChange = (value) => {
    setSearchText(value);
    debouncedSearch(value);
  };

  // Manejar selección de una dirección
  const handleAddressSelect = (value, option) => {
    setSelectedAddress(option.addressData);
    
    // Actualizar los campos individuales
    setState(option.addressData.state);
    setCity(option.addressData.city);
    setColony(option.addressData.colony);
    setPostalCode(option.addressData.zipCode);
    
    // Notificar al componente padre
    if (onChange) {
      onChange({
        state: option.addressData.state,
        city: option.addressData.city,
        colony: option.addressData.colony,
        zipCode: option.addressData.zipCode,
        street: option.addressData.street,
        houseNumber: option.addressData.houseNumber,
        fullAddress: option.addressData.formattedAddress,
        raw: option.addressData.raw
      });
    }
  };

  // Manejar el cambio de código postal
  const handleZipCodeChange = useCallback(async (e) => {
    const value = e.target.value;
    setPostalCode(value);
    setError(null);

    // Validar que sea un código postal válido (5 dígitos)
    if (value && value.length === 5 && /^\d+$/.test(value)) {
      setLoading(true);
      try {
        const results = await getLocationByZipCode(value);
        
        if (results && results.length > 0) {
          // Extraer datos del primer resultado
          const locationData = formatAddressData(results[0]);
          const newState = locationData.state;
          const newCity = locationData.city;
          
          setState(newState);
          setCity(newCity);
          setZipCodeLocked(true);
          
          // Recopilar colonias únicas de todos los resultados
          const uniqueColonies = [...new Set(
            results.map(item => {
              const data = formatAddressData(item);
              return data.colony;
            }).filter(c => c) // Filtrar valores vacíos
          )];
          
          setColonies(uniqueColonies);
          
          // Si solo hay una colonia, seleccionarla automáticamente
          if (uniqueColonies.length === 1) {
            setColony(uniqueColonies[0]);
          } else {
            setColony('');
          }
          
          // Notificar al componente padre
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
  const handleColonyChange = useCallback((value) => {
    setColony(value);
    
    // Notificar al padre sobre el cambio de colonia
    if (onChange) {
      onChange({
        state,
        city,
        colony: value,
        zipCode: postalCode
      });
    }
  }, [onChange, postalCode, state, city]);

  // Manejar cambios en la selección de estado
  const handleStateChange = useCallback((value) => {
    setState(value);
    setCity('');
    
    // Reiniciar colonia y código postal si se cambia manualmente el estado
    setColony('');
    setPostalCode('');
    setColonies([]);
    setZipCodeLocked(false);
    
    // Notificar al padre sobre los cambios
    if (onChange) {
      onChange({
        state: value,
        city: '',
        colony: '',
        zipCode: ''
      });
    }
  }, [onChange]);
  
  // Manejar cambios en la selección de ciudad
  const handleCityChange = useCallback((value) => {
    setCity(value);
    
    // Reiniciar colonia y código postal si se cambia manualmente la ciudad
    setColony('');
    setPostalCode('');
    setColonies([]);
    setZipCodeLocked(false);
    
    // Notificar al padre sobre los cambios
    if (onChange) {
      onChange({
        state,
        city: value,
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

  // Cambiar entre modos de búsqueda
  const handleTabChange = (key) => {
    setActiveSearchMode(key);
    setError(null);
  };

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
      <Tabs 
        defaultActiveKey={activeSearchMode}
        onChange={handleTabChange}
        className="govuk-tabs" 
      >
        <TabPane tab="Buscar por dirección" key="autocomplete">
          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="address-search" className="govuk-label mb-2">
              Buscar dirección {required && <span className="text-royal-red">*</span>}
            </label>
            <AutoComplete
              id="address-search"
              value={searchText}
              options={addressOptions}
              onSelect={handleAddressSelect}
              onChange={handleSearchChange}
              onSearch={handleSearchChange}
              className="w-full"
              placeholder="Ingrese calle y número"
              notFoundContent={loading ? <Spin size="small" /> : "No se encontraron resultados"}
              required={required}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            
            {selectedAddress && (
              <div className="mt-4 p-3 border rounded-md bg-gray-50">
                <h4 className="font-medium mb-2">Dirección seleccionada:</h4>
                <p><strong>Calle:</strong> {selectedAddress.street}</p>
                <p><strong>Número:</strong> {selectedAddress.houseNumber}</p>
                <p><strong>Colonia:</strong> {selectedAddress.colony}</p>
                <p><strong>Ciudad:</strong> {selectedAddress.city}</p>
                <p><strong>Estado:</strong> {selectedAddress.state}</p>
                <p><strong>CP:</strong> {selectedAddress.zipCode}</p>
              </div>
            )}
          </motion.div>
        </TabPane>
        
        <TabPane tab="Buscar por código postal" key="zipcode">
          <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-4" variants={itemAnimation}>
            {/* Campo de Código Postal */}
            <div className="govuk-form-group">
              <label htmlFor="zip-code" className="govuk-label">
                Código Postal {required && <span className="text-royal-red">*</span>}
              </label>
              <Input
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
              <Select
                id="state-selector"
                value={state}
                onChange={handleStateChange}
                className="w-full"
                placeholder="Seleccione un estado"
                disabled={zipCodeLocked}
                required={required}
              >
                {mexicanStatesAndCities.map((stateOption) => (
                  <Option key={stateOption.state} value={stateOption.state}>
                    {stateOption.state}
                  </Option>
                ))}
              </Select>
              {zipCodeLocked && <p className="text-green-500 text-sm mt-1">Bloqueado por código postal</p>}
            </div>
            
            {/* Campo de Ciudad */}
            <div className="govuk-form-group">
              <label htmlFor="city-selector" className="govuk-label">
                Ciudad {required && <span className="text-royal-red">*</span>}
              </label>
              <Select
                id="city-selector"
                value={city}
                onChange={handleCityChange}
                className="w-full"
                placeholder={state ? 'Seleccione una ciudad' : 'Primero seleccione un estado'}
                disabled={!state || zipCodeLocked}
                required={required}
              >
                {getAvailableCities().map((cityOption) => (
                  <Option key={cityOption} value={cityOption}>
                    {cityOption}
                  </Option>
                ))}
              </Select>
              {zipCodeLocked && <p className="text-green-500 text-sm mt-1">Bloqueado por código postal</p>}
            </div>
          </motion.div>
          
          <motion.div className="govuk-form-group mt-4" variants={itemAnimation}>
            <label htmlFor="colony-selector" className="govuk-label">
              Colonia {required && <span className="text-royal-red">*</span>}
            </label>
            <Select
              id="colony-selector"
              value={colony}
              onChange={handleColonyChange}
              className="w-full"
              placeholder={colonies.length > 0 ? 'Seleccione una colonia' : 'Primero ingrese un código postal válido'}
              disabled={colonies.length === 0}
              required={required}
            >
              {colonies.map((colonyOption) => (
                <Option key={colonyOption} value={colonyOption}>
                  {colonyOption}
                </Option>
              ))}
            </Select>
          </motion.div>
        </TabPane>
      </Tabs>
    </div>
  );
});

export default AddressSelector;