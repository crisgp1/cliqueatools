import React, { useEffect } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Prevenir scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Determinar el tamaño del modal
  const modalSize = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`${modalSize[size]} w-full bg-white rounded-lg shadow-xl overflow-hidden`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => {
              e.stopPropagation();
              console.log('Modal content clicked');
            }}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <IoCloseOutline className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;