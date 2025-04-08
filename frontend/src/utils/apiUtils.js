/**
 * Utilidades para el manejo de peticiones a la API
 * Incluye un wrapper para fetch que verifica la expiración del token y maneja redirecciones
 */

// Importar del contexto directamente puede causar problemas de dependencias circulares
// Por lo tanto, almacenaremos la referencia a la función de redirección aquí
let forceRedirectToLoginFn = null;

/**
 * Registra la función para forzar redirección al login
 * @param {Function} redirectFn - Función para forzar redirección (desde AuthContext)
 */
export const registerRedirectFunction = (redirectFn) => {
  forceRedirectToLoginFn = redirectFn;
};

/**
 * Wrapper para fetch que verifica si el token ha expirado
 * @param {string} url - URL de la petición
 * @param {Object} options - Opciones de fetch
 * @param {Function} handleApiResponse - Función para manejar la respuesta de la API (desde AuthContext)
 * @returns {Promise} - Promesa con la respuesta de la API
 */
export const fetchWithTokenCheck = async (url, options = {}, handleApiResponse) => {
  try {
    // Realizar la petición
    const response = await fetch(url, options);
    
    // Si la respuesta es 401, manejar la expiración del token
    if (response.status === 401) {
      console.log('Token expirado detectado en fetchWithTokenCheck');
      
      // Usar la función de redirección si está registrada
      if (forceRedirectToLoginFn) {
        console.log('Forzando redirección al login...');
        forceRedirectToLoginFn();
      }
      
      throw new Error('Sesión expirada');
    }
    
    // Verificar si hay un handler para manejar la respuesta
    if (handleApiResponse) {
      return await handleApiResponse(response);
    }
    
    return response;
  } catch (error) {
    console.error('Error en fetchWithTokenCheck:', error);
    throw error;
  }
};

/**
 * Crea los headers básicos para una petición con autorización
 * @param {string} token - Token de autenticación
 * @param {boolean} includeContentType - Si debe incluir el Content-Type: application/json
 * @returns {Object} - Headers para la petición
 */
export const createAuthHeaders = (token, includeContentType = true) => {
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};