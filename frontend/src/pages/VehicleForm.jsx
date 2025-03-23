import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoAddOutline, IoTrashOutline, IoCarSportOutline, IoCalculatorOutline, IoCheckmarkDoneOutline } from 'react-icons/io5';
import Modal from './Modal';

const VehicleForm = ({ vehicles, onAddVehicle, onUpdateVehicle, onRemoveVehicle }) => {
  const [newVehicle, setNewVehicle] = useState({
    marca: '',
    modelo: '',
    año: new Date().getFullYear(),
    valor: ''
  });
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Comprueba si el modal ya se mostró para esta sesión
  const checkIfModalShown = () => {
    return localStorage.getItem('vehicleInfoModalShown') === 'true';
  };
  
  // Marca el modal como mostrado en localStorage
  const markModalAsShown = () => {
    localStorage.setItem('vehicleInfoModalShown', 'true');
  };
  
  // Cierra el modal y lo marca como ya mostrado
  const handleCloseModal = () => {
    setShowInfoModal(false);
    markModalAsShown();
  };

  // Generar ID único
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Manejar cambios en el formulario de nuevo vehículo
  const handleNewVehicleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'valor') {
      // Si el campo es valor, y el valor está vacío, mantenerlo vacío
      // de lo contrario, convertirlo a número
      const newValue = value === '' ? '' : Number(value);
      setNewVehicle({
        ...newVehicle,
        [name]: newValue
      });
    } else {
      setNewVehicle({
        ...newVehicle,
        [name]: name === 'año' ? Number(value) : value
      });
    }
  };

  // Manejar submit del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Verificar que los campos obligatorios estén completos
    if (!newVehicle.marca || !newVehicle.modelo || !newVehicle.valor) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    
    // Agregar el nuevo vehículo
    onAddVehicle({
      ...newVehicle,
      id: generateId()
    });
    
    // Limpiar el formulario
    setNewVehicle({
      marca: '',
      modelo: '',
      año: new Date().getFullYear(),
      valor: ''
    });
    
    // Mostrar el modal informativo solo si no se ha mostrado antes
    if (!checkIfModalShown()) {
      setShowInfoModal(true);
    }
  };

  // Variantes de animación para los elementos
  const formAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
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

  const tableAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        delay: 0.2
      }
    }
  };

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
    <div className="space-y-8">
      {/* Modal Informativo */}
      <Modal 
        isOpen={showInfoModal} 
        onClose={handleCloseModal}
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
              onClick={handleCloseModal}
              className="govuk-button"
            >
              Entendido
            </button>
          </motion.div>
        </motion.div>
      </Modal>
      <motion.div 
        className="govuk-form-section"
        initial="hidden"
        animate="visible"
        variants={formAnimation}
      >
        <h3 className="govuk-form-section-title">Agregar nuevo vehículo</h3>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
         
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div className="govuk-form-group" variants={itemAnimation}>
              <label htmlFor="marca" className="govuk-label">
                Marca <span className="text-royal-red">*</span>
              </label>
              <input
                type="text"
                id="marca"
                name="marca"
                value={newVehicle.marca}
                onChange={handleNewVehicleChange}
                className="govuk-input"
              />
            </motion.div>
            
            <motion.div className="govuk-form-group" variants={itemAnimation}>
              <label htmlFor="modelo" className="govuk-label">
                Modelo <span className="text-royal-red">*</span>
              </label>
              <input
                type="text"
                id="modelo"
                name="modelo"
                value={newVehicle.modelo}
                onChange={handleNewVehicleChange}
                className="govuk-input"
              />
            </motion.div>
          </div>
          
          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="año" className="govuk-label">
              Año
            </label>
            <input
              type="number"
              id="año"
              name="año"
              value={newVehicle.año}
              onChange={handleNewVehicleChange}
              className="govuk-input"
            />
          </motion.div>
          
          <motion.div className="govuk-form-group" variants={itemAnimation}>
            <label htmlFor="valor" className="govuk-label">
              Valor del vehículo <span className="text-royal-red">*</span>
            </label>
              
            <div className="relative mb-2">
              <div className="govuk-input-prefix">$</div>
              <input
                type="number"
                id="valor"
                name="valor"
                value={newVehicle.valor}
                onChange={handleNewVehicleChange}
                className="govuk-input govuk-input-with-prefix text-right"
                placeholder="Ingresa el valor"
              />
            </div>
            
            <div className="mb-1 flex justify-between text-sm text-royal-gray-600">
              <span>$50,000</span>
              <span>$3,000,000</span>
            </div>
            
            <input
              type="range"
              value={newVehicle.valor || 300000}
              onChange={(e) => handleNewVehicleChange({ target: { name: 'valor', value: e.target.value } })}
              className="govuk-slider"
            />
            
            <div className="text-base text-royal-black mt-2 text-right">
              <span className="font-bold">{formatCurrency(newVehicle.valor)}</span>
            </div>
          </motion.div>
          
          <div className="flex justify-end mt-4">
            <motion.button
              type="submit"
              className="govuk-button flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <IoAddOutline className="h-5 w-5 mr-2" />
              Agregar vehículo
            </motion.button>
          </div>
        </form>
      </motion.div>
      
      {vehicles.length > 0 && (
        <motion.div 
          className="govuk-form-section"
          initial="hidden"
          animate="visible"
          variants={tableAnimation}
        >
          <h3 className="govuk-form-section-title">Vehículos en el lote ({vehicles.length})</h3>
          <div className="overflow-x-auto">
            <table className="govuk-table min-w-full">
              <thead className="hidden sm:table-header-group">
                <tr>
                  <th scope="col" className="govuk-table__header">Marca/Modelo</th>
                  <th scope="col" className="govuk-table__header">Año</th>
                  <th scope="col" className="govuk-table__header">Valor</th>
                  <th scope="col" className="govuk-table__header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <motion.tr 
                    key={vehicle.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="sm:table-row flex flex-col border-b border-gray-200 pb-3 mb-3 sm:pb-0 sm:mb-0"
                  >
                    <td className="govuk-table__cell sm:table-cell block" data-label="Marca/Modelo:">
                      <span className="sm:hidden font-bold inline-block mb-1">Marca/Modelo:</span>
                      {vehicle.marca} {vehicle.modelo}
                    </td>
                    <td className="govuk-table__cell sm:table-cell block" data-label="Año:">
                      <span className="sm:hidden font-bold inline-block mb-1">Año:</span>
                      {vehicle.año}
                    </td>
                    <td className="govuk-table__cell sm:table-cell block" data-label="Valor:">
                      <span className="sm:hidden font-bold inline-block mb-1">Valor:</span>
                      {formatCurrency(vehicle.valor)}
                    </td>
                    <td className="govuk-table__cell sm:table-cell sm:text-right block text-left pt-2">
                      <motion.button
                        onClick={() => onRemoveVehicle(vehicle.id)}
                        className="text-royal-red hover:text-royal-red/80"
                        title="Eliminar vehículo"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <IoTrashOutline className="h-5 w-5" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
                <tr className="font-bold sm:table-row flex flex-col sm:flex-row border-t-2 border-gray-300 pt-3">
                  <td colSpan="3" className="govuk-table__cell text-left sm:text-right">
                    Valor total:
                  </td>
                  <td colSpan="2" className="govuk-table__cell">
                    {formatCurrency(vehicles.reduce((sum, vehicle) => sum + vehicle.valor, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VehicleForm;