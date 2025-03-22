/**
 * Client.js - Entidad de dominio que representa un cliente
 * Basado en la tabla 'cliente' del esquema de la base de datos
 */

class Client {
  constructor({
    id = null,
    nombre,
    apellidos,
    email = null,
    telefono = null,
    rfc = null,
    direccion = null,
    ciudad = null,
    codigoPostal = null,
    fechaCreacion = new Date(),
    fechaActualizacion = new Date()
  }) {
    this.id = id;
    this.nombre = nombre;
    this.apellidos = apellidos;
    this.email = email;
    this.telefono = telefono;
    this.rfc = rfc;
    this.direccion = direccion;
    this.ciudad = ciudad;
    this.codigoPostal = codigoPostal;
    this.fechaCreacion = fechaCreacion;
    this.fechaActualizacion = fechaActualizacion;
  }

  /**
   * Obtiene el nombre completo del cliente
   * @returns {string} Nombre completo del cliente
   */
  get nombreCompleto() {
    return `${this.nombre} ${this.apellidos}`;
  }

  /**
   * Actualiza los datos del cliente
   * @param {Object} clientData - Datos a actualizar
   * @returns {Client} - Instancia actualizada
   */
  update(clientData) {
    Object.assign(this, {
      ...clientData,
      fechaActualizacion: new Date()
    });
    return this;
  }

  /**
   * Valida que los datos del cliente sean correctos
   * @returns {Object} - Objeto con errores encontrados o vacío si no hay errores
   */
  validate() {
    const errors = {};

    if (!this.nombre || this.nombre.trim() === '') {
      errors.nombre = 'El nombre es obligatorio';
    }

    if (!this.apellidos || this.apellidos.trim() === '') {
      errors.apellidos = 'Los apellidos son obligatorios';
    }

    if (this.email && !this.validateEmail(this.email)) {
      errors.email = 'El formato del correo electrónico es inválido';
    }

    if (this.telefono && !this.validatePhoneNumber(this.telefono)) {
      errors.telefono = 'El teléfono debe tener 10 dígitos';
    }

    if (this.rfc && !this.validateRfc(this.rfc)) {
      errors.rfc = 'El formato del RFC es inválido';
    }

    if (this.codigoPostal && !this.validatePostalCode(this.codigoPostal)) {
      errors.codigoPostal = 'El código postal debe tener 5 dígitos';
    }

    return errors;
  }

  /**
   * Valida un correo electrónico
   * @private
   * @param {string} email - Email a validar
   * @returns {boolean} - true si es válido, false si no
   */
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Valida un número de teléfono mexicano (10 dígitos)
   * @private
   * @param {string} phone - Teléfono a validar
   * @returns {boolean} - true si es válido, false si no
   */
  validatePhoneNumber(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
  }

  /**
   * Valida un RFC mexicano (versión simplificada)
   * @private
   * @param {string} rfc - RFC a validar
   * @returns {boolean} - true si es válido, false si no
   */
  validateRfc(rfc) {
    const re = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    return re.test(rfc);
  }

  /**
   * Valida un código postal mexicano (5 dígitos)
   * @private
   * @param {string} postalCode - Código postal a validar
   * @returns {boolean} - true si es válido, false si no
   */
  validatePostalCode(postalCode) {
    const re = /^[0-9]{5}$/;
    return re.test(postalCode);
  }

  /**
   * Convierte la entidad a un objeto simple para persistencia
   * @returns {Object} - Objeto simple con los datos de la entidad
   */
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      apellidos: this.apellidos,
      email: this.email,
      telefono: this.telefono,
      rfc: this.rfc,
      direccion: this.direccion,
      ciudad: this.ciudad,
      codigo_postal: this.codigoPostal,
      fecha_creacion: this.fechaCreacion,
      fecha_actualizacion: this.fechaActualizacion
    };
  }

  /**
   * Crea una instancia de Client a partir de un objeto de la base de datos
   * @param {Object} dbObject - Objeto proveniente de la base de datos
   * @returns {Client} - Nueva instancia de Client
   */
  static fromDatabase(dbObject) {
    return new Client({
      id: dbObject.id,
      nombre: dbObject.nombre,
      apellidos: dbObject.apellidos,
      email: dbObject.email,
      telefono: dbObject.telefono,
      rfc: dbObject.rfc,
      direccion: dbObject.direccion,
      ciudad: dbObject.ciudad,
      codigoPostal: dbObject.codigo_postal,
      fechaCreacion: dbObject.fecha_creacion,
      fechaActualizacion: dbObject.fecha_actualizacion
    });
  }
}

module.exports = Client;