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
  
  // Validar campos obligatorios básicos
  if (!vehicle.marca || !vehicle.modelo || !vehicle.valor) {
    console.error('Falta marca, modelo o valor');
    return false;
  }
  
  // Validar que el valor sea un número positivo
  if (isNaN(vehicle.valor) || vehicle.valor <= 0) {
    console.error('Valor no es un número positivo');
    return false;
  }
  
  // Validar que el año sea un número positivo
  if (isNaN(vehicle.año) || vehicle.año <= 0) {
    console.error('Año no es un número positivo');
    return false;
  }
  
  // Validar campos adicionales requeridos
  if (!vehicle.color) {
    console.error('Falta color');
    return false;
  }
  
  if (!vehicle.tipo) {
    console.error('Falta tipo');
    return false;
  }
  
  if (!vehicle.numero_serie) {
    console.error('Falta número de serie');
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
 * Crea un nuevo objeto vehículo vacío con valores predeterminados para campos requeridos
 * @returns {Object} - Objeto vehículo con valores predeterminados
 */
export const createEmptyVehicle = () => {
  return {
    marca: '',
    modelo: '',
    año: getCurrentYear(),
    valor: 0,
    descripcion: '',
    color: '',
    tipo: 'automovil',  // Valor predeterminado para tipo_vehiculo
    numero_motor: '',
    numero_serie: '',
    vin: null,  // Añadimos el campo vin con valor null para evitar errores de validación
    placas: '',
    numero_circulacion: '',
    numero_factura: '',
    refrendos: '',
    // Campos adicionales con valores predeterminados para el backend
    transmision: 'manual',
    combustible: 'gasolina',
    odometro: 0,
    condicion: 'usado',
    origen: 'nacional',
    adquisicion: 'compra_directa',
    estatus_legal: 'limpio',
    disponible: true
  };
};