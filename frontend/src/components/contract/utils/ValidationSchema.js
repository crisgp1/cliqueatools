import Joi from 'joi';
import {
  RFC_PATTERNS,
  CURP_PATTERN,
  INE_PATTERNS,
  PLACAS_PATTERNS,
  VIN_PATTERN
} from './MexicanValidations';

/**
 * Schema de validación para el formulario de contrato
 * Define los campos obligatorios que deben estar completos
 * antes de permitir acceder a la vista previa
 */
export const contractSchema = Joi.object({
  // Información General - campos obligatorios
  ciudad: Joi.string().required().messages({
    'string.empty': 'La ciudad es obligatoria',
    'any.required': 'La ciudad es obligatoria'
  }),
  estado: Joi.string().required().messages({
    'string.empty': 'El estado es obligatorio',
    'any.required': 'El estado es obligatorio'
  }),
  fecha: Joi.string().required().messages({
    'string.empty': 'La fecha es obligatoria',
    'any.required': 'La fecha es obligatoria'
  }),
  hora: Joi.string().required().messages({
    'string.empty': 'La hora es obligatoria',
    'any.required': 'La hora es obligatoria'
  }),
  codigoPostal: Joi.string().allow(''),
  colonia: Joi.string().allow(''),
  calle: Joi.string().allow(''),
  numeroExterior: Joi.string().allow(''),
  direccionCompleta: Joi.string().allow(''),

  // Información del Comprador - campos obligatorios
  nombreComprador: Joi.string().required().messages({
    'string.empty': 'El nombre del comprador es obligatorio',
    'any.required': 'El nombre del comprador es obligatorio'
  }),
  domicilioComprador: Joi.string().required().messages({
    'string.empty': 'El domicilio del comprador es obligatorio',
    'any.required': 'El domicilio del comprador es obligatorio'
  }),
  telefonoComprador: Joi.string().required().messages({
    'string.empty': 'El teléfono del comprador es obligatorio',
    'any.required': 'El teléfono del comprador es obligatorio'
  }),
  identificacionComprador: Joi.string().required().messages({
    'string.empty': 'El tipo de identificación es obligatorio',
    'any.required': 'El tipo de identificación es obligatorio'
  }),
  numeroIdentificacion: Joi.string().required().messages({
    'string.empty': 'El número de identificación es obligatorio',
    'any.required': 'El número de identificación es obligatorio'
  }),

  // Validaciones especializadas para tipos de identificación mexicanas
  rfc: Joi.string().pattern(RFC_PATTERNS.GENERAL).allow('').messages({
    'string.pattern.base': 'El RFC no tiene el formato correcto (ej. ABCD123456XXX para personas físicas o ABC123456XXX para morales)'
  }),
  curp: Joi.string().pattern(CURP_PATTERN).allow('').messages({
    'string.pattern.base': 'La CURP no tiene el formato correcto (18 caracteres)'
  }),
  ine_clave: Joi.string().pattern(INE_PATTERNS.CLAVE_ELECTOR).allow('').messages({
    'string.pattern.base': 'La clave de elector no tiene el formato correcto (18 caracteres alfanuméricos)'
  }),
  ine_ocr: Joi.string().pattern(INE_PATTERNS.OCR).allow('').messages({
    'string.pattern.base': 'El número OCR no tiene el formato correcto (13 dígitos numéricos)'
  }),

  // Información del Vehículo - campos obligatorios
  marca: Joi.string().required().messages({
    'string.empty': 'La marca del vehículo es obligatoria',
    'any.required': 'La marca del vehículo es obligatoria'
  }),
  modelo: Joi.string().required().messages({
    'string.empty': 'El modelo del vehículo es obligatorio',
    'any.required': 'El modelo del vehículo es obligatorio'
  }),
  color: Joi.string().required().messages({
    'string.empty': 'El color del vehículo es obligatorio',
    'any.required': 'El color del vehículo es obligatorio'
  }),
  tipo: Joi.string().required().messages({
    'string.empty': 'El tipo de vehículo es obligatorio',
    'any.required': 'El tipo de vehículo es obligatorio'
  }),
  numeroMotor: Joi.string().required().messages({
    'string.empty': 'El número de motor es obligatorio',
    'any.required': 'El número de motor es obligatorio'
  }),
  numeroSerie: Joi.string().required().pattern(VIN_PATTERN).messages({
    'string.empty': 'El número de serie es obligatorio',
    'any.required': 'El número de serie es obligatorio',
    'string.pattern.base': 'El número de serie debe tener 17 caracteres alfanuméricos (formato VIN/NIV)'
  }),
  placas: Joi.string().required().pattern(PLACAS_PATTERNS.GENERAL).messages({
    'string.empty': 'Las placas son obligatorias',
    'any.required': 'Las placas son obligatorias',
    'string.pattern.base': 'Las placas no tienen un formato válido (5-7 caracteres alfanuméricos)'
  }),
  numeroFactura: Joi.string().required().messages({
    'string.empty': 'El número de factura es obligatorio',
    'any.required': 'El número de factura es obligatorio'
  }),

  // Información de Pago - campos obligatorios
  precioTotal: Joi.number().greater(0).required().messages({
    'number.base': 'El precio total debe ser un número',
    'number.greater': 'El precio total debe ser mayor a 0',
    'any.required': 'El precio total es obligatorio'
  }),
  formaPago: Joi.string().required().messages({
    'string.empty': 'La forma de pago es obligatoria',
    'any.required': 'La forma de pago es obligatoria'
  }),

  // Campos opcionales que pueden estar presentes en el objeto pero no son requeridos
  emailComprador: Joi.string().email({ tlds: { allow: false } }).allow('').messages({
    'string.email': 'El correo electrónico no tiene un formato válido'
  }),
  rfcVehiculo: Joi.string().pattern(RFC_PATTERNS.GENERAL).allow('').messages({
    'string.pattern.base': 'El RFC no tiene el formato correcto (ej. ABCD123456XXX para personas físicas o ABC123456XXX para morales)'
  }),
  numeroCirculacion: Joi.string().allow(''),
  refrendos: Joi.string().allow(''),
  precioTotalTexto: Joi.string().allow(''),
  observaciones: Joi.string().allow('')
});

