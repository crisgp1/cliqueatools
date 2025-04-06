import { memo } from 'react';
import { IoWarningOutline } from 'react-icons/io5';

/**
 * Modal for address proof reminder
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 */
const AddressProofModal = memo(({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Información Requerida</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Cerrar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <IoWarningOutline className="h-10 w-10 text-amber-500" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Comprobante de Domicilio</h4>
              <p className="text-gray-600 mb-3">
                El domicilio del comprador está incompleto. Por favor, solicite un comprobante de domicilio reciente (no mayor a 3 meses).
              </p>
              <p className="text-gray-600 mb-4">
                Documentos válidos: recibo de luz, agua, teléfono, estado de cuenta bancario, etc.
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
});

export default AddressProofModal;