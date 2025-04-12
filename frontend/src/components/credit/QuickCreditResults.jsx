import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { QuickAmortizationPDF } from '../pdf/AmortizationPDF';
import usePdfStore from '../../store/pdfStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { formatCurrency } from './utils/CreditUtils';
import { 
  FaArrowLeft, 
  FaPrint, 
  FaFilePdf, 
  FaChartPie, 
  FaTable, 
  FaCarAlt,
  FaUser,
  FaMoneyBillWave,
  FaCalendarAlt
} from 'react-icons/fa';
import logoCliquealo from '../../assets/logo-cliquealo.png';

// Registrar componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const QuickCreditResults = ({ cotizacion, onBack }) => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [visiblePayments, setVisiblePayments] = useState(12);
  const printComponentRef = useRef();
  
  // Datos para la gráfica de evolución del crédito
  const [amortizationData, setAmortizationData] = useState([]);
  
  // Extraer datos de la cotización
  const { cliente, vehiculo, credito, fecha } = cotizacion;
  
  // Calcular tabla de amortización
  useEffect(() => {
    const tabla = generateAmortizationTable(
      credito.montoFinanciamiento,
      credito.tasaInteres,
      credito.plazo
    );
    setAmortizationData(tabla);
  }, [credito.montoFinanciamiento, credito.tasaInteres, credito.plazo]);
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-MX', options);
  };
  
  // Función para generar la tabla de amortización
  function generateAmortizationTable(amount, rate, months) {
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = credito.pagoMensual;
    
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
  
  // Función para manejar impresión
  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: `Cotizacion_${vehiculo.marca}_${vehiculo.modelo}_${new Date().toISOString().split('T')[0]}`,
  });
  
  // Zustand store para manejar los datos del PDF
  const { setQuickPdfData } = usePdfStore();
  
  // Preparar datos para el PDF
  useEffect(() => {
    setQuickPdfData({
      cliente,
      vehiculo,
      credito,
      fecha,
      amortizationData
    });
  }, [cliente, vehiculo, credito, fecha, amortizationData, setQuickPdfData]);
  
  // Nombre del archivo PDF
  const getPdfFilename = () => {
    return `Cotizacion_${vehiculo.marca}_${vehiculo.modelo}_${new Date().toISOString().split('T')[0]}.pdf`;
  };
  
  // Variantes para animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 25 }
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Resultado de tu Cotización</h1>
          <p className="text-sm text-gray-600">
            {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio} | {formatCurrency(vehiculo.precio)}
          </p>
        </div>
        <div className="mt-3 sm:mt-0 flex space-x-3">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg flex items-center hover:bg-gray-300 transition-all"
          >
            <FaArrowLeft className="mr-2" />
            Volver
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg flex items-center hover:bg-amber-200 transition-all"
          >
            <FaPrint className="mr-2" />
            Imprimir
          </button>
          <PDFDownloadLink
            document={<QuickAmortizationPDF cotizacion={{ cliente, vehiculo, credito, fecha, amortizationData }} />}
            fileName={getPdfFilename()}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg flex items-center hover:bg-amber-600 transition-all"
            style={{ textDecoration: 'none' }}
          >
            {({ blob, url, loading, error }) => (
              <>
                <FaFilePdf className="mr-2" />
                {loading ? 'Generando PDF...' : 'Descargar PDF'}
              </>
            )}
          </PDFDownloadLink>
        </div>
      </motion.div>
      
      {/* Tabs */}
      <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 border-b-0">
        <div className="flex overflow-x-auto">
          <button
            className={`px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
              activeTab === 'resumen'
                ? 'border-b-2 border-amber-500 text-amber-700'
                : 'text-gray-600 hover:text-amber-700'
            }`}
            onClick={() => setActiveTab('resumen')}
          >
            <FaChartPie className="mr-2" />
            Resumen
          </button>
          <button
            className={`px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap ${
              activeTab === 'amortizacion'
                ? 'border-b-2 border-amber-500 text-amber-700'
                : 'text-gray-600 hover:text-amber-700'
            }`}
            onClick={() => setActiveTab('amortizacion')}
          >
            <FaTable className="mr-2" />
            Tabla de Amortización
          </button>
        </div>
      </div>
      
      {/* Contenido */}
      <div className="bg-white rounded-b-xl shadow-md p-6 border border-gray-200 border-t-0 min-h-[600px]">
        <div ref={printComponentRef} className="print:p-8">
          {/* Encabezado para impresión */}
          <div className="hidden print:block print:mb-8">
            <div className="flex flex-col items-center">
              <img src={logoCliquealo} alt="Logo Cliquéalo" className="h-14 mb-4" />
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Cotización de Crédito Automotriz</h1>
              <p className="text-gray-600 mb-1">
                {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
              </p>
              <p className="text-sm text-gray-500">Generado el: {formatDate(fecha)}</p>
            </div>
          </div>
          
          {activeTab === 'resumen' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Información Rápida - Tarjetas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  variants={itemVariants}
                  className="bg-amber-50 p-4 rounded-lg border border-amber-200"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-amber-100 p-2 rounded-md">
                      <FaCarAlt className="text-amber-700" />
                    </div>
                    <h3 className="ml-3 font-medium text-amber-800">Vehículo</h3>
                  </div>
                  <div className="text-xl font-bold mb-1 text-amber-900">{vehiculo.marca} {vehiculo.modelo}</div>
                  <div className="text-sm text-amber-700">{vehiculo.anio} | {vehiculo.placas || 'Sin placas'}</div>
                </motion.div>
                
                <motion.div
                  variants={itemVariants}
                  className="bg-green-50 p-4 rounded-lg border border-green-200"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-green-100 p-2 rounded-md">
                      <FaMoneyBillWave className="text-green-700" />
                    </div>
                    <h3 className="ml-3 font-medium text-green-800">Pago Mensual</h3>
                  </div>
                  <div className="text-xl font-bold mb-1 text-green-900">{formatCurrency(credito.pagoMensual)}</div>
                  <div className="text-sm text-green-700">por {credito.plazo} meses</div>
                </motion.div>
                
                <motion.div
                  variants={itemVariants}
                  className="bg-blue-50 p-4 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-100 p-2 rounded-md">
                      <FaUser className="text-blue-700" />
                    </div>
                    <h3 className="ml-3 font-medium text-blue-800">Cliente</h3>
                  </div>
                  <div className="text-lg font-bold mb-1 text-blue-900 truncate">{cliente.nombre} {cliente.apellidos}</div>
                  <div className="text-sm text-blue-700">{cliente.telefono}</div>
                </motion.div>
                
                <motion.div
                  variants={itemVariants}
                  className="bg-purple-50 p-4 rounded-lg border border-purple-200"
                >
                  <div className="flex items-center mb-3">
                    <div className="bg-purple-100 p-2 rounded-md">
                      <FaCalendarAlt className="text-purple-700" />
                    </div>
                    <h3 className="ml-3 font-medium text-purple-800">Fecha</h3>
                  </div>
                  <div className="text-lg font-bold mb-1 text-purple-900">{formatDate(fecha)}</div>
                  <div className="text-sm text-purple-700">Cotización válida por 15 días</div>
                </motion.div>
              </div>
              
              {/* Resumen Financiero */}
              <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-amber-500 px-6 py-4">
                  <h2 className="text-lg font-bold text-white">Resumen del Financiamiento</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <h3 className="font-medium text-gray-800 mb-3 border-b border-gray-200 pb-1">Detalles del Crédito</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Banco:</span>
                          <span className="font-medium">
                            {typeof credito.banco.logo === 'string' ? (
                              <span className="inline-block mr-1">{credito.banco.logo}</span>
                            ) : (
                              <img src={credito.banco.logo} alt={credito.banco.nombre} className="h-4 inline-block mr-1" />
                            )}
                            {credito.banco.nombre}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tasa anual:</span>
                          <span className="font-medium">{credito.tasaInteres}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">CAT:</span>
                          <span className="font-medium">{credito.cat.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Plazo:</span>
                          <span className="font-medium">{credito.plazo} meses</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Comisión por apertura:</span>
                          <span className="font-medium">{formatCurrency(credito.comisionApertura)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-800 mb-3 border-b border-gray-200 pb-1">Importes</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Precio del vehículo:</span>
                          <span className="font-medium">{formatCurrency(vehiculo.precio)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Enganche ({credito.enganchePorcentaje}%):</span>
                          <span className="font-medium">{formatCurrency(credito.engancheMonto)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monto a financiar:</span>
                          <span className="font-medium">{formatCurrency(credito.montoFinanciamiento)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total de intereses:</span>
                          <span className="font-medium">{formatCurrency(credito.interesesTotales)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monto total a pagar:</span>
                          <span className="font-medium">{formatCurrency(credito.montoTotal)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex justify-between items-center">
                    <span className="font-medium text-amber-800">Pago mensual:</span>
                    <span className="text-xl font-bold text-amber-700">{formatCurrency(credito.pagoMensual)}</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Gráficos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Distribución de Pagos */}
                <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-medium text-gray-800">Distribución del Pago Total</h3>
                  </div>
                  <div className="p-6">
                    <div className="h-64">
                      <Doughnut
                        data={{
                          labels: ['Capital', 'Intereses', 'Comisión de apertura'],
                          datasets: [{
                            data: [
                              credito.montoFinanciamiento,
                              credito.interesesTotales,
                              credito.comisionApertura
                            ],
                            backgroundColor: [
                              'rgba(59, 130, 246, 0.8)', // Blue
                              'rgba(239, 68, 68, 0.8)',  // Red
                              'rgba(16, 185, 129, 0.8)'  // Green
                            ],
                            borderColor: [
                              'rgba(59, 130, 246, 1)',
                              'rgba(239, 68, 68, 1)',
                              'rgba(16, 185, 129, 1)'
                            ],
                            borderWidth: 1
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                font: {
                                  size: 12
                                },
                                padding: 20
                              }
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const label = context.label || '';
                                  const value = context.raw;
                                  const total = credito.montoFinanciamiento + credito.interesesTotales + credito.comisionApertura;
                                  const percentage = ((value / total) * 100).toFixed(1);
                                  return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-4 text-xs text-gray-600 text-center">
                      <p>Este gráfico muestra cómo se distribuye el pago total del crédito entre el capital, los intereses y la comisión de apertura.</p>
                    </div>
                  </div>
                </motion.div>
                
                {/* Evolución del Crédito */}
                <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-medium text-gray-800">Evolución del Crédito</h3>
                  </div>
                  <div className="p-6">
                    <div className="h-64">
                      <Line
                        data={{
                          labels: amortizationData.filter((_, index) => 
                            index % Math.max(1, Math.floor(credito.plazo / 12)) === 0 || 
                            index === credito.plazo - 1
                          ).map(data => `Mes ${data.paymentNumber}`),
                          datasets: [
                            {
                              label: 'Saldo pendiente',
                              data: amortizationData.filter((_, index) => 
                                index % Math.max(1, Math.floor(credito.plazo / 12)) === 0 || 
                                index === credito.plazo - 1
                              ).map(data => data.balance),
                              borderColor: 'rgba(234, 88, 12, 1)',
                              backgroundColor: 'rgba(234, 88, 12, 0.1)',
                              tension: 0.4,
                              fill: true
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: value => formatCurrency(value)
                              }
                            }
                          },
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const label = context.dataset.label || '';
                                  const value = context.raw;
                                  return `${label}: ${formatCurrency(value)}`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                    <div className="mt-4 text-xs text-gray-600 text-center">
                      <p>Este gráfico muestra cómo disminuye el saldo pendiente del crédito a lo largo del tiempo.</p>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <motion.div variants={itemVariants} className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="mb-2"><strong>Nota importante:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Esta cotización es informativa y no representa un compromiso de financiamiento.</li>
                  <li>Las tasas, comisiones y condiciones están sujetas a aprobación crediticia.</li>
                  <li>Para más información, contáctanos o visita nuestra página web.</li>
                </ul>
              </motion.div>
            </motion.div>
          )}
          
          {activeTab === 'amortizacion' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <h2 className="text-xl font-bold text-gray-800">Tabla de Amortización</h2>
                
                <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm"
                    value={visiblePayments}
                    onChange={(e) => setVisiblePayments(Number(e.target.value))}
                  >
                    {[12, 24, 36, 48, 60, credito.plazo].filter((v, i, a) => a.indexOf(v) === i).map(size => (
                      <option key={size} value={size}>{size} pagos</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <h3 className="font-medium text-amber-800 mb-1">Resumen del crédito</h3>
                    <p className="text-sm text-amber-700">
                      {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio} | Precio: {formatCurrency(vehiculo.precio)}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0 flex flex-col sm:items-end">
                    <div className="font-medium text-sm text-amber-800">Pago mensual</div>
                    <div className="text-xl font-bold text-amber-700">{formatCurrency(credito.pagoMensual)}</div>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Pago</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capital</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interés</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {amortizationData.slice(0, visiblePayments).map((row, index) => (
                      <tr key={row.paymentNumber} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.paymentNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(row.paymentDate)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(row.payment)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(row.principalPayment)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(row.interestPayment)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {visiblePayments < credito.plazo && (
                <div className="text-center mt-6">
                  <button
                    className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg inline-flex items-center hover:bg-amber-200 transition-all"
                    onClick={() => setVisiblePayments(credito.plazo)}
                  >
                    Ver todos los pagos ({credito.plazo})
                  </button>
                </div>
              )}
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">Información sobre la tabla de amortización</h3>
                <p className="text-sm text-gray-600">
                  Esta tabla muestra el desglose de cada pago mensual a lo largo del plazo del crédito. 
                  Cada mes, una parte del pago se destina a cubrir los intereses generados y el resto reduce el saldo pendiente del capital.
                  A medida que avanza el crédito, la proporción de cada pago destinada al capital aumenta y la parte de intereses disminuye.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickCreditResults;