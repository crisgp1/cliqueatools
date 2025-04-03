import { useState, useEffect } from 'react';
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
const CityStateSelector = ({
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

  // Update available cities when state changes
  useEffect(() => {
    if (state) {
      const stateData = mexicanStatesAndCities.find(s => s.state === state);
      if (stateData) {
        setAvailableCities(stateData.cities);
        
        // If current city isn't in the list of cities for the new state, reset it
        if (city && !stateData.cities.includes(city)) {
          setCity('');
          if (onChange) {
            onChange({ state, city: '' });
          }
        }
      } else {
        setAvailableCities([]);
      }
    } else {
      setAvailableCities([]);
    }
  }, [state]);

  // Update parent component when selections change
  useEffect(() => {
    if (onChange && (state !== selectedState || city !== selectedCity)) {
      onChange({ state, city });
    }
  }, [state, city]);

  // Update local state when props change (for controlled component)
  useEffect(() => {
    if (selectedState !== state) {
      setState(selectedState);
    }
    if (selectedCity !== city) {
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
          onChange={(e) => setState(e.target.value)}
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
          onChange={(e) => setCity(e.target.value)}
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
};

export default CityStateSelector;