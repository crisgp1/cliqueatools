import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Radar from 'radar-sdk-js';
import 'radar-sdk-js/dist/radar.css';
import { formatAddressData } from '../../services/RadarService';

/**
 * Componente para autocompletar direcciones usando Radar API
 * 
 * @param {Object} props
 * @param {string} props.value - Valor actual de la dirección
 * @param {Function} props.onChange - Función para manejar cambios en la dirección
 * @param {boolean} props.required - Si el campo es requerido
 * @param {string} props.className - Clases adicionales
 * @param {string} props.error - Mensaje de error
 * @param {boolean} props.showMap - Si se debe mostrar el mapa (default: false)
 * @param {string} props.inputId - ID del input
 */
const RadarAddressAutocomplete = ({
  value = '',
  onChange,
  required = false,
  className = '',
  error = '',
  showMap = false,
  inputId = 'radar-autocomplete'
}) => {
  // Referencias a componentes de Radar
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const containerRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Estado para control de selección
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Inicializar Radar cuando el componente se monta
  useEffect(() => {
    if (hasInitialized) return;

    const initializeRadar = async () => {
      // Inicializar con la llave de API desde las variables de entorno
      const apiKey = import.meta.env.VITE_RADAR_PUBLISHABLE_KEY;
      if (!apiKey) {
        console.error('Error: No se encontró la llave de API de Radar');
        return;
      }

      try {
        // Inicializar Radar SDK
        Radar.initialize(apiKey);
        
        // Coordenadas por defecto para México
        const defaultCoordinates = [-99.1332, 19.4326]; // CDMX

        // Crear el mapa si está habilitado
        if (showMap && mapContainerRef.current) {
          const map = Radar.ui.map({
            container: mapContainerRef.current,
            style: 'radar-default-v1',
            center: defaultCoordinates,
            zoom: 13,
          });
          mapRef.current = map;

          // Añadir un marcador al mapa
          markerRef.current = Radar.ui.marker()
            .setLngLat(defaultCoordinates)
            .addTo(map);
        }

        // Inicializar Radar autocomplete
        if (containerRef.current) {
          // Configurar el autocompletado
          autocompleteRef.current = Radar.ui.autocomplete({
            container: containerRef.current,
            width: '100%',
            placeholder: 'Ingresa una dirección...',
            onSelection: (address) => {
              // Formatear la dirección seleccionada
              const formattedAddress = formatAddressData(address);
              setSelectedAddress(formattedAddress);
              
              // Notificar al componente padre sobre la selección
              if (onChange) {
                onChange({
                  target: {
                    name: inputId,
                    value: formattedAddress.formattedAddress
                  }
                });
              }

              // Actualizar marcador y centrar mapa si está habilitado
              if (showMap && mapRef.current && markerRef.current) {
                const { longitude, latitude } = address;
                markerRef.current.setLngLat([longitude, latitude]);
                mapRef.current.flyTo({ center: [longitude, latitude], zoom: 14 });
              }
            },
          });
        }

        setHasInitialized(true);
      } catch (error) {
        console.error('Error al inicializar Radar:', error);
      }
    };

    initializeRadar();

    // Limpieza al desmontar
    return () => {
      if (autocompleteRef.current) {
        autocompleteRef.current.remove();
      }
    };
  }, [onChange, inputId, showMap, hasInitialized]);

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
    <motion.div className={`radar-address-container ${className}`} variants={itemAnimation}>
      <div className="w-full">
        {/* Contenedor para el input de autocompletado de Radar */}
        <div 
          ref={containerRef} 
          className={`radar-autocomplete-container ${error ? 'border-red-500' : ''}`}
          style={{ width: '100%' }}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      {/* Mapa (opcional) */}
      {showMap && (
        <div
          ref={mapContainerRef}
          className="radar-map-container border rounded-md h-64 my-4"
        />
      )}

      {/* Información de la dirección seleccionada */}
      {selectedAddress && (
        <div className="selected-address mt-2 p-3 border rounded-md bg-gray-50">
          <h4 className="font-medium mb-2">Dirección seleccionada:</h4>
          <p><strong>Calle:</strong> {selectedAddress.street}</p>
          {selectedAddress.houseNumber && <p><strong>Número:</strong> {selectedAddress.houseNumber}</p>}
          {selectedAddress.colony && <p><strong>Colonia:</strong> {selectedAddress.colony}</p>}
          <p><strong>Ciudad:</strong> {selectedAddress.city}</p>
          <p><strong>Estado:</strong> {selectedAddress.state}</p>
          {selectedAddress.zipCode && <p><strong>CP:</strong> {selectedAddress.zipCode}</p>}
        </div>
      )}

      {/* Campo oculto para el formulario */}
      <input 
        type="hidden"
        id={inputId}
        name={inputId}
        value={value}
        readOnly
        required={required}
      />
    </motion.div>
  );
};

export default RadarAddressAutocomplete;