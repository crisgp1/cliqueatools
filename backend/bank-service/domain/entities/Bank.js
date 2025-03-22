/**
 * Bank.js - Entidad de dominio que representa un banco
 * Basado en la tabla 'banco' del esquema de la base de datos
 */

class Bank {
  constructor({
    id = null,
    nombre,
    tasaInteres,
    cat,
    comisionApertura,
    logo = '💳',
    activo = true,
    fechaCreacion = new Date(),
    fechaActualizacion = new Date()
  }) {
    this.id = id;
    this.nombre = nombre;
    this.tasaInteres = tasaInteres;
    this.cat = cat;
    this.comisionApertura = comisionApertura;
    this.logo = logo;
    this.activo = activo;
    this.fechaCreacion = fechaCreacion;
    this.fechaActualizacion = fechaActualizacion;
  }

  /**
   * Obtiene si el banco está activo
   * @returns {boolean} Estado de activación del banco
   */
  estaActivo() {
    return this.activo;
  }

  /**
   * Actualiza los datos del banco
   * @param {Object} bankData - Datos a actualizar
   * @returns {Bank} - Instancia actualizada
   */
  update(bankData) {
    Object.assign(this, {
      ...bankData,
      fechaActualizacion: new Date()
    });
    return this;
  }

  /**
   * Activa o desactiva el banco
   * @param {boolean} estado - Estado a establecer
   * @returns {Bank} - Instancia actualizada
   */
  cambiarEstado(estado) {
    this.activo = estado;
    this.fechaActualizacion = new Date();
    return this;
  }

  /**
   * Formatea la tasa de interés como porcentaje
   * @returns {string} - Tasa formateada como porcentaje
   */
  tasaFormateada() {
    return `${this.tasaInteres.toFixed(2)}%`;
  }

  /**
   * Formatea el CAT como porcentaje
   * @returns {string} - CAT formateado como porcentaje
   */
  catFormateado() {
    return `${this.cat.toFixed(2)}%`;
  }

  /**
   * Formatea la comisión de apertura como porcentaje
   * @returns {string} - Comisión formateada como porcentaje
   */
  comisionFormateada() {
    return `${this.comisionApertura.toFixed(2)}%`;
  }

  /**
   * Calcula el pago mensual de un préstamo
   * @param {number} montoFinanciado - Monto a financiar
   * @param {number} plazoMeses - Plazo del préstamo en meses
   * @returns {number} - Pago mensual
   */
  calcularPagoMensual(montoFinanciado, plazoMeses) {
    const tasaMensual = this.tasaInteres / 100 / 12;
    const factor = Math.pow(1 + tasaMensual, plazoMeses);
    return (montoFinanciado * tasaMensual * factor) / (factor - 1);
  }

  /**
   * Calcula la comisión por apertura
   * @param {number} montoFinanciado - Monto a financiar
   * @returns {number} - Monto de la comisión
   */
  calcularComisionApertura(montoFinanciado) {
    return (montoFinanciado * this.comisionApertura) / 100;
  }

  /**
   * Valida que los datos del banco sean correctos
   * @returns {Object} - Objeto con errores encontrados o vacío si no hay errores
   */
  validate() {
    const errors = {};

    if (!this.nombre || this.nombre.trim() === '') {
      errors.nombre = 'El nombre es obligatorio';
    }

    if (this.tasaInteres === undefined || this.tasaInteres < 0) {
      errors.tasaInteres = 'La tasa de interés debe ser un valor positivo';
    }

    if (this.cat === undefined || this.cat < 0) {
      errors.cat = 'El CAT debe ser un valor positivo';
    }

    if (this.comisionApertura === undefined || this.comisionApertura < 0) {
      errors.comisionApertura = 'La comisión por apertura debe ser un valor positivo';
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
      nombre: this.nombre,
      tasa_interes: this.tasaInteres,
      cat: this.cat,
      comision_apertura: this.comisionApertura,
      logo: this.logo,
      activo: this.activo,
      fecha_creacion: this.fechaCreacion,
      fecha_actualizacion: this.fechaActualizacion
    };
  }

  /**
   * Crea una instancia de Bank a partir de un objeto de la base de datos
   * @param {Object} dbObject - Objeto proveniente de la base de datos
   * @returns {Bank} - Nueva instancia de Bank
   */
  static fromDatabase(dbObject) {
    return new Bank({
      id: dbObject.id,
      nombre: dbObject.nombre,
      tasaInteres: dbObject.tasa_interes,
      cat: dbObject.cat,
      comisionApertura: dbObject.comision_apertura,
      logo: dbObject.logo,
      activo: dbObject.activo,
      fechaCreacion: dbObject.fecha_creacion,
      fechaActualizacion: dbObject.fecha_actualizacion
    });
  }
}

module.exports = Bank;