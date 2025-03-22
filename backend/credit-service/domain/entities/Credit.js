/**
 * Credit.js - Entidad de dominio que representa un crédito
 * Basado en la tabla 'credito' del esquema de la base de datos
 */

class Credit {
  constructor({
    id = null,
    clienteId,
    bancoId,
    fechaSolicitud = new Date(),
    montoTotal, // Valor total de los vehículos
    porcentajeEnganche,
    montoEnganche,
    montoFinanciado,
    plazoMeses,
    tasaInteres,
    pagoMensual,
    cat,
    comisionApertura,
    montoTotalPagar,
    estatus = 'Simulación',
    fechaCreacion = new Date(),
    fechaActualizacion = new Date()
  }) {
    this.id = id;
    this.clienteId = clienteId;
    this.bancoId = bancoId;
    this.fechaSolicitud = fechaSolicitud;
    this.montoTotal = montoTotal;
    this.porcentajeEnganche = porcentajeEnganche;
    this.montoEnganche = montoEnganche;
    this.montoFinanciado = montoFinanciado;
    this.plazoMeses = plazoMeses;
    this.tasaInteres = tasaInteres;
    this.pagoMensual = pagoMensual;
    this.cat = cat;
    this.comisionApertura = comisionApertura;
    this.montoTotalPagar = montoTotalPagar;
    this.estatus = estatus;
    this.fechaCreacion = fechaCreacion;
    this.fechaActualizacion = fechaActualizacion;
  }

  /**
   * Obtiene el estatus del crédito
   * @returns {string} - Estatus actual del crédito
   */
  getEstatus() {
    return this.estatus;
  }

  /**
   * Actualiza el estatus del crédito
   * @param {string} nuevoEstatus - Nuevo estatus a establecer
   * @returns {Credit} - Instancia actualizada
   */
  actualizarEstatus(nuevoEstatus) {
    const estatusValidos = ['Simulación', 'Solicitado', 'En revisión', 'Aprobado', 'Rechazado', 'Cancelado', 'Finalizado'];
    
    if (!estatusValidos.includes(nuevoEstatus)) {
      throw new Error(`Estatus no válido: ${nuevoEstatus}. Los valores válidos son: ${estatusValidos.join(', ')}`);
    }
    
    this.estatus = nuevoEstatus;
    this.fechaActualizacion = new Date();
    return this;
  }

  /**
   * Actualiza los datos del crédito
   * @param {Object} creditData - Datos a actualizar
   * @returns {Credit} - Instancia actualizada
   */
  update(creditData) {
    Object.assign(this, {
      ...creditData,
      fechaActualizacion: new Date()
    });
    return this;
  }

  /**
   * Calcula el pago mensual basado en el monto financiado, tasa y plazo
   * @returns {number} - Pago mensual calculado
   */
  calcularPagoMensual() {
    const tasaMensual = this.tasaInteres / 100 / 12;
    const factor = Math.pow(1 + tasaMensual, this.plazoMeses);
    return (this.montoFinanciado * tasaMensual * factor) / (factor - 1);
  }

  /**
   * Calcula el monto total a pagar (incluye intereses y comisión)
   * @returns {number} - Monto total a pagar
   */
  calcularMontoTotalPagar() {
    const totalIntereses = (this.pagoMensual * this.plazoMeses) - this.montoFinanciado;
    return this.montoFinanciado + totalIntereses + this.comisionApertura;
  }

