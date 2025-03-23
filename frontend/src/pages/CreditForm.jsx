import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoPlayCircleOutline, 
  IoBusinessOutline,
  IoWalletOutline,
  IoAddCircleOutline,
  IoCheckmarkCircle,
  IoTrashOutline,
  IoInformationCircleOutline,
  IoGitCompareOutline,
  IoAlertCircleOutline,
  IoCloseCircleOutline
} from 'react-icons/io5';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  RadialLinearScale,
  Filler,
  DoughnutController
} from 'chart.js';
import { Bar, Doughnut, Radar, Line } from 'react-chartjs-2';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  RadialLinearScale,
  Filler,
  DoughnutController
);
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
  const [downPaymentPercentage, setDownPaymentPercentage] = useState("");
  const [downPaymentAmount, setDownPaymentAmount] = useState("");
  const [term, setTerm] = useState("");
  // Estado para bancos seleccionados para comparación
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState(null);
  // Estado para errores de validación
  const [validationError, setValidationError] = useState(null);
  
  // Estado para bancos con configuración personalizada
  const [customizedBanks, setCustomizedBanks] = useState({});
  const [calculationPreview, setCalculationPreview] = useState(null);
  
  // Estado para tasa de interés y CAT personalizada
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [customRate, setCustomRate] = useState("");
  const [useCustomCat, setUseCustomCat] = useState(false);
  const [customCat, setCustomCat] = useState("");
  
  // Refs para control de debounce
  const debounceTimerRef = useRef(null);
  const isFirstRenderRef = useRef(true);
  const previousDownPaymentPercentageRef = useRef(downPaymentPercentage);
  const previousVehiclesValueRef = useRef(vehiclesValue);
  const validationDebounceRef = useRef(null);
  
  // Calcular monto a financiar
  const financingAmount = vehiclesValue - (downPaymentAmount || 0);

  // Función memoizada para actualizar el monto de enganche basado en porcentaje
  const updateDownPaymentFromPercentage = useCallback(() => {
    if (vehiclesValue > 0 && typeof downPaymentPercentage === 'number') {
      const newAmount = (vehiclesValue * downPaymentPercentage) / 100;
      setDownPaymentAmount(Math.round(newAmount));
    }
  }, [vehiclesValue, downPaymentPercentage]);

  // Actualizar monto de enganche cuando cambia el porcentaje, con control para evitar ciclos
  useEffect(() => {
    // Omitir el primer renderizado
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousDownPaymentPercentageRef.current = downPaymentPercentage;
      previousVehiclesValueRef.current = vehiclesValue;
      return;
    }

    // Solo actualizar si realmente cambió el porcentaje o el valor del vehículo
    const percentageChanged = previousDownPaymentPercentageRef.current !== downPaymentPercentage;
    const vehicleValueChanged = previousVehiclesValueRef.current !== vehiclesValue;
    
    if ((percentageChanged || vehicleValueChanged) && vehiclesValue > 0) {
      updateDownPaymentFromPercentage();
      previousDownPaymentPercentageRef.current = downPaymentPercentage;
      previousVehiclesValueRef.current = vehiclesValue;
    }
  }, [downPaymentPercentage, vehiclesValue, updateDownPaymentFromPercentage]);

  // Componente de alerta de error
  const ErrorAlert = ({ message, onClose }) => (
    <motion.div 
      className="fixed top-4 right-4 z-50 max-w-md"
      initial={{ opacity: 0, y: -50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.5 }}
      transition={{ type: "spring", damping: 20 }}
    >
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-lg flex items-start">
        <IoAlertCircleOutline className="text-red-500 text-2xl flex-shrink-0 mr-3" />
        <div className="flex-grow">
          <p className="text-red-700 font-medium">{message}</p>
        </div>
        <button 
          onClick={onClose} 
          className="text-red-400 hover:text-red-600 transition-colors ml-2"
        >
          <IoCloseCircleOutline className="text-xl" />
        </button>
      </div>
    </motion.div>
  );

  // Estado para evitar validaciones en loop
  const [validationShown, setValidationShown] = useState(false);
  
  // Estado para evitar revalidaciones frecuentes
  const [lastValidatedValues, setLastValidatedValues] = useState({
    downPaymentAmount: null,
    downPaymentPercentage: null,
    customRate: null,
    customCat: null
  });
  
  // Validar que no haya valores incompatibles (con debouncer)
  const validateCreditConfig = useCallback(() => {
    // Evitar validaciones repetitivas de los mismos valores
    const currentValues = {
      downPaymentAmount,
      downPaymentPercentage,
      customRate,
      customCat
    };
    
    // Verificar si los valores han cambiado desde la última validación
    const valuesChanged = Object.keys(currentValues).some(
      key => currentValues[key] !== lastValidatedValues[key]
    );
    
    if (!valuesChanged && validationError) {
      return; // Evitar revalidar si los valores no cambiaron y ya hay un error
    }
    
    // Limpiar cualquier validación pendiente
    if (validationDebounceRef.current) {
      clearTimeout(validationDebounceRef.current);
    }
    
    // Crear un nuevo timer para la validación con debounce
    validationDebounceRef.current = setTimeout(() => {
      // Actualizar el último conjunto de valores validados
      setLastValidatedValues(currentValues);
      
      // Validar enganche no mayor al 100% del valor del vehículo
      if (downPaymentAmount > vehiclesValue && vehiclesValue > 0) {
        if (!validationShown) {
          setValidationError("El enganche no puede ser superior al valor del vehículo");
          setValidationShown(true);
        }
        return false;
      }
      
      // Validar porcentaje no mayor a 100%
      if (downPaymentPercentage > 100) {
        if (!validationShown) {
          setValidationError("El porcentaje de enganche no puede ser superior a 100%");
          setValidationShown(true);
        }
        return false;
      }
      
      // Validar que no haya valores negativos
      if (downPaymentAmount < 0 || downPaymentPercentage < 0 || vehiclesValue < 0) {
        if (!validationShown) {
          setValidationError("Los valores no pueden ser negativos");
          setValidationShown(true);
        }
        return false;
      }
      
      // Validar tasa de interés
      if (useCustomRate && customRate < 0) {
        if (!validationShown) {
          setValidationError("La tasa de interés no puede ser negativa");
          setValidationShown(true);
        }
        return false;
      }
      
      if (useCustomRate && customRate > 99) {
        if (!validationShown) {
          setValidationError("La tasa de interés no puede ser mayor a 99%");
          setValidationShown(true);
        }
        return false;
      }
      
      // Validar CAT
      if (useCustomCat && customCat < 0) {
        if (!validationShown) {
          setValidationError("El CAT no puede ser negativo");
          setValidationShown(true);
        }
        return false;
      }
      
      if (useCustomCat && customCat > 100) {
        if (!validationShown) {
          setValidationError("El CAT no puede ser mayor a 100%");
          setValidationShown(true);
        }
        return false;
      }
      
      // Si todo está bien, limpiar error y resetear el estado de validación mostrada
      setValidationError(null);
      setValidationShown(false);
      return true;
    }, 800); // 800ms de debounce para evitar mensajes intermitentes
  }, [
    downPaymentAmount, 
    downPaymentPercentage, 
    vehiclesValue, 
    customRate,
    customCat,
    useCustomRate,
    useCustomCat,
    lastValidatedValues,
    validationError,
    validationShown
  ]);

  // Ejecutar validación cuando cambien los valores relevantes
  useEffect(() => {
    // Ejecutar la validación de forma debounced
    validateCreditConfig();
    
    // Cleanup para cancelar el timer si el componente se desmonta
    return () => {
      if (validationDebounceRef.current) {
        clearTimeout(validationDebounceRef.current);
      }
    };
  }, [
    validateCreditConfig,
    downPaymentAmount,
    downPaymentPercentage,
    customRate,
    customCat
  ]);

  // Controlador para cambio de porcentaje desde el slider o input numérico
  const handleDownPaymentPercentageChange = useCallback((value) => {
    // Asegurarnos de que el valor es un número válido
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setDownPaymentPercentage(numValue);
      // La validación se hará a través de validateCreditConfig
    }
  }, []);

  // Función para actualizar el porcentaje basado en el monto del enganche
  const handleDownPaymentAmountChange = useCallback((value) => {
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
      // La validación se hará a través de validateCreditConfig
      
      // Limpiar cualquier debounce timer existente
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Crear un nuevo timer para actualizar el porcentaje después de una pausa
      debounceTimerRef.current = setTimeout(() => {
        // Calculamos el nuevo porcentaje solo si tenemos un valor válido
        if (vehiclesValue > 0) {
          const newPercentage = Math.min(100, Math.max(0, (newAmount * 100) / vehiclesValue));
          // Usar una función de actualización para garantizar el valor más reciente
          setDownPaymentPercentage(prev => {
            const rounded = Math.round(newPercentage);
            // Evitar actualizaciones innecesarias que pueden causar ciclos
            return prev === rounded ? prev : rounded;
          });
        }
      }, 500); // 500ms de debounce
    }
  }, [vehiclesValue]);
  
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
  
  // Formatear número con separadores de miles y centavos
  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Formatear porcentaje
  const formatPercentage = (value) => {
    if (value === "" || value === null || value === undefined || isNaN(value)) {
      return "0.00%";
    }
    return `${Number(value).toFixed(2)}%`;
  };

  // Calcular pago mensual
  const calculateMonthlyPayment = (amount, rate, months) => {
    const monthlyRate = rate / 100 / 12;
    const factor = Math.pow(1 + monthlyRate, months);
    return (amount * monthlyRate * factor) / (factor - 1);
  };

  // Calcular vista previa de resultados - optimizado para evitar ciclos
  const calculatePreviewRef = useRef(null);
  
  useEffect(() => {
    // Si ya hay un cálculo pendiente, cancelarlo
    if (calculatePreviewRef.current) {
      clearTimeout(calculatePreviewRef.current);
    }
    
    // Programar el cálculo para evitar múltiples actualizaciones rápidas
    calculatePreviewRef.current = setTimeout(() => {
      if (selectedBankId && vehiclesValue > 0) {
        const selectedBank = BANCOS.find(bank => bank.id === selectedBankId);
        if (selectedBank) {
          // Usar tasa personalizada si está habilitada, de lo contrario usar la tasa del banco
          const effectiveRate = useCustomRate ? customRate : selectedBank.tasa;
          
          const payment = calculateMonthlyPayment(financingAmount, effectiveRate, term);
          const totalAmount = payment * term;
          const totalInterest = totalAmount - financingAmount;
          const openingCommission = (financingAmount * selectedBank.comision) / 100;
          
          setCalculationPreview(prev => {
            // Comprobación para evitar actualización si no hay cambios reales
            if (prev && 
                prev.bank.id === selectedBank.id && 
                prev.monthlyPayment === payment && 
                prev.totalAmount === totalAmount &&
                prev.totalInterest === totalInterest &&
                prev.openingCommission === openingCommission &&
                prev.financingAmount === financingAmount) {
              return prev;
            }
            
            return {
              bank: {
                ...selectedBank,
                tasa: effectiveRate, // Usar la tasa efectiva
              },
              monthlyPayment: payment,
              totalAmount,
              totalInterest,
              openingCommission,
              financingAmount
            };
          });
        }
      } else {
        setCalculationPreview(null);
      }
      
      calculatePreviewRef.current = null;
    }, 100);
    
    // Cleanup para cancelar el timer si el componente se desmonta
    return () => {
      if (calculatePreviewRef.current) {
        clearTimeout(calculatePreviewRef.current);
      }
    };
  }, [selectedBankId, downPaymentAmount, term, vehiclesValue, useCustomRate, customRate, financingAmount]);

  // Función para manejar la selección/deselección de bancos para comparación
  const toggleBankSelection = (bankId) => {
    if (selectedBanks.includes(bankId)) {
      setSelectedBanks(selectedBanks.filter(id => id !== bankId));
      
      // Si el banco personalizado ya no está seleccionado, eliminar su configuración personalizada
      if (customizedBanks[bankId]) {
        const updatedCustomizations = {...customizedBanks};
        delete updatedCustomizations[bankId];
        setCustomizedBanks(updatedCustomizations);
      }
    } else {
      // Limitar a máximo 5 bancos para comparación
      if (selectedBanks.length < 5) {
        setSelectedBanks([...selectedBanks, bankId]);
      } else {
        // Opcional: mostrar mensaje de que solo se pueden seleccionar 5 bancos
        alert('Puedes seleccionar hasta 5 bancos para comparar.');
      }
    }
  };
  
  // Guardar configuración personalizada para un banco específico
  const saveCustomBankConfig = (bankId) => {
    setCustomizedBanks({
      ...customizedBanks,
      [bankId]: {
        downPaymentPercentage,
        downPaymentAmount,
        term,
        financingAmount,
        useCustomRate,
        customRate,
        useCustomCat,
        customCat
      }
    });
  };
  
  // Notificar cambios en la configuración - con debounce para evitar actualizaciones excesivas
  const notifyChangesRef = useRef(null);
  
  useEffect(() => {
    // Evitar el primer renderizado
    if (isFirstRenderRef.current) {
      return;
    }
    
    // Si ya hay una notificación pendiente, cancelarla
    if (notifyChangesRef.current) {
      clearTimeout(notifyChangesRef.current);
    }
    
    // Programar la notificación con un debounce
    notifyChangesRef.current = setTimeout(() => {
      onCreditConfigChange({
        downPaymentPercentage,
        downPaymentAmount,
        term,
        selectedBankId,
        selectedBanks,
        financingAmount,
        useCustomRate,
        customRate,
        useCustomCat,
        customCat,
        customizedBanks
      });
      
      notifyChangesRef.current = null;
    }, 300);
    
    // Cleanup para cancelar el timer si el componente se desmonta
    return () => {
      if (notifyChangesRef.current) {
        clearTimeout(notifyChangesRef.current);
      }
    };
  }, [
    downPaymentPercentage, 
    term, 
    selectedBankId, 
    selectedBanks,
    downPaymentAmount, 
    useCustomRate, 
    customRate, 
    useCustomCat, 
    customCat, 
    customizedBanks, 
    onCreditConfigChange,
    financingAmount
  ]);

  // Calcular resultados para todos los bancos o solo los seleccionados
  const handleCalculate = () => {
    // Si hay bancos seleccionados para comparación, usar solo esos
    const banksToCalculate = selectedBanks.length > 0 
      ? BANCOS.filter(bank => selectedBanks.includes(bank.id))
      : BANCOS;
      
    const results = banksToCalculate.map(bank => {
      // Verificar si este banco tiene configuración personalizada
      const bankConfig = customizedBanks[bank.id];
      
      // Usar configuración personalizada del banco específico o la configuración general
      const configToUse = bankConfig || {
        downPaymentPercentage,
        downPaymentAmount,
        term,
        financingAmount,
        useCustomRate,
        customRate,
        useCustomCat,
        customCat
      };
      
      // Determinar la tasa efectiva para este banco
      const effectiveRate = configToUse.useCustomRate ? configToUse.customRate : bank.tasa;
      
      // Calcular los valores con la configuración apropiada
      const payment = calculateMonthlyPayment(configToUse.financingAmount, effectiveRate, configToUse.term);
      const totalAmount = payment * configToUse.term;
      const totalInterest = totalAmount - configToUse.financingAmount;
      const openingCommission = (configToUse.financingAmount * bank.comision) / 100;
      
      // Determinar el CAT a usar
      const effectiveCat = configToUse.useCustomCat 
        ? configToUse.customCat 
        : configToUse.useCustomRate 
          ? effectiveRate * 1.3 // Estimación aproximada
          : bank.cat;
      
      return {
        ...bank,
        tasa: effectiveRate, // Usar la tasa efectiva
        cat: effectiveCat, // Usar el CAT efectivo
        monthlyPayment: payment,
        totalAmount,
        totalInterest,
        openingCommission,
        financingAmount: configToUse.financingAmount,
        term: configToUse.term,
        downPaymentAmount: configToUse.downPaymentAmount,
        downPaymentPercentage: configToUse.downPaymentPercentage,
        // Identificar si este banco tiene configuración personalizada
        hasCustomConfig: !!bankConfig
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
          <label className="govuk-label">
            Distribución del financiamiento
          </label>
          <div className="flex justify-between mb-1">
            <span className="govuk-form-hint">Ajuste el porcentaje de enganche (0% - 100%)</span>
            <div className="flex items-center">
              <motion.input
                type="number"
               
                step="1"
                value={downPaymentPercentage}
                onChange={(e) => handleDownPaymentPercentageChange(e.target.value)}
                className={`w-16 h-8 border ${validationError ? 'border-red-500 bg-red-50' : 'border-royal-gray-300'} rounded text-center mr-1`}
                whileTap={{ scale: 1.05 }}
              />
              <span className="font-bold">%</span>
            </div>
          </div>
          
          {/* Panel informativo del vehículo */}
          <div className="mt-3 mb-4 bg-gray-50 border-2 border-gray-300 rounded-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-base font-bold text-gray-800">Vehículo cotizado</h4>
              <div className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm">
                {formatCurrency(vehiclesValue)}
              </div>
            </div>

            {/* Mensaje de error de validación */}
            <AnimatePresence>
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 bg-red-50 border border-red-200 rounded-md p-3"
                >
                  <div className="flex items-center text-red-700">
                    <IoAlertCircleOutline className="h-5 w-5 mr-2" />
                    <p className="text-sm">{validationError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Reemplazo de barra visual con gráfico de donut */}
            <div className="w-full h-20 mb-2">
              <Doughnut 
                data={{
                  labels: ['Enganche', 'A financiar'],
                  datasets: [
                    {
                      data: [downPaymentPercentage, 100 - downPaymentPercentage],
                      backgroundColor: validationError 
                        ? [
                            'rgba(239, 68, 68, 0.8)',  // Rojo para indicar error
                            'rgba(239, 68, 68, 0.5)'
                          ]
                        : [
                            'rgba(99, 102, 241, 0.8)',
                            'rgba(20, 184, 166, 0.8)'
                          ],
                      borderColor: validationError 
                        ? [
                            'rgba(220, 38, 38, 1)',
                            'rgba(220, 38, 38, 0.7)'
                          ]
                        : [
                            'rgba(79, 70, 229, 1)',
                            'rgba(13, 148, 136, 1)'
                          ],
                      borderWidth: 1,
                      cutout: '65%',
                      hoverOffset: 5
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  layout: {
                    padding: 5
                  },
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom',
                      labels: {
                        generateLabels: (chart) => {
                          const data = chart.data;
                          if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label, i) => {
                              const value = data.datasets[0].data[i];
                              return {
                                text: `${label}: ${value}%`,
                                fillStyle: data.datasets[0].backgroundColor[i],
                                strokeStyle: data.datasets[0].borderColor[i],
                                lineWidth: 1,
                                hidden: false,
                                index: i
                              };
                            });
                          }
                          return [];
                        }
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.formattedValue || '';
                          return `${label}: ${value}%`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-royal-gray-600 mt-2">
              <div className="flex flex-col">
                <span className="font-medium text-indigo-600">Enganche</span>
                <span>{formatCurrency(downPaymentAmount)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-medium text-teal-600">Monto a financiar</span>
                <span>{formatCurrency(financingAmount)}</span>
              </div>
            </div>

            {/* Progresión del valor reemplazada con un gráfico de barras horizontales */}
            <div className="mt-4 border-t border-gray-300 pt-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Distribución del valor</span>
                <span className="text-sm font-bold">{formatCurrency(vehiclesValue)}</span>
              </div>
              <div className="w-full h-14">
                <Bar
                  data={{
                    labels: ['Distribución'],
                    datasets: [
                      {
                        label: 'Pago inicial',
                        data: [downPaymentAmount],
                        backgroundColor: validationError 
                          ? 'rgba(239, 68, 68, 0.8)' 
                          : 'rgba(79, 70, 229, 0.8)',
                        borderColor: validationError 
                          ? 'rgba(220, 38, 38, 1)' 
                          : 'rgba(67, 56, 202, 1)',
                        borderWidth: 1,
                        barPercentage: 0.9,
                        categoryPercentage: 0.9
                      },
                      {
                        label: 'A financiar',
                        data: [financingAmount],
                        backgroundColor: validationError 
                          ? 'rgba(239, 68, 68, 0.5)' 
                          : 'rgba(20, 184, 166, 0.8)',
                        borderColor: validationError 
                          ? 'rgba(220, 38, 38, 0.7)' 
                          : 'rgba(13, 148, 136, 1)',
                        borderWidth: 1,
                        barPercentage: 0.9,
                        categoryPercentage: 0.9
                      }
                    ]
                  }}
                  options={{
                    indexAxis: 'y',
                    scales: {
                      x: {
                        stacked: true,
                        grid: {
                          display: false
                        },
                        ticks: {
                          display: false
                        }
                      },
                      y: {
                        stacked: true,
                        grid: {
                          display: false
                        },
                        ticks: {
                          display: false
                        }
                      }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            const percentage = context.dataset.label === 'Pago inicial' 
                              ? ((downPaymentAmount / vehiclesValue) * 100).toFixed(1) 
                              : ((financingAmount / vehiclesValue) * 100).toFixed(1);
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Pago inicial: {formatCurrency(downPaymentAmount)}</span>
                <span>A financiar: {formatCurrency(financingAmount)}</span>
              </div>
            </div>
          </div>
          <div className="govuk-summary-list mt-3">
            <div className="govuk-summary-list__row flex items-center justify-between">
              <dt className="govuk-summary-list__key mr-2">Monto de enganche:</dt>
              <dd className="govuk-summary-list__value flex items-center">
                <span className="mr-2">$</span>
                <div className="flex flex-col">
                  <motion.input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder=""
                    value={typeof downPaymentAmount === 'number' ? downPaymentAmount.toString() : downPaymentAmount}
                    onChange={(e) => handleDownPaymentAmountChange(e.target.value)}
                    onBlur={() => {
                      // Si el campo está vacío al perder el foco, restaurar al valor calculado del porcentaje
                      if (downPaymentAmount === '' || downPaymentAmount === null) {
                        setDownPaymentAmount(Math.round((vehiclesValue * downPaymentPercentage) / 100));
                      }
                    }}
                    className={`w-32 h-8 border ${validationError ? 'border-red-500 bg-red-50' : 'border-royal-gray-300'} rounded text-center font-bold`}
                    whileTap={{ scale: 1.05 }}
                  />
                  {typeof downPaymentAmount === 'number' && (
                    <div className="text-xs text-royal-gray-600 mt-1 text-center w-32">
                      {formatNumber(downPaymentAmount)}
                    </div>
                  )}
                </div>
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
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setCustomRate(value);
                          // La validación se hará a través de validateCreditConfig
                        }}
                    className={`w-16 h-8 border ${validationError ? 'border-red-500 bg-red-50' : 'border-royal-gray-300'} rounded text-center mr-1`}
                    whileTap={{ scale: 1.05 }}
                  />
                  <span className="font-bold">%</span>
                </div>
              </div>
                  {/* Barra visual de tasa de interés reemplazada con gráfico de línea */}
                  <div className="w-full h-12 my-3">
                    <Line 
                      data={{
                        labels: ['5%', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '25%'],
                        datasets: [
                          {
                            label: 'Tasa de interés',
                            data: Array(20).fill(null).map((_, i) => i === Math.floor((customRate - 5) / 20 * 19) ? customRate : null),
                            borderColor: 'rgba(217, 119, 6, 1)',
                            backgroundColor: 'rgba(245, 158, 11, 0.8)',
                            pointBackgroundColor: 'rgba(217, 119, 6, 1)',
                            pointBorderColor: '#fff',
                            pointRadius: 6,
                            pointHoverRadius: 8,
                            tension: 0.1,
                            fill: false
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            grid: {
                              display: false
                            },
                            ticks: {
                              maxRotation: 0,
                              autoSkip: true,
                              maxTicksLimit: 2,
                              font: {
                                size: 10
                              }
                            }
                          },
                          y: {
                            display: false,
                            min: 0,
                            max: 30
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `Tasa: ${context.raw}%`;
                              }
                            }
                          }
                        }
                      }}
                    />
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
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setCustomCat(value);
                          // La validación se hará a través de validateCreditConfig
                        }}
                        className={`w-16 h-8 border ${validationError ? 'border-red-500 bg-red-50' : 'border-royal-gray-300'} rounded text-center mr-1`}
                        whileTap={{ scale: 1.05 }}
                      />
                      <span className="font-bold">%</span>
                    </div>
                  </div>
                  {/* Barra visual de CAT reemplazada con gráfico de línea */}
                  <div className="w-full h-12 my-3">
                    <Line 
                      data={{
                        labels: ['6%', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '30%'],
                        datasets: [
                          {
                            label: 'CAT',
                            data: Array(20).fill(null).map((_, i) => i === Math.floor((customCat - 6) / 24 * 19) ? customCat : null),
                            borderColor: 'rgba(220, 38, 38, 1)',
                            backgroundColor: 'rgba(248, 113, 113, 0.8)',
                            pointBackgroundColor: 'rgba(220, 38, 38, 1)',
                            pointBorderColor: '#fff',
                            pointRadius: 6,
                            pointHoverRadius: 8,
                            tension: 0.1,
                            fill: false
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            grid: {
                              display: false
                            },
                            ticks: {
                              maxRotation: 0,
                              autoSkip: true,
                              maxTicksLimit: 2,
                              font: {
                                size: 10
                              }
                            }
                          },
                          y: {
                            display: false,
                            min: 0,
                            max: 35
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `CAT: ${context.raw}%`;
                              }
                            }
                          }
                        }
                      }}
                    />
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
          <div className="govuk-form-group mb-8">
            <div className="flex justify-between items-center mb-4">
              <label className="govuk-label mb-0">
                Selecciona bancos para comparar
              </label>
              <div className="text-sm text-royal-gray-600">
                <span className="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                  {selectedBanks.length} seleccionados
                </span>
              </div>
            </div>
            
            <div className="border-2 border-gray-300 rounded-md p-4 bg-gray-50 mb-4">
              <div className="flex items-center text-sm text-royal-gray-600 mb-4">
                <IoInformationCircleOutline className="h-5 w-5 mr-2 text-blue-600" />
                <p>Selecciona hasta 5 bancos para comparar sus ofertas. Puedes personalizar la configuración del crédito para cada banco.</p>
              </div>
              
              {selectedBanks.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                    <IoGitCompareOutline className="h-5 w-5 mr-1" />
                    Bancos seleccionados para comparación
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBanks.map(bankId => {
                      const bank = BANCOS.find(b => b.id === bankId);
                      const hasCustomConfig = !!customizedBanks[bankId];
                      
                      return (
                        <div 
                          key={`selected-${bankId}`} 
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                            hasCustomConfig ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {bank.nombre}
                          {hasCustomConfig && (
                            <span className="ml-1 text-xs">(Personalizado)</span>
                          )}
                          <button 
                            onClick={() => toggleBankSelection(bankId)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <IoTrashOutline className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {BANCOS.map((bank) => {
                const isSelected = selectedBankId === bank.id;
                const isCompared = selectedBanks.includes(bank.id);
                const hasCustomConfig = !!customizedBanks[bank.id];
                
                return (
                  <motion.div
                    key={bank.id}
                    className={`p-4 border-2 ${
                      isSelected 
                        ? 'border-royal-black bg-royal-gray-100' 
                        : isCompared
                          ? hasCustomConfig 
                            ? 'border-green-500 bg-green-50'
                            : 'border-blue-500 bg-blue-50'
                          : 'border-royal-gray-300 hover:border-royal-black/50'
                    } rounded transition-all`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex flex-col items-center">
                      {React.isValidElement(bank.logo) ? (
                        <div className="mb-2 text-royal-black">{bank.logo}</div>
                      ) : (
                        <img src={bank.logo} alt={bank.nombre} className="h-8 mb-2" />
                      )}
                      <span className="text-base font-bold">{bank.nombre}</span>
                      <div className="mt-1 flex flex-wrap justify-center gap-1">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                          {useCustomRate && hasCustomConfig 
                            ? formatPercentage(customizedBanks[bank.id].customRate) 
                            : useCustomRate 
                              ? formatPercentage(customRate) 
                              : formatPercentage(bank.tasa)
                          }
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                          CAT: {
                            useCustomCat && hasCustomConfig 
                              ? formatPercentage(customizedBanks[bank.id].customCat)
                              : useCustomCat 
                                ? formatPercentage(customCat)
                                : useCustomRate && hasCustomConfig
                                  ? `~${formatPercentage(customizedBanks[bank.id].customRate * 1.3)}`
                                  : useCustomRate
                                    ? `~${formatPercentage(customRate * 1.3)}`
                                    : formatPercentage(bank.cat)
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-3 gap-2">
                      <motion.button
                        type="button"
                        onClick={() => setSelectedBankId(bank.id)}
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          isSelected 
                            ? 'bg-royal-black text-white' 
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        }`}
                        whileTap={{ scale: 0.97 }}
                      >
                        {isSelected ? 'Seleccionado' : 'Vista previa'}
                      </motion.button>
                      
                      <motion.button
                        type="button"
                        onClick={() => toggleBankSelection(bank.id)}
                        className={`px-2 py-1 text-xs font-medium rounded flex items-center ${
                          isCompared 
                            ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                        whileTap={{ scale: 0.97 }}
                      >
                        {isCompared ? (
                          <>
                            <IoTrashOutline className="h-3 w-3 mr-1" />
                            Quitar
                          </>
                        ) : (
                          <>
                            <IoAddCircleOutline className="h-3 w-3 mr-1" />
                            Comparar
                          </>
                        )}
                      </motion.button>
                    </div>
                    
                    {isCompared && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <motion.button
                          type="button"
                          onClick={() => saveCustomBankConfig(bank.id)}
                          className={`w-full px-2 py-1 text-xs font-medium rounded flex items-center justify-center ${
                            hasCustomConfig 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                          whileTap={{ scale: 0.97 }}
                        >
                          {hasCustomConfig ? (
                            <>
                              <IoCheckmarkCircle className="h-3 w-3 mr-1" />
                              Configuración guardada
                            </>
                          ) : (
                            <>
                              <IoAddCircleOutline className="h-3 w-3 mr-1" />
                              Guardar configuración actual
                            </>
                          )}
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
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
          {/* Gráfica progresiva de valor del vehículo vs valor total pagado */}
          <div className="mb-6 border-2 border-gray-300 rounded-md p-4 bg-gray-50">
            <h4 className="govuk-form-section-subtitle mb-3 flex justify-between">
              <span>Comparativa de costos del vehículo</span>
              <span className="text-sm font-bold bg-gray-700 text-white px-3 py-1 rounded-full">
                {formatCurrency(vehiclesValue)}
              </span>
            </h4>
            
            <div className="flex flex-col space-y-6">
              {/* Comparación del valor del vehículo vs costo total - Reemplazo con gráfico de barras */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Costo total vs. Valor del vehículo</span>
                  <span className="text-sm font-medium text-indigo-600">
                    +{((calculationPreview.totalAmount - vehiclesValue) / vehiclesValue * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-40">
                  <Bar
                    data={{
                      labels: ['Valor del vehículo', 'Total a pagar'],
                      datasets: [
                        {
                          label: 'Vehículo',
                          data: [vehiclesValue, vehiclesValue],
                          backgroundColor: 'rgba(59, 130, 246, 0.7)',
                          borderColor: 'rgba(37, 99, 235, 1)',
                          borderWidth: 1
                        },
                        {
                          label: 'Intereses y comisiones',
                          data: [0, calculationPreview.totalAmount - vehiclesValue],
                          backgroundColor: 'rgba(147, 51, 234, 0.7)',
                          borderColor: 'rgba(126, 34, 206, 1)',
                          borderWidth: 1
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          grid: {
                            display: false
                          }
                        },
                        y: {
                          beginAtZero: true,
                          grid: {
                            borderDash: [2, 4]
                          },
                          ticks: {
                            callback: function(value) {
                              return formatCurrency(value);
                            }
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'bottom'
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.dataset.label || '';
                              const value = context.raw;
                              const percentage = (value / calculationPreview.totalAmount * 100).toFixed(1);
                              return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              {/* Evaluación cualitativa del crédito */}
              <div className="border-t border-gray-300 pt-4 mt-4">
                <div className="text-sm font-medium mb-3">Evaluación del crédito</div>
                
                {/* Cálculo de métricas y evaluaciones cualitativas */}
                {(() => {
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
                  
                  return (
                    <div className="space-y-6">
                      {/* Gráfico de radar para evaluación general */}
                      <div className="h-64">
                        <Radar
                          data={{
                            labels: ['Costo Total', 'CAT vs Tasa', 'Plazo', 'Calificación General'],
                            datasets: [
                              {
                                label: 'Puntuación (Mayor es mejor)',
                                data: [costScore, rateScore, termScore, overallScore],
                                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                                borderColor: 'rgba(79, 70, 229, 1)',
                                borderWidth: 2,
                                pointBackgroundColor: [
                                  costRating === 'Bueno' ? 'rgba(16, 185, 129, 1)' : 
                                  costRating === 'Enorme' ? 'rgba(245, 158, 11, 1)' : 
                                  costRating === 'Terrible' ? 'rgba(249, 115, 22, 1)' : 'rgba(239, 68, 68, 1)',
                                  
                                  rateRating === 'Bueno' ? 'rgba(16, 185, 129, 1)' : 
                                  rateRating === 'Enorme' ? 'rgba(245, 158, 11, 1)' : 
                                  rateRating === 'Terrible' ? 'rgba(249, 115, 22, 1)' : 'rgba(239, 68, 68, 1)',
                                  
                                  termRating === 'Bueno' ? 'rgba(16, 185, 129, 1)' : 
                                  termRating === 'Enorme' ? 'rgba(245, 158, 11, 1)' : 
                                  termRating === 'Terrible' ? 'rgba(249, 115, 22, 1)' : 'rgba(239, 68, 68, 1)',
                                  
                                  overallRating === 'Bueno' ? 'rgba(16, 185, 129, 1)' : 
                                  overallRating === 'Enorme' ? 'rgba(245, 158, 11, 1)' : 
                                  overallRating === 'Terrible' ? 'rgba(249, 115, 22, 1)' : 'rgba(239, 68, 68, 1)'
                                ],
                                pointBorderColor: '#fff',
                                pointHoverBackgroundColor: '#fff',
                                pointHoverBorderColor: 'rgba(79, 70, 229, 1)',
                                pointRadius: 5,
                                pointHoverRadius: 7
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              r: {
                                min: 0,
                                max: 100,
                                ticks: {
                                  display: false
                                },
                                pointLabels: {
                                  font: {
                                    size: 12,
                                    weight: 'bold'
                                  }
                                }
                              }
                            },
                            plugins: {
                              legend: {
                                display: false
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context) {
                                    const index = context.dataIndex;
                                    const value = context.raw;
                                    const labels = ['Costo Total', 'CAT vs Tasa', 'Plazo', 'Calificación General'];
                                    const ratings = [costRating, rateRating, termRating, overallRating];
                                    return `${labels[index]}: ${value.toFixed(1)}/100 (${ratings[index]})`;
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </div>
                      
                      {/* Calificaciones resumidas en tarjetas */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {/* Calificación general */}
                        <div className={`p-3 rounded-lg ${
                          overallRating === 'Bueno' ? 'bg-emerald-50 border border-emerald-200' :
                          overallRating === 'Enorme' ? 'bg-amber-50 border border-amber-200' :
                          overallRating === 'Terrible' ? 'bg-orange-50 border border-orange-200' :
                          'bg-red-50 border border-red-200'
                        }`}>
                          <div className="text-xs uppercase font-medium mb-1 text-gray-500">Calificación General</div>
                          <div className={`text-lg font-bold ${
                            overallRating === 'Bueno' ? 'text-emerald-600' :
                            overallRating === 'Enorme' ? 'text-amber-600' :
                            overallRating === 'Terrible' ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {overallRating}
                          </div>
                          <div className="text-xs mt-1 text-gray-600">
                            Coste: {costPercentage.toFixed(1)}% adicional
                          </div>
                        </div>
                        
                        {/* Desglose de los factores */}
                        <div className={`p-3 rounded-lg ${
                          costRating === 'Bueno' ? 'bg-emerald-50 border border-emerald-200' :
                          costRating === 'Enorme' ? 'bg-amber-50 border border-amber-200' :
                          costRating === 'Terrible' ? 'bg-orange-50 border border-orange-200' :
                          'bg-red-50 border border-red-200'
                        }`}>
                          <div className="text-xs uppercase font-medium mb-1 text-gray-500">Costo Total</div>
                          <div className={`text-lg font-bold ${
                            costRating === 'Bueno' ? 'text-emerald-600' :
                            costRating === 'Enorme' ? 'text-amber-600' :
                            costRating === 'Terrible' ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {costRating}
                          </div>
                          <div className="text-xs mt-1 text-gray-600">
                            {formatCurrency(totalCost)}
                          </div>
                        </div>
                        
                        <div className={`p-3 rounded-lg ${
                          rateRating === 'Bueno' ? 'bg-emerald-50 border border-emerald-200' :
                          rateRating === 'Enorme' ? 'bg-amber-50 border border-amber-200' :
                          rateRating === 'Terrible' ? 'bg-orange-50 border border-orange-200' :
                          'bg-red-50 border border-red-200'
                        }`}>
                          <div className="text-xs uppercase font-medium mb-1 text-gray-500">CAT vs Tasa</div>
                          <div className={`text-lg font-bold ${
                            rateRating === 'Bueno' ? 'text-emerald-600' :
                            rateRating === 'Enorme' ? 'text-amber-600' :
                            rateRating === 'Terrible' ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {rateRating}
                          </div>
                          <div className="text-xs mt-1 text-gray-600">
                            Diferencia: {formatPercentage(catVsRateDiff)}
                          </div>
                        </div>
                        
                        <div className={`p-3 rounded-lg ${
                          termRating === 'Bueno' ? 'bg-emerald-50 border border-emerald-200' :
                          termRating === 'Enorme' ? 'bg-amber-50 border border-amber-200' :
                          termRating === 'Terrible' ? 'bg-orange-50 border border-orange-200' :
                          'bg-red-50 border border-red-200'
                        }`}>
                          <div className="text-xs uppercase font-medium mb-1 text-gray-500">Plazo</div>
                          <div className={`text-lg font-bold ${
                            termRating === 'Bueno' ? 'text-emerald-600' :
                            termRating === 'Enorme' ? 'text-amber-600' :
                            termRating === 'Terrible' ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {termRating}
                          </div>
                          <div className="text-xs mt-1 text-gray-600">
                            {term} meses
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                {/* Desglose detallado */}
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Desglose de pagos</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-100 p-2 rounded">
                      <div className="text-xs text-blue-800">Valor del vehículo</div>
                      <div className="font-bold text-blue-600">{formatCurrency(vehiclesValue)}</div>
                    </div>
                    <div className="bg-purple-100 p-2 rounded">
                      <div className="text-xs text-purple-800">Intereses</div>
                      <div className="font-bold text-purple-600">{formatCurrency(calculationPreview.totalInterest)}</div>
                    </div>
                    <div className="bg-amber-100 p-2 rounded">
                      <div className="text-xs text-amber-800">Comisión</div>
                      <div className="font-bold text-amber-600">{formatCurrency(calculationPreview.openingCommission)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h3 className="govuk-form-section-title">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {React.isValidElement(calculationPreview.bank.logo) ? (
                  <div className="mr-2 text-royal-black">{calculationPreview.bank.logo}</div>
                ) : (
                  <img src={calculationPreview.bank.logo} alt={calculationPreview.bank.nombre} className="h-8 mr-2" />
                )}
                Vista previa con {calculationPreview.bank.nombre}
                {useCustomRate && (
                  <span className="ml-2 text-sm">
                    (Tasa personalizada: {(customRate === "" || isNaN(customRate)) ? "0.00" : Number(customRate).toFixed(2)}%)
                  </span>
                )}
              </div>
              
              {/* Calificación de costo en forma de distintivo */}
              {(() => {
                // Calcular costo adicional porcentual
                const totalCost = calculationPreview.totalInterest + calculationPreview.openingCommission;
                const costPercentage = (totalCost / calculationPreview.financingAmount) * 100;
                
                // Determinar calificación
                let costRating = "";
                let bgColor = "";
                let textColor = "";
                
                if (costPercentage <= 15) {
                  costRating = "Bueno";
                  bgColor = "bg-emerald-100";
                  textColor = "text-emerald-800";
                } else if (costPercentage <= 25) {
                  costRating = "Enorme";
                  bgColor = "bg-amber-100";
                  textColor = "text-amber-800";
                } else if (costPercentage <= 35) {
                  costRating = "Terrible";
                  bgColor = "bg-orange-100";
                  textColor = "text-orange-800";
                } else {
                  costRating = "Feo";
                  bgColor = "bg-red-100";
                  textColor = "text-red-800";
                }
                
                return (
                  <div className={`px-3 py-1 rounded-full ${bgColor} ${textColor} text-sm font-bold`}>
                    Costo: {costRating} ({costPercentage.toFixed(1)}%)
                  </div>
                );
              })()}
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
      
          {/* Alerta flotante para errores graves */}
          <AnimatePresence>
            {validationError && (
              <ErrorAlert 
                message={validationError} 
                onClose={() => {
                  setValidationError(null);
                  setValidationShown(false);
                }} 
              />
            )}
          </AnimatePresence>
      
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          {selectedBanks.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm p-4 bg-blue-50 border border-blue-200 rounded-md"
            >
              <p className="font-medium text-blue-800">
                {selectedBanks.length} banco{selectedBanks.length !== 1 ? 's' : ''} seleccionado{selectedBanks.length !== 1 ? 's' : ''} para comparación
              </p>
            </motion.div>
          )}
        </div>
        <div className="flex gap-2">
          {selectedBanks.length > 0 && (
              <motion.button
                onClick={handleCalculate}
                disabled={validationError !== null}
                className={`govuk-button-secondary flex items-center ${validationError !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={validationError === null ? { scale: 1.03 } : {}}
                whileTap={validationError === null ? { scale: 0.97 } : {}}
              >
                <IoGitCompareOutline className="h-5 w-5 mr-2" />
                Comparar seleccionados
              </motion.button>
          )}
          <motion.button
            onClick={handleCalculate}
            disabled={vehiclesValue <= 0 || validationError !== null}
            className={`govuk-button flex items-center ${vehiclesValue <= 0 || validationError !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={vehiclesValue > 0 && validationError === null ? { scale: 1.05 } : {}}
            whileTap={vehiclesValue > 0 && validationError === null ? { scale: 0.95 } : {}}
          >
            <IoPlayCircleOutline className="h-5 w-5 mr-2" />
            Calcular todas las opciones
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CreditForm;