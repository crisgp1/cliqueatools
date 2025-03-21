import { useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  const modalRef = useRef();

  // Configurar clases según el tamaño
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full mx-4"
  };
  
  const modalSize = sizeClasses[size] || sizeClasses.md;

  // Cerrar modal al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevenir scroll en el body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
      <div 
        ref={modalRef} 
        className={`${modalSize} w-full bg-white rounded-none border-2 border-royal-black shadow-md transform transition-all duration-300 overflow-hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b-2 border-royal-black bg-royal-black text-white">
          <h3 className="text-xl font-bold">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-royal-gray-700 transition focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;