  /**
   * Calcula el monto de la comisión por apertura
   * @returns {number} - Monto de la comisión
   */
  calcularComisionApertura() {
    return (this.montoFinanciado * this.tasaInteres) / 100;
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
   * Formatea un valor como porcentaje
   * @param {number} valor - Valor a formatear
   * @returns {string} - Valor formateado como porcentaje
   */
  formatearPorcentaje(valor) {
    return `${valor.toFixed(2)}%`;
  }

  /**
   * Valida que los datos del crédito sean correctos
   * @returns {Object} - Objeto con errores encontrados o vacío si no hay errores
   */
  validate() {
    const errors = {};

    if (!this.clienteId) {
      errors.clienteId = 'El cliente es obligatorio';
    }

    if (!this.bancoId) {
      errors.bancoId = 'El banco es obligatorio';
    }

    if (this.montoTotal <= 0) {
      errors.montoTotal = 'El monto total debe ser mayor a 0';
    }

    if (this.porcentajeEnganche < 10 || this.porcentajeEnganche > 60) {
      errors.porcentajeEnganche = 'El porcentaje de enganche debe estar entre 10% y 60%';
    }

    if (this.montoEnganche <= 0) {
      errors.montoEnganche = 'El monto de enganche debe ser mayor a 0';
    }

    if (this.montoFinanciado <= 0) {
      errors.montoFinanciado = 'El monto financiado debe ser mayor a 0';
    }

    if (![12, 24, 36, 48, 60].includes(this.plazoMeses)) {
      errors.plazoMeses = 'El plazo debe ser 12, 24, 36, 48 o 60 meses';
    }

    return errors;
  }

  /**
   * Verifica si el crédito está en un estatus específico
   * @param {string|Array<string>} estatusEsperado - Estatus a verificar
   * @returns {boolean} - true si el crédito está en el estatus esperado
   */
  estaEnEstatus(estatusEsperado) {
    if (Array.isArray(estatusEsperado)) {
      return estatusEsperado.includes(this.estatus);
    }
    return this.estatus === estatusEsperado;
  }

  /**
   * Verifica si el crédito puede cambiar al estatus especificado
   * @param {string} nuevoEstatus - Estatus al que se quiere cambiar
   * @returns {boolean} - true si el cambio es válido
   */
  puedeActualizarEstatus(nuevoEstatus) {
    // Definición de las transiciones válidas
    const transicionesValidas = {
      'Simulación': ['Solicitado', 'Cancelado'],
      'Solicitado': ['En revisión', 'Cancelado'],
      'En revisión': ['Aprobado', 'Rechazado', 'Cancelado'],
      'Aprobado': ['Finalizado', 'Cancelado'],
      'Rechazado': ['Solicitado', 'Cancelado'],
      'Cancelado': ['Solicitado'],
      'Finalizado': []
    };

    return transicionesValidas[this.estatus]?.includes(nuevoEstatus) || false;
  }

  /**
   * Convierte la entidad a un objeto simple para persistencia
   * @returns {Object} - Objeto simple con los datos de la entidad
   */
  toJSON() {
    return {
      id: this.id,
      cliente_id: this.clienteId,
      banco_id: this.bancoId,
      fecha_solicitud: this.fechaSolicitud,
      monto_total: this.montoTotal,
      porcentaje_enganche: this.porcentajeEnganche,
      monto_enganche: this.montoEnganche,
      monto_financiado: this.montoFinanciado,
      plazo_meses: this.plazoMeses,
      tasa_interes: this.tasaInteres,
      pago_mensual: this.pagoMensual,
      cat: this.cat,
      comision_apertura: this.comisionApertura,
      monto_total_pagar: this.montoTotalPagar,
      estatus: this.estatus,
      fecha_creacion: this.fechaCreacion,
      fecha_actualizacion: this.fechaActualizacion
    };
  }

  /**
   * Crea una instancia de Credit a partir de un objeto de la base de datos
   * @param {Object} dbObject - Objeto proveniente de la base de datos
   * @returns {Credit} - Nueva instancia de Credit
   */
  static fromDatabase(dbObject) {
    return new Credit({
      id: dbObject.id,
      clienteId: dbObject.cliente_id,
      bancoId: dbObject.banco_id,
      fechaSolicitud: dbObject.fecha_solicitud,
      montoTotal: dbObject.monto_total,
      porcentajeEnganche: dbObject.porcentaje_enganche,
      montoEnganche: dbObject.monto_enganche,
      montoFinanciado: dbObject.monto_financiado,
      plazoMeses: dbObject.plazo_meses,
      tasaInteres: dbObject.tasa_interes,
      pagoMensual: dbObject.pago_mensual,
      cat: dbObject.cat,
      comisionApertura: dbObject.comision_apertura,
      montoTotalPagar: dbObject.monto_total_pagar,
      estatus: dbObject.estatus,
      fechaCreacion: dbObject.fecha_creacion,
      fechaActualizacion: dbObject.fecha_actualizacion
    });
  }
}

module.exports = Credit;