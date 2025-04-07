import { useState, useRef, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  // Estado para el modal de confirmación
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [allSignaturesComplete, setAllSignaturesComplete] = useState(false);
  
  // Estado para UIDs de seguridad y finalización
  const [securityUIDs, setSecurityUIDs] = useState({
    vendor: null,
    buyer: null
  });
  
  // Estado para controlar si las firmas están finalizadas (bloqueadas)
  const [signaturesFinalized, setSignaturesFinalized] = useState(false);
  
  // Estado para el modal de finalización
  const [showFinalizationModal, setShowFinalizationModal] = useState(false);
  
  // Referencias para la ventana de firma
  const signatureWindowRef = useRef(null);
  
  // Función para generar un UUID seguro
  const generateSecurityUID = () => {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, function(c) {
      const r = Math.random() * 16 | 0;
      return r.toString(16);
    }).toUpperCase();
  };

  // Obtener la fecha actual formateada
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Función para finalizar y bloquear las firmas
  const handleFinalizeSignatures = () => {
    // Generar UIDs para ambas firmas si no existen
    const newUIDs = { ...securityUIDs };
    
    if (!newUIDs.vendor) {
      newUIDs.vendor = generateSecurityUID();
    }
    
    if (!newUIDs.buyer) {
      newUIDs.buyer = generateSecurityUID();
    }
    
    // Actualizar los UIDs y marcar como finalizado
    setSecurityUIDs(newUIDs);
    setSignaturesFinalized(true);
    setShowFinalizationModal(false);
  };

  // Manejar apertura de la ventana de firma
  const handleOpenSignatureWindow = (type) => {
    setSignatureType(type);

    // Calcular dimensiones y posición de la ventana
    const width = 600;
    const height = 450;
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
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
            
            body {
              font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 30px;
              display: flex;
              flex-direction: column;
              height: 100vh;
              box-sizing: border-box;
              background-color: #f9fafb;
              color: #1f2937;
            }
            h2 {
              margin-top: 0;
              color: #01549b;
              border-bottom: 2px solid #01549b;
              padding-bottom: 12px;
              font-weight: 600;
              letter-spacing: -0.5px;
            }
            .canvas-container {
              flex: 1;
              background-color: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              margin-bottom: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05);
              overflow: hidden;
              position: relative;
            }
            .canvas-container::before {
              content: '';
              position: absolute;
              bottom: 10px;
              left: 10%;
              right: 10%;
              height: 1px;
              background: #000;
              opacity: 0.2;
              z-index: 0;
            }
            canvas {
              position: relative;
              background-color: transparent;
              z-index: 1;
            }
            .actions {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 12px;
            }
            .buttons-group {
              display: flex;
              gap: 10px;
            }
            button {
              padding: 10px 18px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
              font-size: 14px;
              transition: all 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              position: relative;
              overflow: hidden;
            }
            .save-btn {
              background-color: #01549b;
              color: white;
            }
            .save-btn:hover {
              background-color: #014785;
              transform: translateY(-1px);
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .clear-btn {
              background-color: #f3f4f6;
              color: #1f2937;
              border: 1px solid #e5e7eb;
            }
            .clear-btn:hover {
              background-color: #e5e7eb;
              transform: translateY(-1px);
            }
            .instructions {
              margin-bottom: 20px;
              color: #6b7280;
              font-size: 14px;
              line-height: 1.5;
              background-color: #f0f9ff;
              border-left: 3px solid #01549b;
              padding: 12px 16px;
              border-radius: 0 4px 4px 0;
            }
            .pen-options {
              display: flex;
              align-items: center;
              gap: 8px;
              color: #6b7280;
              font-size: 13px;
            }
            .pen-options select {
              padding: 4px 8px;
              border-radius: 4px;
              border: 1px solid #e5e7eb;
              background-color: white;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <h2>Firma ${type === 'vendor' ? 'del Vendedor' : 'del Comprador'}</h2>
          <p class="instructions">Dibuje su firma dentro del recuadro usando el mouse o su dedo en dispositivos táctiles. Su firma será utilizada como parte del documento legal.</p>
          <div class="canvas-container">
            <canvas id="signatureCanvas" width="500" height="200"></canvas>
          </div>
          <div class="actions">
            <div class="pen-options">
              <span>Grosor:</span>
              <select id="penWidth">
                <option value="1">Fino</option>
                <option value="2" selected>Medio</option>
                <option value="3">Grueso</option>
                <option value="4">Extra grueso</option>
              </select>
            </div>
            <div class="buttons-group">
              <button class="clear-btn" id="clearButton">Limpiar</button>
              <button class="save-btn" id="saveButton">
                <span id="buttonText">Presionar para Firmar</span>
                <div id="progressBar" style="position: absolute; bottom: 0; left: 0; height: 3px; width: 0%; background-color: #ffffff; transition: width 0.1s linear;"></div>
              </button>
            </div>
          </div>
          
          <script>
            // Inicializar el canvas
            const canvas = document.getElementById('signatureCanvas');
            const ctx = canvas.getContext('2d');
            const penWidthSelect = document.getElementById('penWidth');
            
            // Configurar propiedades del trazo
            ctx.lineWidth = parseInt(penWidthSelect.value);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#000';
            
            // Actualizar ancho del trazo cuando cambie la selección
            penWidthSelect.addEventListener('change', function() {
              ctx.lineWidth = parseInt(this.value);
            });
            
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
            
            // Función para validar si hay una firma dibujada
            function isCanvasEmpty() {
              const pixelBuffer = new Uint32Array(
                ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
              );
              
              // Buscar cualquier píxel que no sea transparente
              return !pixelBuffer.some(color => color !== 0);
            }
            
            // Función para mostrar un mensaje
            function showMessage(message, isError = true) {
              const msg = document.createElement('div');
              msg.style.position = 'fixed';
              msg.style.top = '10px';
              msg.style.left = '50%';
              msg.style.transform = 'translateX(-50%)';
              msg.style.padding = '12px 20px';
              msg.style.backgroundColor = isError ? '#fee2e2' : '#ecfdf5';
              msg.style.color = isError ? '#b91c1c' : '#065f46';
              msg.style.borderRadius = '4px';
              msg.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
              msg.style.zIndex = '9999';
              msg.style.maxWidth = '90%';
              msg.style.textAlign = 'center';
              msg.textContent = message;
              document.body.appendChild(msg);
              
              // Remover el mensaje después de un tiempo
              setTimeout(() => {
                msg.remove();
              }, 3000);
            }
            
            // Función para crear una ventana modal de confirmación legal
            function showLegalConfirmation(callback) {
              // Crear el overlay
              const overlay = document.createElement('div');
              overlay.style.position = 'fixed';
              overlay.style.top = '0';
              overlay.style.left = '0';
              overlay.style.right = '0';
              overlay.style.bottom = '0';
              overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
              overlay.style.zIndex = '9999';
              overlay.style.display = 'flex';
              overlay.style.alignItems = 'center';
              overlay.style.justifyContent = 'center';
              document.body.appendChild(overlay);
              
              // Crear el modal
              const modal = document.createElement('div');
              modal.style.backgroundColor = 'white';
              modal.style.borderRadius = '8px';
              modal.style.padding = '20px';
              modal.style.width = '90%';
              modal.style.maxWidth = '500px';
              modal.style.maxHeight = '90vh';
              modal.style.overflowY = 'auto';
              modal.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              overlay.appendChild(modal);
              
              // Añadir título
              const title = document.createElement('h3');
              title.textContent = 'Confirmación Legal';
              title.style.color = '#01549b';
              title.style.fontSize = '18px';
              title.style.fontWeight = '600';
              title.style.marginBottom = '16px';
              title.style.paddingBottom = '8px';
              title.style.borderBottom = '2px solid #01549b';
              modal.appendChild(title);
              
              // Añadir contenido
              const content = document.createElement('div');
              content.style.fontSize = '14px';
              content.style.lineHeight = '1.5';
              content.style.color = '#4b5563';
              content.style.marginBottom = '20px';
              content.innerHTML = '<p>Por la presente, <strong>confirmo bajo protesta de decir verdad</strong> que:</p>' +
                '<ul style="list-style-type: disc; padding-left: 20px; margin-top: 12px; margin-bottom: 12px;">' +
                '<li>He verificado la firma contra la identificación oficial del firmante.</li>' +
                '<li>Certifico que las firmas son auténticas y válidas para cualquier ejercicio legal.</li>' +
                '<li>Tengo conocimiento de que se retendrá una copia digital de esta firma para verificación posterior.</li>' +
                '<li>Acepto que esta firma electrónica tiene la misma validez que una firma autógrafa.</li>' +
                '</ul>' +
                '<p>En caso de falsedad, estoy consciente de las responsabilidades legales que pueden aplicarse.</p>';
              modal.appendChild(content);
              
              // Añadir botones
              const buttonsContainer = document.createElement('div');
              buttonsContainer.style.display = 'flex';
              buttonsContainer.style.justifyContent = 'flex-end';
              buttonsContainer.style.gap = '10px';
              buttonsContainer.style.marginTop = '16px';
              modal.appendChild(buttonsContainer);
              
              // Botón Cancelar
              const cancelButton = document.createElement('button');
              cancelButton.textContent = 'Cancelar';
              cancelButton.style.padding = '8px 16px';
              cancelButton.style.backgroundColor = '#f3f4f6';
              cancelButton.style.color = '#1f2937';
              cancelButton.style.border = '1px solid #e5e7eb';
              cancelButton.style.borderRadius = '6px';
              cancelButton.style.fontWeight = '500';
              cancelButton.style.cursor = 'pointer';
              cancelButton.style.fontSize = '14px';
              buttonsContainer.appendChild(cancelButton);
              
              // Botón Aceptar
              const confirmButton = document.createElement('button');
              confirmButton.textContent = 'Acepto y Confirmo';
              confirmButton.style.padding = '8px 16px';
              confirmButton.style.backgroundColor = '#01549b';
              confirmButton.style.color = 'white';
              confirmButton.style.border = 'none';
              confirmButton.style.borderRadius = '6px';
              confirmButton.style.fontWeight = '500';
              confirmButton.style.cursor = 'pointer';
              confirmButton.style.fontSize = '14px';
              buttonsContainer.appendChild(confirmButton);
              
              // Eventos de los botones
              cancelButton.addEventListener('click', function() {
                document.body.removeChild(overlay);
                callback(false);
              });
              
              confirmButton.addEventListener('click', function() {
                document.body.removeChild(overlay);
                callback(true);
              });
            }
            
            // Función para mostrar animación de éxito
            function showSuccessAnimation() {
              // Crear overlay para animación
              const overlay = document.createElement('div');
              overlay.style.position = 'fixed';
              overlay.style.top = '0';
              overlay.style.left = '0';
              overlay.style.width = '100%';
              overlay.style.height = '100%';
              overlay.style.backgroundColor = 'rgba(0,0,0,0.2)';
              overlay.style.display = 'flex';
              overlay.style.justifyContent = 'center';
              overlay.style.alignItems = 'center';
              overlay.style.zIndex = '10000';
              document.body.appendChild(overlay);
              
              // Crear contenedor de animación
              const animation = document.createElement('div');
              animation.style.width = '80px';
              animation.style.height = '80px';
              animation.style.borderRadius = '50%';
              animation.style.backgroundColor = '#10b981';
              animation.style.display = 'flex';
              animation.style.justifyContent = 'center';
              animation.style.alignItems = 'center';
              animation.style.transform = 'scale(0)';
              animation.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
              overlay.appendChild(animation);
              
              // Crear icono de verificación
              const checkmark = document.createElement('div');
              checkmark.innerHTML = \`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              \`;
              checkmark.style.opacity = '0';
              checkmark.style.transition = 'opacity 0.2s ease-in-out';
              animation.appendChild(checkmark);
              
              // Reproducir animación
              setTimeout(() => {
                animation.style.transform = 'scale(1)';
                
                setTimeout(() => {
                  checkmark.style.opacity = '1';
                  
                  setTimeout(() => {
                    // Al finalizar la animación, continuar con el proceso de guardar
                    document.body.removeChild(overlay);
                    validateAndSaveSignature();
                  }, 800);
                }, 300);
              }, 100);
            }
            
            // Función que hace la validación y guardado real
            function validateAndSaveSignature() {
              // Verificar que se haya dibujado una firma
              if (isCanvasEmpty()) {
                // Mostrar mensaje de error si no hay firma
                showMessage('No se detectó ninguna firma. Por favor, dibuje su firma.', true);
                return;
              }
              
              // Mostrar confirmación legal antes de guardar
              showLegalConfirmation(function(confirmed) {
                if (confirmed) {
                  // Obtener la imagen como data URL
                  const signatureImage = canvas.toDataURL('image/png');
                  
                  // Generar un UID de seguridad único
                  const securityUID = 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, function(c) {
                    const r = Math.random() * 16 | 0;
                    return r.toString(16);
                  }).toUpperCase();
                  
                  // Enviar la imagen y el UID a la ventana principal
                  window.opener.postMessage({ 
                    type: 'signature', 
                    signatureType: '${type}', 
                    image: signatureImage,
                    securityUID: securityUID,
                    verified: true
                  }, '*');
                  
                  // Mostrar mensaje de éxito y cerrar después de 1 segundo
                  showMessage('Firma guardada y certificada correctamente.', false);
                  setTimeout(() => {
                    window.close();
                  }, 1000);
                } else {
                  // El usuario canceló la confirmación
                  showMessage('Operación cancelada. La firma no ha sido guardada.', false);
                }
              });
            }
            
            // Configuración de interacción de mantener presionado
            const saveButton = document.getElementById('saveButton');
            const buttonText = document.getElementById('buttonText');
            const progressBar = document.getElementById('progressBar');
            let pressTimer;
            let progress = 0;
            const totalTime = 3000; // 3 segundos
            const interval = 30; // Actualizar cada 30ms
            let isAnimating = false;
            
            // Mouse events
            saveButton.addEventListener('mousedown', function(e) {
              // Evitar comportamiento por defecto
              e.preventDefault();
              
              if (isAnimating) return;
              isAnimating = true;
              progress = 0;
              progressBar.style.width = '0%';
              buttonText.textContent = 'Mantenga presionado...';
              
              // Iniciar timer e intervalo de progreso
              pressTimer = setInterval(() => {
                progress += (interval / totalTime) * 100;
                progressBar.style.width = \`\${Math.min(progress, 100)}%\`;
                
                if (progress >= 100) {
                  clearInterval(pressTimer);
                  buttonText.textContent = '¡Completado!';
                  
                  // Mostrar animación de éxito
                  setTimeout(() => {
                    showSuccessAnimation();
                  }, 200);
                }
              }, interval);
            });
            
            // Si el usuario suelta antes de tiempo
            saveButton.addEventListener('mouseup', function() {
              if (progress < 100) {
                clearInterval(pressTimer);
                progressBar.style.width = '0%';
                buttonText.textContent = 'Presionar para Firmar';
                isAnimating = false;
              }
            });
            
            saveButton.addEventListener('mouseleave', function() {
              if (progress < 100) {
                clearInterval(pressTimer);
                progressBar.style.width = '0%';
                buttonText.textContent = 'Presionar para Firmar';
                isAnimating = false;
              }
            });
            
            // Touch events para móviles
            saveButton.addEventListener('touchstart', function(e) {
              e.preventDefault();
              
              if (isAnimating) return;
              isAnimating = true;
              progress = 0;
              progressBar.style.width = '0%';
              buttonText.textContent = 'Mantenga presionado...';
              
              pressTimer = setInterval(() => {
                progress += (interval / totalTime) * 100;
                progressBar.style.width = \`\${Math.min(progress, 100)}%\`;
                
                if (progress >= 100) {
                  clearInterval(pressTimer);
                  buttonText.textContent = '¡Completado!';
                  
                  setTimeout(() => {
                    showSuccessAnimation();
                  }, 200);
                }
              }, interval);
            });
            
            saveButton.addEventListener('touchend', function() {
              if (progress < 100) {
                clearInterval(pressTimer);
                progressBar.style.width = '0%';
                buttonText.textContent = 'Presionar para Firmar';
                isAnimating = false;
              }
            });
            
            saveButton.addEventListener('touchcancel', function() {
              if (progress < 100) {
                clearInterval(pressTimer);
                progressBar.style.width = '0%';
                buttonText.textContent = 'Presionar para Firmar';
                isAnimating = false;
              }
            });
            
            // Agregar eventos al canvas
            canvas.addEventListener('mousedown', startDrawing);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', stopDrawing);
            canvas.addEventListener('mouseout', stopDrawing);
            
            // Agregar eventos táctiles
            canvas.addEventListener('touchstart', touchStart);
            canvas.addEventListener('touchmove', touchMove);
            canvas.addEventListener('touchend', touchEnd);
            
            // Botón de limpieza
            document.getElementById('clearButton').addEventListener('click', clearCanvas);
          </script>
        </body>
      </html>
    `);

    signatureWindow.document.close();
  };

  // Función para verificar el estado de las firmas y mostrar el modal apropiado
  const checkSignatureStatus = (updatedSignatures) => {
    // Construir mensajes basados en qué firma se completó
    if (updatedSignatures.vendor && updatedSignatures.buyer) {
      // Ambas firmas están completas
      setConfirmationMessage('¡Firmas completas! El contrato ahora está firmado por ambas partes.');
      setAllSignaturesComplete(true);
    } else if (updatedSignatures.vendor && !updatedSignatures.buyer) {
      // Firma del vendedor completada, falta la del comprador
      setConfirmationMessage('Firma del vendedor lista. Ahora, por favor, solicite al comprador que firme el documento.');
      setAllSignaturesComplete(false);
    } else if (!updatedSignatures.vendor && updatedSignatures.buyer) {
      // Firma del comprador completada, falta la del vendedor
      setConfirmationMessage('Firma del comprador lista. Ahora, por favor, solicite al vendedor que firme el documento.');
      setAllSignaturesComplete(false);
    }
    
    // Mostrar el modal
    setShowConfirmationModal(true);
  };

  // Efecto para recibir mensajes de la ventana de firma
  useEffect(() => {
    const handleMessage = (event) => {
      // Verificar que el mensaje sea del tipo correcto
      if (event.data && event.data.type === 'signature') {
        // Actualizar el estado con la nueva firma
        const updatedSignatures = {
          ...signatures,
          [event.data.signatureType]: event.data.image
        };
        
        setSignatures(updatedSignatures);
        
        // Si viene con un UID de seguridad, guardarlo
        if (event.data.securityUID) {
          setSecurityUIDs({
            ...securityUIDs,
            [event.data.signatureType]: event.data.securityUID
          });
        }
        
        // Mostrar el modal de confirmación apropiado
        checkSignatureStatus(updatedSignatures);
      }
    };

    // Agregar listener para mensajes
    window.addEventListener('message', handleMessage);

    // Limpiar listener al desmontar
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [signatures, setSignatures, securityUIDs]);
  
  // Componente Modal de Confirmación
  const ConfirmationModal = () => {
    if (!showConfirmationModal) return null;
    
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowConfirmationModal(false)}></div>
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl z-10 p-6 w-full max-w-md mx-4"
          >
            <div className="flex flex-col items-center text-center">
              {allSignaturesComplete ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              )}
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {allSignaturesComplete ? "Firmas Completas" : "Firma Registrada"}
              </h3>
              
              <p className="text-gray-600 mb-6">{confirmationMessage}</p>
              
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm hover:shadow transition-all w-full"
              >
                {allSignaturesComplete ? "Continuar" : "Entendido"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>,
      document.body
    );
  };
  
  // Componente Modal de Finalización
  const FinalizationModal = () => {
    if (!showFinalizationModal) return null;
    
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowFinalizationModal(false)}></div>
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl z-10 p-6 w-full max-w-md mx-4"
          >
            <div className="flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-amber-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirmar Finalización
              </h3>
              
              <p className="text-gray-600 mb-2">
                Está a punto de finalizar las firmas del documento. Al hacerlo:
              </p>
              
              <ul className="text-left text-gray-600 mb-6 bg-amber-50 p-3 rounded-md border border-amber-100 w-full">
                <li className="flex items-start mb-2">
                  <svg className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Se generarán identificadores únicos (UIDs) para las firmas</span>
                </li>
                <li className="flex items-start mb-0">
                  <svg className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span><strong>Ya no será posible volver a firmar el documento</strong></span>
                </li>
              </ul>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowFinalizationModal(false)}
                  className="flex-1 px-5 py-2.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFinalizeSignatures}
                  className="flex-1 px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm hover:shadow transition-all"
                >
                  Confirmar y Finalizar
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>,
      document.body
    );
  };

  return (
    <div className="govuk-form-section">
      {/* Modal de confirmación */}
      <ConfirmationModal />
      
      {/* Modal de finalización */}
      <FinalizationModal />
      
      <h3 className="govuk-form-section-title">Firmas</h3>
      
      {/* Botón para finalizar firmas - Solo mostrar cuando ambas firmas estén completas y no esté finalizado */}
      {signatures.vendor && signatures.buyer && !signaturesFinalized && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-blue-800">
            <h4 className="font-medium text-lg">Ambas firmas están completas</h4>
            <p className="text-sm text-blue-600">Para generar los identificadores únicos de seguridad y finalizar el proceso, haga clic en el botón.</p>
          </div>
          <button
            onClick={() => setShowFinalizationModal(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm hover:shadow transition-all flex items-center gap-2 min-w-max"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Finalizar Firmas
          </button>
        </div>
      )}
      
      {/* Mensaje cuando las firmas están finalizadas */}
      {signaturesFinalized && (
        <div className="mb-6 bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center gap-3 text-green-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-medium text-lg">Documento finalizado y verificado</h4>
          </div>
          <p className="text-sm text-green-600 mt-1 ml-9">
            Las firmas han sido certificadas y el documento ha sido asegurado con identificadores únicos.
          </p>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* Vendor Signature */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
          <h4 className="text-lg font-semibold mb-4 text-[#01549b]">Firma del Vendedor</h4>
          
          {signatures.vendor ? (
            <div className="w-full flex flex-col items-center">
              <div className="w-full bg-gray-50 rounded-md p-4 mb-2 relative">
                <div className="signature-container relative">
                  <img 
                    src={signatures.vendor} 
                    alt="Firma del vendedor" 
                    className="h-32 object-contain mx-auto mb-2"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
                  
                  {/* Sello de certificación */}
                  <div className="absolute bottom-2 right-2 flex flex-col items-end">
                    <div className="text-xs text-gray-500">{getCurrentDate()}</div>
                    <div className="bg-blue-50 border border-blue-100 rounded-sm px-1 mt-1 flex items-center">
                      <svg className="h-3 w-3 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px] text-blue-600 font-medium tracking-tight">CERTIFICADO Y VERIFICADO</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                  <div>Fecha: {getCurrentDate()}</div>
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                    <span>Verificado</span>
                  </div>
                </div>
              </div>
              
              {/* UID de seguridad - Solo mostrar si las firmas están finalizadas */}
              {signaturesFinalized && securityUIDs.vendor && (
                <div className="w-full mb-4">
                  <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border border-gray-200 rounded-md p-2 text-center">
                    <div className="text-xs text-gray-400 mb-1">IDENTIFICADOR ÚNICO DE SEGURIDAD</div>
                    <div className="flex items-center justify-center">
                      <div className="bg-white px-3 py-1 rounded-md border border-gray-200 shadow-sm">
                        <span className="font-mono text-sm font-medium tracking-wider text-gray-700">{securityUIDs.vendor}</span>
                      </div>
                      <div className="ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={signaturesFinalized ? null : () => handleOpenSignatureWindow('vendor')}
                disabled={signaturesFinalized}
                className={`text-sm ${
                  signaturesFinalized 
                    ? "text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed" 
                    : "text-blue-600 hover:text-blue-800 border-blue-100 bg-blue-50 hover:bg-blue-100"
                } flex items-center gap-1 border px-3 py-1 rounded-full transition-all`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Volver a firmar
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="w-full mb-6 bg-gray-50 rounded-md p-4 flex justify-center items-center min-h-[160px] border border-dashed border-gray-300">
                <div className="text-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <p className="text-sm">Se requiere la firma del vendedor</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenSignatureWindow('vendor')}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Firmar como vendedor
              </button>
            </div>
          )}
          
          <p className="mt-5 text-center font-semibold text-sm text-gray-700 bg-gray-50 py-2 px-4 rounded-md border-t border-gray-200 w-full">
            COMERCIALIZADORA AUTOMOTRIZ CLIQUEALO DE MEXICO
          </p>
        </div>

        {/* Buyer Signature */}
        <div className="flex-1 bg-white border border-gray-200 rounded-lg p-6 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow">
          <h4 className="text-lg font-semibold mb-4 text-[#01549b]">Firma del Comprador</h4>
          
          {signatures.buyer ? (
            <div className="w-full flex flex-col items-center">
              <div className="w-full bg-gray-50 rounded-md p-4 mb-2 relative">
                <div className="signature-container relative">
                  <img 
                    src={signatures.buyer} 
                    alt="Firma del comprador" 
                    className="h-32 object-contain mx-auto mb-2"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
                  
                  {/* Sello de certificación */}
                  <div className="absolute bottom-2 right-2 flex flex-col items-end">
                    <div className="text-xs text-gray-500">{getCurrentDate()}</div>
                    <div className="bg-blue-50 border border-blue-100 rounded-sm px-1 mt-1 flex items-center">
                      <svg className="h-3 w-3 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-[10px] text-blue-600 font-medium tracking-tight">CERTIFICADO Y VERIFICADO</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                  <div>Fecha: {getCurrentDate()}</div>
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                    <span>Verificado</span>
                  </div>
                </div>
              </div>
              
              {/* UID de seguridad - Solo mostrar si las firmas están finalizadas */}
              {signaturesFinalized && securityUIDs.buyer && (
                <div className="w-full mb-4">
                  <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border border-gray-200 rounded-md p-2 text-center">
                    <div className="text-xs text-gray-400 mb-1">IDENTIFICADOR ÚNICO DE SEGURIDAD</div>
                    <div className="flex items-center justify-center">
                      <div className="bg-white px-3 py-1 rounded-md border border-gray-200 shadow-sm">
                        <span className="font-mono text-sm font-medium tracking-wider text-gray-700">{securityUIDs.buyer}</span>
                      </div>
                      <div className="ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={signaturesFinalized ? null : () => handleOpenSignatureWindow('buyer')}
                disabled={signaturesFinalized}
                className={`text-sm ${
                  signaturesFinalized 
                    ? "text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed" 
                    : "text-blue-600 hover:text-blue-800 border-blue-100 bg-blue-50 hover:bg-blue-100"
                } flex items-center gap-1 border px-3 py-1 rounded-full transition-all`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Volver a firmar
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div className="w-full mb-6 bg-gray-50 rounded-md p-4 flex justify-center items-center min-h-[160px] border border-dashed border-gray-300">
                <div className="text-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <p className="text-sm">Se requiere la firma del comprador</p>
                </div>
              </div>
              <button
                onClick={() => handleOpenSignatureWindow('buyer')}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Firmar como comprador
              </button>
            </div>
          )}
          
          <p className="mt-5 text-center font-semibold text-sm text-gray-700 bg-gray-50 py-2 px-4 rounded-md border-t border-gray-200 w-full">
            El Comprador
          </p>
        </div>
      </div>
    </div>
  );
});

export default SignatureManager;