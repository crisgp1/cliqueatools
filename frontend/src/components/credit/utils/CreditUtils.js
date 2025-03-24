/**
 * Formatea un valor numérico como moneda en formato MXN
 * @param {number} value - Valor a formatear
 * @returns {string} - Valor formateado como moneda
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
 * Formatea un número con separadores de miles y decimales
 * @param {number} value - Valor a formatear
 * @returns {string} - Valor formateado
 */
export const formatNumber = (value) => {
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formatea un valor como porcentaje
 * @param {number} value - Valor a formatear
 * @returns {string} - Valor formateado como porcentaje
 */
export const formatPercentage = (value) => {
  if (value === "" || value === null || value === undefined || isNaN(value)) {
    return "0.00%";
  }
  return `${Number(value).toFixed(2)}%`;
};

/**
 * Calcula el pago mensual de un crédito
 * @param {number} amount - Monto a financiar
 * @param {number} rate - Tasa de interés anual (porcentaje)
 * @param {number} months - Plazo en meses
 * @returns {number} - Pago mensual calculado
 */
export const calculateMonthlyPayment = (amount, rate, months) => {
  const monthlyRate = rate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, months);
  return (amount * monthlyRate * factor) / (factor - 1);
};

/**
 * Calcula calificaciones para la evaluación del crédito
 * @param {Object} calculationPreview - Datos de cálculo del crédito
 * @param {number} vehiclesValue - Valor de los vehículos
 * @param {number} term - Plazo en meses
 * @param {boolean} useCustomRate - Indicador de uso de tasa personalizada
 * @param {number} customRate - Valor de tasa personalizada
 * @param {boolean} useCustomCat - Indicador de uso de CAT personalizado
 * @param {number} customCat - Valor de CAT personalizado
 * @returns {Object} - Objeto con calificaciones y puntuaciones
 */
export const calculateCreditRatings = (calculationPreview, vehiclesValue, term, useCustomRate, customRate, useCustomCat, customCat) => {
  // Calcular porcentaje del costo adicional
  const totalInterest = calculationPreview.totalInterest;
  const openingFee = calculationPreview.openingCommission;
  const principal = calculationPreview.financingAmount;
  const totalCost = totalInterest + openingFee;
  const costPercentage = (totalCost / principal) * 100;
  
  // Evaluación cualitativa del costo
  let costRating = "";
  if (costPercentage <= 15) {
    costRating = "Bueno";
  } else if (costPercentage <= 25) {
    costRating = "Enorme";
  } else if (costPercentage <= 35) {
    costRating = "Terrible";
  } else {
    costRating = "Feo";
  }
  
  // Evaluación según CAT vs tasa nominal
  const effectiveRate = useCustomRate ? customRate : calculationPreview.bank.tasa;
  const effectiveCat = useCustomCat ? customCat : calculationPreview.bank.cat;
  const catVsRateDiff = effectiveCat - effectiveRate;
  
  let rateRating = "";
  if (catVsRateDiff <= 3) {
    rateRating = "Bueno";
  } else if (catVsRateDiff <= 5) {
    rateRating = "Enorme";
  } else if (catVsRateDiff <= 8) {
    rateRating = "Terrible";
  } else {
    rateRating = "Feo";
  }
  
  // Evaluación según plazo vs depreciación
  const termRating = term <= 36 ? "Bueno" : term <= 48 ? "Enorme" : term <= 60 ? "Terrible" : "Feo";
  
  // Puntuación general del crédito (promedio ponderado de los factores)
  const costScore = Math.max(0, Math.min(100, 100 - (costPercentage * 2)));
  const rateScore = Math.max(0, Math.min(100, 100 - (catVsRateDiff * 10)));
  const termScore = Math.max(0, Math.min(100, 100 - ((term / 60) * 100)));
  
  const overallScore = (costScore * 0.5) + (rateScore * 0.3) + (termScore * 0.2);
  let overallRating = "";
  if (overallScore >= 75) {
    overallRating = "Bueno";
  } else if (overallScore >= 50) {
    overallRating = "Enorme";
  } else if (overallScore >= 25) {
    overallRating = "Terrible";
  } else {
    overallRating = "Feo";
  }
  
  return {
    costRating,
    rateRating,
    termRating,
    overallRating,
    costScore,
    rateScore,
    termScore,
    overallScore,
    costPercentage,
    catVsRateDiff,
    totalCost
  };
};