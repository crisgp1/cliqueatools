import { useState } from 'react';

const BankComparison = ({ results, onSelectBank }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'monthlyPayment', direction: 'ascending' });
  
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
  
  // Ordenar resultados
  const sortedResults = [...results].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
  
  // Configurar ordenamiento
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Obtener clases para encabezado ordenable
  const getSortButtonClass = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' 
        ? 'text-royal-black' 
        : 'text-royal-black rotate-180';
    }
    return 'text-royal-gray-400';
  };
  
  return (
    <div className="govuk-form-section">
      <h3 className="govuk-form-section-title">
        Comparativa de opciones de financiamiento
      </h3>
      <p className="govuk-form-hint mb-4">
        Encuentra la mejor opción entre {results.length} bancos. Haz clic en los encabezados para ordenar la tabla.
      </p>
      
      <div className="overflow-x-auto">
        <table className="govuk-table">
          <caption className="govuk-table__caption sr-only">
            Comparativa de opciones de financiamiento
          </caption>
          <thead>
            <tr>
              <th scope="col" className="govuk-table__header">
                Banco
              </th>
              <th 
                scope="col" 
                className="govuk-table__header cursor-pointer"
                onClick={() => requestSort('tasa')}
              >
                <div className="flex items-center">
                  Tasa
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`ml-1 h-4 w-4 ${getSortButtonClass('tasa')}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
              <th 
                scope="col" 
                className="govuk-table__header cursor-pointer"
                onClick={() => requestSort('cat')}
              >
                <div className="flex items-center">
                  CAT
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`ml-1 h-4 w-4 ${getSortButtonClass('cat')}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
              <th 
                scope="col" 
                className="govuk-table__header cursor-pointer"
                onClick={() => requestSort('monthlyPayment')}
              >
                <div className="flex items-center">
                  Pago Mensual
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`ml-1 h-4 w-4 ${getSortButtonClass('monthlyPayment')}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
              <th 
                scope="col" 
                className="govuk-table__header cursor-pointer"
                onClick={() => requestSort('totalAmount')}
              >
                <div className="flex items-center">
                  Monto Total
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`ml-1 h-4 w-4 ${getSortButtonClass('totalAmount')}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414l-3.293 3.293a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </th>
              <th scope="col" className="govuk-table__header">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((bank, index) => (
              <tr 
                key={bank.id} 
                className={`govuk-table__row ${index === 0 && sortConfig.key === 'monthlyPayment' && sortConfig.direction === 'ascending' 
                  ? "bg-royal-gray-100 border-l-4 border-royal-black" 
                  : ""}`}
              >
                <td className="govuk-table__cell">
                  <div className="flex items-center">
                    {typeof bank.logo === 'string' && !bank.logo.includes('.') ? (
                      <div className="text-2xl mr-3">{bank.logo}</div>
                    ) : (
                      <img src={bank.logo} alt={bank.nombre} className="h-8 mr-3" />
                    )}
                    <div>
                      <div className="font-bold">{bank.nombre}</div>
                      {index === 0 && sortConfig.key === 'monthlyPayment' && sortConfig.direction === 'ascending' && (
                        <span className="inline-block px-2 py-1 text-xs font-bold bg-royal-black text-white">
                          Mejor opción
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="govuk-table__cell">
                  {formatPercentage(bank.tasa)}
                </td>
                <td className="govuk-table__cell">
                  {formatPercentage(bank.cat)}
                </td>
                <td className="govuk-table__cell font-bold">
                  {formatCurrency(bank.monthlyPayment)}
                </td>
                <td className="govuk-table__cell">
                  {formatCurrency(bank.totalAmount)}
                </td>
                <td className="govuk-table__cell">
                  <button
                    onClick={() => onSelectBank(bank)}
                    className="govuk-button-secondary px-3 py-1 text-sm"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="govuk-inset-text mt-4">
        <p>
          * Las tasas de interés y CAT son aproximadas y pueden variar. Consulta términos y condiciones con cada institución bancaria.
        </p>
      </div>
    </div>
  );
};

export default BankComparison;