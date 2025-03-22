/**
 * CreditVehicle.js - Entidad de dominio que representa la relación entre un crédito y un vehículo
 * Basado en la tabla 'credito_vehiculo' del esquema de la base de datos
 */

class CreditVehicle {
  constructor({
    creditoId,
    vehiculoId
  }) {
    this.creditoId = creditoId;
    this.vehiculoId = vehiculoId;
  }

  /**
   * Valida que los datos de la relación sean correctos
   * @returns {Object} - Objeto con errores encontrados o vacío si no hay errores
   */
  validate() {
    const errors = {};

    if (!this.creditoId) {
      errors.creditoId = 'El ID del crédito es obligatorio';
    }

    if (!this.vehiculoId) {
      errors.vehiculoId = 'El ID del vehículo es obligatorio';
    }

    return errors;
  }

  /**
   * Convierte la entidad a un objeto simple para persistencia
   * @returns {Object} - Objeto simple con los datos de la entidad
   */
  toJSON() {
    return {
      credito_id: this.creditoId,
      vehiculo_id: this.vehiculoId
    };
  }

  /**
   * Crea una instancia de CreditVehicle a partir de un objeto de la base de datos
   * @param {Object} dbObject - Objeto proveniente de la base de datos
   * @returns {CreditVehicle} - Nueva instancia de CreditVehicle
   */
  static fromDatabase(dbObject) {
    return new CreditVehicle({
      creditoId: dbObject.credito_id,
      vehiculoId: dbObject.vehiculo_id
    });
  }

  /**
   * Obtiene una clave única para identificar esta relación
   * @returns {string} - Clave única para la relación
   */
  getUniqueKey() {
    return `${this.creditoId}_${this.vehiculoId}`;
  }
}

module.exports = CreditVehicle;