import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import logoCliquealo from '../../assets/logo-cliquealo.png';

// Estilos para el documento PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  logo: {
    width: 120,
    marginBottom: 10,
    alignSelf: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 15,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  infoColumn: {
    flex: 1,
  },
  infoBox: {
    border: '1px solid #ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 10,
    marginBottom: 2,
  },
  divider: {
    borderBottom: '1px solid #eee',
    marginVertical: 10,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontWeight: 'bold',
    padding: 8,
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 8,
    fontSize: 8,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 8,
    fontSize: 8,
    backgroundColor: '#f9f9f9',
  },
  tableCell1: {
    width: '8%',
  },
  tableCell2: {
    width: '22%',
  },
  tableCell3: {
    width: '14%',
  },
  tableCell4: {
    width: '14%',
  },
  tableCell5: {
    width: '14%',
  },
  tableCell6: {
    width: '28%',
  },
  summaryBox: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 9,
  },
  summaryValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  highlightValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#e98c23',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
  smallText: {
    fontSize: 8,
    marginBottom: 2,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    right: 30,
    fontSize: 8,
    color: '#666',
  },
});

// Funciones de utilidad
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-MX', options);
};

const formatPercentage = (value) => {
  if (value === "" || value === null || value === undefined || isNaN(value)) {
    return "0.00%";
  }
  return `${Number(value).toFixed(2)}%`;
};

// Componente para la tabla de amortización
const AmortizationTable = ({ data }) => {
  return (
    <View>
      <Text style={styles.infoTitle}>Tabla de Amortización</Text>
      <View style={styles.tableHeader}>
        <Text style={styles.tableCell1}>No.</Text>
        <Text style={styles.tableCell2}>Fecha</Text>
        <Text style={styles.tableCell3}>Pago</Text>
        <Text style={styles.tableCell4}>Capital</Text>
        <Text style={styles.tableCell5}>Interés</Text>
        <Text style={styles.tableCell6}>Saldo</Text>
      </View>
      {data.map((row, index) => (
        <View key={row.paymentNumber} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
          <Text style={styles.tableCell1}>{row.paymentNumber}</Text>
          <Text style={styles.tableCell2}>{formatDate(row.paymentDate)}</Text>
          <Text style={styles.tableCell3}>{formatCurrency(row.payment)}</Text>
          <Text style={styles.tableCell4}>{formatCurrency(row.principalPayment)}</Text>
          <Text style={styles.tableCell5}>{formatCurrency(row.interestPayment)}</Text>
          <Text style={styles.tableCell6}>{formatCurrency(row.balance)}</Text>
        </View>
      ))}
    </View>
  );
};

