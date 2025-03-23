import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logoCliquealo from '../assets/logo-cliquealo.png';

const AmortizationTable = ({ bank, client, vehicles, creditConfig, onBack }) => {
  const printComponentRef = useRef();
  
  // Estado para controlar el número de pagos visibles
  const [visiblePayments, setVisiblePayments] = useState(12);
  
  // Determinar la tasa de interés a utilizar (personalizada o del banco)
  const effectiveRate = creditConfig.useCustomRate ? creditConfig.customRate : bank.tasa;
  
  // Determinar el CAT a utilizar (personalizado o del banco)
  const effectiveCat = creditConfig.useCustomCat 
    ? creditConfig.customCat 
    : creditConfig.useCustomRate 
      ? creditConfig.customRate * 1.3 // Estimación aproximada
      : bank.cat;
  
  // Preparar datos para la tabla de amortización
  const amortizationData = generateAmortizationTable(
    creditConfig.financingAmount,
    effectiveRate, // Usar la tasa efectiva
    creditConfig.term
  );
  
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
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-MX', options);
  };
  
  // Función para generar la tabla de amortización
  function generateAmortizationTable(amount, rate, months) {
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = calculateMonthlyPayment(amount, rate, months);
    
    let balance = amount;
    const table = [];
    
    for (let i = 1; i <= months; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      
      if (balance < 0.01) balance = 0; // Evitar números negativos muy pequeños
      
      const paymentDate = new Date();
      paymentDate.setMonth(paymentDate.getMonth() + i);
      
      table.push({
        paymentNumber: i,
        paymentDate: paymentDate.toISOString().split('T')[0],
        payment: monthlyPayment,
        principalPayment,
        interestPayment,
        balance
      });
    }
    
    return table;
  }
  
  // Función para calcular el pago mensual
  function calculateMonthlyPayment(amount, rate, months) {
    const monthlyRate = rate / 100 / 12;
    const factor = Math.pow(1 + monthlyRate, months);
    return (amount * monthlyRate * factor) / (factor - 1);
  }
  
  // Manejar impresión
  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: `Tabla_Amortizacion_${bank.nombre}_${new Date().toISOString().split('T')[0]}`,
    onBeforeGetContent: () => {
      // Asegurarse de que el contenido esté listo antes de imprimir
      return new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    },
    onAfterPrint: () => {
      console.log('Impresión completada');
    },
    removeAfterPrint: true
  });
  
  // Manejar descarga de PDF
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Añadir logo y encabezado
      const imgData = logoCliquealo;
      doc.addImage(imgData, 'PNG', 105 - 15, 10, 30, 15, undefined, 'FAST');
      doc.setFontSize(16);
      doc.text('Tabla de Amortización', 105, 35, { align: 'center' });
      
      // Detalles del banco y fecha
      doc.setFontSize(10);
      const bankText = `Banco: ${bank.nombre} | Generado el: ${new Date().toLocaleDateString('es-MX')}`;
      doc.text(bankText, 105, 42, { align: 'center' });
      
      if (creditConfig.useCustomRate) {
        doc.text(`(Tasa personalizada: ${formatPercentage(creditConfig.customRate)})`, 105, 48, { align: 'center' });
      }
      
      // Información del cliente
      doc.setFontSize(12);
      doc.text('Información del Cliente', 14, 60);
      doc.setFontSize(10);
      let yPos = 65;
      
      if (client) {
        doc.text(`Nombre: ${client.nombre} ${client.apellidos}`, 14, yPos);
        yPos += 5;
        
        if (client.rfc) {
          doc.text(`RFC: ${client.rfc}`, 14, yPos);
          yPos += 5;
        }
        
        if (client.email) {
          doc.text(`Email: ${client.email}`, 14, yPos);
          yPos += 5;
        }
      }
      
      // Detalles del crédito
      yPos = Math.max(yPos, 65);
      doc.setFontSize(12);
      doc.text('Detalles del Crédito', 95, 60);
      doc.setFontSize(10);
      doc.text(`Monto financiado: ${formatCurrency(creditConfig.financingAmount)}`, 95, 65);
      doc.text(`Plazo: ${creditConfig.term} meses`, 95, 70);
      doc.text(`Tasa anual: ${formatPercentage(effectiveRate)}${creditConfig.useCustomRate ? ' (Personalizada)' : ''}`, 95, 75);
      doc.text(`CAT: ${creditConfig.useCustomCat 
        ? formatPercentage(creditConfig.customCat)
        : creditConfig.useCustomRate 
          ? `~${formatPercentage(creditConfig.customRate * 1.3)}` // Estimación aproximada
          : formatPercentage(bank.cat)}`, 95, 80);
      
      // Resumen del préstamo
      doc.setFontSize(12);
      doc.text('Resumen del Préstamo', 150, 60);
      doc.setFontSize(10);
      doc.text(`Pago mensual: ${formatCurrency(amortizationData[0].payment)}`, 150, 65);
      doc.text(`Total a pagar: ${formatCurrency(amortizationData[0].payment * creditConfig.term)}`, 150, 70);
      doc.text(`Total de intereses: ${formatCurrency(
        amortizationData.reduce((sum, row) => sum + row.interestPayment, 0)
      )}`, 150, 75);
      doc.text(`Comisión por apertura: ${formatCurrency((creditConfig.financingAmount * bank.comision) / 100)}`, 150, 80);
      
      // Vehículos financiados (si hay)
      yPos = 90;
      if (vehicles && vehicles.length > 0) {
        doc.setFontSize(12);
        doc.text('Vehículos financiados', 14, yPos);
        yPos += 5;
        
        const vehicleTableColumns = ['Descripción', 'Marca/Modelo', 'Año', 'Valor'];
        const vehicleTableRows = vehicles.map(vehicle => [
          vehicle.descripcion,
          `${vehicle.marca} ${vehicle.modelo}`,
          vehicle.año,
          formatCurrency(vehicle.valor)
        ]);
        
        doc.autoTable({
          head: [vehicleTableColumns],
          body: vehicleTableRows,
          startY: yPos,
          margin: { left: 14 },
          theme: 'grid',
          headStyles: { fillColor: [10, 10, 10], textColor: [255, 255, 255] },
          styles: { fontSize: 8 },
        });
        
        yPos = doc.previousAutoTable.finalY + 10;
      }
      
      // Tabla de amortización
      doc.setFontSize(12);
      doc.text('Tabla de Amortización', 14, yPos);
      yPos += 5;
      
      const amortizationColumns = ['No. Pago', 'Fecha', 'Pago', 'Capital', 'Interés', 'Saldo'];
      const amortizationRows = amortizationData.map(row => [
        row.paymentNumber,
        formatDate(row.paymentDate),
        formatCurrency(row.payment),
        formatCurrency(row.principalPayment),
        formatCurrency(row.interestPayment),
        formatCurrency(row.balance)
      ]);
      
      doc.autoTable({
        head: [amortizationColumns],
        body: amortizationRows,
        startY: yPos,
        margin: { left: 14 },
        theme: 'grid',
        headStyles: { fillColor: [10, 10, 10], textColor: [255, 255, 255] },
        styles: { fontSize: 8 },
        didDrawPage: function (data) {
          // Pie de página
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.setFontSize(8);
          doc.text('Este documento es informativo y no representa un contrato de crédito oficial.', 105, pageHeight - 20, { align: 'center' });
          doc.text(`Consulta los términos y condiciones con ${bank.nombre} antes de formalizar tu crédito.`, 105, pageHeight - 15, { align: 'center' });
          doc.text('Generado por Cliquéalo.mx - Simulador de Crédito Automotriz', 105, pageHeight - 10, { align: 'center' });
        }
      });
      
      // Guardar PDF
      doc.save(`Tabla_Amortizacion_${bank.nombre}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      console.log('PDF generado y descargado correctamente');
    } catch (error) {
      console.error('Error al generar el PDF:', error);
    }
  };
  
  return (
    <div className="govuk-form-section">
      <div className="bg-royal-black p-4 text-white mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl font-bold">Tabla de Amortización</h2>
            <p className="text-white text-sm">
              Banco: {bank.nombre} | Plazo: {creditConfig.term} meses
              {creditConfig.useCustomRate && (
                <span className="ml-2">(Tasa personalizada: {formatPercentage(creditConfig.customRate)})</span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onBack}
              className="govuk-button-secondary px-3 py-1 text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Volver
            </button>
            <button
              onClick={handlePrint}
              className="govuk-button-secondary px-3 py-1 text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0v3H7V4h6zm-6 8v4h6v-4H7z" clipRule="evenodd" />
              </svg>
              Imprimir
            </button>
            <button
              onClick={handleDownloadPDF}
              className="govuk-button-secondary px-3 py-1 text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Descargar PDF
            </button>
          </div>
        </div>
      </div>
      
      {/* Contenido imprimible */}
      <div ref={printComponentRef} className="p-2">
        {/* Encabezado para impresión - visible solo al imprimir */}
        <div className="hidden print:block print:mb-6">
          <div className="flex flex-col items-center">
            <img 
              src={logoCliquealo} 
              alt="Logo Cliquealo" 
              className="h-16 mb-4" 
            />
            <h1 className="text-2xl font-bold text-royal-black">Tabla de Amortización</h1>
            <p className="text-royal-gray-600">
              Banco: {bank.nombre} | Generado el: {new Date().toLocaleDateString('es-MX')}
              {creditConfig.useCustomRate && (
                <span className="ml-2">(Tasa personalizada: {formatPercentage(creditConfig.customRate)})</span>
              )}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="border-2 border-royal-black p-4">
            <h3 className="govuk-heading-s mb-2">Información del Cliente</h3>
            {client && (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <dt className="text-sm font-bold sm:w-1/3">Nombre:</dt>
                  <dd className="text-sm">{client.nombre} {client.apellidos}</dd>
                </div>
                {client.rfc && (
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <dt className="text-sm font-bold sm:w-1/3">RFC:</dt>
                    <dd className="text-sm">{client.rfc}</dd>
                  </div>
                )}
                {client.email && (
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <dt className="text-sm font-bold sm:w-1/3">Email:</dt>
                    <dd className="text-sm">{client.email}</dd>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="border-2 border-royal-black p-4">
            <h3 className="govuk-heading-s mb-2">Detalles del Crédito</h3>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-sm font-bold sm:w-1/2">Monto financiado:</dt>
                <dd className="text-sm">{formatCurrency(creditConfig.financingAmount)}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-sm font-bold sm:w-1/2">Plazo:</dt>
                <dd className="text-sm">{creditConfig.term} meses</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-sm font-bold sm:w-1/2">Tasa anual:</dt>
                <dd className="text-sm">
                  {formatPercentage(effectiveRate)}
                  {creditConfig.useCustomRate && <span className="font-bold ml-1">(Personalizada)</span>}
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-sm font-bold sm:w-1/2">CAT:</dt>
                <dd className="text-sm">
                  {creditConfig.useCustomCat 
                    ? formatPercentage(creditConfig.customCat)
                    : creditConfig.useCustomRate 
                      ? `~${formatPercentage(creditConfig.customRate * 1.3)}` // Estimación aproximada
                      : formatPercentage(bank.cat)
                  }
                </dd>
              </div>
            </div>
          </div>
          
          <div className="border-2 border-royal-black p-4 sm:col-span-2 lg:col-span-1">
            <h3 className="govuk-heading-s mb-2">Resumen del Préstamo</h3>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-sm font-bold sm:w-1/2">Pago mensual:</dt>
                <dd className="text-sm font-bold">{formatCurrency(amortizationData[0].payment)}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-sm font-bold sm:w-1/2">Total a pagar:</dt>
                <dd className="text-sm">{formatCurrency(amortizationData[0].payment * creditConfig.term)}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-sm font-bold sm:w-1/2">Total de intereses:</dt>
                <dd className="text-sm">{formatCurrency(
                  amortizationData.reduce((sum, row) => sum + row.interestPayment, 0)
                )}</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-sm font-bold sm:w-1/2">Comisión por apertura:</dt>
                <dd className="text-sm">{formatCurrency((creditConfig.financingAmount * bank.comision) / 100)}</dd>
              </div>
            </div>
          </div>
        </div>
        
        {vehicles && vehicles.length > 0 && (
          <div className="mb-8">
            <h3 className="govuk-heading-s mb-4">Vehículos financiados</h3>
            
            {/* Mobile card view */}
            <div className="sm:hidden space-y-4">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="border border-royal-gray-300 p-3">
                  <div className="font-bold">{vehicle.descripcion}</div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <div className="text-xs text-royal-gray-600">Marca/Modelo</div>
                      <div>{vehicle.marca} {vehicle.modelo}</div>
                    </div>
                    <div>
                      <div className="text-xs text-royal-gray-600">Año</div>
                      <div>{vehicle.año}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-royal-gray-600">Valor</div>
                      <div className="font-bold">{formatCurrency(vehicle.valor)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop table view */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="govuk-table">
                <thead>
                  <tr>
                    <th scope="col" className="govuk-table__header">Descripción</th>
                    <th scope="col" className="govuk-table__header">Marca/Modelo</th>
                    <th scope="col" className="govuk-table__header">Año</th>
                    <th scope="col" className="govuk-table__header">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="govuk-table__row">
                      <td className="govuk-table__cell">{vehicle.descripcion}</td>
                      <td className="govuk-table__cell">{vehicle.marca} {vehicle.modelo}</td>
                      <td className="govuk-table__cell">{vehicle.año}</td>
                      <td className="govuk-table__cell">{formatCurrency(vehicle.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        <h3 className="govuk-heading-s mb-4">Tabla de Amortización</h3>
        
        {/* Mobile card view */}
        <div className="sm:hidden">
          <div className="flex space-x-2 mb-4">
            <button 
              className="px-3 py-1 text-xs bg-royal-gray-100 border border-royal-gray-300 rounded"
              onClick={() => setVisiblePayments(12)}
            >
              12 meses
            </button>
            <button 
              className="px-3 py-1 text-xs bg-royal-gray-100 border border-royal-gray-300 rounded"
              onClick={() => setVisiblePayments(24)}
            >
              24 meses
            </button>
            <select 
              id="mobilePageSize" 
              className="px-2 py-1 text-xs bg-white border border-royal-gray-300 rounded"
              value={visiblePayments}
              onChange={(e) => setVisiblePayments(Number(e.target.value))}
            >
              {[6, 12, 24, creditConfig.term].map(size => (
                <option key={size} value={size}>{size} pagos</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-3">
            {amortizationData.slice(0, visiblePayments).map((row) => (
              <details 
                key={row.paymentNumber} 
                className="border border-royal-gray-300"
              >
                <summary className="flex justify-between items-center p-3 cursor-pointer">
                  <div className="font-medium">Pago #{row.paymentNumber}</div>
                  <div className="font-bold">{formatCurrency(row.payment)}</div>
                </summary>
                <div className="p-3 border-t border-royal-gray-300 bg-royal-gray-50">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-royal-gray-600">Fecha</div>
                      <div>{formatDate(row.paymentDate)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-royal-gray-600">Capital</div>
                      <div>{formatCurrency(row.principalPayment)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-royal-gray-600">Interés</div>
                      <div>{formatCurrency(row.interestPayment)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-royal-gray-600">Saldo</div>
                      <div>{formatCurrency(row.balance)}</div>
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
          
          {visiblePayments < amortizationData.length && (
            <div className="mt-4 text-center">
              <p className="text-sm text-royal-gray-600">
                Mostrando {visiblePayments} de {amortizationData.length} pagos
              </p>
              <button 
                className="mt-2 px-4 py-2 text-sm bg-royal-gray-100 border border-royal-gray-300 rounded"
                onClick={() => setVisiblePayments(amortizationData.length)}
              >
                Ver todos los pagos
              </button>
            </div>
          )}
        </div>
        
        {/* Desktop table view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="govuk-table">
            <thead>
              <tr>
                <th scope="col" className="govuk-table__header">No. Pago</th>
                <th scope="col" className="govuk-table__header">Fecha</th>
                <th scope="col" className="govuk-table__header">Pago</th>
                <th scope="col" className="govuk-table__header">Capital</th>
                <th scope="col" className="govuk-table__header">Interés</th>
                <th scope="col" className="govuk-table__header">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {amortizationData.map((row) => (
                <tr key={row.paymentNumber} className="govuk-table__row">
                  <td className="govuk-table__cell">{row.paymentNumber}</td>
                  <td className="govuk-table__cell">{formatDate(row.paymentDate)}</td>
                  <td className="govuk-table__cell">{formatCurrency(row.payment)}</td>
                  <td className="govuk-table__cell">{formatCurrency(row.principalPayment)}</td>
                  <td className="govuk-table__cell">{formatCurrency(row.interestPayment)}</td>
                  <td className="govuk-table__cell">{formatCurrency(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pie de página para impresión - visible solo al imprimir */}
        <div className="hidden print:block print:mt-8">
          <div className="govuk-inset-text text-center">
            <p>Este documento es informativo y no representa un contrato de crédito oficial.</p>
            <p>Consulta los términos y condiciones con {bank.nombre} antes de formalizar tu crédito.</p>
            <p className="mt-2">Generado por Cliquéalo.mx - Simulador de Crédito Automotriz</p>
            <img 
              src={logoCliquealo} 
              alt="Logo Cliquealo" 
              className="h-10 mt-2 mx-auto" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmortizationTable;