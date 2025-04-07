/**
 * Servicio para interactuar con la API de direcciones
 * Reemplaza completamente la integración anterior con Sepomex
 */

// Cliente API key (publishable) - Solo usar esta en frontend
const API_KEY = 'prj_live_pk_beb2823dd019a3462f4145f9673bc2fec9ba82d9';
const API_URL = 'https://api.geoapify.com/v1';

/**
 * Busca direcciones por texto con autocompletado
 * 
 * @param {string} text - Texto de búsqueda (calle, número, etc.)
 * @param {Object} options - Opciones adicionales
 * @param {string} options.country - Código de país (default: 'mx' para México)
 * @param {number} options.limit - Límite de resultados (default: 5)
 * @returns {Promise<Array>} - Promesa con los resultados de la búsqueda
 */
export const searchAddressByText = async (text, options = {}) => {
  try {
    const country = options.country || 'mx';
    const limit = options.limit || 5;
    
    const url = new URL(`${API_URL}/geocode/autocomplete`);
    url.searchParams.append('text', text);
    url.searchParams.append('country', country);
    url.searchParams.append('limit', limit);
    url.searchParams.append('format', 'json');
    url.searchParams.append('apiKey', API_KEY);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error al buscar direcciones: ${response.status}`);
    }
    
    const data = await response.json();
    return data.features || [];
  } catch (error) {
    console.error('Error al buscar direcciones:', error);
    throw error;
  }
};

/**
 * Busca información de ubicación por código postal
 * 
 * @param {string} zipCode - Código postal a buscar
 * @param {Object} options - Opciones adicionales
 * @param {string} options.country - Código de país (default: 'mx' para México)
 * @returns {Promise<Object>} - Promesa con los datos de la ubicación
 */
export const getLocationByZipCode = async (zipCode, options = {}) => {
  try {
    const country = options.country || 'mx';
    
    const url = new URL(`${API_URL}/geocode/search`);
    url.searchParams.append('postcode', zipCode);
    url.searchParams.append('country', country);
    url.searchParams.append('format', 'json');
    url.searchParams.append('apiKey', API_KEY);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error al consultar el código postal: ${response.status}`);
    }
    
    const data = await response.json();
    return data.features || [];
  } catch (error) {
    console.error('Error al consultar código postal:', error);
    throw error;
  }
};

/**
 * Utilidad para formatear una dirección a partir de los resultados de la API
 * 
 * @param {Object} addressData - Datos de la dirección de la API
 * @returns {Object} - Objeto con los datos formateados
 */
export const formatAddressData = (addressData) => {
  if (!addressData || !addressData.properties) {
    return {};
  }
  
  const properties = addressData.properties;
  
  return {
    street: properties.street || '',
    houseNumber: properties.housenumber || '',
    city: properties.city || properties.county || '',
    state: properties.state || '',
    zipCode: properties.postcode || '',
    colony: properties.suburb || properties.neighbourhood || properties.district || '',
    formattedAddress: properties.formatted || '',
    raw: properties // Guardar datos completos por si se necesitan
  };
};

export default {
  searchAddressByText,
  getLocationByZipCode,
  formatAddressData
};