// Componente para resumen del financiamiento
const FinancingSummary = ({ credito, vehiculo }) => {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryTitle}>Resumen del Financiamiento</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Precio del vehículo:</Text>
        <Text style={styles.summaryValue}>{formatCurrency(vehiculo.precio)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Enganche ({credito.enganchePorcentaje}%):</Text>
        <Text style={styles.summaryValue}>{formatCurrency(credito.engancheMonto)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Monto a financiar:</Text>
        <Text style={styles.summaryValue}>{formatCurrency(credito.montoFinanciamiento)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Tasa anual:</Text>
        <Text style={styles.summaryValue}>{formatPercentage(credito.tasaInteres)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>CAT:</Text>
        <Text style={styles.summaryValue}>{formatPercentage(credito.cat)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Plazo:</Text>
        <Text style={styles.summaryValue}>{credito.plazo} meses</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Total de intereses:</Text>
        <Text style={styles.summaryValue}>{formatCurrency(credito.interesesTotales)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Comisión por apertura:</Text>
        <Text style={styles.summaryValue}>{formatCurrency(credito.comisionApertura)}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Pago mensual:</Text>
        <Text style={styles.highlightValue}>{formatCurrency(credito.pagoMensual)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Monto total a pagar:</Text>
        <Text style={styles.highlightValue}>{formatCurrency(credito.montoTotal)}</Text>
      </View>
    </View>
  );
};

// Componente principal del documento PDF - Cotizador Rápido
const QuickAmortizationPDF = ({ cotizacion }) => {
  const { cliente, vehiculo, credito, fecha, amortizationData = [] } = cotizacion;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Image style={styles.logo} src={logoCliquealo} />
          <Text style={styles.title}>Cotización de Crédito Automotriz</Text>
          <Text style={styles.subtitle}>Generado el: {formatDate(fecha || new Date())}</Text>
        </View>
        
        {/* Información del Cliente y Vehículo */}
        <View style={styles.infoRow}>
          <View style={[styles.infoColumn, { marginRight: 10 }]}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Información del Cliente</Text>
              <Text style={styles.infoValue}>Nombre: {cliente.nombre} {cliente.apellidos}</Text>
              {cliente.telefono && (
                <Text style={styles.infoValue}>Teléfono: {cliente.telefono}</Text>
              )}
              {cliente.email && (
                <Text style={styles.infoValue}>Email: {cliente.email}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.infoColumn}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Información del Vehículo</Text>
              <Text style={styles.infoValue}>
                {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
              </Text>
              <Text style={styles.infoValue}>Precio: {formatCurrency(vehiculo.precio)}</Text>
              {vehiculo.placas && (
                <Text style={styles.infoValue}>Placas: {vehiculo.placas}</Text>
              )}
            </View>
          </View>
        </View>
        
        {/* Resumen del Financiamiento */}
        <FinancingSummary credito={credito} vehiculo={vehiculo} />
        
        {/* Tabla de Amortización */}
        <AmortizationTable data={amortizationData} />
        
        {/* Pie de página */}
        <View style={styles.footer}>
          <Text style={styles.smallText}>Esta cotización es informativa y no constituye una oferta de crédito.</Text>
          <Text style={styles.smallText}>Las condiciones pueden variar según aprobación crediticia y políticas vigentes.</Text>
          <Text style={styles.smallText}>Generado por Cliquéalo.mx - Simulador de Crédito Automotriz</Text>
        </View>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} />
      </Page>
    </Document>
  );
};

// Componente principal del documento PDF - Cotizador Normal
const NormalAmortizationPDF = ({ data }) => {
  const { bank, client, vehicles, creditConfig, amortizationData = [] } = data;
  
  // Determinar la tasa de interés a utilizar (personalizada o del banco)
  const effectiveRate = creditConfig.useCustomRate ? creditConfig.customRate : bank.tasa;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Image style={styles.logo} src={logoCliquealo} />
          <Text style={styles.title}>Tabla de Amortización</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
            {bank.logo && typeof bank.logo !== 'string' && (
              <Image src={bank.logo} style={{ width: 20, height: 20, marginRight: 5 }} />
            )}
            <Text style={styles.subtitle}>
              Banco: {bank.nombre} | Generado el: {formatDate(new Date())}
            </Text>
          </View>
          
          {creditConfig.useCustomRate && (
            <Text style={styles.subtitle}>(Tasa personalizada: {formatPercentage(creditConfig.customRate)})</Text>
          )}
        </View>
        
        {/* Información del Cliente y Detalles del Crédito */}
        <View style={styles.infoRow}>
          <View style={[styles.infoColumn, { marginRight: 10 }]}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Información del Cliente</Text>
              {client && (
                <>
                  <Text style={styles.infoValue}>
                    Nombre: {client.nombre} {client.apellidos}
                  </Text>
                  {client.rfc && (
                    <Text style={styles.infoValue}>RFC: {client.rfc}</Text>
                  )}
                  {client.email && (
                    <Text style={styles.infoValue}>Email: {client.email}</Text>
                  )}
                </>
              )}
            </View>
          </View>
          
          <View style={styles.infoColumn}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Detalles del Crédito</Text>
              <Text style={styles.infoValue}>
                Monto financiado: {formatCurrency(creditConfig.financingAmount)}
              </Text>
              <Text style={styles.infoValue}>
                Plazo: {creditConfig.term} meses
              </Text>
              <Text style={styles.infoValue}>
                Tasa anual: {formatPercentage(effectiveRate)}
                {creditConfig.useCustomRate ? ' (Personalizada)' : ''}
              </Text>
              <Text style={styles.infoValue}>
                CAT: {creditConfig.useCustomCat 
                  ? formatPercentage(creditConfig.customCat)
                  : creditConfig.useCustomRate 
                    ? `~${formatPercentage(creditConfig.customRate * 1.3)}` // Estimación aproximada
                    : formatPercentage(bank.cat)
                }
              </Text>
            </View>
          </View>
        </View>
        
        {/* Resumen del Préstamo */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Resumen del Préstamo</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pago mensual:</Text>
            <Text style={styles.summaryValue}>
              {amortizationData.length > 0 
                ? formatCurrency(amortizationData[0].payment) 
                : formatCurrency(0)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total a pagar:</Text>
            <Text style={styles.summaryValue}>
              {amortizationData.length > 0 
                ? formatCurrency(amortizationData[0].payment * creditConfig.term)
                : formatCurrency(0)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total de intereses:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(
                amortizationData.length > 0
                  ? amortizationData.reduce((sum, row) => sum + row.interestPayment, 0)
                  : 0
              )}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Comisión por apertura:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency((creditConfig.financingAmount * bank.comision) / 100)}
            </Text>
          </View>
        </View>
        
        {/* Vehículos financiados (si hay) */}
        {vehicles && vehicles.length > 0 && (
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Vehículos financiados</Text>
            {vehicles.map((vehicle, index) => (
              <View key={index} style={index > 0 ? { marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#eee' } : {}}>
                <Text style={styles.infoValue}>
                  {vehicle.marca} {vehicle.modelo} {vehicle.año || 'N/A'}
                </Text>
                <Text style={styles.infoValue}>
                  Valor: {formatCurrency(vehicle.valor || 0)}
                </Text>
                {vehicle.descripcion && (
                  <Text style={styles.infoValue}>{vehicle.descripcion}</Text>
                )}
              </View>
            ))}
          </View>
        )}
        
        {/* Tabla de Amortización */}
        <AmortizationTable data={amortizationData} />
        
        {/* Pie de página */}
        <View style={styles.footer}>
          <Text style={styles.smallText}>Este documento es informativo y no representa un contrato de crédito oficial.</Text>
          <Text style={styles.smallText}>Consulta los términos y condiciones con {bank.nombre} antes de formalizar tu crédito.</Text>
          <Text style={styles.smallText}>Generado por Cliquéalo.mx - Simulador de Crédito Automotriz</Text>
        </View>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} />
      </Page>
    </Document>
  );
};

export { QuickAmortizationPDF, NormalAmortizationPDF };