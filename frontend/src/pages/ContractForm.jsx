import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoDocumentOutline, IoPrintOutline, IoSaveOutline, IoInformationCircleOutline, IoWarningOutline } from 'react-icons/io5';
import Modal from './Modal';
import CityStateSelector from '../components/common/CityStateSelector';

const ContractForm = ({ vehicles = [], client = {} }) => {
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
  const formattedTime = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

  const [contractData, setContractData] = useState({
    // Información general
    ciudad: '',
    estado: '',
    fecha: formattedDate,
    hora: formattedTime,

    // Información del comprador
    nombreComprador: client.nombre ? `${client.nombre} ${client.apellidos || ''}` : '',
    domicilioComprador: client.direccion || '',
    telefonoComprador: client.telefono || '',
    emailComprador: client.email || '',
    identificacionComprador: '',
    numeroIdentificacion: '',

    // Información del vehículo
    marca: vehicles.length > 0 ? vehicles[0].marca || '' : '',
    modelo: vehicles.length > 0 ? vehicles[0].modelo || '' : '',
    color: '',
    tipo: '',
    numeroMotor: '',
    numeroSerie: '',
    placas: '',
    numeroCirculacion: '',
    numeroFactura: '',
    refrendos: '',
    rfcVehiculo: '',

    // Información de pago
    precioTotal: vehicles.length > 0 ? vehicles[0].valor || 0 : 0,
    precioTotalTexto: '',
    formaPago: 'Transferencia bancaria',

    // Observaciones adicionales
    observaciones: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [showIdCopyModal, setShowIdCopyModal] = useState(false);
  const [showAddressProofModal, setShowAddressProofModal] = useState(false);
  const [idModalShown, setIdModalShown] = useState(false);
  const contractRef = useRef(null);

  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Convertir número a texto
  const numeroATexto = (numero) => {
    // Esta función es simplificada, idealmente usaríamos una biblioteca
    const unidades = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const decenas = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    // Simplificado para el propósito de este ejemplo
    return `${numero} pesos 00/100 M.N.`;
  };

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'precioTotal') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setContractData({
          ...contractData,
          [name]: numValue,
          precioTotalTexto: numeroATexto(numValue)
        });
      }
    } else {
      setContractData({
        ...contractData,
        [name]: value
      });
    }
  };

  // Lista de identificaciones comunes en México
  const identificacionesComunes = [
    "INE / Credencial de elector",
    "Pasaporte",
    "Cédula profesional",
    "Licencia de conducir",
    "Cartilla militar",
    "INAPAM",
    "Credencial de servicio médico",
    "Tarjeta de residencia (extranjeros)"
  ];

  // Seleccionar identificación del modal
  const handleSelectIdentification = (identificacion) => {
    setContractData({
      ...contractData,
      identificacionComprador: identificacion
    });
    setShowIdCopyModal(false);
  };

  // Mostrar modal de recordatorio de copia de ID
  const showIdCopyReminder = () => {
    if (!idModalShown) {
      setIdModalShown(true);
      setShowIdCopyModal(true);
    }
  };

  // Estado para las firmas
  const [signatureType, setSignatureType] = useState(''); // 'vendor' o 'buyer'
  const [signatures, setSignatures] = useState({
    vendor: null,
    buyer: null
  });

  // Referencias para el canvas de firma
  const signatureCanvasRef = useRef(null);
  const signatureWindowRef = useRef(null);

  // Mostrar modal de recordatorio de comprobante de domicilio
  const showAddressProofReminder = () => {
    setShowAddressProofModal(true);
  };

  // Verificar si la dirección está completa
  const checkAddressComplete = () => {
    if (!contractData.domicilioComprador || contractData.domicilioComprador.trim() === '') {
      showAddressProofReminder();
    }
  };

  // Manejar apertura de la ventana de firma
  const handleOpenSignatureWindow = (type) => {
    setSignatureType(type);

    // Calcular dimensiones y posición de la ventana
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    // Abrir una nueva ventana
    const signatureWindow = window.open(
      '',
      'signatureWindow',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    signatureWindowRef.current = signatureWindow;

    // Escribir el contenido HTML de la ventana
    signatureWindow.document.write(`
      <html>
        <head>
          <title>Firma ${type === 'vendor' ? 'del Vendedor' : 'del Comprador'}</title>
          <style>
            body {
              font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              height: 100vh;
              box-sizing: border-box;
              background-color: #f9fafb;
            }
            h2 {
              margin-top: 0;
              color: #01549b;
              border-bottom: 2px solid #01549b;
              padding-bottom: 8px;
            }
            .canvas-container {
              flex: 1;
              background-color: white;
              border: 1px solid #ddd;
              border-radius: 4px;
              margin-bottom: 16px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            canvas {
              border: 1px solid #eee;
              background-color: white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .actions {
              display: flex;
              justify-content: flex-end;
              gap: 8px;
            }
            button {
              padding: 8px 16px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: 500;
              font-size: 14px;
              transition: background-color 0.2s;
            }
            .save-btn {
              background-color: #01549b;
              color: white;
            }
            .save-btn:hover {
              background-color: #014785;
            }
            .clear-btn {
              background-color: #f3f4f6;
              color: #1f2937;
            }
            .clear-btn:hover {
              background-color: #e5e7eb;
            }
            .instructions {
              margin-bottom: 16px;
              color: #4b5563;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <h2>Firma ${type === 'vendor' ? 'del Vendedor' : 'del Comprador'}</h2>
          <p class="instructions">Dibuje su firma dentro del recuadro usando el mouse o su dedo en dispositivos táctiles.</p>
          <div class="canvas-container">
            <canvas id="signatureCanvas" width="500" height="200"></canvas>
          </div>
          <div class="actions">
            <button class="clear-btn" id="clearButton">Limpiar</button>
            <button class="save-btn" id="saveButton">Guardar Firma</button>
          </div>
          
          <script>
            // Inicializar el canvas
            const canvas = document.getElementById('signatureCanvas');
            const ctx = canvas.getContext('2d');
            
            // Configurar propiedades del trazo
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000';
            
            // Variables para el dibujo
            let isDrawing = false;
            let lastX = 0;
            let lastY = 0;
            
            // Función para comenzar a dibujar
            function startDrawing(e) {
              isDrawing = true;
              
              // Obtener posición relativa al canvas
              const rect = canvas.getBoundingClientRect();
              [lastX, lastY] = [
                e.clientX - rect.left, 
                e.clientY - rect.top
              ];
            }
            
            // Función para dibujar
            function draw(e) {
              if (!isDrawing) return;
              
              // Obtener posición relativa al canvas
              const rect = canvas.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              
              // Dibujar línea
              ctx.beginPath();
              ctx.moveTo(lastX, lastY);
              ctx.lineTo(x, y);
              ctx.stroke();
              
              // Actualizar última posición
              [lastX, lastY] = [x, y];
            }
            
            // Función para dejar de dibujar
            function stopDrawing() {
              isDrawing = false;
            }
            
            // Eventos táctiles para dispositivos móviles
            function touchStart(e) {
              e.preventDefault();
              const touch = e.touches[0];
              const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
              });
              canvas.dispatchEvent(mouseEvent);
            }
            
            function touchMove(e) {
              e.preventDefault();
              const touch = e.touches[0];
              const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
              });
              canvas.dispatchEvent(mouseEvent);
            }
            
            function touchEnd(e) {
              e.preventDefault();
              const mouseEvent = new MouseEvent('mouseup', {});
              canvas.dispatchEvent(mouseEvent);
            }
            
            // Función para limpiar el canvas
            function clearCanvas() {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            
            // Función para guardar la firma
            function saveSignature() {
              // Obtener la imagen como data URL
              const signatureImage = canvas.toDataURL('image/png');
              
              // Enviar la imagen a la ventana principal
              window.opener.postMessage({ 
                type: 'signature', 
                signatureType: '${type}', 
                image: signatureImage 
              }, '*');
              
              // Cerrar esta ventana
              window.close();
            }
            
            // Agregar eventos al canvas
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
            
            // Agregar eventos táctiles
            canvas.addEventListener('touchstart', touchStart);
            canvas.addEventListener('touchmove', touchMove);
            canvas.addEventListener('touchend', touchEnd);
            
            // Botones de acción
            document.getElementById('clearButton').addEventListener('click', clearCanvas);
            document.getElementById('saveButton').addEventListener('click', saveSignature);
          </script>
        </body>
      </html>
    `);

    signatureWindow.document.close();
  };

  // Efecto para recibir mensajes de la ventana de firma
  useEffect(() => {
    const handleMessage = (event) => {
      // Verificar que el mensaje sea del tipo correcto
      if (event.data && event.data.type === 'signature') {
        // Actualizar el estado con la nueva firma
        setSignatures({
          ...signatures,
          [event.data.signatureType]: event.data.image
        });
      }
    };

    // Agregar listener para mensajes
    window.addEventListener('message', handleMessage);

    // Limpiar listener al desmontar
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [signatures]);

  // Imprimir contrato
  const handlePrint = () => {
    const content = contractRef.current;
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <html>
        <head>
          <title>Contrato de Compraventa - Cliquéalo.mx</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: letter;
              margin: 2.5cm 3cm;
            }
            body {
              font-family: 'Poppins', sans-serif;
              line-height: 1.5;
              color: #333;
              margin: 0;
              padding: 50;
              background-color: white;
              position: relative;
              font-size: 10pt;
            }
            .contract-container {
              max-width: 100%;
              margin: 0 auto;
              padding: 0 25px;
              position: relative;
            }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 120px;
              color: rgba(1, 84, 155, 0.03);
              z-index: -1;
              white-space: nowrap;
            }
            .header {
              text-align: center;
              padding-bottom: 15px;
              border-bottom: 2px solid #01549b;
              margin-bottom: 20px;
            }
            .logo {
              width: 160px;
              margin-bottom: 10px;
            }
            h1 {
              font-size: 18pt;
              text-align: center;
              color: #01549b;
              margin: 0 0 5px 0;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            h2 {
              font-size: 14pt;
              color: #01549b;
              margin-top: 20px;
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 1px solid #ddd;
            }
            .subtitle {
              font-size: 10pt;
              text-align: center;
              color: #666;
              margin-top: 0;
              margin-bottom: 15px;
            }
            .section {
              margin-bottom: 12px;
              page-break-inside: avoid;
            }
            .section-title {
  font-weight: 700;
  margin-bottom: 8px;
  color: #01549b;
  font-size: 11pt;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
  .clauses-section .section-title {
  margin-top: 150px; /* Increased to place clauses section further down */
  padding-top: 25px;
}

            p {
              margin-bottom: 8px;
              text-align: justify;
              font-size: 10pt;
            }
             
            strong {
              font-weight: 600;
            }
            .vehicle-info {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              margin: 12px 0;
              padding: 15px;
              background-color: #f9fbff;
              border: 1px solid #e9eeff;
              border-radius: 8px;
            }
            .vehicle-info-item {
              margin-bottom: 8px;
            }
            .vehicle-info-label {
              font-weight: 600;
              color: #01549b;
              margin-bottom: 2px;
              font-size: 9pt;
              text-transform: uppercase;
            }
            .vehicle-info-value {
              font-size: 10pt;
            }
            .clauses {
              counter-reset: clause;
              column-count: 2;
              column-gap: 30px;
              margin: 0 auto;
            }
            .clause {
              margin-bottom: 12px;
              position: relative;
              padding-left: 20px;
              break-inside: avoid;
            }
            .clause::before {
              counter-increment: clause;
              content: counter(clause, upper-roman) ".";
              font-weight: 700;
              color: #01549b;
              position: absolute;
              left: 0;
              margin-bottom: 3px;
              display: block;
            }
            ol {
              padding-left: 20px;
              margin: 8px 0;
            }
            ol li {
              margin-bottom: 4px;
              font-size: 9.5pt;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 9.5pt;
              border-radius: 6px;
              overflow: hidden;
            }
            table, th, td {
              border: 1px solid #ddd;
            }
            th {
              background-color: #f2f8ff;
              font-weight: 600;
              color: #01549b;
            }
            th, td {
              padding: 8px;
              text-align: left;
            }
            .observations {
              margin: 15px 0;
              padding: 12px;
              background-color: #f9fbff;
              border-left: 4px solid #01549b;
              font-style: italic;
              font-size: 9.5pt;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 20px;
              page-break-inside: avoid;
            }
            .signature {
              width: 45%;
            }
            .signature-line {
              border-top: 1px solid black;
              margin-top: 40px;
              padding-top: 8px;
              text-align: center;
            }
            .signature-image {
              height: 50px;
              margin: 0 auto;
              display: block;
              margin-bottom: 10px;
            }
            .signature-name {
              font-weight: 600;
              font-size: 9pt;
            }
            .signature-title {
              font-size: 8pt;
              color: #666;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 8pt;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            .page-number:after {
              content: counter(page);
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="contract-container">
            <div class="watermark">CLIQUÉALO.MX</div>
            <div class="header">
              <img src="data:image/png;base64,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" class="logo" alt="Cliquéalo.mx">
              <h1>Contrato de Compraventa de Vehículo</h1>
              <p class="subtitle">Documento Legalmente Vinculante</p>
            </div>

            <div class="section">
              <p>
                En la ciudad de <strong>${contractData.ciudad}</strong> siendo el día <strong>${contractData.fecha}</strong> a las <strong>${contractData.hora}</strong> horas.
              </p>
            </div>

            <div class="section">
              <div class="section-title">REUNIDOS</div>
              <p>
                <strong>Por una parte, EL VENDEDOR:</strong> la sociedad mercantil <strong>COMERCIALIZADORA AUTOMOTRIZ CLIQUEALO DE MEXICO, S. DE R.L. DE C.V.</strong>, con domicilio fiscal en <strong>SORGO 3923, COL. LA NOGALERA, GUADALAJARA, JALISCO, C.P. 44470</strong> con RFC <strong>CAC240628RQ1</strong>, con número de teléfono 33 5009 1643, representada en este acto por <strong>RICARDO GARCIA RAMIREZ</strong>, facultado para ejecutar operaciones de compraventa.
              </p>
              
              <table>
                <tr>
                  <th colspan="2"><strong>DATOS DEL COMPRADOR</strong></th>
                </tr>
                <tr>
                  <th width="40%">Nombre:</th>
                  <td><strong>${contractData.nombreComprador}</strong></td>
                </tr>
                <tr>
                  <th>Domicilio:</th>
                  <td><strong>${contractData.domicilioComprador}</strong></td>
                </tr>
                <tr>
                  <th>Contacto:</th>
                  <td>Tel: <strong>${contractData.telefonoComprador}</strong> | Email: <strong>${contractData.emailComprador}</strong></td>
                </tr>
                <tr>
                  <th>Identificación:</th>
                  <td><strong>${contractData.identificacionComprador}</strong> No. <strong>${contractData.numeroIdentificacion}</strong></td>
                </tr>
              </table>
            </div>

            <div class="section">
              <div class="section-title">VEHÍCULO OBJETO DE COMPRAVENTA</div>
              
              <div class="vehicle-info">
                <div class="vehicle-info-item">
                  <div class="vehicle-info-label">Marca</div>
                  <div class="vehicle-info-value">${contractData.marca}</div>
                </div>
                <div class="vehicle-info-item">
                  <div class="vehicle-info-label">Modelo</div>
                  <div class="vehicle-info-value">${contractData.modelo}</div>
                </div>
                <div class="vehicle-info-item">
                  <div class="vehicle-info-label">Color</div>
                  <div class="vehicle-info-value">${contractData.color}</div>
                </div>
                <div class="vehicle-info-item">
                  <div class="vehicle-info-label">Tipo</div>
                  <div class="vehicle-info-value">${contractData.tipo}</div>
                </div>
                <div class="vehicle-info-item">
                  <div class="vehicle-info-label">No. Motor</div>
                  <div class="vehicle-info-value">${contractData.numeroMotor}</div>
                </div>
                <div class="vehicle-info-item">
                  <div class="vehicle-info-label">No. Serie</div>
                  <div class="vehicle-info-value">${contractData.numeroSerie}</div>
                </div>
                <div class="vehicle-info-item">
                  <div class="vehicle-info-label">Placas</div>
                  <div class="vehicle-info-value">${contractData.placas}</div>
                </div>
                <div class="vehicle-info-item">
                  <div class="vehicle-info-label">T. Circulación</div>
                  <div class="vehicle-info-value">${contractData.numeroCirculacion || 'No aplica'}</div>
                </div>
                <div class="vehicle-info-item">
                  <div class="vehicle-info-label">No. Factura</div>
                  <div class="vehicle-info-value">${contractData.numeroFactura}</div>
                </div>
                <div class="vehicle-info-item">
                  <div class="vehicle-info-label">Refrendos</div>
                  <div class="vehicle-info-value">${contractData.refrendos || 'No aplica'}</div>
                </div>
                <div class="vehicle-info-item">
                  <div class="vehicle-info-label">Precio Total</div>
                  <div class="vehicle-info-value"><strong>${formatCurrency(contractData.precioTotal)}</strong></div>
                </div>
                <div class="vehicle-info-item">
                  <div class="vehicle-info-label">Forma de Pago</div>
                  <div class="vehicle-info-value">${contractData.formaPago}</div>
                </div>
              </div>
            </div>

            <div class="section clauses-section">
            
              <div class="section-title">CLÁUSULAS</div>
              
              <div class="clauses">
                <div class="clause">
                  <p><strong>EL VENDEDOR</strong> entrega en este acto al <strong>COMPRADOR</strong> los documentos correspondientes al automóvil arriba descrito.</p>
                </div>
                
                <div class="clause">
                  <p><strong>EL COMPRADOR</strong> declara haber revisado física, mecánica y documentalmente el vehículo, aceptándolo en las condiciones actuales de uso, por lo que reconoce que el vehículo se vende en el estado "tal como está", renunciando a cualquier reclamación posterior por defectos, vicios ocultos o fallas presentes o futuras.</p>
                </div>
                
                <div class="clause">
                  <p><strong>EL COMPRADOR</strong> paga al <strong>VENDEDOR</strong> la cantidad total de <strong>${formatCurrency(contractData.precioTotal)}</strong> (<strong>${contractData.precioTotalTexto || 'cantidad con letra'}</strong>) por concepto del precio total del vehículo mediante <strong>${contractData.formaPago}</strong>, sirviendo el presente documento como recibo por el pago total del vehículo.</p>
                </div>
                
                <div class="clause">
                  <p><strong>El VENDEDOR</strong> declara que a la fecha el vehículo está libre de adeudos, multas, gravámenes y responsabilidades. A partir de la firma del presente documento, <strong>EL COMPRADOR</strong> asume toda responsabilidad legal, civil, penal, administrativa, fiscal o de cualquier otra índole.</p>
                </div>
                
                <div class="clause">
                  <p>En caso de disolución de este contrato por causas imputables a cualquiera de las partes, la parte responsable pagará como pena convencional el 10% del valor total, independientemente de los daños y perjuicios ocasionados.</p>
                </div>
                
                <div class="clause">
                  <p>Para la interpretación y cumplimiento del presente contrato, las partes acuerdan someterse a: 1) Resolución amistosa mediante negociación directa, 2) Mediación ante el Instituto de Justicia Alternativa de Jalisco, 3) Jurisdicción de Tribunales de Guadalajara, Jalisco.</p>
                </div>
                
                <div class="clause">
                  <p><strong>DECLARACIONES FINALES:</strong> Las partes manifiestan que: 1) Han leído este documento, 2) Las observaciones adicionales son las únicas válidas, 3) El COMPRADOR ha verificado el vehículo y documentos, 4) No existen acuerdos diferentes a los establecidos, 5) No se aceptarán reclamaciones posteriores.</p>
                </div>
              </div>
            </div>

            ${contractData.observaciones ? `
            <div class="section">
              <div class="section-title">OBSERVACIONES ADICIONALES</div>
              <div class="observations">
                <p>${contractData.observaciones}</p>
              </div>
            </div>
            ` : ''}

            <div class="section">
              <p>Leído el presente contrato por las partes, y enteradas de su contenido, valor y alcance legal, manifiestan su conformidad y lo firman por duplicado.</p>
            </div>

            <div class="signatures">
              <div class="signature">
                <div class="signature-line">
                  ${signatures.vendor ? `<img src="${signatures.vendor}" class="signature-image" alt="Firma del vendedor">` : ''}
                  <p class="signature-name">RICARDO GARCIA RAMIREZ</p>
                  <p class="signature-title">EL VENDEDOR</p>
                </div>
              </div>
              
              <div class="signature">
                <div class="signature-line">
                  ${signatures.buyer ? `<img src="${signatures.buyer}" class="signature-image" alt="Firma del comprador">` : ''}
                  <p class="signature-name">${contractData.nombreComprador}</p>
                  <p class="signature-title">EL COMPRADOR</p>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>Contrato de Compraventa | Cliquéalo.mx | contacto@cliquealo.mx | Tel: 33 5009 1643</p>
              <p>SORGO 3923, COL. LA NOGALERA, GUADALAJARA, JALISCO, MÉXICO C.P. 44470</p>
            </div>
          </div>
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

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Variantes de animación
  const formAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 20 }
    }
  };

  // Renderizar formulario de edición
  const renderForm = () => (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={formAnimation}
    >
      <div className="govuk-form-section">
        <h3 className="govuk-form-section-title">Información General</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Reemplazado input de ciudad con el selector de estados y ciudades */}
          <motion.div className="govuk-form-group md:col-span-2" variants={itemAnimation}>
            <CityStateSelector 
              selectedState={contractData.estado}
              selectedCity={contractData.ciudad}
              onChange={({ state, city }) => {
                setContractData({
                  ...contractData,
                  estado: state,
                  ciudad: city
                });
              }}
              stateLabel="Estado"
              cityLabel="Ciudad"
              required={true}
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="fecha" className="govuk-label">
              Fecha <span className="text-royal-red">*</span>
            </label>
            <input
              type="text"
              id="fecha"
              name="fecha"
              value={contractData.fecha}
              onChange={handleChange}
              className="govuk-input"
              placeholder="DD/MM/AAAA"
              required
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="hora" className="govuk-label">
              Hora <span className="text-royal-red">*</span>
            </label>
            <input
              type="text"
              id="hora"
              name="hora"
              value={contractData.hora}
              onChange={handleChange}
              className="govuk-input"
              placeholder="HH:MM"
              required
            />
          </motion.div>
        </div>
      </div>

      <div className="govuk-form-section">
        <h3 className="govuk-form-section-title">Información del Comprador</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="nombreComprador" className="govuk-label">
              Nombre o Razón Social <span className="text-royal-red">*</span>
            </label>
            <input
              type="text"
              id="nombreComprador"
              name="nombreComprador"
              value={contractData.nombreComprador}
              onChange={handleChange}
              className="govuk-input"
              required
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="domicilioComprador" className="govuk-label">
              Domicilio <span className="text-royal-red">*</span>
            </label>
            <input
              type="text"
              id="domicilioComprador"
              name="domicilioComprador"
              value={contractData.domicilioComprador}
              onChange={handleChange}
              className="govuk-input"
              required
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="telefonoComprador" className="govuk-label">
              Teléfono <span className="text-royal-red">*</span>
            </label>
            <input
              type="text"
              id="telefonoComprador"
              name="telefonoComprador"
              value={contractData.telefonoComprador}
              onChange={handleChange}
              className="govuk-input"
              required
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="emailComprador" className="govuk-label">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="emailComprador"
              name="emailComprador"
              value={contractData.emailComprador}
              onChange={handleChange}
              className="govuk-input"
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="identificacionComprador" className="govuk-label">
              Tipo de Identificación <span className="text-royal-red">*</span>
            </label>
            <input
              type="text"
              id="identificacionComprador"
              name="identificacionComprador"
              value={contractData.identificacionComprador}
              onChange={handleChange}
              className="govuk-input"
              placeholder="INE, Pasaporte, etc."
              required
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="numeroIdentificacion" className="govuk-label">
              Número de Identificación <span className="text-royal-red">*</span>
            </label>
            <input
              type="text"
              id="numeroIdentificacion"
              name="numeroIdentificacion"
              value={contractData.numeroIdentificacion}
              onChange={handleChange}
              className="govuk-input"
              required
            />
          </motion.div>
        </div>
      </div>

      <div className="govuk-form-section">
        <h3 className="govuk-form-section-title">Información del Vehículo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="marca" className="govuk-label">
              Marca <span className="text-royal-red">*</span>
            </label>
            <input
              type="text"
              id="marca"
              name="marca"
              value={contractData.marca}
              onChange={handleChange}
              className="govuk-input"
              required
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="modelo" className="govuk-label">
              Modelo <span className="text-royal-red">*</span>
            </label>
            <input
              type="text"
              id="modelo"
              name="modelo"
              value={contractData.modelo}
              onChange={handleChange}
              className="govuk-input"
              required
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="color" className="govuk-label">
              Color <span className="text-royal-red">*</span>
            </label>
            <input
              type="text"
              id="color"
              name="color"
              value={contractData.color}
              onChange={handleChange}
              className="govuk-input"
              required
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="tipo" className="govuk-label">
              Tipo <span className="text-royal-red">*</span>
            </label>
            <input
              type="text"
              id="tipo"
              name="tipo"
              value={contractData.tipo}
              onChange={handleChange}
              className="govuk-input"
              required
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="numeroMotor" className="govuk-label">
              Número de Motor <span className="text-royal-red">*</span>
            </label>
            <input
              type="text"
              id="numeroMotor"
              name="numeroMotor"
              value={contractData.numeroMotor}
              onChange={handleChange}
              className="govuk-input"
              required
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="numeroSerie" className="govuk-label">
              Número de Serie <span className="text-royal-red">*</span>
            </label>
            <input
              type="text"
              id="numeroSerie"
              name="numeroSerie"
              value={contractData.numeroSerie}
              onChange={handleChange}
              className="govuk-input"
              required
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="placas" className="govuk-label">
              Placas <span className="text-royal-red">*</span>
            </label>
            <input
              type="text"
              id="placas"
              name="placas"
              value={contractData.placas}
              onChange={handleChange}
              className="govuk-input"
              required
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="numeroCirculacion" className="govuk-label">
              No. T. Circulación (Si aplica)
            </label>
            <input
              type="text"
              id="numeroCirculacion"
              name="numeroCirculacion"
              value={contractData.numeroCirculacion}
              onChange={handleChange}
              className="govuk-input"
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="numeroFactura" className="govuk-label">
              No. Factura <span className="text-royal-red">*</span>
            </label>
            <input
              type="text"
              id="numeroFactura"
              name="numeroFactura"
              value={contractData.numeroFactura}
              onChange={handleChange}
              className="govuk-input"
              required
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="refrendos" className="govuk-label">
              Refrendos
            </label>
            <input
              type="text"
              id="refrendos"
              name="refrendos"
              value={contractData.refrendos}
              onChange={handleChange}
              className="govuk-input"
            />
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="rfcVehiculo" className="govuk-label">
              RFC (Si aplica)
            </label>
            <input
              type="text"
              id="rfcVehiculo"
              name="rfcVehiculo"
              value={contractData.rfcVehiculo}
              onChange={handleChange}
              className="govuk-input"
            />
          </motion.div>
        </div>
      </div>

      <div className="govuk-form-section">
        <h3 className="govuk-form-section-title">Información de Pago</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="precioTotal" className="govuk-label">
              Precio Total <span className="text-royal-red">*</span>
            </label>
            <div className="relative">
              <div className="govuk-input-prefix">$</div>
              <input
                type="number"
                id="precioTotal"
                name="precioTotal"
                value={contractData.precioTotal}
                onChange={handleChange}
                className="govuk-input govuk-input-with-prefix text-right"
                required
              />
            </div>
            <div className="text-sm mt-1 text-gray-600">
              {formatCurrency(contractData.precioTotal)}
            </div>
          </motion.div>

          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="formaPago" className="govuk-label">
              Forma de Pago <span className="text-royal-red">*</span>
            </label>
            <select
              id="formaPago"
              name="formaPago"
              value={contractData.formaPago}
              onChange={handleChange}
              className="govuk-input"
              required
            >
              <option value="Transferencia bancaria">Transferencia bancaria</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Cheque">Cheque</option>
              <option value="Tarjeta de crédito">Tarjeta de crédito</option>
              <option value="Tarjeta de débito">Tarjeta de débito</option>
            </select>
          </motion.div>
        </div>
      </div>

      <div className="govuk-form-section">
        <h3 className="govuk-form-section-title">Observaciones Adicionales</h3>
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <textarea
            id="observaciones"
            name="observaciones"
            value={contractData.observaciones}
            onChange={handleChange}
            className="govuk-textarea"
            rows="3"
          ></textarea>
        </motion.div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={togglePreview}
          className="govuk-button govuk-button-secondary flex items-center"
        >
          <IoDocumentOutline className="h-5 w-5 mr-2" />
          {showPreview ? 'Volver al Formulario' : 'Vista Previa'}
        </button>

        {showPreview && (
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
        )}
      </div>
    </motion.div>
  );

  // Renderizar vista previa del contrato
  const renderContractPreview = () => (
    <div className="bg-white p-6 border border-gray-300 shadow-md">
      <div ref={contractRef} className="contract-preview prose max-w-none">
        <h1 className="text-center text-2xl font-bold text-blue-800 mb-6">Cliquéalo.mx</h1>

        <p className="mb-4">
          En la ciudad de <strong>{contractData.ciudad}</strong> siendo el día <strong>{contractData.fecha}</strong> y la hora <strong>{contractData.hora}</strong>
        </p>

        <p className="mb-4">
          Reunidos por una parte en calidad de <strong>EL VENDEDOR</strong> la sociedad mercantil <strong>COMERCIALIZADORA AUTOMOTRIZ CLIQUEALO DE MEXICO, SOCIEDAD DE RESPONSABILIDAD LIMITADA DE CAPITAL VARIABLE</strong>, con domicilio fiscal en <strong>SORGO 3923, COL. LA NOGALERA, GUADALAJARA, JALISCO, MÉXICO</strong>, <strong>C.P. 44470</strong> con RFC <strong>CAC240628RQ1</strong>, con número de teléfono 33 5009 1643 y correo electrónico <a href="mailto:contacto@cliquealo.mx">contacto@cliquealo.mx</a>, representada en este acto por <strong>RICARDO GARCIA RAMIREZ</strong>, quien está debidamente acreditado y facultado para ejecutar operaciones de compraventa, siendo el objeto social de la empresa la compraventa, comercialización, consignación y distribución de vehículos automotores seminuevos y usados, incluyendo automóviles, camionetas y camiones, manifestando bajo protesta de decir verdad que dichas facultades no le han sido revocadas ni modificadas en forma alguna.
        </p>

        <p className="mb-4">
          <strong>y por otra parte el comprador</strong>
        </p>

        <p className="mb-4">
          Nombre o razón social <strong>{contractData.nombreComprador}</strong>
        </p>

        <p className="mb-4">
          y con domicilio en <strong>{contractData.domicilioComprador}</strong>
        </p>

        <p className="mb-4">
          y con número de teléfono <strong>{contractData.telefonoComprador}</strong>
        </p>

        <p className="mb-4">
          y correo electrónico <strong>{contractData.emailComprador}</strong>
        </p>

        <p className="mb-4">
          <strong>Celebramos una carta responsiva, al tenor de las siguientes cláusulas:</strong>
        </p>

        <p className="mb-4">
          <strong>1.- PRIMERA. EL VENDEDOR</strong> entrega en este acto al <strong>COMPRADOR</strong> los documentos correspondientes al automóvil que a continuación se describe.
        </p>

        <div className="grid grid-cols-2 gap-4 my-6">
          <div>
            <p><strong>MARCA</strong><br />{contractData.marca}</p>
          </div>
          <div>
            <p><strong>NO. DE MOTOR</strong><br />{contractData.numeroMotor}</p>
          </div>
          <div>
            <p><strong>COLOR</strong><br />{contractData.color}</p>
          </div>
          <div>
            <p><strong>TIPO</strong><br />{contractData.tipo}</p>
          </div>
          <div>
            <p><strong>NO. FACTURA</strong><br />{contractData.numeroFactura}</p>
          </div>
          <div>
            <p><strong>MODELO</strong><br />{contractData.modelo}</p>
          </div>
          <div>
            <p><strong>NO. DE SERIE</strong><br />{contractData.numeroSerie}</p>
          </div>
          <div>
            <p><strong>PLACAS</strong><br />{contractData.placas}</p>
          </div>
          <div>
            <p><strong>NO. T. CIRCU. (SI APLICA)</strong><br />{contractData.numeroCirculacion}</p>
          </div>
          <div>
            <p><strong>REFRENDOS</strong><br />{contractData.refrendos}</p>
          </div>
          <div>
            <p><strong>RFC (si aplica)</strong><br />{contractData.rfcVehiculo}</p>
          </div>
          <div>
            <p>y que se identifica con <strong>{contractData.identificacionComprador}</strong></p>
          </div>
          <div>
            <p>número de identificación <strong>{contractData.numeroIdentificacion}</strong></p>
          </div>
        </div>

        <p className="mb-4">
          <strong>2.- SEGUNDA. EL COMPRADOR</strong> declara haber revisado física, mecánica y documentalmente el vehículo por cuenta propia y/o a través de su mecánico o perito de confianza presente durante la revisión física del vehículo, aceptándolo en las condiciones actuales de uso, por lo que reconoce que el vehículo se vende en el estado "tal como está" ("as is"), renunciando expresamente a cualquier reclamación posterior por defectos, vicios ocultos o fallas presentes o futuras. <strong>EL COMPRADOR</strong> reconoce que se le otorgó el tiempo suficiente para realizar la revisión exhaustiva del vehículo en el lugar de la compraventa con el personal técnico o peritos de su elección, manifestando su conformidad con el estado actual del vehículo en todos sus aspectos, por lo que no se aceptará ningún reclamo posterior a la firma del presente contrato.
        </p>

        <p className="mb-4">
          <strong>3.- TERCERA. EL COMPRADOR</strong> paga al <strong>VENDEDOR</strong>, de común acuerdo, la cantidad total de {formatCurrency(contractData.precioTotal)} ({contractData.precioTotalTexto || 'cantidad con letra'}) por concepto del precio total del vehículo. El pago se realiza mediante {contractData.formaPago}, sirviendo el presente documento como el recibo más amplio que en derecho proceda por el pago total del vehículo. Las partes acuerdan que no existen pagos pendientes ni compromisos económicos adicionales entre ellas.
        </p>

        <p className="mb-4">
          <strong>4.- CUARTA. El VENDEDOR</strong> declara bajo protesta de decir verdad que hasta la fecha y hora de firma del presente documento, el vehículo está libre de adeudos, multas, gravámenes y responsabilidades tanto civiles como penales o de tránsito. A partir del momento de la firma del presente documento y la entrega física del vehículo, <strong>EL COMPRADOR</strong> asume toda responsabilidad legal, civil, penal, administrativa, fiscal o de cualquier otra índole que se derive del uso, posesión y propiedad del vehículo, liberando al <strong>VENDEDOR</strong> de cualquier responsabilidad futura. <strong>El COMPRADOR</strong> será responsable incluso de aquellas infracciones o situaciones que, habiendo ocurrido después de la firma, llegaran a ser notificadas al <strong>VENDEDOR</strong>.
        </p>

        <p className="mb-4">
          <strong>5.- QUINTA.</strong> En caso de disolución del presente contrato por causas imputables a cualquiera de las partes, la parte responsable deberá pagar como pena convencional el diez por ciento (10%) del valor total de la operación, independientemente de los daños y perjuicios que se pudieran ocasionar. Esta penalización deberá ser cubierta en un plazo no mayor a cinco días hábiles a partir de la notificación de disolución del contrato. Una vez cubierta dicha penalización, las partes renuncian a cualquier acción legal adicional.
        </p>

        <p className="mb-4">
          <strong>6.- SEXTA.</strong> Para la interpretación, cumplimiento y ejecución del presente contrato, las partes expresamente acuerdan someterse a los siguientes procedimientos y jurisdicción:
        </p>

        <ol className="list-decimal list-inside mb-4 pl-4">
          <li>Resolución amistosa mediante negociación directa y de buena fe como primera instancia.</li>
          <li>Mediación ante el Instituto de Justicia Alternativa con sede en <strong>Enrique Diaz de León Norte 316 Colonia Villaseñor , C.P. 44200, Guadalajara, Jalisco.</strong></li>
          <li>En última instancia, se someten expresamente a la jurisdicción de los Tribunales competentes de la ciudad de Guadalajara, Jalisco, renunciando a cualquier otro fuero que por razón de sus domicilios presentes o futuros pudiera corresponderles.</li>
        </ol>

        <p className="mb-4">
          <strong>7.- SEPTIMA. DESLINDE DE RESPONSABILIDADES Y DECLARACIONES FINALES:</strong> Las partes manifiestan que:
        </p>

        <ol className="list-decimal list-inside mb-6 pl-4">
          <li>Han leído y comprendido en su totalidad el presente documento.</li>
          <li>Las observaciones adicionales anotadas son las únicas existentes y válidas.</li>
          <li><strong>El COMPRADOR</strong> ha verificado físicamente el vehículo y todos los documentos.</li>
          <li>No existen acuerdos verbales o escritos diferentes a los aquí establecidos.</li>
          <li>Cualquier acuerdo no incluido en este documento se considera nulo.</li>
          <li>No se aceptarán reclamaciones posteriores sobre el estado del vehículo o documentación.</li>
        </ol>

        {contractData.observaciones && (
          <div className="mb-6 border p-4 bg-gray-50">
            <p className="font-bold">OBSERVACIONES ADICIONALES:</p>
            <p>{contractData.observaciones}</p>
          </div>
        )}

        <p className="mb-10">
          Leído que fue el presente contrato por las partes, y enteradas de su contenido, valor y alcance legal, manifestando su total conformidad con el mismo, lo firman por duplicado al margen izquierdo y al calce en cada una de sus hojas para constancia.
        </p>

        <div className="flex justify-between mt-20 pt-10">
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
              <p className="font-bold">COMERCIALIZADORA AUTOMOTRIZ CLIQUEALO DE MEXICO, SOCIEDAD DE RESPONSABILIDAD LIMITADA DE CAPITAL VARIABLE</p>
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

  // Componente Modal de Firma
  const renderSignatureModal = () => (
    signatureModalOpen && (
      <div className="signature-modal-overlay">
        <div className="signature-modal">
          <div className="signature-modal-header">
            <h4 className="text-xl font-bold text-primary">
              {signatureType === 'vendor' ? 'Firma del Vendedor' : 'Firma del Comprador'}
            </h4>
            <button
              onClick={handleCloseSignatureModal}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="signature-modal-body">
            <div className="canvas-container bg-white border border-gray-300 rounded-md">
              <canvas
                ref={signatureCanvasRef}
                width={500}
                height={200}
                className="signature-canvas"
              />
            </div>

            <div className="mt-3 mb-1 text-sm text-gray-500">
              Dibuje su firma dentro del recuadro
            </div>
          </div>

          <div className="signature-modal-footer">
            <button
              onClick={handleClearSignature}
              className="govuk-button govuk-button-secondary mr-3"
            >
              Limpiar
            </button>
            <button
              onClick={handleSaveSignature}
              className="govuk-button"
            >
              Guardar Firma
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Agregar eventos para campos de identificación
  const handleIdentificationFieldFocus = () => {
    // Solo mostrar el modal si no hay valor en el campo
    if (!contractData.identificacionComprador || !contractData.numeroIdentificacion) {
      showIdCopyReminder();
    }
  };

  // Efecto para añadir event listeners a los campos de identificación y domicilio
  useEffect(() => {
    // Referencias a los campos de formulario
    const idTypeField = document.getElementById('identificacionComprador');
    const idNumberField = document.getElementById('numeroIdentificacion');
    const addressField = document.getElementById('domicilioComprador');

    // Funciones para los event listeners
    const handleIdTypeFieldFocus = () => {
      // Solo mostrar el modal si no se ha mostrado antes
      if (!idModalShown && (!contractData.identificacionComprador || !contractData.numeroIdentificacion)) {
        showIdCopyReminder();
      }
    };

    const handleAddressFieldBlur = () => {
      if (!contractData.domicilioComprador || contractData.domicilioComprador.trim() === '') {
        showAddressProofReminder();
      }
    };

    // Añadir event listeners
    if (idTypeField) idTypeField.addEventListener('focus', handleIdTypeFieldFocus);
    if (idNumberField) idNumberField.addEventListener('focus', handleIdTypeFieldFocus);
    if (addressField) addressField.addEventListener('blur', handleAddressFieldBlur);

    // Limpiar event listeners al desmontar
    return () => {
      if (idTypeField) idTypeField.removeEventListener('focus', handleIdTypeFieldFocus);
      if (idNumberField) idNumberField.removeEventListener('focus', handleIdTypeFieldFocus);
      if (addressField) addressField.removeEventListener('blur', handleAddressFieldBlur);
    };
  }, [contractData.identificacionComprador, contractData.numeroIdentificacion, contractData.domicilioComprador]);

  return (
    <div className="contract-form">
      {showPreview ? renderContractPreview() : renderForm()}

      {/* Modal para recordatorio de copia de ID */}
      <Modal
        isOpen={showIdCopyModal}
        onClose={() => setShowIdCopyModal(false)}
        title="Seleccione tipo de identificación"
        size="md"
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <IoInformationCircleOutline className="h-10 w-10 text-blue-600" />
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Identificaciones comunes en México</h3>
            <p className="text-gray-600 mb-3">
              Seleccione el tipo de identificación del comprador:
            </p>
            <div className="max-h-60 overflow-y-auto mb-4 border rounded-md">
              {identificacionesComunes.map((identificacion, index) => (
                <div
                  key={index}
                  className="p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectIdentification(identificacion)}
                >
                  {identificacion}
                </div>
              ))}
            </div>
            <p className="text-gray-600 mb-4">
              <span className="text-amber-600"><IoWarningOutline className="inline mr-1" /> Recuerde:</span> Solicite y guarde una copia de la identificación oficial del comprador.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowIdCopyModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal para recordatorio de comprobante de domicilio */}
      <Modal
        isOpen={showAddressProofModal}
        onClose={() => setShowAddressProofModal(false)}
        title="Información Requerida"
        size="md"
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <IoWarningOutline className="h-10 w-10 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Comprobante de Domicilio</h3>
            <p className="text-gray-600 mb-3">
              El domicilio del comprador está incompleto. Por favor, solicite un comprobante de domicilio reciente (no mayor a 3 meses).
            </p>
            <p className="text-gray-600 mb-4">
              Documentos válidos: recibo de luz, agua, teléfono, estado de cuenta bancario, etc.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddressProofModal(false)}
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default ContractForm;