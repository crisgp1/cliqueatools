/**
 * Utilidades para componentes de vehículos
 */

/**
 * Formatea un valor numérico como moneda MXN
 * @param {number} value - Valor a formatear
 * @returns {string} - Valor formateado como moneda
 */
export const formatCurrency = (value) => {
  if (value === undefined || value === null || value === '') return '';
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Valida que los campos requeridos del vehículo estén completos
 * @param {Object} vehicle - Datos del vehículo a validar
 * @returns {boolean} - True si el vehículo es válido
 */
export const validateVehicle = (vehicle) => {
  if (!vehicle) return false;
  
  // Validar campos obligatorios
  if (!vehicle.marca || !vehicle.modelo || !vehicle.valor) {
    return false;
  }
  
  // Validar que el valor sea un número positivo
  if (isNaN(vehicle.valor) || vehicle.valor <= 0) {
    return false;
  }
  
  // Validar que el año sea un número positivo
  if (isNaN(vehicle.año) || vehicle.año <= 0) {
    return false;
  }
  
  return true;
};

/**
 * Obtiene el valor total de una lista de vehículos
 * @param {Array} vehicles - Lista de vehículos
 * @returns {number} - Valor total
 */
export const calculateTotalValue = (vehicles) => {
  if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
    return 0;
  }
  
  return vehicles.reduce((total, vehicle) => total + (Number(vehicle.valor) || 0), 0);
};

/**
 * Devuelve el año actual
 * @returns {number} - Año actual
 */
export const getCurrentYear = () => {
  return new Date().getFullYear();
};

/**
 * Devuelve una lista de años para seleccionar en formularios
 * @param {number} startYear - Año inicial (opcional, por defecto 1990)
 * @returns {Array} - Lista de años (números)
 */
export const getYearsList = (startYear = 1990) => {
  const currentYear = getCurrentYear();
  const years = [];
  
  for (let year = currentYear + 1; year >= startYear; year--) {
    years.push(year);
  }
  
  return years;
};

/**
 * Crea un nuevo objeto vehículo vacío
 * @returns {Object} - Objeto vehículo vacío
 */
export const createEmptyVehicle = () => {
  return {
    marca: '',
    modelo: '',
    año: getCurrentYear(),
    valor: '',
    descripcion: '',
    color: '',
    tipo: '',
    numero_motor: '',
    numero_serie: '',
    placas: '',
    numero_circulacion: '',
    numero_factura: '',
    refrendos: ''
  };
};