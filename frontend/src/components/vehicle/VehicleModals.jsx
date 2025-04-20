import React from 'react';
import { motion } from 'framer-motion';
import {
  IoTrashOutline,
  IoCarSportOutline,
  IoCalculatorOutline,
  IoCheckmarkDoneOutline,
  IoAlertCircleOutline
} from 'react-icons/io5';
import Modal from '../../pages/Modal';
import VehicleFormModal from './VehicleFormModal';

/**
 * Componente que gestiona los diferentes modales relacionados con vehículos
 */
export const VehicleModals = {
  /**
   * Modal de formulario para agregar un vehículo
   *
   * @param {Object} props - Propiedades del componente
   * @param {boolean} props.isOpen - Indica si el modal está abierto
   * @param {Function} props.onClose - Función para cerrar el modal
   * @param {Function} props.onSubmit - Función a llamar cuando se envía el formulario con éxito
   * @param {boolean} props.loading - Indica si hay una operación en curso
   * @returns {JSX.Element}
   */
  FormModal: ({ isOpen, onClose, onSubmit, loading }) => {
    return (
      <VehicleFormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onSubmit}
        loading={loading}
      />
    );
  },
  /**
   * Modal de éxito después de agregar un vehículo
   * 
   * @param {Object} props - Propiedades del componente
   * @param {boolean} props.isOpen - Indica si el modal está abierto
   * @param {Function} props.onClose - Función para cerrar el modal
   * @returns {JSX.Element}
   */
  SuccessModal: ({ isOpen, onClose }) => {
    // Elementos de animación para el contenido del modal
    const containerAnimation = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2
        }
      }
    };
    
    const modalItemAnimation = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 24
        }
      }
    };

    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        title="¡Vehículo registrado con éxito!"
        size="md"
      >
        <motion.div
          className="space-y-6"
          variants={containerAnimation}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="flex items-center justify-center" variants={modalItemAnimation}>
            <div className="bg-green-100 p-3 rounded-full">
              <IoCheckmarkDoneOutline className="text-green-600 h-12 w-12" />
            </div>
          </motion.div>
          
          <motion.p className="text-center text-lg" variants={modalItemAnimation}>
            Has registrado exitosamente un vehículo en tu inventario.
            Ahora puedes realizar las siguientes operaciones:
          </motion.p>
          
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={modalItemAnimation}>
            <div className="bg-royal-gray-100 p-4 rounded-md">
              <div className="flex items-center mb-2">
                <IoCalculatorOutline className="text-royal-black h-6 w-6 mr-2" />
                <h4 className="font-bold">Simular crédito</h4>
              </div>
              <p className="text-sm">Calcula opciones de financiamiento para este vehículo con diferentes plazos y tasas.</p>
            </div>
            
            <div className="bg-royal-gray-100 p-4 rounded-md">
              <div className="flex items-center mb-2">
                <IoCarSportOutline className="text-royal-black h-6 w-6 mr-2" />
                <h4 className="font-bold">Realizar compraventa</h4>
              </div>
              <p className="text-sm">Inicia el proceso de compraventa generando un contrato para este vehículo.</p>
            </div>
          </motion.div>
          
          <motion.div className="flex justify-center mt-4" variants={modalItemAnimation}>
            <button
              onClick={onClose}
              className="govuk-button"
            >
              Entendido
            </button>
          </motion.div>
        </motion.div>
      </Modal>
    );
  },

  /**
   * Modal de error para mensajes de error
   * 
   * @param {Object} props - Propiedades del componente
   * @param {boolean} props.isOpen - Indica si el modal está abierto
   * @param {Function} props.onClose - Función para cerrar el modal
   * @param {string} props.error - Mensaje de error a mostrar
   * @returns {JSX.Element}
   */
  ErrorModal: ({ isOpen, onClose, error }) => {
    // Elementos de animación para el contenido del modal
    const containerAnimation = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2
        }
      }
    };
    
    const modalItemAnimation = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 24
        }
      }
    };

    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        title="Error"
        size="md"
      >
        <motion.div
          className="space-y-6"
          variants={containerAnimation}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="flex items-center justify-center" variants={modalItemAnimation}>
            <div className="bg-red-100 p-3 rounded-full">
              <IoAlertCircleOutline className="text-red-600 h-12 w-12" />
            </div>
          </motion.div>
          
          <motion.p className="text-center text-lg" variants={modalItemAnimation}>
            {error || 'Ha ocurrido un error inesperado.'}
          </motion.p>
          
          <motion.div className="flex justify-center mt-4" variants={modalItemAnimation}>
            <button
              onClick={onClose}
              className="govuk-button bg-red-600 hover:bg-red-700"
            >
              Cerrar
            </button>
          </motion.div>
        </motion.div>
      </Modal>
    );
  },

  /**
   * Modal de confirmación para eliminar un vehículo
   * 
   * @param {Object} props - Propiedades del componente
   * @param {boolean} props.isOpen - Indica si el modal está abierto
   * @param {Function} props.onClose - Función para cerrar el modal
   * @param {Function} props.onConfirm - Función a llamar cuando se confirma la eliminación
   * @param {Object} props.vehicle - Vehículo a eliminar
   * @returns {JSX.Element}
   */
  DeleteConfirmModal: ({ isOpen, onClose, onConfirm, vehicle }) => {
    // Elementos de animación para el contenido del modal
    const containerAnimation = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2
        }
      }
    };
    
    const modalItemAnimation = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 24
        }
      }
    };

    return (
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        title="Confirmar eliminación"
        size="md"
      >
        <motion.div
          className="space-y-6"
          variants={containerAnimation}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="flex items-center justify-center" variants={modalItemAnimation}>
            <div className="bg-red-100 p-3 rounded-full">
              <IoTrashOutline className="text-red-600 h-12 w-12" />
            </div>
          </motion.div>
          
          <motion.p className="text-center text-lg" variants={modalItemAnimation}>
            ¿Estás seguro de que deseas eliminar este vehículo?
            {vehicle && (
              <span className="block font-bold mt-2">
                {vehicle.marca} {vehicle.modelo} ({vehicle.año})
              </span>
            )}
          </motion.p>
          
          <motion.p className="text-center text-sm text-gray-500" variants={modalItemAnimation}>
            Esta acción no se puede deshacer.
          </motion.p>
          
          <motion.div className="flex justify-between mt-4" variants={modalItemAnimation}>
            <button
              onClick={onClose}
              className="govuk-button-secondary"
            >
              Cancelar
            </button>
            
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="govuk-button bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </button>
          </motion.div>
        </motion.div>
      </Modal>
    );
  }
};

export default VehicleModals;