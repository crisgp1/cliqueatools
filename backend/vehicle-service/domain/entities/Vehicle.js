/**
 * Vehicle.js - Entidad de dominio que representa un vehículo
 * Basado en la tabla 'vehiculo' del esquema de la base de datos
 */

class Vehicle {
  constructor({
    id = null,
    marca,
    modelo,
    anio = new Date().getFullYear(),
    valor,
    fechaCreacion = new Date(),
    fechaActualizacion = new Date()
  }) {
    this.id = id;
    this.marca = marca;
    this.modelo = modelo;
    this.anio = anio;
    this.valor = valor;
    this.fechaCreacion = fechaCreacion;
    this.fechaActualizacion = fechaActualizacion;
  }

  /**
   * Obtiene la descripción completa del vehículo
   * @returns {string} Descripción completa del vehículo
   */
  get descripcionCompleta() {
    return `${this.marca} ${this.modelo} (${this.anio})`;
  }

  /**
   * Actualiza los datos del vehículo
   * @param {Object} vehicleData - Datos a actualizar
   * @returns {Vehicle} - Instancia actualizada
   */
  update(vehicleData) {
    Object.assign(this, {
      ...vehicleData,
      fechaActualizacion: new Date()
    });
    return this;
  }

  /**
   * Formatea el valor del vehículo como moneda
   * @returns {string} - Valor formateado como moneda
   */
  valorFormateado() {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(this.valor);
  }

  /**
   * Valida que los datos del vehículo sean correctos
   * @returns {Object} - Objeto con errores encontrados o vacío si no hay errores
   */
  validate() {
    const errors = {};

    if (!this.marca || this.marca.trim() === '') {
      errors.marca = 'La marca es obligatoria';
    }

    if (!this.modelo || this.modelo.trim() === '') {
      errors.modelo = 'El modelo es obligatorio';
    }

    if (!this.valor || this.valor < 50000) {
      errors.valor = 'El valor debe ser mayor a $50,000';
    }

    if (!this.anio || this.anio < 1900 || this.anio > new Date().getFullYear() + 1) {
      errors.anio = 'El año debe ser válido';
    }

    return errors;
  }

  /**
   * Convierte la entidad a un objeto simple para persistencia
   * @returns {Object} - Objeto simple con los datos de la entidad
   */
  toJSON() {
    return {
      id: this.id,
      marca: this.marca,
      modelo: this.modelo,
      anio: this.anio,
      valor: this.valor,
      fecha_creacion: this.fechaCreacion,
      fecha_actualizacion: this.fechaActualizacion
    };
  }

  /**
   * Crea una instancia de Vehicle a partir de un objeto de la base de datos
   * @param {Object} dbObject - Objeto proveniente de la base de datos
   * @returns {Vehicle} - Nueva instancia de Vehicle
   */
  static fromDatabase(dbObject) {
    return new Vehicle({
      id: dbObject.id,
      marca: dbObject.marca,
      modelo: dbObject.modelo,
      anio: dbObject.anio,
      valor: dbObject.valor,
      fechaCreacion: dbObject.fecha_creacion,
      fechaActualizacion: dbObject.fecha_actualizacion
    });
  }
}

module.exports = Vehicle;