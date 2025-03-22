/**
 * AmortizationSchedule.js - Entidad de dominio que representa una tabla de amortización completa
 * Basado en la tabla 'amortizacion_detalle' del esquema de la base de datos
 */

const AmortizationDetail = require('./AmortizationDetail');

class AmortizationSchedule {
  constructor({
    creditoId,
    montoFinanciado,
    tasaInteres,
    plazoMeses,
    fechaInicio = new Date(),
    detalles = []
  }) {
    this.creditoId = creditoId;
    this.montoFinanciado = montoFinanciado;
    this.tasaInteres = tasaInteres;
    this.plazoMeses = plazoMeses;
    this.fechaInicio = fechaInicio;
    this.detalles = detalles;
  }

  /**
   * Agrega un detalle de amortización a la tabla
   * @param {AmortizationDetail} detalle - Detalle a agregar
   * @returns {AmortizationSchedule} - Instancia actualizada
   */
  agregarDetalle(detalle) {
    this.detalles.push(detalle);
    return this;
  }

  /**
   * Obtiene todos los detalles de la tabla de amortización
   * @returns {Array<AmortizationDetail>} - Detalles de la tabla
   */
  getDetalles() {
    return this.detalles;
  }

  /**
   * Obtiene el resumen de la tabla de amortización
   * @returns {Object} - Resumen con totales
   */
  getResumen() {
    const totalPagos = this.detalles.reduce((sum, detalle) => sum + detalle.pagoTotal, 0);
    const totalCapital = this.detalles.reduce((sum, detalle) => sum + detalle.pagoCapital, 0);
    const totalInteres = this.detalles.reduce((sum, detalle) => sum + detalle.pagoInteres, 0);
    
    return {
      montoFinanciado: this.montoFinanciado,
      pagoMensual: this.detalles.length > 0 ? this.detalles[0].pagoTotal : 0,
      plazoMeses: this.plazoMeses,
      tasaInteres: this.tasaInteres,
      totalPagos,
      totalCapital,
      totalInteres,
      costoFinanciamiento: totalPagos - this.montoFinanciado
    };
  }

  /**
   * Calcula el pago mensual basado en los parámetros del crédito
   * @returns {number} - Pago mensual calculado
   */
  calcularPagoMensual() {
    const tasaMensual = this.tasaInteres / 100 / 12;
    const factor = Math.pow(1 + tasaMensual, this.plazoMeses);
    return (this.montoFinanciado * tasaMensual * factor) / (factor - 1);
  }

  /**
   * Genera todos los detalles de la tabla de amortización
   * @returns {AmortizationSchedule} - Instancia actualizada con todos los detalles
   */
  generarTablaAmortizacion() {
    const pagoMensual = this.calcularPagoMensual();
    let saldoInsoluto = this.montoFinanciado;
    const tasaMensual = this.tasaInteres / 100 / 12;
    this.detalles = [];

    for (let i = 1; i <= this.plazoMeses; i++) {
      // Calcular fecha de pago
      const fechaPago = new Date(this.fechaInicio);
      fechaPago.setMonth(fechaPago.getMonth() + i);

      // Calcular pago de interés
      const pagoInteres = saldoInsoluto * tasaMensual;

      // Calcular pago a capital
      let pagoCapital = pagoMensual - pagoInteres;

      // Ajustar para el último pago si hay diferencia
      if (i === this.plazoMeses && Math.abs(pagoCapital - saldoInsoluto) < 1) {
        pagoCapital = saldoInsoluto;
      }

      // Actualizar saldo insoluto
      saldoInsoluto -= pagoCapital;

      // Asegurar que el saldo no sea negativo
      saldoInsoluto = Math.max(0, saldoInsoluto);

      // Crear detalle de amortización
      const detalle = new AmortizationDetail({
        creditoId: this.creditoId,
        numeroPago: i,
        fechaPago,
        pagoTotal: pagoMensual,
        pagoCapital,
        pagoInteres,
        saldoInsoluto
      });

      this.detalles.push(detalle);
    }

    return this;
  }

  /**
   * Valida que los datos de la tabla de amortización sean correctos
   * @returns {Object} - Objeto con errores encontrados o vacío si no hay errores
   */
  validate() {
    const errors = {};

    if (!this.creditoId) {
      errors.creditoId = 'El ID del crédito es obligatorio';
    }

    if (!this.montoFinanciado || this.montoFinanciado <= 0) {
      errors.montoFinanciado = 'El monto financiado debe ser mayor a 0';
    }

    if (!this.tasaInteres || this.tasaInteres < 0) {
      errors.tasaInteres = 'La tasa de interés debe ser un valor positivo';
    }

    if (!this.plazoMeses || this.plazoMeses <= 0 || !Number.isInteger(this.plazoMeses)) {
      errors.plazoMeses = 'El plazo debe ser un número entero positivo de meses';
    }

    if (!this.fechaInicio) {
      errors.fechaInicio = 'La fecha de inicio es obligatoria';
    }

    return errors;
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
   * Convierte la entidad a un objeto simple para persistencia o representación
   * @returns {Object} - Objeto con los datos de la entidad
   */
  toJSON() {
    return {
      creditoId: this.creditoId,
      montoFinanciado: this.montoFinanciado,
      tasaInteres: this.tasaInteres,
      plazoMeses: this.plazoMeses,
      fechaInicio: this.fechaInicio,
      detalles: this.detalles.map(detalle => detalle.toJSON()),
      resumen: this.getResumen()
    };
  }
}

module.exports = AmortizationSchedule;