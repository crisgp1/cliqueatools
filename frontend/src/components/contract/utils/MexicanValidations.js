/**
 * Validación de documentos mexicanos
 * Contiene patrones regex y funciones de validación para documentos de identificación mexicanos
 */

/**
 * Patrones de validación para RFC
 * - Personas físicas: 13 caracteres (4 letras + 6 dígitos de fecha + 3 caracteres homoclave)
 * - Personas morales: 12 caracteres (3 letras + 6 dígitos de fecha + 3 caracteres homoclave)
 */
export const RFC_PATTERNS = {
  // RFC para personas físicas (13 caracteres)
  FISICA: /^[A-ZÑ&]{4}[0-9]{6}[A-Z0-9]{3}$/,
  // RFC para personas morales (12 caracteres)
  MORAL: /^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$/,
  // Patrón general que acepta ambos formatos
  GENERAL: /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/
};

/**
 * Patrón de validación para CURP
 * 18 caracteres (4 letras + 6 dígitos de fecha + H/M (sexo) + 2 letras estado + 3 consonantes + 1 dígito/letra)
 */
export const CURP_PATTERN = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{2}[BCDFGHJKLMNPQRSTVWXYZ]{3}[0-9A-Z][0-9]$/;

/**
 * Patrones de validación para INE/IFE
 */
export const INE_PATTERNS = {
  // Clave de elector: 18 caracteres alfanuméricos
  CLAVE_ELECTOR: /^[A-Z]{6}[0-9]{8}[A-Z]{4}$/,
  // OCR: 13 dígitos numéricos
  OCR: /^[0-9]{13}$/,
  // CIC: 10 dígitos alfanuméricos (puede aparecer en algunas credenciales)
  CIC: /^[0-9]{10}$/
};

/**
 * Patrones de validación para placas vehiculares
 * Formatos variables según estado (5-7 caracteres)
 */
export const PLACAS_PATTERNS = {
  // CDMX (3 letras + 3 números)
  CDMX: /^[A-Z]{3}[0-9]{3}$/,
  // Estado de México (3 números + 3 letras)
  EDOMEX: /^[0-9]{3}[A-Z]{3}$/,
  // Jalisco, Nuevo León y otros (2-3 letras + 4-5 números)
  OTROS: /^[A-Z]{2,3}[0-9]{4,5}$/,
  // Patrón general que acepta la mayoría de formatos
  GENERAL: /^[A-Z0-9]{5,7}$/
};

/**
 * Patrón de validación para Número de serie de vehículos (NIV/VIN)
 * 17 caracteres alfanuméricos (estándar internacional)
 * No contiene I, O, Q para evitar confusión con 1 y 0
 */
export const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

/**
 * Valida un RFC según su tipo
 * @param {string} rfc - RFC a validar
 * @param {string} tipo - 'FISICA', 'MORAL' o 'GENERAL'
 * @returns {boolean} - true si es válido, false si no lo es
 */
export const validarRFC = (rfc, tipo = 'GENERAL') => {
  if (!rfc) return false;
  
  // Convertir a mayúsculas
  const rfcUppercase = rfc.toUpperCase();
  
  // Validar según el tipo
  return RFC_PATTERNS[tipo].test(rfcUppercase);
};

/**
 * Valida una CURP
 * @param {string} curp - CURP a validar
 * @returns {boolean} - true si es válida, false si no lo es
 */
export const validarCURP = (curp) => {
  if (!curp) return false;
  
  // Convertir a mayúsculas
  const curpUppercase = curp.toUpperCase();
  
  return CURP_PATTERN.test(curpUppercase);
};

/**
 * Valida un número de INE/IFE según su tipo
 * @param {string} ine - Número a validar
 * @param {string} tipo - 'CLAVE_ELECTOR', 'OCR' o 'CIC'
 * @returns {boolean} - true si es válido, false si no lo es
 */
export const validarINE = (ine, tipo = 'CLAVE_ELECTOR') => {
  if (!ine) return false;
  
  // Convertir a mayúsculas para la clave de elector
  const ineUppercase = tipo === 'CLAVE_ELECTOR' ? ine.toUpperCase() : ine;
  
  return INE_PATTERNS[tipo].test(ineUppercase);
};

/**
 * Valida una placa vehicular
 * @param {string} placa - Placa a validar
 * @param {string} tipo - 'CDMX', 'EDOMEX', 'OTROS' o 'GENERAL'
 * @returns {boolean} - true si es válida, false si no lo es
 */
export const validarPlaca = (placa, tipo = 'GENERAL') => {
  if (!placa) return false;
  
  // Convertir a mayúsculas
  const placaUppercase = placa.toUpperCase();
  
  return PLACAS_PATTERNS[tipo].test(placaUppercase);
};

/**
 * Valida un número de serie vehicular (NIV/VIN)
 * @param {string} vin - Número de serie a validar
 * @returns {boolean} - true si es válido, false si no lo es
 */
export const validarVIN = (vin) => {
  if (!vin) return false;
  
  // Convertir a mayúsculas
  const vinUppercase = vin.toUpperCase();
  
  return VIN_PATTERN.test(vinUppercase);
};

/**
 * Detecta el tipo de identificación basado en el formato
 * @param {string} numero - Número de identificación
 * @param {string} tipo - Tipo de identificación declarado
 * @returns {string} - El tipo de identificación detectado
 */
export const detectarTipoIdentificacion = (numero, tipo) => {
  if (!numero) return 'DESCONOCIDO';
  
  numero = numero.toUpperCase();
  
  // Detectar tipo basado en el formato
  if (validarRFC(numero, 'FISICA')) return 'RFC_FISICA';
  if (validarRFC(numero, 'MORAL')) return 'RFC_MORAL';
  if (validarCURP(numero)) return 'CURP';
  if (validarINE(numero, 'CLAVE_ELECTOR')) return 'INE_CLAVE';
  if (validarINE(numero, 'OCR')) return 'INE_OCR';
  
  // Si no se detecta un formato específico, devolver el tipo declarado
  return tipo || 'DESCONOCIDO';
};