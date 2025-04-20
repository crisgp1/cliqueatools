import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoAddOutline, IoCarSportOutline } from 'react-icons/io5';
import { formatCurrency, createEmptyVehicle, validateVehicle, getCurrentYear } from './VehicleUtils';
import Modal from '../../pages/Modal';

/**
 * Componente que muestra un formulario para agregar un nuevo vehículo en un modal
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Indica si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSubmit - Función a llamar cuando se envía el formulario con éxito
 * @param {boolean} props.loading - Indica si hay una operación en curso
 * @returns {JSX.Element}
 */
const VehicleFormModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  // Estado para el nuevo vehículo
  const [newVehicle, setNewVehicle] = useState(createEmptyVehicle());
  
  // Estado para errores de validación
  const [validationErrors, setValidationErrors] = useState({});

  // Reiniciar el formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setNewVehicle(createEmptyVehicle());
      setValidationErrors({});
    }
  }, [isOpen]);

  // Manejar cambios en el formulario
  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    
    console.log(`Campo: ${name}, Valor: ${value}`); // Depuración
    
    if (name === 'valor') {
      // Si el campo es valor, y el valor está vacío, mantenerlo como 0
      // de lo contrario, convertirlo a número
      const newValue = value === '' ? 0 : Number(value);
      
      setNewVehicle(prev => ({
        ...prev,
        [name]: newValue
      }));
      
      // Limpiar error específico cuando el usuario corrige el campo
      if (validationErrors.valor) {
        setValidationErrors(prev => ({
          ...prev,
          valor: undefined
        }));
      }
    } else if (name === 'año') {
      // Convertir año a número
      const yearValue = value === '' ? '' : Number(value);
      
      setNewVehicle(prev => ({
        ...prev,
        [name]: yearValue
      }));
      
      // Limpiar error específico
      if (validationErrors.año) {
        setValidationErrors(prev => ({
          ...prev,
          año: undefined
        }));
      }
    } else {
      setNewVehicle(prev => ({
        ...prev,
        [name]: value
      }));
      
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
    if (!newVehicle.marca) {
      errors.marca = "La marca es obligatoria";
    }
    
    if (!newVehicle.modelo) {
      errors.modelo = "El modelo es obligatorio";
    }
    
    if (!newVehicle.valor) {
      errors.valor = "El valor es obligatorio";
    } else if (Number(newVehicle.valor) <= 0) {
      errors.valor = "El valor debe ser mayor a cero";
    }
    
    // Validar año
    const currentYear = getCurrentYear();
    if (!newVehicle.año) {
      errors.año = "El año es obligatorio";
    } else if (Number(newVehicle.año) < 1900 || Number(newVehicle.año) > currentYear + 1) {
      errors.año = `El año debe estar entre 1900 y ${currentYear + 1}`;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Enviando formulario con datos:', newVehicle); // Depuración
    
    // Validar formulario
    if (!validateForm()) {
      console.log('Validación de formulario fallida', validationErrors); // Depuración
      return;
    }
    
    // Validación adicional con la función general
    if (!validateVehicle(newVehicle)) {
      console.log('Validación de vehículo fallida'); // Depuración
      setValidationErrors({
        general: "Por favor completa todos los campos obligatorios correctamente"
      });
      return;
    }
    
    try {
      // Llamar a la función de envío pasada por props
      const success = await onSubmit(newVehicle);
      
      // Si fue exitoso, limpiar el formulario y cerrar el modal
      if (success) {
        setNewVehicle(createEmptyVehicle());
        setValidationErrors({});
        onClose();
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setValidationErrors({
        general: "Error al guardar el vehículo. Inténtalo de nuevo."
      });
    }
  };

  // Animaciones
  const formAnimation = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar nuevo vehículo"
      size="lg"
    >
      <motion.div
        className="p-2"
        initial="hidden"
        animate="visible"
        variants={formAnimation}
      >
        {/* Depuración */}
        {/* <pre className="text-xs bg-gray-100 p-2 mb-4">
          {JSON.stringify(newVehicle, null, 2)}
        </pre> */}
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
              <label htmlFor="marca" className="govuk-label">
                Marca <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="marca"
                name="marca"
                value={newVehicle.marca}
                onChange={handleVehicleChange}
                className={`govuk-input ${validationErrors.marca ? 'border-red-500' : ''}`}
              />
              {validationErrors.marca && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.marca}</p>
              )}
            </motion.div>
            
            <motion.div className="govuk-form-group" variants={itemAnimation}>
              <label htmlFor="modelo" className="govuk-label">
                Modelo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="modelo"
                name="modelo"
                value={newVehicle.modelo}
                onChange={handleVehicleChange}
                className={`govuk-input ${validationErrors.modelo ? 'border-red-500' : ''}`}
              />
              {validationErrors.modelo && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.modelo}</p>
              )}
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div className="govuk-form-group" variants={itemAnimation}>
              <label htmlFor="año" className="govuk-label">
                Año <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="año"
                name="año"
                value={newVehicle.año}
                onChange={handleVehicleChange}
                className={`govuk-input ${validationErrors.año ? 'border-red-500' : ''}`}
              />
              {validationErrors.año && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.año}</p>
              )}
            </motion.div>
            
            <motion.div className="govuk-form-group" variants={itemAnimation}>
              <label htmlFor="valor" className="govuk-label">
                Valor del vehículo <span className="text-red-500">*</span>
              </label>
                
              <div className="relative mb-2">
                <div className="govuk-input-prefix">$</div>
                <input
                  type="number"
                  id="valor"
                  name="valor"
                  value={newVehicle.valor}
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
                <span className="font-bold">{formatCurrency(newVehicle.valor || 0)}</span>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Color */}
            <motion.div className="govuk-form-group" variants={itemAnimation}>
              <label htmlFor="color" className="govuk-label">
                Color <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="color"
                name="color"
                value={newVehicle.color}
                onChange={handleVehicleChange}
                className={`govuk-input ${validationErrors.color ? 'border-red-500' : ''}`}
              />
              {validationErrors.color && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.color}</p>
              )}
            </motion.div>
            
            {/* Tipo */}
            <motion.div className="govuk-form-group" variants={itemAnimation}>
              <label htmlFor="tipo" className="govuk-label">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                id="tipo"
                name="tipo"
                value={newVehicle.tipo || 'automovil'}
                onChange={handleVehicleChange}
                className={`govuk-select ${validationErrors.tipo ? 'border-red-500' : ''}`}
              >
                <option value="automovil">Automóvil</option>
                <option value="camioneta">Camioneta</option>
                <option value="suv">SUV</option>
                <option value="pickup">Pickup</option>
                <option value="motocicleta">Motocicleta</option>
                <option value="otro">Otro</option>
              </select>
              {validationErrors.tipo && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.tipo}</p>
              )}
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Número de Motor */}
            <motion.div className="govuk-form-group" variants={itemAnimation}>
              <label htmlFor="numero_motor" className="govuk-label">
                Número de Motor
              </label>
              <input
                type="text"
                id="numero_motor"
                name="numero_motor"
                value={newVehicle.numero_motor}
                onChange={handleVehicleChange}
                className={`govuk-input ${validationErrors.numero_motor ? 'border-red-500' : ''}`}
              />
              {validationErrors.numero_motor && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.numero_motor}</p>
              )}
            </motion.div>
            
            {/* Número de Serie */}
            <motion.div className="govuk-form-group" variants={itemAnimation}>
              <label htmlFor="numero_serie" className="govuk-label">
                Número de Serie <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="numero_serie"
                name="numero_serie"
                value={newVehicle.numero_serie}
                onChange={handleVehicleChange}
                className={`govuk-input ${validationErrors.numero_serie ? 'border-red-500' : ''}`}
              />
              {validationErrors.numero_serie && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.numero_serie}</p>
              )}
            </motion.div>
          </div>
          
          <div className="flex justify-end mt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="govuk-button-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <motion.button
              type="submit"
              className="govuk-button bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              <IoAddOutline className="h-5 w-5 mr-2" />
              Agregar vehículo
            </motion.button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default VehicleFormModal;