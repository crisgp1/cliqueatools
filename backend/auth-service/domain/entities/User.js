/**
 * User.js - Entidad de dominio que representa un usuario del sistema
 * Basado en la tabla 'usuario' del esquema de la base de datos
 */

const Password = require('../value-objects/Password');

class User {
  constructor({
    id = null,
    username,
    password, // Instancia de Password o string hasheado
    email,
    nombre,
    apellidos,
    rol = 'cliente',
    clienteId = null,
    ultimoAcceso = null,
    intentosFallidos = 0,
    activo = true,
    tokenRecuperacion = null,
    fechaExpiracionToken = null,
    fechaCreacion = new Date(),
    fechaActualizacion = new Date()
  }) {
    this.id = id;
    this.username = username;
    this.password = typeof password === 'string' 
      ? Password.fromHash(password)
      : password;
    this.email = email;
    this.nombre = nombre;
    this.apellidos = apellidos;
    this.rol = rol;
    this.clienteId = clienteId;
    this.ultimoAcceso = ultimoAcceso;
    this.intentosFallidos = intentosFallidos;
    this.activo = activo;
    this.tokenRecuperacion = tokenRecuperacion;
    this.fechaExpiracionToken = fechaExpiracionToken;
    this.fechaCreacion = fechaCreacion;
    this.fechaActualizacion = fechaActualizacion;
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @param {string} plainPassword - Contraseña en texto plano
   * @returns {Promise<User>} - Nuevo usuario
   */
  static async create(userData, plainPassword) {
    // Crear el hash de la contraseña
    const passwordObj = await Password.create(plainPassword);
    
    // Crear el usuario
    return new User({
      ...userData,
      password: passwordObj,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    });
  }

  /**
   * Obtiene el nombre completo del usuario
   * @returns {string} - Nombre completo
   */
  get nombreCompleto() {
    return `${this.nombre} ${this.apellidos}`;
  }

  /**
   * Actualiza los datos básicos del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {User} - Instancia actualizada
   */
  update(userData) {
    Object.assign(this, {
      ...userData,
      fechaActualizacion: new Date()
    });
    return this;
  }

  /**
   * Cambia la contraseña del usuario
   * @param {string} newPassword - Nueva contraseña en texto plano
   * @returns {Promise<User>} - Instancia actualizada
   */
  async changePassword(newPassword) {
    this.password = await Password.create(newPassword);
    this.fechaActualizacion = new Date();
    this.tokenRecuperacion = null;
    this.fechaExpiracionToken = null;
    return this;
  }

  /**
   * Verifica si la contraseña proporcionada es correcta
   * @param {string} plainPassword - Contraseña en texto plano
   * @returns {Promise<boolean>} - true si la contraseña es correcta
   */
  async verifyPassword(plainPassword) {
    return await this.password.compare(plainPassword);
  }

  /**
   * Genera un token de recuperación de contraseña
   * @param {number} expirationHours - Horas de validez del token
   * @returns {string} - Token generado
   */
  generateRecoveryToken(expirationHours = 24) {
    // Generar un token aleatorio
    const token = require('crypto').randomBytes(32).toString('hex');
    
    // Establecer fecha de expiración
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + expirationHours);
    
    // Actualizar datos
    this.tokenRecuperacion = token;
    this.fechaExpiracionToken = expiration;
    this.fechaActualizacion = new Date();
    
    return token;
  }

  /**
   * Verifica si un token de recuperación es válido
   * @param {string} token - Token a verificar
   * @returns {boolean} - true si el token es válido y no ha expirado
   */
  isRecoveryTokenValid(token) {
    if (!this.tokenRecuperacion || this.tokenRecuperacion !== token) {
      return false;
    }
    
    if (!this.fechaExpiracionToken || new Date() > this.fechaExpiracionToken) {
      return false;
    }
    
    return true;
  }

  /**
   * Registra un acceso fallido
   * @returns {User} - Instancia actualizada
   */
  registerFailedAttempt() {
    this.intentosFallidos += 1;
    
    // Si supera el umbral de intentos, desactivar la cuenta
    if (this.intentosFallidos >= 5) {
      this.activo = false;
    }
    
    this.fechaActualizacion = new Date();
    return this;
  }

  /**
   * Registra un acceso exitoso
   * @returns {User} - Instancia actualizada
   */
  registerSuccessLogin() {
    this.ultimoAcceso = new Date();
    this.intentosFallidos = 0;
    this.fechaActualizacion = new Date();
    return this;
  }

