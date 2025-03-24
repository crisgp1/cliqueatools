import React from 'react';
import { motion } from 'framer-motion';
import { IoAlertCircleOutline, IoCloseCircleOutline } from 'react-icons/io5';

/**
 * Componente para mostrar alertas de error animadas
 * @param {Object} props - Propiedades del componente
 * @param {string} props.message - Mensaje de error a mostrar
 * @param {Function} props.onClose - Función para cerrar la alerta
 * @returns {JSX.Element} - Componente de alerta de error
 */
const ErrorAlert = ({ message, onClose }) => (
  <motion.div 
    className="fixed top-4 right-4 z-50 max-w-md"
    initial={{ opacity: 0, y: -50, scale: 0.3 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.5 }}
    transition={{ type: "spring", damping: 20 }}
  >
    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-lg flex items-start">
      <IoAlertCircleOutline className="text-red-500 text-2xl flex-shrink-0 mr-3" />
      <div className="flex-grow">
        <p className="text-red-700 font-medium">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="text-red-400 hover:text-red-600 transition-colors ml-2"
      >
        <IoCloseCircleOutline className="text-xl" />
      </button>
    </div>
  </motion.div>
);

export default ErrorAlert;