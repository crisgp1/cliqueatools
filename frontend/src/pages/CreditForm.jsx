import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

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

// Importación de componentes modulares
import ErrorAlert from '../components/credit/ErrorAlert';
import VehicleSelectionPanel from '../components/credit/VehicleSelectionPanel';
import DownPaymentConfig from '../components/credit/DownPaymentConfig';
import TermSelector from '../components/credit/TermSelector';
import CustomRateConfig from '../components/credit/CustomRateConfig';
import BankSelectionGrid from '../components/credit/BankSelectionGrid';
import CreditPreview from '../components/credit/CreditPreview';
import ActionButtons from '../components/credit/ActionButtons';
import CreditTimeline from '../components/credit/CreditTimeline';

// Importación de utilidades y constantes
import { calculateMonthlyPayment } from '../components/credit/utils/CreditUtils';

const CreditForm = ({ vehiclesValue, vehicles = [], onCreditConfigChange, onCalculateResults }) => {
  // Estado para controlar el paso actual del formulario
  const [currentStep, setCurrentStep] = useState(1);
  
  // Estado para los datos del formulario
  const [downPaymentPercentage, setDownPaymentPercentage] = useState("");
  const [downPaymentAmount, setDownPaymentAmount] = useState("");
  const [term, setTerm] = useState("");
  // Estado para vehículos seleccionados
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  // Estado para bancos seleccionados para comparación
  const [selectedBanks, setSelectedBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState(null);
  // Estado para errores de validación
  const [validationError, setValidationError] = useState(null);
  // Estado para indicar si un paso es válido
  const [stepValidation, setStepValidation] = useState({
    1: false, // Vehículo
    2: false, // Enganche
    3: false, // Plazo
    4: false  // Bancos
  });
  // Valor total de los vehículos seleccionados
  const selectedVehiclesValue = selectedVehicles.reduce((sum, vehicle) => sum + vehicle.valor, 0);
  // Usar el valor de los vehículos seleccionados si hay alguno, de lo contrario usar el valor total
  const effectiveVehiclesValue = selectedVehicles.length > 0 ? selectedVehiclesValue : vehiclesValue;
  
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
  const financingAmount = effectiveVehiclesValue - (downPaymentAmount || 0);

  // Función memoizada para actualizar el monto de enganche basado en porcentaje
  const updateDownPaymentFromPercentage = useCallback(() => {
    if (effectiveVehiclesValue > 0 && typeof downPaymentPercentage === 'number') {
      const newAmount = (effectiveVehiclesValue * downPaymentPercentage) / 100;
      setDownPaymentAmount(Math.round(newAmount));
    }
  }, [effectiveVehiclesValue, downPaymentPercentage]);

  // Actualizar monto de enganche cuando cambia el porcentaje, con control para evitar ciclos
  useEffect(() => {
    // Omitir el primer renderizado
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousDownPaymentPercentageRef.current = downPaymentPercentage;
      previousVehiclesValueRef.current = effectiveVehiclesValue;
      return;
    }

    // Solo actualizar si realmente cambió el porcentaje o el valor del vehículo
    const percentageChanged = previousDownPaymentPercentageRef.current !== downPaymentPercentage;
    const vehicleValueChanged = previousVehiclesValueRef.current !== effectiveVehiclesValue;
    
    if ((percentageChanged || vehicleValueChanged) && effectiveVehiclesValue > 0) {
      updateDownPaymentFromPercentage();
      previousDownPaymentPercentageRef.current = downPaymentPercentage;
      previousVehiclesValueRef.current = effectiveVehiclesValue;
    }
  }, [downPaymentPercentage, effectiveVehiclesValue, updateDownPaymentFromPercentage]);

  // Estado para evitar validaciones en loop
  const [validationShown, setValidationShown] = useState(false);
  
  // Estado para evitar revalidaciones frecuentes
  const [lastValidatedValues, setLastValidatedValues] = useState({
    downPaymentAmount: null,
    downPaymentPercentage: null,
    customRate: null,
    customCat: null
  });
  
  // Manejar la selección/deselección de vehículos
  const toggleVehicleSelection = (vehicle) => {
    const isSelected = selectedVehicles.some(v => v.id === vehicle.id);
    
    if (isSelected) {
      // Quitar el vehículo de la selección
      setSelectedVehicles(selectedVehicles.filter(v => v.id !== vehicle.id));
    } else {
      // Agregar el vehículo a la selección
      setSelectedVehicles([...selectedVehicles, vehicle]);
    }
  };
  
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
      if (downPaymentAmount > effectiveVehiclesValue && effectiveVehiclesValue > 0) {
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
    validationShown,
    effectiveVehiclesValue
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
        if (effectiveVehiclesValue > 0) {
          const newPercentage = Math.min(100, Math.max(0, (newAmount * 100) / effectiveVehiclesValue));
          // Usar una función de actualización para garantizar el valor más reciente
          setDownPaymentPercentage(prev => {
            const rounded = Math.round(newPercentage);
            // Evitar actualizaciones innecesarias que pueden causar ciclos
            return prev === rounded ? prev : rounded;
          });
        }
      }, 500); // 500ms de debounce
    }
  }, [effectiveVehiclesValue]);
  
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
        // Importación dinámica para evitar referencia circular
        import('../components/credit/constants/BankData').then(({ BANCOS }) => {
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
        });
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
    // Importación dinámica para evitar referencia circular
    import('../components/credit/constants/BankData').then(({ BANCOS }) => {
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
    });
  };

  // Manejadores de eventos para el componente CustomRateConfig
  const handleToggleCustomRate = () => setUseCustomRate(!useCustomRate);
  const handleCustomRateChange = (value) => setCustomRate(value);
  const handleToggleCustomCat = () => setUseCustomCat(!useCustomCat);
  const handleCustomCatChange = (value) => setCustomCat(value);

  // Validar el paso actual y actualizar el estado de validación
  const validateCurrentStep = useCallback(() => {
    switch(currentStep) {
      case 1: // Vehículo
        const isStep1Valid = selectedVehicles.length > 0;
        setStepValidation(prev => ({ ...prev, 1: isStep1Valid }));
        return isStep1Valid;
      
      case 2: // Enganche
        const isStep2Valid = downPaymentAmount !== "" && downPaymentPercentage !== "" && 
                            downPaymentAmount >= 0 && downPaymentPercentage >= 0 && 
                            downPaymentPercentage <= 100 && downPaymentAmount <= effectiveVehiclesValue;
        setStepValidation(prev => ({ ...prev, 2: isStep2Valid }));
        return isStep2Valid;
      
      case 3: // Plazo
        const isStep3Valid = term !== "";
        setStepValidation(prev => ({ ...prev, 3: isStep3Valid }));
        return isStep3Valid;
      
      case 4: // Bancos
        const isStep4Valid = selectedBankId !== null;
        setStepValidation(prev => ({ ...prev, 4: isStep4Valid }));
        return isStep4Valid;
      
      default:
        return true;
    }
  }, [currentStep, selectedVehicles.length, downPaymentAmount, downPaymentPercentage, effectiveVehiclesValue, term, selectedBankId]);

  // Validar el paso actual cuando cambian los valores relevantes
  useEffect(() => {
    validateCurrentStep();
  }, [validateCurrentStep, selectedVehicles, downPaymentAmount, downPaymentPercentage, term, selectedBankId]);

  // Efecto para calcular automáticamente al llegar al paso 5 (Comparación)
  useEffect(() => {
    if (currentStep === 5) {
      handleCalculate();
    }
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Avanzar al siguiente paso
  const handleNextStep = () => {
    const isCurrentStepValid = validateCurrentStep();
    
    if (isCurrentStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    } else {
      // Mostrar mensaje de error si el paso actual no es válido
      if (currentStep === 1 && selectedVehicles.length === 0) {
        setValidationError("Debes seleccionar al menos un vehículo para continuar");
      } else if (currentStep === 2) {
        if (downPaymentAmount === "" || downPaymentPercentage === "") {
          setValidationError("Debes configurar el enganche para continuar");
        } else if (downPaymentAmount > effectiveVehiclesValue) {
          setValidationError("El enganche no puede ser superior al valor del vehículo");
        } else if (downPaymentPercentage > 100) {
          setValidationError("El porcentaje de enganche no puede ser superior a 100%");
        }
      } else if (currentStep === 3 && term === "") {
        setValidationError("Debes seleccionar un plazo para continuar");
      } else if (currentStep === 4 && selectedBankId === null) {
        setValidationError("Debes seleccionar un banco para continuar");
      }
    }
  };

  // Retroceder al paso anterior
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    // Limpiar mensajes de error al retroceder
    setValidationError(null);
    setValidationShown(false);
  };

  // Función para renderizar el contenido según el paso actual
  const renderStepContent = () => {
    switch(currentStep) {
      case 1: // Vehículo
        return (
          <VehicleSelectionPanel
            vehicles={vehicles}
            selectedVehicles={selectedVehicles}
            onVehicleToggle={toggleVehicleSelection}
            effectiveVehiclesValue={effectiveVehiclesValue}
          />
        );
      
      case 2: // Enganche
        return (
          <DownPaymentConfig
            downPaymentPercentage={downPaymentPercentage}
            downPaymentAmount={downPaymentAmount}
            effectiveVehiclesValue={effectiveVehiclesValue}
            financingAmount={financingAmount}
            validationError={validationError}
            onPercentageChange={handleDownPaymentPercentageChange}
            onAmountChange={handleDownPaymentAmountChange}
          />
        );
      
      case 3: // Plazo
        return (
          <TermSelector
            term={term}
            financingAmount={financingAmount}
            onTermChange={setTerm}
          />
        );
      
      case 4: // Bancos
        return (
          <>
            <CustomRateConfig
              useCustomRate={useCustomRate}
              customRate={customRate}
              useCustomCat={useCustomCat}
              customCat={customCat}
              validationError={validationError}
              onToggleCustomRate={handleToggleCustomRate}
              onCustomRateChange={handleCustomRateChange}
              onToggleCustomCat={handleToggleCustomCat}
              onCustomCatChange={handleCustomCatChange}
            />
            
            <BankSelectionGrid
              selectedBankId={selectedBankId}
              selectedBanks={selectedBanks}
              customizedBanks={customizedBanks}
              useCustomRate={useCustomRate}
              customRate={customRate}
              useCustomCat={useCustomCat}
              customCat={customCat}
              onSelectBank={setSelectedBankId}
              onToggleBankSelection={toggleBankSelection}
              onSaveCustomConfig={saveCustomBankConfig}
              effectiveVehiclesValue={effectiveVehiclesValue}
            />
          </>
        );
      
      case 5: // Comparación
        return (
          <CreditPreview
            calculationPreview={calculationPreview}
            vehiclesValue={vehiclesValue}
            term={term}
            useCustomRate={useCustomRate}
            customRate={customRate}
            useCustomCat={useCustomCat}
            customCat={customCat}
          />
        );
      
      default:
        return null;
    }
  };

  // Obtener el título según el paso actual
  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return "Selección de Vehículos";
      case 2: return "Configuración de Enganche";
      case 3: return "Selección de Plazo";
      case 4: return "Selección de Bancos";
      case 5: return "Comparación de Opciones";
      case 6: return "Tabla de Amortización";
      default: return "Configuración del crédito";
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={formAnimation}
    >
      {/* Breadcrumb de línea de tiempo del proceso */}
      <CreditTimeline currentStep={currentStep} />
      
      <motion.div 
        className="govuk-form-section"
        variants={sectionAnimation}
        key={`step-${currentStep}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <h3 className="govuk-form-section-title">{getStepTitle()}</h3>
        
        {/* Contenido dinámico según el paso actual */}
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </motion.div>
      
      {/* Componente de alerta de error */}
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
      
      {/* Navegación y botones de acción */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex gap-2">
          {currentStep > 1 && (
            <motion.button
              onClick={handlePrevStep}
              className="govuk-button-secondary flex items-center"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </motion.button>
          )}
          
          {currentStep < 5 && (
            <motion.button
              onClick={handleNextStep}
              className={`govuk-button flex items-center ${stepValidation[currentStep] ? '' : 'opacity-70'}`}
              whileHover={stepValidation[currentStep] ? { scale: 1.03 } : {}}
              whileTap={stepValidation[currentStep] ? { scale: 0.97 } : {}}
            >
              Siguiente
              <FaArrowRight className="h-4 w-4 ml-2" />
            </motion.button>
          )}
        </div>
        
        {currentStep === 5 && (
          <ActionButtons
            selectedBanks={selectedBanks}
            effectiveVehiclesValue={effectiveVehiclesValue}
            validationError={validationError}
            onCalculate={handleCalculate}
          />
        )}
      </div>
    </motion.div>
  );
};

export default CreditForm;