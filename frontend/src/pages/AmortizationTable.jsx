import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logoCliquealo from '../assets/logo-cliquealo.png';
import CreditEvolutionModal from './CreditEvolutionModal';
import { IoBarChartOutline } from 'react-icons/io5';

const AmortizationTable = ({ bank, client, vehicles, creditConfig, onBack }) => {
  // Estado para controlar el modal de evolución del crédito
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
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
    if (value === "" || value === null || value === undefined || isNaN(value)) {
      return "0.00%";
    }
    return `${Number(value).toFixed(2)}%`;
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-MX', options);
  };
  
  // Función para generar la tabla de amortización
  function generateAmortizationTable(amount, rate, months) {
    // Asegúrarse de que los valores sean números válidos
    amount = typeof amount === 'number' ? amount : 0;
    rate = typeof rate === 'number' ? rate : 0;
    months = typeof months === 'number' ? months : 0;
    
    // Si alguno de los valores esenciales es 0, devolver un array vacío
    if (amount <= 0 || rate <= 0 || months <= 0) {
      return [];
    }
    
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
      doc.text(`Pago mensual: ${amortizationData.length > 0 
        ? formatCurrency(amortizationData[0].payment) 
        : formatCurrency(0)}`, 150, 65);
      doc.text(`Total a pagar: ${amortizationData.length > 0 
        ? formatCurrency(amortizationData[0].payment * creditConfig.term)
        : formatCurrency(0)}`, 150, 70);
      doc.text(`Total de intereses: ${formatCurrency(
        amortizationData.length > 0
          ? amortizationData.reduce((sum, row) => sum + row.interestPayment, 0)
          : 0
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
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-white text-sm">
                Banco: {bank.nombre} | Plazo: {creditConfig.term} meses
                {creditConfig.useCustomRate && (
                  <span className="ml-2">(Tasa personalizada: {formatPercentage(creditConfig.customRate)})</span>
                )}
              </p>
              <div className="inline-block bg-gray-700 text-white text-sm px-3 py-1 rounded-full">
                Vehículo: {formatCurrency(creditConfig.financingAmount + creditConfig.downPaymentAmount)}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowEvolutionModal(true)}
              className="govuk-button px-3 py-1.5 text-sm flex items-center bg-blue-600 hover:bg-blue-700"
            >
              <IoBarChartOutline className="h-4 w-4 mr-1" />
              Ver Evolución del Crédito
            </button>
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
        
        {/* Nuevo panel de resumen del vehículo */}
        {vehicles && vehicles.length > 0 && (
          <div className="mb-8 bg-gray-50 border-2 border-gray-300 rounded-md overflow-hidden">
            <div className="bg-gray-700 text-white p-3">
              <h3 className="font-bold text-lg">Vehículo Financiado</h3>
              <div className="text-sm text-gray-200">Valor total: {formatCurrency(creditConfig.financingAmount + creditConfig.downPaymentAmount)}</div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Información del vehículo */}
                <div className="space-y-2">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="border border-gray-200 p-3 rounded bg-white">
                      <div className="font-bold text-gray-800">{vehicle.descripcion}</div>
                      <div className="text-sm text-gray-600">{vehicle.marca} {vehicle.modelo} ({vehicle.año})</div>
                      <div className="font-bold text-lg text-gray-800 mt-1">{formatCurrency(vehicle.valor)}</div>
                    </div>
                  ))}
                </div>
                
                {/* Distribución del financiamiento */}
                <div className="border border-gray-200 p-3 rounded bg-white">
                  <div className="font-medium mb-2">Distribución del Financiamiento</div>
                  
                  {/* Barra visual de enganche y financiamiento */}
                  <div className="w-full h-10 rounded overflow-hidden border border-gray-300 flex mb-2">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(creditConfig.downPaymentAmount / (creditConfig.financingAmount + creditConfig.downPaymentAmount)) * 100}%` }}
                    >
                      Enganche
                    </div>
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 flex items-center justify-center text-white text-xs font-medium"
                      style={{ width: `${(creditConfig.financingAmount / (creditConfig.financingAmount + creditConfig.downPaymentAmount)) * 100}%` }}
                    >
                      Financiado
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-3">
                    <div>
                      <div className="text-xs text-indigo-600">Enganche</div>
                      <div className="font-medium">{formatCurrency(creditConfig.downPaymentAmount)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-teal-600">Financiado</div>
                      <div className="font-medium">{formatCurrency(creditConfig.financingAmount)}</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 border-t border-gray-200 pt-2">
                    <div className="flex justify-between">
                      <span>Enganche (%)</span>
                      <span>{((creditConfig.downPaymentAmount / (creditConfig.financingAmount + creditConfig.downPaymentAmount)) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Monto financiado (%)</span>
                      <span>{((creditConfig.financingAmount / (creditConfig.financingAmount + creditConfig.downPaymentAmount)) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
          
          <div className="border-2 border-royal-black p-4 sm:col-span-2 lg:col-span-1 bg-gray-50">
            <h3 className="govuk-heading-s mb-2">Resumen del Préstamo</h3>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-sm font-bold sm:w-1/2">Pago mensual:</dt>
                <dd className="text-sm font-bold">
                  {amortizationData.length > 0 
                    ? formatCurrency(amortizationData[0].payment) 
                    : formatCurrency(0)}
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-sm font-bold sm:w-1/2">Total a pagar:</dt>
                <dd className="text-sm">
                  {amortizationData.length > 0 
                    ? formatCurrency(amortizationData[0].payment * creditConfig.term)
                    : formatCurrency(0)}
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-sm font-bold sm:w-1/2">Total de intereses:</dt>
                <dd className="text-sm">
                  {formatCurrency(
                    amortizationData.length > 0
                      ? amortizationData.reduce((sum, row) => sum + row.interestPayment, 0)
                      : 0
                  )}
                </dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <dt className="text-sm font-bold sm:w-1/2">Comisión por apertura:</dt>
                <dd className="text-sm">{formatCurrency((creditConfig.financingAmount * bank.comision) / 100)}</dd>
              </div>
            </div>
          </div>
        </div>
        

        {amortizationData.length > 0 && (
          <div className="mb-8">
            <h3 className="govuk-heading-s mb-4 flex justify-between items-center">
              <span>Gráfica de Progresión</span>
              <span className="text-sm bg-gray-700 text-white px-3 py-1 rounded-full">
                {formatCurrency(creditConfig.financingAmount + creditConfig.downPaymentAmount)}
              </span>
            </h3>
            
            {/* Visualización gráfica de la evolución del crédito */}
            <div className="border-2 border-gray-300 rounded-md p-4 mb-6">
              <h4 className="text-sm font-bold mb-2">Evolución del Financiamiento del Vehículo</h4>
              
              {/* Leyenda */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-indigo-600 to-blue-500 mr-1 rounded-sm"></div>
                  <span className="text-xs">Capital pagado</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 mr-1 rounded-sm"></div>
                  <span className="text-xs">Intereses pagados</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gradient-to-r from-gray-300 to-gray-400 mr-1 rounded-sm"></div>
                  <span className="text-xs">Saldo pendiente</span>
                </div>
              </div>
              
              {/* Barra inicial (saldo total) */}
              <div className="mb-1 text-xs font-medium">
                Inicio: {formatCurrency(creditConfig.financingAmount)}
              </div>
              <div className="w-full h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded-sm mb-4"></div>
              
              {/* Barras intermedias (cada 25% del plazo) */}
              {[0.25, 0.5, 0.75].map((fraction) => {
                const paymentIndex = Math.floor(creditConfig.term * fraction) - 1;
                if (paymentIndex < 0 || paymentIndex >= amortizationData.length) return null;
                
                const row = amortizationData[paymentIndex];
                const totalPaid = creditConfig.financingAmount - row.balance;
                const totalInterestPaid = amortizationData.slice(0, paymentIndex + 1)
                  .reduce((sum, r) => sum + r.interestPayment, 0);
                const totalPrincipalPaid = totalPaid - totalInterestPaid;
                
                const principalPaidWidth = `${(totalPrincipalPaid / creditConfig.financingAmount) * 100}%`;
                const interestPaidWidth = `${(totalInterestPaid / creditConfig.financingAmount) * 100}%`;
                const balanceWidth = `${(row.balance / creditConfig.financingAmount) * 100}%`;
                
                return (
                  <div key={`payment-${row.paymentNumber}`} className="mb-4">
                    <div className="mb-1 text-xs font-medium">
                      Pago #{row.paymentNumber} ({formatDate(row.paymentDate)}): {formatCurrency(row.balance)} pendiente
                    </div>
                    <div className="w-full h-8 flex rounded-sm overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center"
                        style={{ width: principalPaidWidth }}
                      >
                        {parseFloat(principalPaidWidth) > 15 && (
                          <span className="text-xs text-white px-1">Capital</span>
                        )}
                      </div>
                      <div 
                        className="h-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center"
                        style={{ width: interestPaidWidth }}
                      >
                        {parseFloat(interestPaidWidth) > 15 && (
                          <span className="text-xs text-white px-1">Interés</span>
                        )}
                      </div>
                      <div 
                        className="h-full bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center"
                        style={{ width: balanceWidth }}
                      >
                        {parseFloat(balanceWidth) > 15 && (
                          <span className="text-xs text-gray-800 px-1">Saldo</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Barra final (último pago) */}
              {amortizationData.length > 0 && (
                <div>
                  <div className="mb-1 text-xs font-medium">
                    Al finalizar (Pago #{creditConfig.term}): {formatCurrency(0)} pendiente
                  </div>
                  <div className="w-full h-8 flex rounded-sm overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center"
                      style={{ 
                        width: `${(creditConfig.financingAmount - amortizationData.reduce((sum, row) => sum + row.interestPayment, 0)) / creditConfig.financingAmount * 100}%`
                      }}
                    >
                      <span className="text-xs text-white px-1">Capital</span>
                    </div>
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-red-500 flex items-center justify-center"
                      style={{ 
                        width: `${amortizationData.reduce((sum, row) => sum + row.interestPayment, 0) / creditConfig.financingAmount * 100}%`
                      }}
                    >
                      <span className="text-xs text-white px-1">Interés Total</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Distribución de pagos */}
            <div className="border-2 border-gray-300 rounded-md p-4">
              <h4 className="text-sm font-bold mb-2">Distribución del Pago Mensual: {formatCurrency(amortizationData[0].payment)}</h4>
              
              {/* Gráfica circular que muestra la distribución del primer pago */}
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Visualización gráfica */}
                <div className="w-full md:w-2/3">
                  <div className="w-full h-12 flex rounded-sm overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 flex items-center justify-center text-white"
                      style={{ 
                        width: `${(amortizationData[0].principalPayment / amortizationData[0].payment) * 100}%`
                      }}
                    >
                      <span className="text-xs md:text-sm">Capital</span>
                    </div>
                    <div 
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center text-white"
                      style={{ 
                        width: `${(amortizationData[0].interestPayment / amortizationData[0].payment) * 100}%`
                      }}
                    >
                      <span className="text-xs md:text-sm">Interés</span>
                    </div>
                  </div>
                  
                  {/* Etiquetas de porcentaje */}
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>
                      {((amortizationData[0].principalPayment / amortizationData[0].payment) * 100).toFixed(1)}% a capital
                    </span>
                    <span>
                      {((amortizationData[0].interestPayment / amortizationData[0].payment) * 100).toFixed(1)}% a interés
                    </span>
                  </div>
                </div>
                
                {/* Valores numéricos */}
                <div className="w-full md:w-1/3 flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-teal-600 font-medium">Capital:</span>
                    <span className="text-xs font-bold">{formatCurrency(amortizationData[0].principalPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-amber-600 font-medium">Interés:</span>
                    <span className="text-xs font-bold">{formatCurrency(amortizationData[0].interestPayment)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-200">
                    <span className="text-xs font-medium">Total:</span>
                    <span className="text-xs font-bold">{formatCurrency(amortizationData[0].payment)}</span>
                  </div>
                </div>
              </div>
              
              {/* Explicación de la evolución */}
              <div className="mt-4 text-xs text-gray-600">
                <p>A medida que avanza el crédito, la proporción de capital aumenta y la de interés disminuye en cada pago mensual.</p>
              </div>
            </div>
          </div>
        )}
        
        <h3 className="govuk-heading-s mb-4">Tabla de Amortización</h3>
        
        {amortizationData.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-royal-gray-300">
            <p className="text-royal-gray-600">
              Ingrese valores válidos en el formulario de crédito para generar la tabla de amortización.
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}
        
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
      
      {/* Modal con visualización dinámica de la evolución del crédito */}
      <CreditEvolutionModal
        isOpen={showEvolutionModal}
        onClose={() => setShowEvolutionModal(false)}
        amortizationData={amortizationData}
        vehicleValue={creditConfig.financingAmount + creditConfig.downPaymentAmount}
        financingAmount={creditConfig.financingAmount}
        term={creditConfig.term}
        rate={effectiveRate}
        downPaymentAmount={creditConfig.downPaymentAmount}
        cat={effectiveCat}
        bankComision={bank.comision}
      />
    </div>
  );
};

export default AmortizationTable;