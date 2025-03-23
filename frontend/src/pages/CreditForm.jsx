import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  IoPlayCircleOutline, 
  IoBusinessOutline,
  IoWalletOutline
} from 'react-icons/io5';
import bbvaLogo from '../assets/bbva.png';
import banorteLogo from '../assets/banorte.png';
import santanderLogo from '../assets/santander.png';
import scotiabankLogo from '../assets/scotiabank.png';
import banamexLogo from '../assets/banamex.png';
import hsbcLogo from '../assets/hsbc.png';
import afirmeLogo from '../assets/afirme.png';
import heyBancoLogo from '../assets/heybanco.svg';

// Lista de bancos mexicanos con sus tasas de interés aproximadas
const BANCOS = [
  { id: 1, nombre: 'BBVA', tasa: 12.5, cat: 16.2, comision: 2, logo: bbvaLogo },
  { id: 2, nombre: 'Banorte', tasa: 13.2, cat: 17.1, comision: 1.8, logo: banorteLogo },
  { id: 3, nombre: 'Santander', tasa: 13.8, cat: 17.5, comision: 2.2, logo: santanderLogo },
  { id: 4, nombre: 'Scotiabank', tasa: 14.2, cat: 18.3, comision: 1.5, logo: scotiabankLogo },
  { id: 5, nombre: 'Citibanamex', tasa: 13.5, cat: 17.8, comision: 2.0, logo: banamexLogo },
  { id: 6, nombre: 'HSBC', tasa: 14.5, cat: 18.9, comision: 1.7, logo: hsbcLogo },
  { id: 7, nombre: 'Inbursa', tasa: 12.8, cat: 16.5, comision: 1.9, logo: <IoBusinessOutline className="h-8 w-8" /> },
  { id: 8, nombre: 'Afirme', tasa: 14.8, cat: 19.2, comision: 2.1, logo: afirmeLogo },
  { id: 9, nombre: 'BanRegio', tasa: 13.9, cat: 18.0, comision: 1.6, logo: <IoBusinessOutline className="h-8 w-8" /> },
  { id: 10, nombre: 'Hey Banco', tasa: 12.9, cat: 16.8, comision: 1.8, logo: heyBancoLogo },
];

