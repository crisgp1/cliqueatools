/**
 * AmortizationDetail.js - Entidad de dominio que representa un detalle de amortización
 * Basado en la tabla 'amortizacion_detalle' del esquema de la base de datos
 */

class AmortizationDetail {
  constructor({
    id = null,
    creditoId,
    numeroPago,
    fechaPago,
    pagoTotal,
    pagoCapital,
    pagoInteres,
    saldoInsoluto,
    fechaCreacion = new Date()
  }) {
    this.id = id;
    this.creditoId = creditoId;
    this.numeroPago = numeroPago;
    this.fechaPago = fechaPago;
    this.pagoTotal = pagoTotal;
    this.pagoCapital = pagoCapital;
    this.pagoInteres = pagoInteres;
    this.saldoInsoluto = saldoInsoluto;
    this.fechaCreacion = fechaCreacion;
  }

  /**
   * Formatea un valor como moneda (MXN)
   * @param {number} valor - Valor a formatear
   * @returns {string} - Valor formateado como moneda
   */
  formatearMoneda(valor) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor);
  }

  /**
   * Obtiene el monto de pago total formateado como moneda
   * @returns {string} - Monto formateado
   */
  getPagoTotalFormateado() {
    return this.formatearMoneda(this.pagoTotal);
  }

  /**
   * Obtiene el monto de pago a capital formateado como moneda
   * @returns {string} - Monto formateado
   */
  getPagoCapitalFormateado() {
    return this.formatearMoneda(this.pagoCapital);
  }

  /**
   * Obtiene el monto de pago de interés formateado como moneda
   * @returns {string} - Monto formateado
   */
  getPagoInteresFormateado() {
    return this.formatearMoneda(this.pagoInteres);
  }

  /**
   * Obtiene el saldo insoluto formateado como moneda
   * @returns {string} - Monto formateado
   */
  getSaldoInsolutoFormateado() {
    return this.formatearMoneda(this.saldoInsoluto);
  }

  /**
   * Valida que los datos del detalle de amortización sean correctos
   * @returns {Object} - Objeto con errores encontrados o vacío si no hay errores
   */
  validate() {
    const errors = {};

    if (!this.creditoId) {
      errors.creditoId = 'El ID del crédito es obligatorio';
    }

    if (this.numeroPago === undefined || this.numeroPago <= 0) {
      errors.numeroPago = 'El número de pago debe ser un número positivo';
    }

    if (!this.fechaPago) {
      errors.fechaPago = 'La fecha de pago es obligatoria';
    }

    if (this.pagoTotal === undefined || this.pagoTotal <= 0) {
      errors.pagoTotal = 'El pago total debe ser un número positivo';
    }

    if (this.pagoCapital === undefined || this.pagoCapital < 0) {
      errors.pagoCapital = 'El pago a capital debe ser un número positivo o cero';
    }

    if (this.pagoInteres === undefined || this.pagoInteres < 0) {
      errors.pagoInteres = 'El pago de interés debe ser un número positivo o cero';
    }

    if (this.saldoInsoluto === undefined || this.saldoInsoluto < 0) {
      errors.saldoInsoluto = 'El saldo insoluto debe ser un número positivo o cero';
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
      credito_id: this.creditoId,
      numero_pago: this.numeroPago,
      fecha_pago: this.fechaPago,
      pago_total: this.pagoTotal,
      pago_capital: this.pagoCapital,
      pago_interes: this.pagoInteres,
      saldo_insoluto: this.saldoInsoluto,
      fecha_creacion: this.fechaCreacion
    };
  }

  /**
   * Crea una instancia de AmortizationDetail a partir de un objeto de la base de datos
   * @param {Object} dbObject - Objeto proveniente de la base de datos
   * @returns {AmortizationDetail} - Nueva instancia de AmortizationDetail
   */
  static fromDatabase(dbObject) {
    return new AmortizationDetail({
      id: dbObject.id,
      creditoId: dbObject.credito_id,
      numeroPago: dbObject.numero_pago,
      fechaPago: dbObject.fecha_pago,
      pagoTotal: dbObject.pago_total,
      pagoCapital: dbObject.pago_capital,
      pagoInteres: dbObject.pago_interes,
      saldoInsoluto: dbObject.saldo_insoluto,
      fechaCreacion: dbObject.fecha_creacion
    });
  }
}

module.exports = AmortizationDetail;