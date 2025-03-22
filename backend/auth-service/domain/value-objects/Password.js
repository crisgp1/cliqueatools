/**
 * Password.js - Objeto de valor que representa una contraseña segura
 * Se encarga del hash, validación y comparación de contraseñas
 */

const bcrypt = require('bcryptjs');

class Password {
  /**
   * Constructor privado, no debe usarse directamente
   * @param {string} hashedValue - Valor hasheado de la contraseña
   * @private
   */
  constructor(hashedValue) {
    this.value = hashedValue;
  }

  /**
   * Crea una nueva instancia de Password a partir de una contraseña en texto plano
   * @param {string} plainPassword - Contraseña en texto plano
   * @returns {Promise<Password>} - Nueva instancia de Password
   * @throws {Error} - Si la contraseña no es válida
   */
  static async create(plainPassword) {
    // Validar la contraseña
    const validationResult = this.validate(plainPassword);
    if (Object.keys(validationResult).length > 0) {
      throw new Error(Object.values(validationResult).join(', '));
    }

    // Generar el hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    return new Password(hashedPassword);
  }

  /**
   * Crea una instancia de Password a partir de un hash existente
   * @param {string} hashedPassword - Hash de la contraseña
   * @returns {Password} - Nueva instancia de Password
   */
  static fromHash(hashedPassword) {
    return new Password(hashedPassword);
  }

  /**
   * Valida una contraseña en texto plano
   * @param {string} plainPassword - Contraseña en texto plano
   * @returns {Object} - Objeto con errores encontrados o vacío si no hay errores
   */
  static validate(plainPassword) {
    const errors = {};

    if (!plainPassword) {
      errors.required = 'La contraseña es obligatoria';
      return errors;
    }

    if (plainPassword.length < 8) {
      errors.length = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (!/[A-Z]/.test(plainPassword)) {
      errors.uppercase = 'La contraseña debe contener al menos una letra mayúscula';
    }

    if (!/[a-z]/.test(plainPassword)) {
      errors.lowercase = 'La contraseña debe contener al menos una letra minúscula';
    }

    if (!/[0-9]/.test(plainPassword)) {
      errors.digit = 'La contraseña debe contener al menos un dígito';
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(plainPassword)) {
      errors.special = 'La contraseña debe contener al menos un carácter especial';
    }

    return errors;
  }

  /**
   * Compara una contraseña en texto plano con el hash almacenado
   * @param {string} plainPassword - Contraseña en texto plano a comparar
   * @returns {Promise<boolean>} - true si la contraseña coincide, false en caso contrario
   */
  async compare(plainPassword) {
    return await bcrypt.compare(plainPassword, this.value);
  }

  /**
   * Obtiene el hash de la contraseña
   * @returns {string} - Hash de la contraseña
   */
  getHash() {
    return this.value;
  }

  /**
   * Verifica si la contraseña actual está hasheada con un algoritmo obsoleto
   * y necesita ser actualizada
   * @returns {boolean} - true si la contraseña necesita actualización
   */
  needsRehash() {
    // Implementación futura para verificar si el algoritmo de hash está desactualizado
    return false;
  }

  /**
   * Convierte el objeto a una representación de string
   * @returns {string} - Representación de string
   */
  toString() {
    return this.value;
  }

  /**
   * Serializa el objeto para JSON
   * @returns {string} - Valor hasheado
   */
  toJSON() {
    return this.value;
  }
}

module.exports = Password;