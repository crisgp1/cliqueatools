import { useState, useRef, useEffect, memo } from 'react';

/**
 * Component for managing signatures in the contract
 * 
 * @param {Object} props
 * @param {Object} props.signatures - The current signatures object
 * @param {Function} props.setSignatures - Function to update signatures
 */
const SignatureManager = memo(({ signatures, setSignatures }) => {
  // Estado para el tipo de firma actual
  const [signatureType, setSignatureType] = useState('');
  
  // Referencias para la ventana de firma
  const signatureWindowRef = useRef(null);

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
  }, [signatures, setSignatures]);

  return (
    <div className="govuk-form-section">
      <h3 className="govuk-form-section-title">Firmas</h3>
      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* Vendor Signature */}
        <div className="flex-1 border rounded-md p-4 flex flex-col items-center">
          <h4 className="text-lg font-medium mb-4">Firma del Vendedor</h4>
          
          {signatures.vendor ? (
            <div className="w-full flex flex-col items-center">
              <img 
                src={signatures.vendor} 
                alt="Firma del vendedor" 
                className="h-32 mb-4 border-b"
              />
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Firmar como vendedor
            </button>
          )}
          
          <p className="mt-4 text-center font-medium">
            COMERCIALIZADORA AUTOMOTRIZ CLIQUEALO DE MEXICO
          </p>
        </div>

        {/* Buyer Signature */}
        <div className="flex-1 border rounded-md p-4 flex flex-col items-center">
          <h4 className="text-lg font-medium mb-4">Firma del Comprador</h4>
          
          {signatures.buyer ? (
            <div className="w-full flex flex-col items-center">
              <img 
                src={signatures.buyer} 
                alt="Firma del comprador" 
                className="h-32 mb-4 border-b"
              />
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Firmar como comprador
            </button>
          )}
          
          <p className="mt-4 text-center font-medium">
            El Comprador
          </p>
        </div>
      </div>
    </div>
  );
});

export default SignatureManager;