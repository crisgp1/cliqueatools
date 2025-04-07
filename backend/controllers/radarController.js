/**
 * Controller para la integración de Radar API en el lado del servidor
 * Maneja operaciones seguras que requieren la clave secreta
 */

const fetch = require('node-fetch');

// Configuración de la API de Radar
const RADAR_API_URL = 'https://api.radar.io/v1';
const RADAR_SECRET_KEY = process.env.RADAR_SECRET_KEY || 'prj_live_sk_903ed3003d200af157fe1555be97a50dac0ee8c0';

/**
 * Funciones privadas de utilidad
 */

/**
 * Realiza una petición a la API de Radar con la clave secreta
 * 
 * @param {string} endpoint - Endpoint de la API de Radar
 * @param {Object} options - Opciones de fetch (method, body, etc.)
 * @returns {Promise<Object>} - Respuesta de la API en formato JSON
 */
const fetchFromRadar = async (endpoint, options = {}) => {
  try {
    const url = `${RADAR_API_URL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Authorization': RADAR_SECRET_KEY,
        'Content-Type': 'application/json'
      }
    };
    
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error en la API de Radar: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error en la petición a Radar API (${endpoint}):`, error);
    throw error;
  }
};

/**
 * Controllers expuestos para las rutas
 */

/**
 * Geocodifica una dirección (convierte texto a coordenadas)
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.geocodeAddress = async (req, res) => {
  try {
    const { query, country = 'mx' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        mensaje: 'El parámetro "query" es requerido'
      });
    }
    
    const params = new URLSearchParams({
      query,
      country
    });
    
    const data = await fetchFromRadar(`/geocode/forward?${params}`);
    
    return res.json({
      success: true,
      data: data.addresses || []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      mensaje: 'Error al geocodificar la dirección',
      error: error.message
    });
  }
};

/**
 * Valida una dirección completa
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.validateAddress = async (req, res) => {
  try {
    const { 
      street, 
      houseNumber, 
      city, 
      stateCode, 
      postalCode, 
      countryCode = 'mx', 
      unit 
    } = req.body;
    
    // Validar campos requeridos
    if (!city || !stateCode || !postalCode || !countryCode) {
      return res.status(400).json({
        success: false,
        mensaje: 'Los campos city, stateCode, postalCode y countryCode son requeridos'
      });
    }
    
    // Construir parámetros para la petición
    const params = new URLSearchParams();
    params.append('city', city);
    params.append('stateCode', stateCode);
    params.append('postalCode', postalCode);
    params.append('countryCode', countryCode);
    
    if (street) params.append('street', street);
    if (houseNumber) params.append('number', houseNumber);
    if (unit) params.append('unit', unit);
    
    const data = await fetchFromRadar(`/addresses/validate?${params}`);
    
    return res.json({
      success: true,
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      mensaje: 'Error al validar la dirección',
      error: error.message
    });
  }
};

/**
 * Busca ubicación por código postal
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.getLocationByZipCode = async (req, res) => {
  try {
    const { zipCode, country = 'mx' } = req.params;
    
    if (!zipCode) {
      return res.status(400).json({
        success: false,
        mensaje: 'El código postal es requerido'
      });
    }
    
    const params = new URLSearchParams({
      query: zipCode,
      country
    });
    
    const data = await fetchFromRadar(`/geocode/forward?${params}`);
    
    return res.json({
      success: true,
      data: data.addresses || []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      mensaje: 'Error al buscar ubicación por código postal',
      error: error.message
    });
  }
};

/**
 * Geocodifica una dirección inversa (coordenadas a dirección)
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.reverseGeocode = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        mensaje: 'Los parámetros "latitude" y "longitude" son requeridos'
      });
    }
    
    const params = new URLSearchParams({
      coordinates: `${latitude},${longitude}`
    });
    
    const data = await fetchFromRadar(`/geocode/reverse?${params}`);
    
    return res.json({
      success: true,
      data: data.addresses || []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      mensaje: 'Error al realizar la geocodificación inversa',
      error: error.message
    });
  }
};

/**
 * Busca direcciones por texto con autocompletado
 * 
 * @param {Object} req - Objeto de petición Express
 * @param {Object} res - Objeto de respuesta Express
 */
exports.searchAddressByText = async (req, res) => {
  try {
    const { query, near, limit = 10, country = 'mx' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        mensaje: 'El parámetro "query" es requerido'
      });
    }
    
    const params = new URLSearchParams({
      query,
      limit,
      countryCode: country
    });
    
    if (near) {
      params.append('near', near);
    }
    
    const data = await fetchFromRadar(`/search/autocomplete?${params}`);
    
    return res.json({
      success: true,
      data: data.addresses || []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      mensaje: 'Error al buscar direcciones por texto',
      error: error.message
    });
  }
};