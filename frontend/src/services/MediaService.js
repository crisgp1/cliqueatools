import axios from 'axios';

const API_URL = '/api/media';

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
    
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    console.error('Error al subir archivo:', error);
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
    const response = await axios.get(`${API_URL}/vehiculo/${vehiculoId}`, {
      withCredentials: true
    });
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
    const response = await axios.delete(`${API_URL}/${mediaId}`, {
      withCredentials: true
    });
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
    const response = await axios.patch(`${API_URL}/${mediaId}/vehiculo/${vehiculoId}`, data, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar archivo:', error);
    throw new Error(`Error al actualizar archivo: ${error.response?.data?.message || error.message}`);
  }
};

export default {
  uploadFile,
  getVehicleFiles,
  deleteFile,
  updateFile
};