  /**
   * Activa o desactiva la cuenta de usuario
   * @param {boolean} estado - Estado a establecer
   * @returns {User} - Instancia actualizada
   */
  cambiarEstado(estado) {
    this.activo = estado;
    this.fechaActualizacion = new Date();
    
    // Si se activa, reiniciar intentos fallidos
    if (estado) {
      this.intentosFallidos = 0;
    }
    
    return this;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string|Array<string>} rolEsperado - Rol o roles a verificar
   * @returns {boolean} - true si el usuario tiene el rol esperado
   */
  tieneRol(rolEsperado) {
    if (Array.isArray(rolEsperado)) {
      return rolEsperado.includes(this.rol);
    }
    return this.rol === rolEsperado;
  }

  /**
   * Verifica si el usuario es administrador
   * @returns {boolean} - true si el usuario es administrador
   */
  esAdmin() {
    return this.rol === 'admin';
  }

  /**
   * Verifica si el usuario es asesor
   * @returns {boolean} - true si el usuario es asesor
   */
  esAsesor() {
    return this.rol === 'asesor';
  }

  /**
   * Verifica si el usuario es cliente
   * @returns {boolean} - true si el usuario es cliente
   */
  esCliente() {
    return this.rol === 'cliente';
  }

  /**
   * Valida que los datos del usuario sean correctos
   * @returns {Object} - Objeto con errores encontrados o vacío si no hay errores
   */
  validate() {
    const errors = {};

    if (!this.username || this.username.trim() === '') {
      errors.username = 'El nombre de usuario es obligatorio';
    } else if (this.username.length < 3) {
      errors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!this.email || this.email.trim() === '') {
      errors.email = 'El correo electrónico es obligatorio';
    } else if (!this.validateEmail(this.email)) {
      errors.email = 'El formato del correo electrónico es inválido';
    }

    if (!this.nombre || this.nombre.trim() === '') {
      errors.nombre = 'El nombre es obligatorio';
    }

    if (!this.apellidos || this.apellidos.trim() === '') {
      errors.apellidos = 'Los apellidos son obligatorios';
    }

    if (!['admin', 'asesor', 'cliente'].includes(this.rol)) {
      errors.rol = 'El rol debe ser admin, asesor o cliente';
    }

    if (this.rol === 'cliente' && !this.clienteId) {
      errors.clienteId = 'El ID del cliente es obligatorio para usuarios con rol cliente';
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
   * Convierte la entidad a un objeto simple para persistencia
   * @returns {Object} - Objeto simple con los datos de la entidad
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      password: this.password.getHash(),
      email: this.email,
      nombre: this.nombre,
      apellidos: this.apellidos,
      rol: this.rol,
      cliente_id: this.clienteId,
      ultimo_acceso: this.ultimoAcceso,
      intentos_fallidos: this.intentosFallidos,
      activo: this.activo,
      token_recuperacion: this.tokenRecuperacion,
      fecha_expiracion_token: this.fechaExpiracionToken,
      fecha_creacion: this.fechaCreacion,
      fecha_actualizacion: this.fechaActualizacion
    };
  }

  /**
   * Crea una instancia de User a partir de un objeto de la base de datos
   * @param {Object} dbObject - Objeto proveniente de la base de datos
   * @returns {User} - Nueva instancia de User
   */
  static fromDatabase(dbObject) {
    return new User({
      id: dbObject.id,
      username: dbObject.username,
      password: dbObject.password, // Ya debe estar hasheado
      email: dbObject.email,
      nombre: dbObject.nombre,
      apellidos: dbObject.apellidos,
      rol: dbObject.rol,
      clienteId: dbObject.cliente_id,
      ultimoAcceso: dbObject.ultimo_acceso,
      intentosFallidos: dbObject.intentos_fallidos,
      activo: dbObject.activo,
      tokenRecuperacion: dbObject.token_recuperacion,
      fechaExpiracionToken: dbObject.fecha_expiracion_token,
      fechaCreacion: dbObject.fecha_creacion,
      fechaActualizacion: dbObject.fecha_actualizacion
    });
  }

  /**
   * Genera una representación simple del usuario para tokens o sesiones
   * @returns {Object} - Datos básicos del usuario
   */
  toBasicInfo() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      nombre: this.nombre,
      apellidos: this.apellidos,
      nombreCompleto: this.nombreCompleto,
      rol: this.rol,
      clienteId: this.clienteId,
      activo: this.activo
    };
  }
}

module.exports = User;