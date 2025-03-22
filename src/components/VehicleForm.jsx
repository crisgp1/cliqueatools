import { useState } from 'react';
import { motion } from 'framer-motion';
import { IoAddOutline, IoTrashOutline } from 'react-icons/io5';

const VehicleForm = ({ vehicles, onAddVehicle, onUpdateVehicle, onRemoveVehicle }) => {
  const [newVehicle, setNewVehicle] = useState({
    descripcion: '',
    marca: '',
    modelo: '',
    año: new Date().getFullYear(),
    valor: 300000
  });

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
    setNewVehicle({
      ...newVehicle,
      [name]: name === 'valor' || name === 'año' ? Number(value) : value
    });
  };

  // Manejar submit del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Verificar que los campos obligatorios estén completos
    if (!newVehicle.descripcion || !newVehicle.marca || !newVehicle.modelo || !newVehicle.valor) {
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
      descripcion: '',
      marca: '',
      modelo: '',
      año: new Date().getFullYear(),
      valor: 300000
    });
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

  return (
    <div className="space-y-8">
      <motion.div 
        className="govuk-form-section"
        initial="hidden"
        animate="visible"
        variants={formAnimation}
      >
        <h3 className="govuk-form-section-title">Agregar nuevo vehículo</h3>
        <form onSubmit={handleSubmit}>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <motion.div className="govuk-form-group" variants={itemAnimation}>
                <label htmlFor="descripcion" className="govuk-label">
                  Descripción <span className="text-royal-red">*</span>
                </label>
                <input
                  type="text"
                  id="descripcion"
                  name="descripcion"
                  value={newVehicle.descripcion}
                  onChange={handleNewVehicleChange}
                  className="govuk-input"
                  required
                />
                <span className="govuk-form-hint">Nombre o descripción breve del vehículo</span>
              </motion.div>
            </div>
            
            <div className="govuk-grid-column-one-half">
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
                  required
                />
              </motion.div>
            </div>
            
            <div className="govuk-grid-column-one-half">
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
                  required
                />
              </motion.div>
            </div>
            
            <div className="govuk-grid-column-one-half">
              <motion.div className="govuk-form-group" variants={itemAnimation}>
                <label htmlFor="año" className="govuk-label">
                  Año
                </label>
                <input
                  type="number"
                  id="año"
                  name="año"
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  value={newVehicle.año}
                  onChange={handleNewVehicleChange}
                  className="govuk-input"
                />
              </motion.div>
            </div>
            
            <div className="govuk-grid-column-full">
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
                    min="50000"
                    max="3000000"
                    step="10000"
                    value={newVehicle.valor}
                    onChange={handleNewVehicleChange}
                    className="govuk-input govuk-input-with-prefix text-right"
                    required
                  />
                </div>
                
                <div className="mb-1 flex justify-between text-sm text-royal-gray-600">
                  <span>$50,000</span>
                  <span>$3,000,000</span>
                </div>
                
                <input
                  type="range"
                  min="50000"
                  max="3000000"
                  step="10000"
                  value={newVehicle.valor}
                  onChange={(e) => handleNewVehicleChange({ target: { name: 'valor', value: e.target.value } })}
                  className="govuk-slider"
                />
                
                <div className="text-base text-royal-black mt-2 text-right">
                  <span className="font-bold">{formatCurrency(newVehicle.valor)}</span>
                </div>
              </motion.div>
            </div>
            
            <div className="govuk-grid-column-full flex justify-end mt-4">
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
            <table className="govuk-table">
              <thead>
                <tr>
                  <th scope="col" className="govuk-table__header">Descripción</th>
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
                  >
                    <td className="govuk-table__cell">
                      {vehicle.descripcion}
                    </td>
                    <td className="govuk-table__cell">
                      {vehicle.marca} {vehicle.modelo}
                    </td>
                    <td className="govuk-table__cell">
                      {vehicle.año}
                    </td>
                    <td className="govuk-table__cell">
                      {formatCurrency(vehicle.valor)}
                    </td>
                    <td className="govuk-table__cell text-right">
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
                <tr className="font-bold">
                  <td colSpan="3" className="govuk-table__cell text-right">
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