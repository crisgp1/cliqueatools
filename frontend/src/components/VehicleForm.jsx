import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoAddOutline, IoTrashOutline, IoReloadOutline } from 'react-icons/io5';
import axios from 'axios';


const VehicleForm = ({ vehicles = [], onAddVehicle, onUpdateVehicle, onRemoveVehicle }) => {
  const [newVehicle, setNewVehicle] = useState({
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    valor: 300000
  });
  
  // Estados para el manejo de API
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Estado para manejo de errores de validación
  const [errors, setErrors] = useState({});

  // API base URL
  const API_URL = '/api/vehicles';

    // Cargar vehículos desde la API
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const response = await axios.get(API_URL);
      if (response.data && Array.isArray(response.data)) {
        // Limpiar los vehículos existentes para evitar duplicados
        if (onAddVehicle && typeof onAddVehicle === 'function') {
          // Añadir cada vehículo al componente padre
          response.data.forEach(vehicle => onAddVehicle({
            ...vehicle,
            // Asegurar que id sea string para evitar problemas de tipado
            id: vehicle.id.toString()
          }));
        }
      }
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
      setApiError('No se pudieron cargar los vehículos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Iniciar carga de vehículos al montar el componente
  useEffect(() => {
    fetchVehicles();
  }, []);

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
      [name]: name === 'valor' || name === 'anio' ? Number(value) : value
    });
    
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors({...errors, [name]: ''});
    }
  };

  // Manejar submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar que los campos obligatorios estén completos
    const newErrors = {};
    if (!newVehicle.marca) {
      newErrors.marca = 'La marca es obligatoria';
    }
    if (!newVehicle.modelo) {
      newErrors.modelo = 'El modelo es obligatorio';
    }
    if (!newVehicle.valor || newVehicle.valor < 50000) {
      newErrors.valor = 'El valor debe ser mayor a $50,000';
    }
    
    // Si hay errores, mostrarlos y detener el proceso
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      setLoading(true);
      setApiError(null);
      
      // Crear vehículo en la API
      const response = await axios.post(API_URL, {
        ...newVehicle
      });
      
      // Agregar el nuevo vehículo al estado
      if (onAddVehicle && typeof onAddVehicle === 'function') {
        onAddVehicle(response.data);
      }
      
      // Limpiar el formulario
      setNewVehicle({
        marca: '',
        modelo: '',
        anio: new Date().getFullYear(),
        valor: 300000
      });
      
      // Limpiar errores
      setErrors({});
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      setApiError('No se pudo crear el vehículo. Verifique los datos e intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar eliminación de vehículo
  const handleRemoveVehicle = async (id) => {
    try {
      setLoading(true);
      setApiError(null);
      
      // Eliminar vehículo de la API
      await axios.delete(`${API_URL}/${id}`);
      
      // Actualizar estado local
      if (onRemoveVehicle && typeof onRemoveVehicle === 'function') {
        onRemoveVehicle(id);
      }
    } catch (error) {
      console.error('Error al eliminar vehículo:', error);
      setApiError('No se pudo eliminar el vehículo. Intente nuevamente.');
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-8">
      {apiError && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">
            Hubo un problema
          </h2>
          <div className="govuk-error-summary__body">
            <p>{apiError}</p>
          </div>
        </div>
      )}
      
      <motion.div 
        className="govuk-form-section"
        initial="hidden"
        animate="visible"
        variants={formAnimation}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="govuk-form-section-title">Agregar nuevo vehículo</h3>
          {loading ? (
            <span className="text-gray-500 inline-flex items-center">
              <IoReloadOutline className="animate-spin h-5 w-5 mr-2" />
              Cargando...
            </span>
          ) : (
            <motion.button
              onClick={fetchVehicles}
              className="govuk-button govuk-button--secondary inline-flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              <IoReloadOutline className="h-5 w-5 mr-2" />
              Actualizar
            </motion.button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="w-full">
              <motion.div className={`govuk-form-group ${errors.marca ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
                <label htmlFor="marca" className="govuk-label">
                  Marca <span className="text-royal-red">*</span>
                </label>
                {errors.marca && (
                  <span className="govuk-error-message">{errors.marca}</span>
                )}
                <input
                  type="text"
                  id="marca"
                  name="marca"
                  value={newVehicle.marca}
                  onChange={handleNewVehicleChange}
                  className={`govuk-input ${errors.marca ? 'govuk-input--error' : ''}`}
                  disabled={loading}
                />
              </motion.div>
            </div>
            
            <div className="w-full">
              <motion.div className={`govuk-form-group ${errors.modelo ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
                <label htmlFor="modelo" className="govuk-label">
                  Modelo <span className="text-royal-red">*</span>
                </label>
                {errors.modelo && (
                  <span className="govuk-error-message">{errors.modelo}</span>
                )}
                <input
                  type="text"
                  id="modelo"
                  name="modelo"
                  value={newVehicle.modelo}
                  onChange={handleNewVehicleChange}
                  className={`govuk-input ${errors.modelo ? 'govuk-input--error' : ''}`}
                  disabled={loading}
                />
              </motion.div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="w-full">
              <motion.div className="govuk-form-group" variants={itemAnimation}>
                <label htmlFor="anio" className="govuk-label">
                  Año
                </label>
                <input
                  type="number"
                  id="anio"
                  name="anio"
                  value={newVehicle.anio}
                  onChange={handleNewVehicleChange}
                  className="govuk-input"
                  disabled={loading}
                />
              </motion.div>
            </div>
            
            <div className="w-full">
              <motion.div className={`govuk-form-group ${errors.valor ? 'govuk-form-group--error' : ''}`} variants={itemAnimation}>
                <label htmlFor="valor" className="govuk-label">
                  Valor del vehículo <span className="text-royal-red">*</span>
                </label>
                {errors.valor && (
                  <span className="govuk-error-message">{errors.valor}</span>
                )}
                  
                <div className="relative mb-2">
                  <div className="govuk-input-prefix">$</div>
                  <input
                    type="number"
                    id="valor"
                    name="valor"
                    step="10000"
                    value={newVehicle.valor}
                    onChange={handleNewVehicleChange}
                    className={`govuk-input govuk-input-with-prefix text-right ${errors.valor ? 'govuk-input--error' : ''}`}
                    disabled={loading}
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
                  className="govuk-slider w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={loading}
                />
                
                <div className="text-base text-royal-black mt-2 text-right">
                  <span className="font-bold">{formatCurrency(newVehicle.valor)}</span>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <motion.button
              type="submit"
              className="govuk-button flex items-center"
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
      
      {vehicles.length > 0 && (
        <motion.div 
          className="govuk-form-section bg-white rounded-lg shadow-sm p-6"
          initial="hidden"
          animate="visible"
          variants={tableAnimation}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h3 className="govuk-form-section-title text-xl font-semibold mb-2 sm:mb-0">Vehículos en el lote ({vehicles.length})</h3>
            <div className="text-right text-sm text-gray-600">
              {loading && <span className="inline-flex items-center"><IoReloadOutline className="animate-spin h-4 w-4 mr-1" /> Actualizando...</span>}
            </div>
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="govuk-table w-full">
              <thead className="hidden sm:table-header-group">
                <tr>
                  <th scope="col" className="govuk-table__header">ID</th>
                  <th scope="col" className="govuk-table__header">Marca/Modelo</th>
                  <th scope="col" className="govuk-table__header">Año</th>
                  <th scope="col" className="govuk-table__header">Valor</th>
                  <th scope="col" className="govuk-table__header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle, index) => (
                  <motion.tr 
                    key={`vehicle-${vehicle.id}-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="sm:table-row flex flex-col border-b border-gray-200 pb-4 mb-4 sm:pb-2 sm:mb-0 rounded-lg sm:rounded-none bg-gray-50 sm:bg-transparent p-4 sm:p-0 mt-4 sm:mt-0"
                  >
                    <td className="govuk-table__cell sm:table-cell block py-1 sm:py-3" data-label="ID:">
                      <span className="sm:hidden font-bold inline-block mb-1 text-gray-700">ID:</span>
                      <span className="text-gray-500 text-sm">{vehicle.id}</span>
                    </td>
                    <td className="govuk-table__cell sm:table-cell block py-1 sm:py-3" data-label="Marca/Modelo:">
                      <span className="sm:hidden font-bold inline-block mb-1 text-gray-700">Marca/Modelo:</span>
                      <span className="font-medium">{vehicle.marca} {vehicle.modelo}</span>
                    </td>
                    <td className="govuk-table__cell sm:table-cell block py-1 sm:py-3" data-label="Año:">
                      <span className="sm:hidden font-bold inline-block mb-1 text-gray-700">Año:</span>
                      {vehicle.anio}
                    </td>
                    <td className="govuk-table__cell sm:table-cell block py-1 sm:py-3" data-label="Valor:">
                      <span className="sm:hidden font-bold inline-block mb-1 text-gray-700">Valor:</span>
                      <span className="font-semibold">{formatCurrency(vehicle.valor)}</span>
                    </td>
                    <td className="govuk-table__cell sm:table-cell sm:text-right block text-right sm:pl-4 pt-3 sm:pt-3 border-t sm:border-0 mt-2 sm:mt-0">
                      <motion.button
                        onClick={() => handleRemoveVehicle(vehicle.id)}
                        disabled={loading}
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
                <tr key="summary-row" className="font-bold sm:table-row flex flex-col sm:flex-row border-t-2 border-gray-300 pt-4 mt-4 bg-gray-100 rounded-lg p-4">
                  <td colSpan="2" className="govuk-table__cell text-left sm:text-right py-2">
                    <span className="text-lg">Valor total:</span>
                  </td>
                  <td colSpan="2" className="govuk-table__cell py-2">
                    <span className="text-lg text-royal-blue">
                      {formatCurrency(vehicles.reduce((sum, vehicle) => sum + vehicle.valor, 0))}
                    </span>
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