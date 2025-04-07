/**
 * Servicio para gestionar las operaciones de API relacionadas con clientes
 */
class ClientService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  /**
   * Obtiene todos los clientes
   * @param {string} token - Token de autenticación
   * @returns {Promise<Object>} - Respuesta con los clientes obtenidos
   */
  async getClients(token) {
    try {
      const response = await fetch(`${this.apiUrl}/clientes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener los clientes');
      }
      
      return data;
    } catch (error) {
      console.error('Error en getClients:', error);
      throw error;
    }
  }

  /**
   * Obtiene un cliente por su ID
   * @param {string} token - Token de autenticación
   * @param {number} clientId - ID del cliente
   * @returns {Promise<Object>} - Respuesta con el cliente obtenido
   */
  async getClientById(token, clientId) {
    try {
      const response = await fetch(`${this.apiUrl}/clientes/${clientId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener el cliente');
      }
      
      return data;
    } catch (error) {
      console.error('Error en getClientById:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo cliente
   * @param {string} token - Token de autenticación
   * @param {Object} clientData - Datos del cliente a crear
   * @returns {Promise<Object>} - Respuesta con el cliente creado
   */
  async createClient(token, clientData) {
    try {
      const response = await fetch(`${this.apiUrl}/clientes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al crear el cliente');
      }
      
      return data;
    } catch (error) {
      console.error('Error en createClient:', error);
      throw error;
    }
  }

  /**
   * Actualiza un cliente existente
   * @param {string} token - Token de autenticación
   * @param {Object} clientData - Datos del cliente a actualizar
   * @returns {Promise<Object>} - Respuesta con el cliente actualizado
   */
  async updateClient(token, clientData) {
    try {
      const response = await fetch(`${this.apiUrl}/clientes/${clientData.cliente_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar el cliente');
      }
      
      return data;
    } catch (error) {
      console.error('Error en updateClient:', error);
      throw error;
    }
  }

  /**
   * Elimina un cliente
   * @param {string} token - Token de autenticación
   * @param {number} clientId - ID del cliente a eliminar
   * @returns {Promise<Object>} - Respuesta de la operación
   */
  async deleteClient(token, clientId) {
    try {
      const response = await fetch(`${this.apiUrl}/clientes/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar el cliente');
      }
      
      return data;
    } catch (error) {
      console.error('Error en deleteClient:', error);
      throw error;
    }
  }
}

// Exportar una instancia única del servicio
export default new ClientService();