/**
 * Servicio para interactuar con la API de Radar
 * Implementación de la API de Radar para direcciones y búsqueda de ubicaciones
 */

// Cliente API key (publishable) - Leer desde variables de entorno
const API_KEY = import.meta.env.VITE_RADAR_PUBLISHABLE_KEY || 'prj_live_pk_beb2823dd019a3462f4145f9673bc2fec9ba82d9';
// La URL base de la API de Radar
const API_URL = 'https://api.radar.io/v1';

// Importar Radar SDK
import Radar from 'radar-sdk-js';
import 'radar-sdk-js/dist/radar.css';

// Inicializar Radar SDK
Radar.initialize(API_KEY);

/**
 * Busca direcciones por texto con autocompletado utilizando Radar API
 * 
 * @param {string} text - Texto de búsqueda (calle, número, etc.)
 * @param {Object} options - Opciones adicionales
 * @param {string} options.country - Código de país (default: 'mx' para México)
 * @param {number} options.limit - Límite de resultados (default: 5)
 * @returns {Promise<Array>} - Promesa con los resultados de la búsqueda
 */
export const searchAddressByText = async (text, options = {}) => {
  try {
    const countryCode = options.country || 'mx';
    const limit = options.limit || 5;
    
    const url = new URL(`${API_URL}/search/autocomplete`);
    url.searchParams.append('query', text);
    url.searchParams.append('countryCode', countryCode);
    url.searchParams.append('limit', limit);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error al buscar direcciones: ${response.status}`);
    }
    
    const data = await response.json();
    return data.addresses || [];
  } catch (error) {
    console.error('Error al buscar direcciones:', error);
    throw error;
  }
};

/**
 * Busca información de ubicación por código postal utilizando Radar API
 * 
 * @param {string} zipCode - Código postal a buscar
 * @param {Object} options - Opciones adicionales
 * @param {string} options.country - Código de país (default: 'mx' para México)
 * @returns {Promise<Object>} - Promesa con los datos de la ubicación
 */
export const getLocationByZipCode = async (zipCode, options = {}) => {
  try {
    const countryCode = options.country || 'mx';
    
    const url = new URL(`${API_URL}/geocode/forward`);
    url.searchParams.append('query', zipCode);
    url.searchParams.append('country', countryCode);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error al consultar el código postal: ${response.status}`);
    }
    
    const data = await response.json();
    return data.addresses || [];
  } catch (error) {
    console.error('Error al consultar código postal:', error);
    throw error;
  }
};

/**
 * Utilidad para formatear una dirección a partir de los resultados de la API de Radar
 * 
 * @param {Object} addressData - Datos de la dirección de la API de Radar
 * @returns {Object} - Objeto con los datos formateados
 */
export const formatAddressData = (addressData) => {
  if (!addressData) {
    return {};
  }
  
  return {
    street: addressData.street || '',
    houseNumber: addressData.number || '',
    city: addressData.city || addressData.borough || '',
    state: addressData.state || '',
    zipCode: addressData.postalCode || '',
    colony: addressData.neighborhood || addressData.borough || addressData.district || '',
    formattedAddress: addressData.formattedAddress || '',
    raw: addressData // Guardar datos completos por si se necesitan
  };
};

/**
 * Busca la dirección actual del usuario utilizando la geolocalización del navegador y Radar
 * 
 * @returns {Promise<Object>} - Promesa con los datos de la ubicación actual
 */
export const getCurrentLocation = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La geolocalización no está soportada por este navegador.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const url = new URL(`${API_URL}/geocode/reverse`);
          url.searchParams.append('coordinates', `${latitude},${longitude}`);
          
          const response = await fetch(url, {
            headers: {
              'Authorization': API_KEY
            }
          });
          
          if (!response.ok) {
            throw new Error(`Error al obtener la ubicación actual: ${response.status}`);
          }
          
          const data = await response.json();
          if (data.addresses && data.addresses.length > 0) {
            resolve(formatAddressData(data.addresses[0]));
          } else {
            reject(new Error('No se pudo determinar la dirección de la ubicación actual.'));
          }
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        reject(new Error(`Error de geolocalización: ${error.message}`));
      }
    );
  });
};

/**
 * Verifica una dirección completa utilizando Radar API
 * 
 * @param {Object} addressData - Datos de la dirección a verificar
 * @returns {Promise<Object>} - Promesa con la dirección verificada
 */
export const verifyAddress = async (addressData) => {
  try {
    const url = new URL(`${API_URL}/addresses/validate`);
    url.searchParams.append('number', addressData.houseNumber || '');
    url.searchParams.append('street', addressData.street || '');
    url.searchParams.append('city', addressData.city || '');
    url.searchParams.append('stateCode', addressData.stateCode || '');
    url.searchParams.append('postalCode', addressData.zipCode || '');
    url.searchParams.append('countryCode', addressData.countryCode || 'mx');
    
    if (addressData.unit) {
      url.searchParams.append('unit', addressData.unit);
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error al verificar la dirección: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al verificar la dirección:', error);
    throw error;
  }
};

export default {
  searchAddressByText,
  getLocationByZipCode,
  formatAddressData,
  getCurrentLocation,
  verifyAddress
};