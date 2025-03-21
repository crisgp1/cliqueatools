import { useState, useEffect } from 'react';
import bbvaLogo from '../assets/bbva.png';
import banorteLogo from '../assets/banorte.png';
import santanderLogo from '../assets/santander.png';
import scotiabankLogo from '../assets/scotiabank.png';
import banamexLogo from '../assets/banamex.png';
import hsbcLogo from '../assets/hsbc.png';
import afirmeLogo from '../assets/afirme.png';

// Lista de bancos mexicanos con sus tasas de interés aproximadas
const BANCOS = [
  { id: 1, nombre: 'BBVA', tasa: 12.5, cat: 16.2, comision: 2, logo: bbvaLogo },
  { id: 2, nombre: 'Banorte', tasa: 13.2, cat: 17.1, comision: 1.8, logo: banorteLogo },
  { id: 3, nombre: 'Santander', tasa: 13.8, cat: 17.5, comision: 2.2, logo: santanderLogo },
  { id: 4, nombre: 'Scotiabank', tasa: 14.2, cat: 18.3, comision: 1.5, logo: scotiabankLogo },
  { id: 5, nombre: 'Citibanamex', tasa: 13.5, cat: 17.8, comision: 2.0, logo: banamexLogo },
  { id: 6, nombre: 'HSBC', tasa: 14.5, cat: 18.9, comision: 1.7, logo: hsbcLogo },
  { id: 7, nombre: 'Inbursa', tasa: 12.8, cat: 16.5, comision: 1.9, logo: '💳' },
  { id: 8, nombre: 'Afirme', tasa: 14.8, cat: 19.2, comision: 2.1, logo: afirmeLogo },
  { id: 9, nombre: 'BanRegio', tasa: 13.9, cat: 18.0, comision: 1.6, logo: '💳' },
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
    <div className="space-y-8">
      <div className="govuk-form-section">
        <h3 className="govuk-form-section-title">Configuración del crédito</h3>
        
        <div className="govuk-form-group">
          <label htmlFor="downPayment" className="govuk-label">
            Enganche (%)
          </label>
          <div className="flex justify-between mb-1">
            <span className="govuk-form-hint">Seleccione el porcentaje de enganche</span>
            <span className="font-bold">{downPaymentPercentage}%</span>
          </div>
          <input
            type="range"
            id="downPayment"
            min="10"
            max="60"
            step="1"
            value={downPaymentPercentage}
            onChange={(e) => setDownPaymentPercentage(Number(e.target.value))}
            className="govuk-slider"
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
          <select
            id="term"
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="govuk-select"
          >
            {PLAZOS.map(p => (
              <option key={p} value={p}>{p} meses</option>
            ))}
          </select>
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
            <div className="relative h-6 w-12">
              <input
                type="checkbox"
                id="useCustomRate"
                checked={useCustomRate}
                onChange={() => setUseCustomRate(!useCustomRate)}
                className="sr-only"
              />
              <div className={`block w-12 h-6 rounded-full transition ${useCustomRate ? 'bg-royal-black' : 'bg-royal-gray-300'}`}></div>
              <div 
                className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${useCustomRate ? 'translate-x-6' : ''}`}>
              </div>
            </div>
          </div>
          
          {useCustomRate && (
            <div className="mt-4">
              <label htmlFor="customRate" className="govuk-label">
                Tasa de interés anual (%)
              </label>
              <div className="flex justify-between mb-1">
                <span className="govuk-form-hint">Ajuste la tasa de interés</span>
                <span className="font-bold">{customRate.toFixed(2)}%</span>
              </div>
              <input
                type="range"
                id="customRate"
                min="5"
                max="25"
                step="0.1"
                value={customRate}
                onChange={(e) => setCustomRate(Number(e.target.value))}
                className="govuk-slider"
              />
              <div className="flex justify-between text-sm text-royal-gray-600 mt-1">
                <span>5%</span>
                <span>25%</span>
              </div>
            </div>
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {BANCOS.map((bank) => (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => setSelectedBankId(bank.id)}
                  className={`p-4 border-2 ${
                    selectedBankId === bank.id 
                      ? 'border-royal-black bg-royal-gray-100' 
                      : 'border-royal-gray-300 hover:border-royal-black/50'
                  } flex flex-col items-center transition-all`}
                >
                  {typeof bank.logo === 'string' && !bank.logo.includes('.') ? (
                    <span className="text-2xl mb-2">{bank.logo}</span>
                  ) : (
                    <img src={bank.logo} alt={bank.nombre} className="h-8 mb-2" />
                  )}
                  <span className="text-base font-bold">{bank.nombre}</span>
                  <span className="text-sm">
                    {useCustomRate ? formatPercentage(customRate) : formatPercentage(bank.tasa)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {calculationPreview && (
        <div className="govuk-form-section">
          <h3 className="govuk-form-section-title">
            <div className="flex items-center">
              {typeof calculationPreview.bank.logo === 'string' && !calculationPreview.bank.logo.includes('.') ? (
                <span className="text-2xl mr-2">{calculationPreview.bank.logo}</span>
              ) : (
                <img src={calculationPreview.bank.logo} alt={calculationPreview.bank.nombre} className="h-8 mr-2" />
              )}
              Vista previa con {calculationPreview.bank.nombre}
              {useCustomRate && (
                <span className="ml-2 text-sm">(Tasa personalizada: {customRate.toFixed(2)}%)</span>
              )}
            </div>
          </h3>
          
          <div className="govuk-grid-row mb-6">
            <div className="govuk-grid-column-one-third">
              <div className="border-2 border-royal-black p-4">
                <div className="text-sm">Pago mensual</div>
                <div className="text-xl font-bold">{formatCurrency(calculationPreview.monthlyPayment)}</div>
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="border-2 border-royal-black p-4">
                <div className="text-sm">Tasa anual</div>
                <div className="text-xl font-bold">{formatPercentage(calculationPreview.bank.tasa)}</div>
              </div>
            </div>
            <div className="govuk-grid-column-one-third">
              <div className="border-2 border-royal-black p-4">
                <div className="text-sm">CAT</div>
                <div className="text-xl font-bold">
                  {useCustomRate 
                    ? `~${formatPercentage(customRate * 1.3)}` // Estimación aproximada del CAT
                    : formatPercentage(calculationPreview.bank.cat)
                  }
                </div>
              </div>
            </div>
          </div>
          
          <div className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Comisión por apertura:</dt>
              <dd className="govuk-summary-list__value">{formatCurrency(calculationPreview.openingCommission)}</dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Monto total a pagar:</dt>
              <dd className="govuk-summary-list__value">{formatCurrency(calculationPreview.totalAmount)}</dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Intereses totales:</dt>
              <dd className="govuk-summary-list__value">{formatCurrency(calculationPreview.totalInterest)}</dd>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          onClick={handleCalculate}
          disabled={vehiclesValue <= 0}
          className={`govuk-button flex items-center ${vehiclesValue <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Calcular todas las opciones
        </button>
      </div>
    </div>
  );
};

export default CreditForm;
