/**
 * Servicio para manejar las operaciones relacionadas con citas
 */

/**
 * Obtiene las citas con soporte para paginación
 * @param {string} token - Token de autenticación
 * @param {Object} options - Opciones de filtrado y paginación
 * @param {number} options.page - Número de página (por defecto 1)
 * @param {number} options.limit - Número de registros por página (por defecto 20)
 * @param {string} options.fecha - Filtrar por fecha específica (YYYY-MM-DD)
 * @param {number} options.clienteId - Filtrar por cliente específico
 * @param {number} options.usuarioId - Filtrar por usuario específico
 * @returns {Promise} - Promesa con los datos de las citas y metadatos de paginación
 */
export const fetchAppointments = async (token, options = {}) => {
  try {
    const { page = 1, limit = 20, fecha, clienteId, usuarioId } = options;
    let url;
    
    // Crear URL base según los filtros
    if (fecha) {
      url = new URL(`${import.meta.env.VITE_API_URL}/citas/fecha/${fecha}`);
    } else if (clienteId) {
      url = new URL(`${import.meta.env.VITE_API_URL}/citas/cliente/${clienteId}`);
    } else if (usuarioId) {
      url = new URL(`${import.meta.env.VITE_API_URL}/citas/usuario/${usuarioId}`);
    } else {
      url = new URL(`${import.meta.env.VITE_API_URL}/citas`);
    }
    
    // Añadir parámetros de paginación a la URL
    url.searchParams.append('page', page);
    url.searchParams.append('limit', limit);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar las citas');
    }
    
    const data = await response.json();
    
    // Transformar datos del backend al formato del frontend
    const transformedAppointments = data.data.map(cita => ({
      id: cita.cita_id,
      clienteId: cita.cliente_id,
      cliente: cita.cliente ? `${cita.cliente.nombre} ${cita.cliente.apellidos}` : 'Cliente no disponible',
      usuarioId: cita.usuario_id,
      usuario: cita.usuario ? cita.usuario.usuario : null,
      vehiculoId: cita.vehiculo_id,
      vehiculo: cita.vehiculo ? `${cita.vehiculo.marca} ${cita.vehiculo.modelo} (${cita.vehiculo.anio})` : null,
      fecha: cita.fecha_cita,
      hora: cita.hora_cita,
      lugar: cita.lugar || '',
      comentarios: cita.comentarios || '',
      clienteObj: cita.cliente,
      usuarioObj: cita.usuario,
      vehiculoObj: cita.vehiculo
    }));
    
    // Incluir metadatos de paginación en la respuesta
    return {
      appointments: transformedAppointments,
      pagination: data.pagination || {
        total: transformedAppointments.length,
        page: 1,
        limit: transformedAppointments.length,
        totalPages: 1
      }
    };
  } catch (error) {
    console.error('Error al obtener citas:', error);
    throw error;
  }
};

/**
 * Obtiene una cita por su ID
 * @param {string} token - Token de autenticación
 * @param {number} id - ID de la cita
 * @returns {Promise} - Promesa con los datos de la cita
 */
export const fetchAppointmentById = async (token, id) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/citas/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al cargar la cita');
    }
    
    const data = await response.json();
    const cita = data.data;
    
    // Transformar datos del backend al formato del frontend
    return {
      id: cita.cita_id,
      clienteId: cita.cliente_id,
      cliente: cita.cliente ? `${cita.cliente.nombre} ${cita.cliente.apellidos}` : 'Cliente no disponible',
      usuarioId: cita.usuario_id,
      usuario: cita.usuario ? cita.usuario.usuario : null,
      vehiculoId: cita.vehiculo_id,
      vehiculo: cita.vehiculo ? `${cita.vehiculo.marca} ${cita.vehiculo.modelo} (${cita.vehiculo.anio})` : null,
      fecha: cita.fecha_cita,
      hora: cita.hora_cita,
      lugar: cita.lugar || '',
      comentarios: cita.comentarios || '',
      clienteObj: cita.cliente,
      usuarioObj: cita.usuario,
      vehiculoObj: cita.vehiculo
    };
  } catch (error) {
    console.error('Error al obtener cita por ID:', error);
    throw error;
  }
};

