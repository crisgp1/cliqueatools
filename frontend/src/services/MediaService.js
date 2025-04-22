import axios from 'axios';

const API_URL = '/api/media';

// Crear una instancia de axios con configuración específica
const mediaAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

// Interceptor para añadir el token de auth en cada solicitud
mediaAxios.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token'); // O como almacenes tu token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Sube un archivo a Cloudinary a través del backend
 * @param {File} file - Archivo a subir
 * @param {string} vehiculoId - ID de vehículo asociado (opcional)
 * @param {boolean} esPrincipal - Si es la imagen principal
 * @param {number} orden - Orden de la imagen
 * @returns {Promise<Object>} - Datos del archivo subido
 */
export const uploadFile = async (file, vehiculoId = null, esPrincipal = false, orden = 0) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    if (vehiculoId) {
      formData.append('vehiculo_id', vehiculoId);
    }
    
    formData.append('es_principal', esPrincipal);
    formData.append('orden', orden);
    
    // Usar la instancia personalizada de axios
    const response = await mediaAxios.post('/upload', formData);
    
    return response.data;
  } catch (error) {
    console.error('Error detallado al subir archivo:', error.response?.data || error);
    throw new Error(`Error al subir archivo: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Obtiene los archivos asociados a un vehículo
 * @param {string} vehiculoId - ID del vehículo
 * @returns {Promise<Array>} - Lista de archivos
 */
export const getVehicleFiles = async (vehiculoId) => {
  try {
    const response = await mediaAxios.get(`/vehiculo/${vehiculoId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener archivos del vehículo:', error);
    throw new Error(`Error al obtener archivos: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Elimina un archivo
 * @param {string} mediaId - ID del archivo a eliminar
 * @returns {Promise<Object>} - Confirmación
 */
export const deleteFile = async (mediaId) => {
  try {
    const response = await mediaAxios.delete(`/${mediaId}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    throw new Error(`Error al eliminar archivo: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Actualiza propiedades de un archivo
 * @param {string} mediaId - ID del archivo
 * @param {string} vehiculoId - ID del vehículo
 * @param {Object} data - Datos a actualizar (es_principal, orden)
 * @returns {Promise<Object>} - Confirmación
 */
export const updateFile = async (mediaId, vehiculoId, data) => {
  try {
    // Ajustar el Content-Type para esta solicitud específica
    const response = await mediaAxios.patch(`/${mediaId}/vehiculo/${vehiculoId}`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar archivo:', error);
    throw new Error(`Error al actualizar archivo: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Sube un archivo a Cloudinary a través del backend usando la ruta de prueba sin autenticación
 * @param {File} file - Archivo a subir
 * @returns {Promise<Object>} - Datos del archivo subido
 */
export const uploadFileTest = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // Usar la ruta de prueba sin autenticación
    const response = await axios.post('/api/media-test/upload-test', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error detallado al subir archivo (prueba):', error.response?.data || error);
    throw new Error(`Error al subir archivo (prueba): ${error.response?.data?.message || error.message}`);
  }
};

export default {
  uploadFile,
  getVehicleFiles,
  deleteFile,
  updateFile,
  uploadFileTest
};