/**
 * Utility functions for contract components
 */

/**
 * Formats a number as Mexican currency
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Converts a number to its text representation in Spanish
 * @param {number} numero - The number to convert
 * @returns {string} Text representation of the number
 */
export const numeroATexto = (numero) => {
  // Simplified version - in a real implementation, we would use a full conversion library
  const unidades = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const decenas = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  // Simplified for the purpose of this example
  return `${numero} pesos 00/100 M.N.`;
};

/**
 * Gets current formatted date and time
 * @returns {Object} Object containing formatted date and time
 */
export const getCurrentFormattedDateTime = () => {
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
  const formattedTime = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
  
  return {
    formattedDate,
    formattedTime
  };
};

/**
 * Common Mexican identification types
 */
export const identificacionesComunes = [
  "INE / Credencial de elector",
  "Pasaporte",
  "Cédula profesional",
  "Licencia de conducir",
  "Cartilla militar",
  "INAPAM",
  "Credencial de servicio médico",
  "Tarjeta de residencia (extranjeros)"
];

/**
 * Payment methods
 */
export const formasDePago = [
  "Transferencia bancaria",
  "Efectivo",
  "Cheque",
  "Tarjeta de crédito",
  "Tarjeta de débito"
];