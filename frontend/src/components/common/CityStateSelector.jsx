import { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import mexicanStatesAndCities from './MexicanStatesData';

/**
 * Component for selecting Mexican states and cities
 * 
 * @param {Object} props
 * @param {string} props.selectedState - Currently selected state
 * @param {string} props.selectedCity - Currently selected city
 * @param {Function} props.onChange - Callback for when selection changes
 * @param {string} props.stateLabel - Label for the state field
 * @param {string} props.cityLabel - Label for the city field
 * @param {boolean} props.required - Whether the fields are required
 * @param {string} props.className - Additional CSS classes
 */
const CityStateSelector = memo(({
  selectedState = '',
  selectedCity = '',
  onChange,
  stateLabel = 'Estado',
  cityLabel = 'Ciudad',
  required = false,
  className = '',
}) => {
  const [availableCities, setAvailableCities] = useState([]);
  const [state, setState] = useState(selectedState);
  const [city, setCity] = useState(selectedCity);
  
  // Initialize component with the initial values (runs only once)
  useEffect(() => {
    setState(selectedState);
    setCity(selectedCity);
    
    // Initial setup of available cities based on the selected state
    if (selectedState) {
      const stateData = mexicanStatesAndCities.find(s => s.state === selectedState);
      if (stateData) {
        setAvailableCities(stateData.cities);
      }
    }
  }, []); // Empty dependency array - runs only once on mount
  
  // Handler for state change
  const handleStateChange = useCallback((newState) => {
    setState(newState);
    
    // Update available cities when state changes
    if (newState) {
      const stateData = mexicanStatesAndCities.find(s => s.state === newState);
      if (stateData) {
        setAvailableCities(stateData.cities);
        
        // If current city isn't in the list of cities for the new state, reset it
        if (city && !stateData.cities.includes(city)) {
          setCity('');
        }
      } else {
        setAvailableCities([]);
      }
    } else {
      setAvailableCities([]);
      setCity('');
    }
    
    // Notify parent about the state change
    if (onChange) {
      onChange({ state: newState, city: '' });
    }
  }, [city, onChange]);
  
  // Handler for city change
  const handleCityChange = useCallback((newCity) => {
    setCity(newCity);
    
    // Notify parent about the city change
    if (onChange) {
      onChange({ state, city: newCity });
    }
  }, [state, onChange]);
  
  // Sync with parent props when they change
  useEffect(() => {
    // Only update if props actually changed and are different from internal state
    if (selectedState !== '' && selectedState !== state) {
      setState(selectedState);
      
      // Update available cities
      const stateData = mexicanStatesAndCities.find(s => s.state === selectedState);
      if (stateData) {
        setAvailableCities(stateData.cities);
      } else {
        setAvailableCities([]);
      }
    }
    
    if (selectedCity !== '' && selectedCity !== city) {
      setCity(selectedCity);
    }
  }, [selectedState, selectedCity]);

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
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      <motion.div className="govuk-form-group" variants={itemAnimation}>
        <label htmlFor="state-selector" className="govuk-label">
          {stateLabel} {required && <span className="text-royal-red">*</span>}
        </label>
        <select
          id="state-selector"
          name="state"
          value={state}
          onChange={(e) => handleStateChange(e.target.value)}
          className="govuk-input"
          required={required}
        >
          <option value="">Seleccione un estado</option>
          {mexicanStatesAndCities.map((stateOption) => (
            <option key={stateOption.state} value={stateOption.state}>
              {stateOption.state}
            </option>
          ))}
        </select>
      </motion.div>

      <motion.div className="govuk-form-group" variants={itemAnimation}>
        <label htmlFor="city-selector" className="govuk-label">
          {cityLabel} {required && <span className="text-royal-red">*</span>}
        </label>
        <select
          id="city-selector"
          name="city"
          value={city}
          onChange={(e) => handleCityChange(e.target.value)}
          className="govuk-input"
          required={required}
          disabled={!state}
        >
          <option value="">
            {state ? 'Seleccione una ciudad' : 'Primero seleccione un estado'}
          </option>
          {availableCities.map((cityOption) => (
            <option key={cityOption} value={cityOption}>
              {cityOption}
            </option>
          ))}
        </select>
      </motion.div>
    </div>
  );
});

export default CityStateSelector;