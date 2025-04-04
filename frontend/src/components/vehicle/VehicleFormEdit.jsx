import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { formatCurrency, validateVehicle, getCurrentYear } from './VehicleUtils';

/**
 * Componente que muestra un formulario para editar un vehículo existente
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.vehicle - Vehículo a editar
 * @param {Function} props.onSubmit - Función a llamar cuando se envía el formulario con éxito
 * @param {Function} props.onCancel - Función a llamar cuando se cancela la edición
 * @param {boolean} props.loading - Indica si hay una operación en curso
 * @returns {JSX.Element}
 */
const VehicleFormEdit = ({ vehicle, onSubmit, onCancel, loading = false }) => {
  // Estado para el vehículo en edición
  const [editingVehicle, setEditingVehicle] = useState(vehicle || {});
  
  // Estado para errores de validación
  const [validationErrors, setValidationErrors] = useState({});

  // Actualizar el estado cuando cambia el vehículo prop
  useEffect(() => {
    if (vehicle) {
      setEditingVehicle(vehicle);
    }
  }, [vehicle]);

  // Manejar cambios en el formulario
  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'valor') {
      // Si el campo es valor, y el valor está vacío, mantenerlo vacío
      // de lo contrario, convertirlo a número
      const newValue = value === '' ? '' : Number(value);
      
      setEditingVehicle({
        ...editingVehicle,
        [name]: newValue
      });
      
      // Limpiar error específico
      if (validationErrors.valor) {
        setValidationErrors(prev => ({
          ...prev,
          valor: undefined
        }));
      }
    } else if (name === 'año') {
      // Convertir año a número
      const yearValue = value === '' ? '' : Number(value);
      
      setEditingVehicle({
        ...editingVehicle,
        [name]: yearValue
      });
      
      // Limpiar error específico
      if (validationErrors.año) {
        setValidationErrors(prev => ({
          ...prev,
          año: undefined
        }));
      }
    } else {
      setEditingVehicle({
        ...editingVehicle,
        [name]: value
      });
      
      // Limpiar error específico
      if (validationErrors[name]) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: undefined
        }));
      }
    }
  };

  // Validar formulario antes de enviar
  const validateForm = () => {
    const errors = {};
    
    // Validar campos obligatorios
    if (!editingVehicle.marca) {
      errors.marca = "La marca es obligatoria";
    }
    
    if (!editingVehicle.modelo) {
      errors.modelo = "El modelo es obligatorio";
    }
    
    if (!editingVehicle.valor) {
      errors.valor = "El valor es obligatorio";
    } else if (Number(editingVehicle.valor) <= 0) {
      errors.valor = "El valor debe ser mayor a cero";
    }
    
    // Validar año
    const currentYear = getCurrentYear();
    if (!editingVehicle.año) {
      errors.año = "El año es obligatorio";
    } else if (Number(editingVehicle.año) < 1900 || Number(editingVehicle.año) > currentYear + 1) {
      errors.año = `El año debe estar entre 1900 y ${currentYear + 1}`;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }
    
    // Validación adicional con la función general
    if (!validateVehicle(editingVehicle)) {
      setValidationErrors({
        general: "Por favor completa todos los campos obligatorios correctamente"
      });
      return;
    }
    
    // Llamar a la función de envío pasada por props
    await onSubmit(editingVehicle);
  };

  // Animaciones
  const formAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        staggerChildren: 0.1
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

  return (
    <motion.div 
      className="bg-white rounded-md p-6"
      initial="hidden"
      animate="visible"
      variants={formAnimation}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center">
        <IoCheckmarkCircleOutline className="h-5 w-5 text-blue-600 mr-2" />
        Editar vehículo
      </h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {loading && (
          <div className="flex justify-center py-2">
            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {/* Error general */}
        {validationErrors.general && (
          <div className="bg-red-50 p-3 rounded border border-red-200 text-red-600">
            {validationErrors.general}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="edit-marca" className="govuk-label">
              Marca <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="edit-marca"
              name="marca"
              value={editingVehicle.marca || ''}
              onChange={handleVehicleChange}
              className={`govuk-input ${validationErrors.marca ? 'border-red-500' : ''}`}
            />
            {validationErrors.marca && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.marca}</p>
            )}
          </motion.div>
          
          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="edit-modelo" className="govuk-label">
              Modelo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="edit-modelo"
              name="modelo"
              value={editingVehicle.modelo || ''}
              onChange={handleVehicleChange}
              className={`govuk-input ${validationErrors.modelo ? 'border-red-500' : ''}`}
            />
            {validationErrors.modelo && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.modelo}</p>
            )}
          </motion.div>
        </div>
        
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="edit-año" className="govuk-label">
            Año <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="edit-año"
            name="año"
            value={editingVehicle.año || ''}
            onChange={handleVehicleChange}
            className={`govuk-input ${validationErrors.año ? 'border-red-500' : ''}`}
          />
          {validationErrors.año && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.año}</p>
          )}
        </motion.div>
        
        <motion.div className="govuk-form-group" variants={itemAnimation}>
          <label htmlFor="edit-valor" className="govuk-label">
            Valor del vehículo <span className="text-red-500">*</span>
          </label>
            
          <div className="relative mb-2">
            <div className="govuk-input-prefix">$</div>
            <input
              type="number"
              id="edit-valor"
              name="valor"
              value={editingVehicle.valor || ''}
              onChange={handleVehicleChange}
              className={`govuk-input govuk-input-with-prefix text-right ${validationErrors.valor ? 'border-red-500' : ''}`}
              placeholder="Ingresa el valor"
            />
          </div>
          
          {validationErrors.valor && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.valor}</p>
          )}
          
          <div className="mb-1 flex justify-between text-sm text-gray-500">
            <span>$50,000</span>
            <span>$3,000,000</span>
          </div>
          
          <div className="text-base text-gray-800 mt-2 text-right">
            <span className="font-bold">{formatCurrency(editingVehicle.valor || 0)}</span>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-4">
          <motion.button
            type="button"
            onClick={onCancel}
            className="govuk-button-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            Cancelar
          </motion.button>
          
          <motion.button
            type="submit"
            className="govuk-button flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            Guardar cambios
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default VehicleFormEdit;