import React, { useState, useEffect, useRef } from 'react';
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
  const [downPaymentAmount, setDownPaymentAmount] = useState(() => (vehiclesValue * 20) / 100);
  const [term, setTerm] = useState(36);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [calculationPreview, setCalculationPreview] = useState(null);
  
  // Estado para tasa de interés y CAT personalizada
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [customRate, setCustomRate] = useState(12.0);
  const [useCustomCat, setUseCustomCat] = useState(false);
  const [customCat, setCustomCat] = useState(15.6);
  
  // Estado para controlar la actualización del enganche
  const [isUpdatingFromPercentage, setIsUpdatingFromPercentage] = useState(false);
  const debounceTimerRef = useRef(null);
  
  // Calcular monto a financiar
  const financingAmount = vehiclesValue - downPaymentAmount;

  // Actualizar monto de enganche cuando cambia el porcentaje
  useEffect(() => {
    if (vehiclesValue > 0 && isUpdatingFromPercentage) {
      setDownPaymentAmount((vehiclesValue * downPaymentPercentage) / 100);
      setIsUpdatingFromPercentage(false);
    }
  }, [downPaymentPercentage, vehiclesValue, isUpdatingFromPercentage]);

  // Controlador para cambio de porcentaje desde el slider o input numérico
  const handleDownPaymentPercentageChange = (value) => {
    setIsUpdatingFromPercentage(true);
    setDownPaymentPercentage(Number(value));
  };

  // Función para actualizar el porcentaje basado en el monto del enganche
  const handleDownPaymentAmountChange = (value) => {
    // Permitir que el usuario borre el campo completamente
    if (value === '' || value === null) {
      setDownPaymentAmount('');
      return;
    }
    
    // Remover cualquier caracter no numérico excepto dígitos
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    
    // Si no hay valor después de sanitizar, dejarlo vacío
    if (!sanitizedValue) {
      setDownPaymentAmount('');
      return;
    }
    
    // Convertir a número entero (sin decimales)
    const newAmount = parseInt(sanitizedValue, 10);
    
    // Verificar si es un número válido
    if (!isNaN(newAmount)) {
      setDownPaymentAmount(newAmount);
      
      // Limpiar cualquier debounce timer existente
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Crear un nuevo timer para actualizar el porcentaje después de una pausa
      debounceTimerRef.current = setTimeout(() => {
        // Calculamos el nuevo porcentaje solo si tenemos un valor válido
        if (vehiclesValue > 0) {
          const newPercentage = Math.min(60, Math.max(10, (newAmount * 100) / vehiclesValue));
          setDownPaymentPercentage(Math.round(newPercentage));
        }
      }, 500); // 500ms de debounce
    }
  };
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
      customRate,
      useCustomCat,
      customCat
    });
  }, [downPaymentPercentage, term, selectedBankId, downPaymentAmount, useCustomRate, customRate, useCustomCat, customCat, onCreditConfigChange]);

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
            <div className="flex items-center">
              <motion.input
                type="number"
                min="10"
                max="60"
                step="1"
                value={downPaymentPercentage}
                onChange={(e) => handleDownPaymentPercentageChange(e.target.value)}
                className="w-16 h-8 border border-royal-gray-300 rounded text-center mr-1"
                whileTap={{ scale: 1.05 }}
              />
              <span className="font-bold">%</span>
            </div>
          </div>
          <motion.input
            type="range"
            id="downPayment"
            min="10"
            max="60"
            step="1"
            value={downPaymentPercentage}
            onChange={(e) => handleDownPaymentPercentageChange(e.target.value)}
            className="govuk-slider"
            whileTap={{ scale: 1.05 }}
          />
          <div className="flex justify-between text-sm text-royal-gray-600 mt-1">
            <span>10%</span>
            <span>60%</span>
          </div>
          <div className="govuk-summary-list mt-3">
            <div className="govuk-summary-list__row flex items-center justify-between">
              <dt className="govuk-summary-list__key mr-2">Monto de enganche:</dt>
              <dd className="govuk-summary-list__value flex items-center">
                <span className="mr-2">$</span>
                <motion.input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  value={typeof downPaymentAmount === 'number' ? downPaymentAmount.toString() : downPaymentAmount}
                  onChange={(e) => handleDownPaymentAmountChange(e.target.value)}
                  onBlur={() => {
                    // Si el campo está vacío al perder el foco, restaurar al valor calculado del porcentaje
                    if (downPaymentAmount === '' || downPaymentAmount === null) {
                      setDownPaymentAmount(Math.round((vehiclesValue * downPaymentPercentage) / 100));
                    }
                  }}
                  className="w-32 h-8 border border-royal-gray-300 rounded text-center font-bold"
                  whileTap={{ scale: 1.05 }}
                />
              </dd>
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
                <div className="flex items-center">
                  <motion.input
                    type="number"
                    min="5"
                    max="25"
                    step="0.1"
                    value={customRate}
                    onChange={(e) => setCustomRate(Number(e.target.value))}
                    className="w-16 h-8 border border-royal-gray-300 rounded text-center mr-1"
                    whileTap={{ scale: 1.05 }}
                  />
                  <span className="font-bold">%</span>
                </div>
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

              {/* CAT personalizado */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <label htmlFor="useCustomCat" className="govuk-label mb-0">
                    Ajustar CAT manualmente
                  </label>
                  <motion.div 
                    className="relative h-6 w-12 cursor-pointer"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setUseCustomCat(!useCustomCat)}
                  >
                    <input
                      type="checkbox"
                      id="useCustomCat"
                      checked={useCustomCat}
                      onChange={() => setUseCustomCat(!useCustomCat)}
                      className="sr-only"
                    />
                    <div className={`block w-12 h-6 rounded-full transition ${useCustomCat ? 'bg-royal-black' : 'bg-royal-gray-300'}`}></div>
                    <motion.div 
                      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full`}
                      animate={{ 
                        x: useCustomCat ? 24 : 0 
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              {useCustomCat && (
                <motion.div 
                  className="mt-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label htmlFor="customCat" className="govuk-label">
                    CAT (%)
                  </label>
                  <div className="flex justify-between mb-1">
                    <span className="govuk-form-hint">Ajuste el CAT</span>
                    <div className="flex items-center">
                      <motion.input
                        type="number"
                        min="6"
                        max="30"
                        step="0.1"
                        value={customCat}
                        onChange={(e) => setCustomCat(Number(e.target.value))}
                        className="w-16 h-8 border border-royal-gray-300 rounded text-center mr-1"
                        whileTap={{ scale: 1.05 }}
                      />
                      <span className="font-bold">%</span>
                    </div>
                  </div>
                  <motion.input
                    type="range"
                    id="customCat"
                    min="6"
                    max="30"
                    step="0.1"
                    value={customCat}
                    onChange={(e) => setCustomCat(Number(e.target.value))}
                    className="govuk-slider"
                    whileTap={{ scale: 1.05 }}
                  />
                  <div className="flex justify-between text-sm text-royal-gray-600 mt-1">
                    <span>6%</span>
                    <span>30%</span>
                  </div>
                </motion.div>
              )}
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
                {useCustomCat 
                  ? formatPercentage(customCat)
                  : useCustomRate 
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