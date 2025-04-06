/**
 * Servicio para interactuar con la API de Sepomex para códigos postales mexicanos
 */

const SEPOMEX_API_URL = 'https://sepomex.icalialabs.com/api/v1';

/**
 * Busca información de ubicación por código postal
 * 
 * @param {string} zipCode - Código postal a buscar
 * @returns {Promise<Object>} - Promesa con los datos de la ubicación
 */
export const getLocationByZipCode = async (zipCode) => {
  try {
    const response = await fetch(`${SEPOMEX_API_URL}/zip_codes?zip_code=${zipCode}`);
    
    if (!response.ok) {
      throw new Error(`Error al consultar el código postal: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al consultar API de Sepomex:', error);
    throw error;
  }
};

/**
 * Obtiene los estados disponibles
 * 
 * @returns {Promise<Array>} - Lista de estados
 */
export const getStates = async () => {
  try {
    const response = await fetch(`${SEPOMEX_API_URL}/states`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener estados: ${response.status}`);
    }
    
    const data = await response.json();
    return data.states || [];
  } catch (error) {
    console.error('Error al consultar estados desde API de Sepomex:', error);
    throw error;
  }
};

/**
 * Obtiene los municipios de un estado específico
 * 
 * @param {number} stateId - ID del estado
 * @returns {Promise<Array>} - Lista de municipios
 */
export const getMunicipalitiesByState = async (stateId) => {
  try {
    const response = await fetch(`${SEPOMEX_API_URL}/states/${stateId}/municipalities`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener municipios: ${response.status}`);
    }
    
    const data = await response.json();
    return data.municipalities || [];
  } catch (error) {
    console.error('Error al consultar municipios desde API de Sepomex:', error);
    throw error;
  }
};

export default {
  getLocationByZipCode,
  getStates,
  getMunicipalitiesByState
};