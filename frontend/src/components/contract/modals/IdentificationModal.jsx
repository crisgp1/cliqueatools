import { memo } from 'react';
import { IoInformationCircleOutline, IoWarningOutline } from 'react-icons/io5';
import { identificacionesComunes } from '../utils/ContractUtils';

/**
 * Modal for selecting identification type
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onSelectIdentification - Function to handle ID selection
 */
const IdentificationModal = memo(({ isOpen, onClose, onSelectIdentification }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Seleccione tipo de identificación</h3>
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
              <IoInformationCircleOutline className="h-10 w-10 text-blue-600" />
            </div>
            <div className="flex-grow">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Identificaciones comunes en México</h4>
              <p className="text-gray-600 mb-3">
                Seleccione el tipo de identificación del comprador:
              </p>
              <div className="max-h-60 overflow-y-auto mb-4 border rounded-md">
                {identificacionesComunes.map((identificacion, index) => (
                  <div
                    key={index}
                    className="p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onSelectIdentification(identificacion)}
                  >
                    {identificacion}
                  </div>
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                <span className="text-amber-600 flex items-center">
                  <IoWarningOutline className="inline mr-1" /> Recuerde:
                </span> 
                Solicite y guarde una copia de la identificación oficial del comprador.
              </p>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
});

export default IdentificationModal;