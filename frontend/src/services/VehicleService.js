    /**
 * Servicio para manejar las operaciones relacionadas con vehículos
 */
import { fetchWithTokenCheck, createAuthHeaders } from '../utils/apiUtils';

/**
 * Obtiene los vehículos del usuario con soporte para paginación
 * @param {string} token - Token de autenticación
 * @param {Object} options - Opciones de paginación
 * @param {number} options.page - Número de página (por defecto 1)
 * @param {number} options.limit - Número de registros por página (por defecto 20)
 * @returns {Promise} - Promesa con los datos de los vehículos y metadatos de paginación
 */
export const fetchVehicles = async (token, options = {}, handleApiResponse = null) => {
  try {
    const { page = 1, limit = 100 } = options;
    const url = new URL(`${import.meta.env.VITE_API_URL}/vehiculos`);
    
    // Añadir parámetros de paginación a la URL
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    
    const response = await fetchWithTokenCheck(url, {
      headers: createAuthHeaders(token, false)
    }, handleApiResponse);
    
    if (!response.ok) {
      throw new Error('Error al cargar los vehículos');
    }
    
    const data = await response.json();
    
    // Transformar datos del backend al formato del frontend
    const transformedVehicles = data.data.map(vehiculo => ({
      id: vehiculo.vehiculo_id,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      año: vehiculo.anio,
      valor: parseFloat(vehiculo.valor),
      descripcion: vehiculo.descripcion || ''
    }));
    
    // Incluir metadatos de paginación en la respuesta
    return {
      vehicles: transformedVehicles,
      pagination: data.pagination || {
        total: transformedVehicles.length,
        page: 1,
        limit: transformedVehicles.length,
        totalPages: 1
      }
    };
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    throw error;
  }
};

/**
 * Crea un nuevo vehículo
 * @param {string} token - Token de autenticación
 * @param {Object} vehicleData - Datos del vehículo
 * @returns {Promise} - Promesa con los datos del vehículo creado
 */
export const createVehicle = async (token, vehicleData, handleApiResponse = null) => {
  try {
    // Preparar datos para enviar al backend, mapeando campos del frontend al formato del backend
    const dataToSend = {
      marca: vehicleData.marca,
      modelo: vehicleData.modelo,
      anio: vehicleData.año,
      valor: vehicleData.valor, // Mantener valor como lo espera el backend
      precio_lista: vehicleData.valor, // También incluir precio_lista para el modelo Sequelize
      descripcion: vehicleData.descripcion || '',
      // Campos adicionales requeridos por el backend
      color_exterior: vehicleData.color || '',
      tipo_vehiculo: vehicleData.tipo || 'automovil',
      num_serie: vehicleData.numero_serie || '',
      vin: vehicleData.vin || null, // Añadimos el campo vin con valor null para evitar errores de validación
      transmision: vehicleData.transmision || 'manual', // Valor por defecto
      combustible: vehicleData.combustible || 'gasolina', // Valor por defecto
      odometro: vehicleData.odometro || 0,
      condicion: vehicleData.condicion || 'usado',
      origen: vehicleData.origen || 'nacional',
      adquisicion: vehicleData.adquisicion || 'compra_directa',
      estatus_legal: vehicleData.estatus_legal || 'limpio',
      disponible: vehicleData.disponible !== undefined ? vehicleData.disponible : true
    };
    
    const response = await fetchWithTokenCheck(`${import.meta.env.VITE_API_URL}/vehiculos`, {
      method: 'POST',
      headers: createAuthHeaders(token),
      body: JSON.stringify(dataToSend)
    }, handleApiResponse);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al crear vehículo');
    }
    
    // Crear objeto de vehículo con el formato del frontend
    const newVehicleWithId = {
      id: data.data.vehiculo_id,
      marca: data.data.marca,
      modelo: data.data.modelo,
      año: data.data.anio,
      valor: parseFloat(data.data.valor),
      descripcion: data.data.descripcion || ''
    };
    
    return newVehicleWithId;
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    throw error;
  }
};

/**
 * Actualiza un vehículo existente
 * @param {string} token - Token de autenticación
 * @param {Object} vehicleData - Datos del vehículo
 * @returns {Promise} - Promesa con los datos del vehículo actualizado
 */
export const updateVehicle = async (token, vehicleData, handleApiResponse = null) => {
  try {
    // Preparar datos para enviar al backend, mapeando campos del frontend al formato del backend
    const dataToSend = {
      marca: vehicleData.marca,
      modelo: vehicleData.modelo,
      anio: vehicleData.año,
      valor: vehicleData.valor, // Mantener valor como lo espera el backend
      precio_lista: vehicleData.valor, // También incluir precio_lista para el modelo Sequelize
      descripcion: vehicleData.descripcion || '',
      // Campos adicionales requeridos por el backend
      color_exterior: vehicleData.color || '',
      tipo_vehiculo: vehicleData.tipo || 'automovil',
      num_serie: vehicleData.numero_serie || '',
      vin: vehicleData.vin || null, // Añadimos el campo vin con valor null para evitar errores de validación
      transmision: vehicleData.transmision || 'manual', // Valor por defecto
      combustible: vehicleData.combustible || 'gasolina', // Valor por defecto
      odometro: vehicleData.odometro || 0,
      condicion: vehicleData.condicion || 'usado',
      origen: vehicleData.origen || 'nacional',
      adquisicion: vehicleData.adquisicion || 'compra_directa',
      estatus_legal: vehicleData.estatus_legal || 'limpio',
      disponible: vehicleData.disponible !== undefined ? vehicleData.disponible : true
    };
    
    const response = await fetchWithTokenCheck(`${import.meta.env.VITE_API_URL}/vehiculos/${vehicleData.id}`, {
      method: 'PUT',
      headers: createAuthHeaders(token),
      body: JSON.stringify(dataToSend)
    }, handleApiResponse);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al actualizar vehículo');
    }
    
    return vehicleData;
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    throw error;
  }
};

/**
 * Elimina un vehículo
 * @param {string} token - Token de autenticación
 * @param {string|number} id - ID del vehículo a eliminar
 * @returns {Promise} - Promesa con el resultado de la operación
 */
export const deleteVehicle = async (token, id, handleApiResponse = null) => {
  try {
    const response = await fetchWithTokenCheck(`${import.meta.env.VITE_API_URL}/vehiculos/${id}`, {
      method: 'DELETE',
      headers: createAuthHeaders(token, false)
    }, handleApiResponse);
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.mensaje || 'Error al eliminar vehículo');
    }
    
    return true;
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    throw error;
  }
};