/**
 * Crea una nueva cita
 * @param {string} token - Token de autenticación
 * @param {Object} appointmentData - Datos de la cita
 * @returns {Promise} - Promesa con los datos de la cita creada
 */
export const createAppointment = async (token, appointmentData) => {
  try {
    // Preparar datos para enviar al backend
    const dataToSend = {
      cliente_id: appointmentData.clienteId,
      usuario_id: appointmentData.usuarioId,
      vehiculo_id: appointmentData.vehiculoId,
      fecha_cita: appointmentData.fecha,
      hora_cita: appointmentData.hora,
      lugar: appointmentData.lugar,
      comentarios: appointmentData.comentarios
    };
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/citas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dataToSend)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al crear cita');
    }
    
    // Crear objeto de cita con el formato del frontend
    return {
      id: data.data.cita_id,
      clienteId: data.data.cliente_id,
      usuarioId: data.data.usuario_id,
      vehiculoId: data.data.vehiculo_id,
      fecha: data.data.fecha_cita,
      hora: data.data.hora_cita,
      lugar: data.data.lugar || '',
      comentarios: data.data.comentarios || ''
    };
  } catch (error) {
    console.error('Error al crear cita:', error);
    throw error;
  }
};

/**
 * Actualiza una cita existente
 * @param {string} token - Token de autenticación
 * @param {Object} appointmentData - Datos de la cita
 * @returns {Promise} - Promesa con los datos de la cita actualizada
 */
export const updateAppointment = async (token, appointmentData) => {
  try {
    // Preparar datos para enviar al backend
    const dataToSend = {
      cliente_id: appointmentData.clienteId,
      usuario_id: appointmentData.usuarioId,
      vehiculo_id: appointmentData.vehiculoId,
      fecha_cita: appointmentData.fecha,
      hora_cita: appointmentData.hora,
      lugar: appointmentData.lugar,
      comentarios: appointmentData.comentarios
    };
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/citas/${appointmentData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dataToSend)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al actualizar cita');
    }
    
    return appointmentData;
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    throw error;
  }
};

/**
 * Elimina una cita
 * @param {string} token - Token de autenticación
 * @param {string|number} id - ID de la cita a eliminar
 * @returns {Promise} - Promesa con el resultado de la operación
 */
export const deleteAppointment = async (token, id) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/citas/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.mensaje || 'Error al eliminar cita');
    }
    
    return true;
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    throw error;
  }
};

/**
 * Busca citas por término
 * @param {string} token - Token de autenticación
 * @param {string} term - Término de búsqueda
 * @param {string} type - Tipo de búsqueda (opcional: fecha, cliente, usuario, lugar)
 * @returns {Promise} - Promesa con los resultados de la búsqueda
 */
export const searchAppointments = async (token, term, type = '') => {
  try {
    const url = new URL(`${import.meta.env.VITE_API_URL}/citas/buscar`);
    url.searchParams.append('termino', term);
    
    if (type) {
      url.searchParams.append('tipo', type);
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al buscar citas');
    }
    
    const data = await response.json();
    
    // Transformar datos del backend al formato del frontend
    const transformedAppointments = data.data.map(cita => ({
      id: cita.cita_id,
      clienteId: cita.cliente_id,
      cliente: cita.cliente ? `${cita.cliente.nombre} ${cita.cliente.apellidos}` : 'Cliente no disponible',
      usuarioId: cita.usuario_id,
      usuario: cita.usuario ? cita.usuario.usuario : null,
      vehiculoId: cita.vehiculo_id,
      vehiculo: cita.vehiculo ? `${cita.vehiculo.marca} ${cita.vehiculo.modelo} (${cita.vehiculo.anio})` : null,
      fecha: cita.fecha_cita,
      hora: cita.hora_cita,
      lugar: cita.lugar || '',
      comentarios: cita.comentarios || '',
      clienteObj: cita.cliente,
      usuarioObj: cita.usuario,
      vehiculoObj: cita.vehiculo
    }));
    
    return transformedAppointments;
  } catch (error) {
    console.error('Error al buscar citas:', error);
    throw error;
  }
};