/**
 * Valida los datos del contrato usando el schema de Joi
 * Implementa el sistema de visualización de errores gov.uk
 * 
 * @param {Object} contractData - Datos del formulario de contrato
 * @returns {Object} - Resultado de la validación {isValid, errors, fieldErrors}
 */
export const validateContractData = (contractData) => {
  const validation = contractSchema.validate(contractData, {
    abortEarly: false,
    allowUnknown: true
  });

  if (validation.error) {
    // Crear un objeto de errores por campo para el resumen de errores
    const fieldErrors = {};
    const errorMessages = [];

    validation.error.details.forEach(detail => {
      const fieldId = detail.path[0]; // Obtenemos el identificador del campo
      const errorMessage = detail.message;
      
      // Agregamos el error al objeto de errores por campo
      fieldErrors[fieldId] = errorMessage;
      
      // Agregamos el mensaje a la lista para compatibilidad con versiones anteriores
      errorMessages.push(errorMessage);
    });

    return {
      isValid: false,
      errors: errorMessages,
      fieldErrors
    };
  }

  return {
    isValid: true,
    errors: [],
    fieldErrors: {}
  };
};

/**
 * Valida un valor específico contra un patrón de validación mexicano
 * 
 * @param {string} value - Valor a validar
 * @param {string} type - Tipo de validación ('RFC', 'CURP', 'INE', 'PLACAS', 'VIN')
 * @returns {boolean} - true si es válido, false si no lo es
 */
export const validateMexicanField = (value, type) => {
  if (!value) return false;

  value = value.toUpperCase();
  
  switch (type) {
    case 'RFC_FISICA':
      return RFC_PATTERNS.FISICA.test(value);
    case 'RFC_MORAL':
      return RFC_PATTERNS.MORAL.test(value);
    case 'RFC':
      return RFC_PATTERNS.GENERAL.test(value);
    case 'CURP':
      return CURP_PATTERN.test(value);
    case 'INE_CLAVE':
      return INE_PATTERNS.CLAVE_ELECTOR.test(value);
    case 'INE_OCR':
      return INE_PATTERNS.OCR.test(value);
    case 'PLACAS':
      return PLACAS_PATTERNS.GENERAL.test(value);
    case 'VIN':
      return VIN_PATTERN.test(value);
    default:
      return false;
  }
};