// Plazos disponibles para el crédito en meses
const PLAZOS = [12, 24, 36, 48, 60];
const CreditForm = ({ vehiclesValue, onCreditConfigChange, onCalculateResults }) => {
  // Estado para los datos del formulario
  const [downPaymentPercentage, setDownPaymentPercentage] = useState(20);
  const [term, setTerm] = useState(36);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [calculationPreview, setCalculationPreview] = useState(null);
  
  // Estado para tasa de interés personalizada
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [customRate, setCustomRate] = useState(12.0);
  
  // Calcular valor del enganche y monto a financiar
  const downPaymentAmount = (vehiclesValue * downPaymentPercentage) / 100;
  const financingAmount = vehiclesValue - downPaymentAmount;
  // Animaciones
  const formAnimation = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const sectionAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    }
  };

  const previewAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    }
  };
  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Formatear porcentaje
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  // Calcular pago mensual
  const calculateMonthlyPayment = (amount, rate, months) => {
    const monthlyRate = rate / 100 / 12;
    const factor = Math.pow(1 + monthlyRate, months);
    return (amount * monthlyRate * factor) / (factor - 1);
  };

  // Calcular vista previa de resultados
  useEffect(() => {
    if (selectedBankId && vehiclesValue > 0) {
      const selectedBank = BANCOS.find(bank => bank.id === selectedBankId);
      if (selectedBank) {
        // Usar tasa personalizada si está habilitada, de lo contrario usar la tasa del banco
        const effectiveRate = useCustomRate ? customRate : selectedBank.tasa;
        
        const payment = calculateMonthlyPayment(financingAmount, effectiveRate, term);
        const totalAmount = payment * term;
        const totalInterest = totalAmount - financingAmount;
        const openingCommission = (financingAmount * selectedBank.comision) / 100;
        
        setCalculationPreview({
          bank: {
            ...selectedBank,
            tasa: effectiveRate, // Usar la tasa efectiva
          },
          monthlyPayment: payment,
          totalAmount,
          totalInterest,
          openingCommission,
          financingAmount
        });
      }
    } else {
      setCalculationPreview(null);
    }
  }, [selectedBankId, downPaymentPercentage, term, vehiclesValue, useCustomRate, customRate]);

  // Notificar cambios en la configuración
  useEffect(() => {
    onCreditConfigChange({
      downPaymentPercentage,
      downPaymentAmount,
      term,
      selectedBankId,
      financingAmount,
      useCustomRate,
      customRate
    });
  }, [downPaymentPercentage, term, selectedBankId, downPaymentAmount, useCustomRate, customRate, onCreditConfigChange]);

  // Calcular resultados para todos los bancos
  const handleCalculate = () => {
    const results = BANCOS.map(bank => {
      // Usar tasa personalizada si está habilitada, de lo contrario usar la tasa del banco
      const effectiveRate = useCustomRate ? customRate : bank.tasa;
      
      const payment = calculateMonthlyPayment(financingAmount, effectiveRate, term);
      const totalAmount = payment * term;
      const totalInterest = totalAmount - financingAmount;
      const openingCommission = (financingAmount * bank.comision) / 100;
      
      return {
        ...bank,
        tasa: effectiveRate, // Usar la tasa efectiva
        monthlyPayment: payment,
        totalAmount,
        totalInterest,
        openingCommission,
        financingAmount
      };
    }).sort((a, b) => a.monthlyPayment - b.monthlyPayment);
    
    onCalculateResults(results);
  };

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={formAnimation}
    >
      <motion.div 
        className="govuk-form-section"
        variants={sectionAnimation}
      >
        <h3 className="govuk-form-section-title">Configuración del crédito</h3>
        
        <div className="govuk-form-group">
          <label htmlFor="downPayment" className="govuk-label">
            Enganche (%)
          </label>
          <div className="flex justify-between mb-1">
            <span className="govuk-form-hint">Seleccione el porcentaje de enganche</span>
            <span className="font-bold">{downPaymentPercentage}%</span>
          </div>
          <motion.input
            type="range"
            id="downPayment"
            min="10"
            max="60"
            step="1"
            value={downPaymentPercentage}
            onChange={(e) => setDownPaymentPercentage(Number(e.target.value))}
            className="govuk-slider"
            whileTap={{ scale: 1.05 }}
          />
          <div className="flex justify-between text-sm text-royal-gray-600 mt-1">
            <span>10%</span>
            <span>60%</span>
          </div>
          <div className="govuk-summary-list mt-3">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Monto de enganche:</dt>
              <dd className="govuk-summary-list__value font-bold">{formatCurrency(downPaymentAmount)}</dd>
            </div>
          </div>
        </div>
        
        <div className="govuk-form-group">
          <label htmlFor="term" className="govuk-label">
            Plazo (meses)
          </label>
          <motion.select
            id="term"
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="govuk-select"
            whileTap={{ scale: 1.02 }}
          >
            {PLAZOS.map(p => (
              <option key={p} value={p}>{p} meses</option>
            ))}
          </motion.select>
          <div className="govuk-summary-list mt-3">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Monto a financiar:</dt>
              <dd className="govuk-summary-list__value font-bold">{formatCurrency(financingAmount)}</dd>
            </div>
          </div>
        </div>
        
        {/* Configuración de tasa de interés personalizada */}
        <div className="govuk-form-group">
          <div className="flex items-center justify-between">
            <label htmlFor="useCustomRate" className="govuk-label mb-0">
              Usar tasa de interés personalizada
            </label>
            <motion.div 
              className="relative h-6 w-12 cursor-pointer"
              whileTap={{ scale: 0.95 }}
              onClick={() => setUseCustomRate(!useCustomRate)}
            >
              <input
                type="checkbox"
                id="useCustomRate"
                checked={useCustomRate}
                onChange={() => setUseCustomRate(!useCustomRate)}
                className="sr-only"
              />
              <div className={`block w-12 h-6 rounded-full transition ${useCustomRate ? 'bg-royal-black' : 'bg-royal-gray-300'}`}></div>
              <motion.div 
                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full`}
                animate={{ 
                  x: useCustomRate ? 24 : 0 
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
              </motion.div>
            </motion.div>
          </div>
          
          {useCustomRate && (
            <motion.div 
              className="mt-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label htmlFor="customRate" className="govuk-label">
                Tasa de interés anual (%)
              </label>
              <div className="flex justify-between mb-1">
                <span className="govuk-form-hint">Ajuste la tasa de interés</span>
                <span className="font-bold">{customRate.toFixed(2)}%</span>
              </div>
              <motion.input
                type="range"
                id="customRate"
                min="5"
                max="25"
                step="0.1"
                value={customRate}
                onChange={(e) => setCustomRate(Number(e.target.value))}
                className="govuk-slider"
                whileTap={{ scale: 1.05 }}
              />
              <div className="flex justify-between text-sm text-royal-gray-600 mt-1">
                <span>5%</span>
                <span>25%</span>
              </div>
            </motion.div>
          )}
        </div>
        
        {vehiclesValue <= 0 ? (
          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon">!</span>
            <strong className="govuk-warning-text__text">
              Primero debes agregar vehículos para configurar el crédito.
            </strong>
          </div>
        ) : (
          <div className="govuk-form-group">
            <label className="govuk-label mb-4">
              Selecciona un banco para vista previa (opcional)
            </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {BANCOS.map((bank) => (
                <motion.button
                  key={bank.id}
                  type="button"
                  onClick={() => setSelectedBankId(bank.id)}
                  className={`p-4 border-2 ${
                    selectedBankId === bank.id 
                      ? 'border-royal-black bg-royal-gray-100' 
                      : 'border-royal-gray-300 hover:border-royal-black/50'
                  } flex flex-col items-center transition-all`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {React.isValidElement(bank.logo) ? (
                    <div className="mb-2 text-royal-black">{bank.logo}</div>
                  ) : (
                    <img src={bank.logo} alt={bank.nombre} className="h-8 mb-2" />
                  )}
                  <span className="text-base font-bold">{bank.nombre}</span>
                  <span className="text-sm">
                    {useCustomRate ? formatPercentage(customRate) : formatPercentage(bank.tasa)}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
      
      {calculationPreview && (
        <motion.div 
          className="govuk-form-section"
          variants={previewAnimation}
          initial="hidden"
          animate="visible"
        >
          <h3 className="govuk-form-section-title">
            <div className="flex items-center">
              {React.isValidElement(calculationPreview.bank.logo) ? (
                <div className="mr-2 text-royal-black">{calculationPreview.bank.logo}</div>
              ) : (
                <img src={calculationPreview.bank.logo} alt={calculationPreview.bank.nombre} className="h-8 mr-2" />
              )}
              Vista previa con {calculationPreview.bank.nombre}
              {useCustomRate && (
                <span className="ml-2 text-sm">(Tasa personalizada: {customRate.toFixed(2)}%)</span>
              )}
            </div>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <motion.div 
              className="border-2 border-royal-black p-4"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="text-sm">Pago mensual</div>
              <div className="text-xl font-bold">{formatCurrency(calculationPreview.monthlyPayment)}</div>
            </motion.div>
            
            <motion.div 
              className="border-2 border-royal-black p-4"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="text-sm">Tasa anual</div>
              <div className="text-xl font-bold">{formatPercentage(calculationPreview.bank.tasa)}</div>
            </motion.div>
            
            <motion.div 
              className="border-2 border-royal-black p-4"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="text-sm">CAT</div>
              <div className="text-xl font-bold">
                {useCustomRate 
                  ? `~${formatPercentage(customRate * 1.3)}` // Estimación aproximada del CAT
                  : formatPercentage(calculationPreview.bank.cat)
                }
              </div>
            </motion.div>
          </div>
          
          <div className="govuk-summary-list space-y-3 sm:space-y-0">
            <div className="govuk-summary-list__row flex flex-col sm:flex-row sm:items-center">
              <dt className="govuk-summary-list__key text-base sm:text-sm sm:w-1/2">Comisión por apertura:</dt>
              <dd className="govuk-summary-list__value text-base sm:text-sm font-medium sm:font-normal">{formatCurrency(calculationPreview.openingCommission)}</dd>
            </div>
            <div className="govuk-summary-list__row flex flex-col sm:flex-row sm:items-center">
              <dt className="govuk-summary-list__key text-base sm:text-sm sm:w-1/2">Monto total a pagar:</dt>
              <dd className="govuk-summary-list__value text-base sm:text-sm font-medium sm:font-normal">{formatCurrency(calculationPreview.totalAmount)}</dd>
            </div>
            <div className="govuk-summary-list__row flex flex-col sm:flex-row sm:items-center">
              <dt className="govuk-summary-list__key text-base sm:text-sm sm:w-1/2">Intereses totales:</dt>
              <dd className="govuk-summary-list__value text-base sm:text-sm font-medium sm:font-normal">{formatCurrency(calculationPreview.totalInterest)}</dd>
            </div>
          </div>
        </motion.div>
      )}
      
      <div className="flex justify-end">
        <motion.button
          onClick={handleCalculate}
          disabled={vehiclesValue <= 0}
          className={`govuk-button flex items-center ${vehiclesValue <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <IoPlayCircleOutline className="h-5 w-5 mr-2" />
          Calcular todas las opciones
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CreditForm;
