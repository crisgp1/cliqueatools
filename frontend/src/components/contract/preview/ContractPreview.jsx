import { memo, useRef } from 'react';
import { IoDocumentOutline, IoPrintOutline, IoSaveOutline } from 'react-icons/io5';
import { formatCurrency } from '../utils/ContractUtils';

/**
 * Contract preview component
 * 
 * @param {Object} props
 * @param {Object} props.contractData - The contract form data
 * @param {Object} props.signatures - The signatures object
 * @param {Function} props.togglePreview - Function to toggle between form and preview
 * @param {Function} props.handleOpenSignatureWindow - Function to open signature window
 */
const ContractPreview = memo(({ 
  contractData, 
  signatures, 
  togglePreview,
  handleOpenSignatureWindow
}) => {
  const contractRef = useRef(null);

  // Imprimir contrato
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    // Write print-specific CSS and HTML content to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Contrato de Compraventa - Cliquéalo.mx</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @page { size: letter; margin: 2.5cm 3cm; }
            body {
              font-family: 'Poppins', sans-serif;
              line-height: 1.5;
              color: #333;
              background-color: white;
              font-size: 10pt;
            }
            /* Additional print styles would go here */
          </style>
        </head>
        <body>
          ${contractRef.current.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  };

  // Guardar como PDF (simulado)
  const handleSave = () => {
    // En una implementación real, utilizaríamos una biblioteca como jsPDF
    // o un endpoint del servidor para generar el PDF
    alert('Funcionalidad de guardar como PDF disponible próximamente');
  };

  return (
    <div className="bg-white p-6 border border-gray-300 shadow-md">
      <div ref={contractRef} className="contract-preview prose max-w-none">
        <h1 className="text-center text-2xl font-bold text-blue-800 mb-6">Cliquéalo.mx</h1>
        <h2 className="text-center text-xl font-bold text-blue-800 mb-4">Contrato de Compraventa de Vehículo</h2>

        <p className="mb-4">
          En la ciudad de <strong>{contractData.ciudad}</strong>, {contractData.estado && <><strong>{contractData.estado}</strong>,</>} siendo el día <strong>{contractData.fecha}</strong> y la hora <strong>{contractData.hora}</strong>
        </p>

        <div className="mb-6 border-b pb-4">
          <h3 className="text-lg font-bold text-blue-800 mb-2">Datos del Vendedor</h3>
          <p>
            <strong>COMERCIALIZADORA AUTOMOTRIZ CLIQUEALO DE MEXICO, S. DE R.L. DE C.V.</strong><br />
            Domicilio: <strong>SORGO 3923, COL. LA NOGALERA, GUADALAJARA, JALISCO, C.P. 44470</strong><br />
            RFC: <strong>CAC240628RQ1</strong><br />
            Teléfono: 33 5009 1643<br />
            Representante: <strong>RICARDO GARCIA RAMIREZ</strong>
          </p>
        </div>

        <div className="mb-6 border-b pb-4">
          <h3 className="text-lg font-bold text-blue-800 mb-2">Datos del Comprador</h3>
          <p>
            Nombre: <strong>{contractData.nombreComprador}</strong><br />
            Domicilio: <strong>{contractData.domicilioComprador}</strong>
            {contractData.colonia && <>, Col. <strong>{contractData.colonia}</strong></>}
            {contractData.ciudad && <>, <strong>{contractData.ciudad}</strong></>}
            {contractData.estado && <>, <strong>{contractData.estado}</strong></>}
            {contractData.codigoPostal && <>, C.P. <strong>{contractData.codigoPostal}</strong></>}<br />
            Teléfono: <strong>{contractData.telefonoComprador}</strong><br />
            Correo: <strong>{contractData.emailComprador}</strong><br />
            Identificación: <strong>{contractData.identificacionComprador}</strong> No. <strong>{contractData.numeroIdentificacion}</strong>
          </p>
        </div>

        <div className="mb-6 border-b pb-4">
          <h3 className="text-lg font-bold text-blue-800 mb-2">Datos del Vehículo</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md">
            <div>
              <p className="text-sm text-gray-600">Marca</p>
              <p className="font-semibold">{contractData.marca}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Modelo</p>
              <p className="font-semibold">{contractData.modelo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Color</p>
              <p className="font-semibold">{contractData.color}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tipo</p>
              <p className="font-semibold">{contractData.tipo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">No. Motor</p>
              <p className="font-semibold">{contractData.numeroMotor}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">No. Serie</p>
              <p className="font-semibold">{contractData.numeroSerie}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Placas</p>
              <p className="font-semibold">{contractData.placas}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">No. T. Circulación</p>
              <p className="font-semibold">{contractData.numeroCirculacion || 'No aplica'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">No. Factura</p>
              <p className="font-semibold">{contractData.numeroFactura}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Refrendos</p>
              <p className="font-semibold">{contractData.refrendos || 'No aplica'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Precio Total</p>
              <p className="font-semibold">{formatCurrency(contractData.precioTotal)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Forma de Pago</p>
              <p className="font-semibold">{contractData.formaPago}</p>
            </div>
          </div>
        </div>

        <div className="mb-6 border-b pb-4">
          <h3 className="text-lg font-bold text-blue-800 mb-2">Cláusulas</h3>
          <ol className="list-decimal list-inside pl-4">
            <li className="mb-2">
              <strong>EL VENDEDOR</strong> entrega en este acto al <strong>COMPRADOR</strong> los documentos correspondientes al automóvil arriba descrito.
            </li>
            <li className="mb-2">
              <strong>EL COMPRADOR</strong> declara haber revisado física, mecánica y documentalmente el vehículo, aceptándolo en las condiciones actuales de uso, por lo que reconoce que el vehículo se vende en el estado "tal como está", renunciando a cualquier reclamación posterior por defectos, vicios ocultos o fallas presentes o futuras.
            </li>
            <li className="mb-2">
              <strong>EL COMPRADOR</strong> paga al <strong>VENDEDOR</strong> la cantidad total de <strong>{formatCurrency(contractData.precioTotal)}</strong> ({contractData.precioTotalTexto || 'cantidad con letra'}) por concepto del precio total del vehículo mediante <strong>{contractData.formaPago}</strong>, sirviendo el presente documento como recibo por el pago total del vehículo.
            </li>
            <li className="mb-2">
              <strong>El VENDEDOR</strong> declara que a la fecha el vehículo está libre de adeudos, multas, gravámenes y responsabilidades. A partir de la firma del presente documento, <strong>EL COMPRADOR</strong> asume toda responsabilidad legal, civil, penal, administrativa, fiscal o de cualquier otra índole.
            </li>
            <li className="mb-2">
              En caso de disolución de este contrato por causas imputables a cualquiera de las partes, la parte responsable pagará como pena convencional el 10% del valor total, independientemente de los daños y perjuicios ocasionados.
            </li>
            <li className="mb-2">
              Para la interpretación y cumplimiento del presente contrato, las partes acuerdan someterse a: 1) Resolución amistosa mediante negociación directa, 2) Mediación ante el Instituto de Justicia Alternativa de Jalisco, 3) Jurisdicción de Tribunales de Guadalajara, Jalisco.
            </li>
            <li className="mb-2">
              <strong>DECLARACIONES FINALES:</strong> Las partes manifiestan que: 1) Han leído este documento, 2) Las observaciones adicionales son las únicas válidas, 3) El COMPRADOR ha verificado el vehículo y documentos, 4) No existen acuerdos diferentes a los establecidos, 5) No se aceptarán reclamaciones posteriores.
            </li>
          </ol>
        </div>

        {contractData.observaciones && (
          <div className="mb-6 border p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-bold text-blue-800 mb-2">Observaciones Adicionales</h3>
            <p>{contractData.observaciones}</p>
          </div>
        )}

        <p className="mb-8">
          Leído el presente contrato por las partes, y enteradas de su contenido, valor y alcance legal, manifiestan su conformidad y lo firman por duplicado.
        </p>

        <div className="flex justify-between mt-16 pt-6 border-t">
          <div className="w-5/12 text-center pt-2">
            {signatures.vendor ? (
              <div className="mb-4">
                <img src={signatures.vendor} alt="Firma del vendedor" className="h-16 mx-auto mb-2" />
                <button
                  onClick={() => handleOpenSignatureWindow('vendor')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Volver a firmar
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleOpenSignatureWindow('vendor')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-4"
              >
                Firmar como vendedor
              </button>
            )}
            <div className="border-t border-black pt-2">
              <p className="font-bold">COMERCIALIZADORA AUTOMOTRIZ CLIQUEALO DE MEXICO, S. DE R.L. DE C.V.</p>
            </div>
          </div>

          <div className="w-5/12 text-center pt-2">
            {signatures.buyer ? (
              <div className="mb-4">
                <img src={signatures.buyer} alt="Firma del comprador" className="h-16 mx-auto mb-2" />
                <button
                  onClick={() => handleOpenSignatureWindow('buyer')}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Volver a firmar
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleOpenSignatureWindow('buyer')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-4"
              >
                Firmar como comprador
              </button>
            )}
            <div className="border-t border-black pt-2">
              <p className="font-bold">EL COMPRADOR</p>
              <p>{contractData.nombreComprador}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t text-center text-gray-500 text-sm">
          <p>Contrato de Compraventa | Cliquéalo.mx | contacto@cliquealo.mx | Tel: 33 5009 1643</p>
          <p>SORGO 3923, COL. LA NOGALERA, GUADALAJARA, JALISCO, MÉXICO C.P. 44470</p>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={togglePreview}
          className="govuk-button govuk-button-secondary flex items-center"
        >
          <IoDocumentOutline className="h-5 w-5 mr-2" />
          Volver al Formulario
        </button>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handlePrint}
            className="govuk-button flex items-center"
          >
            <IoPrintOutline className="h-5 w-5 mr-2" />
            Imprimir
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="govuk-button flex items-center"
          >
            <IoSaveOutline className="h-5 w-5 mr-2" />
            Guardar como PDF
          </button>
        </div>
      </div>
    </div>
  );
});

export default ContractPreview;