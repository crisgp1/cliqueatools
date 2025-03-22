/**
 * PostgreSQLVehicleRepository.js - Implementación en PostgreSQL del repositorio de vehículos
 * Para uso en ambiente de producción y desarrollo con datos persistentes
 */

const VehicleRepository = require('../../../domain/repositories/VehicleRepository');
const Vehicle = require('../../../domain/entities/Vehicle');
const db = require('../../../db/postgres');

class PostgreSQLVehicleRepository extends VehicleRepository {
  /**
   * Buscar todos los vehículos
   * 
   * @returns {Promise<Array>} Promise que resuelve a un array de vehículos
   */
  async findAll() {
    try {
      const result = await db.query('SELECT * FROM vehiculo ORDER BY fecha_creacion DESC');
      return result.rows.map(row => this.mapVehicleFromDb(row));
    } catch (error) {
      console.error('Error al obtener todos los vehículos:', error);
      throw new Error('Error al obtener los vehículos desde la base de datos');
    }
  }

  /**
   * Buscar un vehículo por su ID
   * 
   * @param {string} id - ID del vehículo
   * @returns {Promise<Object|null>} Promise que resuelve al vehículo encontrado o null si no existe
   */
  async findById(id) {
    try {
      const result = await db.query('SELECT * FROM vehiculo WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapVehicleFromDb(result.rows[0]);
    } catch (error) {
      console.error(`Error al buscar vehículo por ID ${id}:`, error);
      throw new Error(`Error al buscar vehículo en la base de datos`);
    }
  }

  /**
   * Guardar un nuevo vehículo
   * 
   * @param {Object} vehicle - Datos del vehículo a guardar
   * @returns {Promise<Object>} Promise que resuelve al vehículo guardado
   */
  async save(vehicle) {
    try {
      const { marca, modelo, anio, valor } = vehicle;
      
      const result = await db.query(
        `INSERT INTO vehiculo (marca, modelo, anio, valor, fecha_creacion, fecha_actualizacion) 
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
         RETURNING *`,
        [marca, modelo, anio, valor]
      );
      
      return this.mapVehicleFromDb(result.rows[0]);
    } catch (error) {
      console.error('Error al guardar vehículo:', error);
      throw new Error('Error al guardar vehículo en la base de datos');
    }
  }

  /**
   * Actualizar un vehículo existente
   * 
   * @param {string} id - ID del vehículo a actualizar
   * @param {Object} vehicleData - Datos actualizados del vehículo
   * @returns {Promise<Object|null>} Promise que resuelve al vehículo actualizado o null si no existe
   */
  async update(id, vehicleData) {
    try {
      const { marca, modelo, anio, valor } = vehicleData;
      
      const result = await db.query(
        `UPDATE vehiculo 
         SET marca = $1, modelo = $2, anio = $3, valor = $4, fecha_actualizacion = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
        [marca, modelo, anio, valor, id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapVehicleFromDb(result.rows[0]);
    } catch (error) {
      console.error(`Error al actualizar vehículo ${id}:`, error);
      throw new Error('Error al actualizar vehículo en la base de datos');
    }
  }

  /**
   * Eliminar un vehículo por su ID
   * 
   * @param {string} id - ID del vehículo a eliminar
   * @returns {Promise<boolean>} Promise que resuelve a true si se eliminó correctamente o false si no existe
   */
  async delete(id) {
    try {
      const result = await db.query('DELETE FROM vehiculo WHERE id = $1 RETURNING id', [id]);
      
      return result.rows.length > 0;
    } catch (error) {
      console.error(`Error al eliminar vehículo ${id}:`, error);
      throw new Error('Error al eliminar vehículo de la base de datos');
    }
  }

  /**
   * Mapear un registro de la base de datos a una entidad Vehicle
   * 
   * @param {Object} dbVehicle - Registro de la base de datos
   * @returns {Vehicle} Instancia de Vehicle
   */
  mapVehicleFromDb(dbVehicle) {
    return new Vehicle({
      id: dbVehicle.id.toString(),
      marca: dbVehicle.marca,
      modelo: dbVehicle.modelo,
      anio: dbVehicle.anio,
      valor: parseFloat(dbVehicle.valor),
      fechaCreacion: dbVehicle.fecha_creacion,
      fechaActualizacion: dbVehicle.fecha_actualizacion
    });
  }

  /**
   * Agregar vehículos de muestra para desarrollo
   */
  async addSampleVehicles() {
    const sampleVehicles = [
      {
        marca: 'Toyota',
        modelo: 'Corolla',
        anio: 2022,
        valor: 350000
      },
      {
        marca: 'Honda',
        modelo: 'Civic',
        anio: 2021,
        valor: 320000
      },
      {
        marca: 'Volkswagen',
        modelo: 'Golf',
        anio: 2023,
        valor: 400000
      }
    ];
    
    try {
      for (const vehicleData of sampleVehicles) {
        // Verificar si ya existe un vehículo con la misma marca y modelo
        const existingResult = await db.query(
          'SELECT id FROM vehiculo WHERE marca = $1 AND modelo = $2',
          [vehicleData.marca, vehicleData.modelo]
        );
        
        if (existingResult.rows.length === 0) {
          await this.save(new Vehicle(vehicleData));
        }
      }
      
      console.log('Added sample vehicles for development in PostgreSQL');
    } catch (error) {
      console.error('Error adding sample vehicles:', error);
    }
  }
}

module.exports = PostgreSQLVehicleRepository;