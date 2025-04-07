import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoCalendarOutline, 
  IoPersonOutline, 
  IoCarSportOutline, 
  IoTimeOutline,
  IoLocationOutline,
  IoChatboxOutline,
  IoSaveOutline,
  IoCloseOutline,
  IoAddOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline
} from 'react-icons/io5';
import { AuthContext } from '../../context/AuthContext';
import useVehicleStore from '../../store/vehicleStore';
import ClientService from '../../services/ClientService';

/**
 * Componente para crear o editar citas con UI mejorada
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.initialValues - Valores iniciales para el formulario (cuando se edita)
 * @param {boolean} props.isEditing - Indica si se está editando una cita existente
 * @param {Function} props.onSubmit - Función a llamar al enviar el formulario
 * @param {Function} props.onCancel - Función a llamar al cancelar
 * @returns {JSX.Element}
 */
const AppointmentForm = ({ initialValues = {}, isEditing = false, onSubmit, onCancel }) => {
  const { user } = useContext(AuthContext);
  const { vehicles, loadVehicles } = useVehicleStore();
  
  // Estado para clientes disponibles
  const [clients, setClients] = useState([]);
  // Estado para usuarios disponibles
  const [users, setUsers] = useState([]);
  // Estado para cargar datos
  const [loading, setLoading] = useState(false);
  // Estado para errores de formulario
  const [errors, setErrors] = useState({});
  // Estado para campos que han sido tocados (para validación)
  const [touched, setTouched] = useState({});
  // Estado para la sección activa en formularios largos
  const [activeStep, setActiveStep] = useState(1);
  // Estado para mostrar tooltip
  const [tooltip, setTooltip] = useState(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    clienteId: initialValues.clienteId || '',
    usuarioId: initialValues.usuarioId || user?.usuario_id || '',
    vehiculoId: initialValues.vehiculoId || '',
    fecha: initialValues.fecha || new Date().toISOString().split('T')[0],
    hora: initialValues.hora || '09:00',
    lugar: initialValues.lugar || '',
    comentarios: initialValues.comentarios || ''
  });
  
  // Cargar datos necesarios al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar vehículos si no se han cargado ya
        if (vehicles.length === 0) {
          const token = localStorage.getItem('token');
          if (token) {
            await loadVehicles(token);
          }
        }
        
        // Cargar clientes y usuarios desde la API
        await fetchClients();
        await fetchUsers();
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Cargar clientes desde la API usando ClientService
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      console.log('Cargando clientes usando ClientService...');
      const response = await ClientService.getClients(token);
      
      if (response.success && Array.isArray(response.data)) {
        console.log('Clientes cargados correctamente:', response.data.length);
        setClients(response.data.map(cliente => ({
          id: cliente.cliente_id,
          nombre: cliente.nombre,
          apellidos: cliente.apellidos
        })));
      } else {
        console.error('Formato de respuesta inesperado para clientes:', response);
        // Si no hay datos o hay un error, usar datos de ejemplo
        const mockClients = [
          { id: 1, nombre: 'Juan', apellidos: 'Pérez López' },
          { id: 2, nombre: 'María', apellidos: 'González Rodríguez' },
          { id: 3, nombre: 'Carlos', apellidos: 'Martínez Silva' }
        ];
        
        setClients(mockClients);
      }
    } catch (error) {
      console.error('Error en fetchClients usando ClientService:', error);
      // En caso de error, usar datos de ejemplo
      const mockClients = [
        { id: 1, nombre: 'Juan', apellidos: 'Pérez López' },
        { id: 2, nombre: 'María', apellidos: 'González Rodríguez' },
        { id: 3, nombre: 'Carlos', apellidos: 'Martínez Silva' }
      ];
      
      setClients(mockClients);
    }
  };
  
  // Cargar usuarios desde la API
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data.map(usuario => ({
          usuario_id: usuario.usuario_id,
          usuario: usuario.usuario,
          rol: usuario.rol
        })));
      } else {
        // Si no hay datos o hay un error, usar datos de ejemplo
        const mockUsers = [
          { usuario_id: 1, usuario: 'admin', rol: 'admin' },
          { usuario_id: 2, usuario: 'vendedor1', rol: 'capturista' },
          { usuario_id: 3, usuario: 'gerente', rol: 'gerencia' }
        ];
        
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // En caso de error, usar datos de ejemplo
      const mockUsers = [
        { usuario_id: 1, usuario: 'admin', rol: 'admin' },
        { usuario_id: 2, usuario: 'vendedor1', rol: 'capturista' },
        { usuario_id: 3, usuario: 'gerente', rol: 'gerencia' }
      ];
      
      setUsers(mockUsers);
    }
  };
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Marcar el campo como tocado
    if (!touched[name]) {
      setTouched(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
    // Validar el campo
    validateField(name, value);
  };

  // Validar un campo específico
  const validateField = (name, value) => {
    let fieldError = null;
    
    switch (name) {
      case 'clienteId':
        if (!value) {
          fieldError = 'Debe seleccionar un cliente';
        }
        break;
      case 'fecha':
        if (!value) {
          fieldError = 'Debe seleccionar una fecha';
        } else {
          // Validar que la fecha no sea anterior a hoy
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Eliminar horas para comparar solo fechas
          
          if (selectedDate < today) {
            fieldError = 'La fecha no puede ser anterior a hoy';
          }
        }
        break;
      case 'hora':
        if (!value) {
          fieldError = 'Debe seleccionar una hora';
        }
        break;
      default:
        // No hay validaciones adicionales para otros campos
        break;
    }
    
    // Actualizar estado de errores
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
    
    return !fieldError;
  };
  
  // Validar el formulario completo
  const validateForm = () => {
    // Validar todos los campos
    const newErrors = {};
    let isValid = true;
    
    // Validar cliente
    if (!formData.clienteId) {
      newErrors.clienteId = 'Debe seleccionar un cliente';
      isValid = false;
    }
    
    // Validar fecha
    if (!formData.fecha) {
      newErrors.fecha = 'Debe seleccionar una fecha';
      isValid = false;
    } else {
      const selectedDate = new Date(formData.fecha);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.fecha = 'La fecha no puede ser anterior a hoy';
        isValid = false;
      }
    }
    
    // Validar hora
    if (!formData.hora) {
      newErrors.hora = 'Debe seleccionar una hora';
      isValid = false;
    }
    
    // Marcar todos los campos como tocados
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    
    setTouched(allTouched);
    setErrors(newErrors);
    
    return isValid;
  };
  
  // Manejar pérdida de foco en campos para validación
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };
  
  // Mostrar tooltip de ayuda
  const showFieldTooltip = (fieldName) => {
    const tooltips = {
      clienteId: 'Selecciona el cliente para esta cita',
      usuarioId: 'Asigna un usuario responsable para la cita',
      vehiculoId: 'Selecciona el vehículo relacionado con la cita',
      fecha: 'Selecciona la fecha de la cita',
      hora: 'Selecciona la hora de la cita',
      lugar: 'Especifica la ubicación donde se llevará a cabo la cita',
      comentarios: 'Añade notas importantes o detalles sobre la cita'
    };
    
    setTooltip({
      field: fieldName,
      text: tooltips[fieldName] || 'Campo del formulario'
    });
  };
  
  // Ocultar tooltip
  const hideTooltip = () => {
    setTooltip(null);
  };
  
  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convertir tipos de datos antes de enviar
      const formattedData = {
        ...formData,
        clienteId: Number(formData.clienteId),
        usuarioId: formData.usuarioId ? Number(formData.usuarioId) : null,
        vehiculoId: formData.vehiculoId ? Number(formData.vehiculoId) : null
      };
      
      if (isEditing) {
        formattedData.id = initialValues.id;
      }
      
      onSubmit(formattedData);
    }
  };
  
  // Verificar si un campo tiene errores y ha sido tocado
  const hasError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };
  
  // Verificar si un campo es válido y ha sido tocado
  const isValid = (fieldName) => {
    return touched[fieldName] && !errors[fieldName] && formData[fieldName];
  };
  
  // Renderizar indicador de estado del campo
  const renderFieldStatus = (fieldName) => {
    if (hasError(fieldName)) {
      return (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <IoAlertCircleOutline className="h-5 w-5 text-red-500" />
        </div>
      );
    }
    
    if (isValid(fieldName)) {
      return (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <IoCheckmarkCircleOutline className="h-5 w-5 text-green-500" />
        </div>
      );
    }
    
    return null;
  };
  
  // Renderizar tooltip
  const renderTooltip = () => {
    if (!tooltip) return null;
    
    return (
      <div className="absolute z-10 mt-2 bg-gray-800 text-white p-2 rounded-md text-sm shadow-lg max-w-xs">
        {tooltip.text}
        <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-800"></div>
      </div>
    );
  };
  
  // Animaciones
  const formAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  const inputAnimation = {
    focus: { scale: 1.02, boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" },
    tap: { scale: 0.98 }
  };
  
  const buttonAnimation = {
    hover: { scale: 1.05, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)" },
    tap: { scale: 0.95 }
  };
  
  return (
    <motion.div
      className="bg-white shadow-lg rounded-xl overflow-hidden"
      variants={formAnimation}
      initial="hidden"
      animate="visible"
    >
      {/* Encabezado del formulario con degradado */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
        <div className="flex items-center">
          <div className="bg-white p-2 rounded-full mr-3">
            <IoCalendarOutline className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold">
            {isEditing ? 'Editar Cita' : 'Nueva Cita'}
          </h2>
        </div>
        <p className="text-blue-100 mt-1 text-sm">
          {isEditing 
            ? 'Actualiza los detalles de la cita existente' 
            : 'Programa una nueva cita con un cliente'}
        </p>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Cargando formulario...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Cliente (campo obligatorio) */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center" htmlFor="clienteId">
                Cliente <span className="text-red-500 ml-1">*</span>
                <button 
                  type="button"
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onMouseEnter={() => showFieldTooltip('clienteId')}
                  onMouseLeave={hideTooltip}
                >
                  <IoInformationCircleOutline className="h-4 w-4" />
                </button>
                {tooltip && tooltip.field === 'clienteId' && renderTooltip()}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoPersonOutline className={`h-5 w-5 ${hasError('clienteId') ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <motion.select
                  id="clienteId"
                  name="clienteId"
                  value={formData.clienteId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  whileFocus="focus"
                  whileTap="tap"
                  variants={inputAnimation}
                  className={`pl-10 block w-full rounded-lg border ${
                    hasError('clienteId') 
                      ? 'border-red-300 text-red-600 bg-red-50' 
                      : isValid('clienteId')
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 bg-white'
                  } py-3 pr-10 focus:outline-none focus:ring-2 ${
                    hasError('clienteId') ? 'focus:ring-red-200' : 'focus:ring-blue-200'
                  } focus:border-blue-500 transition-colors duration-200`}
                  required
                >
                  <option value="">Seleccione un cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.nombre} {client.apellidos}
                    </option>
                  ))}
                </motion.select>
                {renderFieldStatus('clienteId')}
              </div>
              <AnimatePresence>
                {hasError('clienteId') && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1 text-sm text-red-600 flex items-center"
                  >
                    <IoAlertCircleOutline className="h-4 w-4 mr-1" />
                    {errors.clienteId}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            {/* Usuario asignado (opcional) */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center" htmlFor="usuarioId">
                Usuario asignado
                <button 
                  type="button"
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onMouseEnter={() => showFieldTooltip('usuarioId')}
                  onMouseLeave={hideTooltip}
                >
                  <IoInformationCircleOutline className="h-4 w-4" />
                </button>
                {tooltip && tooltip.field === 'usuarioId' && renderTooltip()}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoPersonOutline className="h-5 w-5 text-gray-400" />
                </div>
                <motion.select
                  id="usuarioId"
                  name="usuarioId"
                  value={formData.usuarioId}
                  onChange={handleChange}
                  whileFocus="focus"
                  whileTap="tap"
                  variants={inputAnimation}
                  className="pl-10 block w-full rounded-lg border border-gray-300 bg-white py-3 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Sin asignar</option>
                  {users.map(user => (
                    <option key={user.usuario_id} value={user.usuario_id}>
                      {user.usuario} ({user.rol})
                    </option>
                  ))}
                </motion.select>
                {renderFieldStatus('usuarioId')}
              </div>
            </div>
            
            {/* Vehículo (opcional) */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center" htmlFor="vehiculoId">
                Vehículo
                <button 
                  type="button"
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onMouseEnter={() => showFieldTooltip('vehiculoId')}
                  onMouseLeave={hideTooltip}
                >
                  <IoInformationCircleOutline className="h-4 w-4" />
                </button>
                {tooltip && tooltip.field === 'vehiculoId' && renderTooltip()}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoCarSportOutline className="h-5 w-5 text-gray-400" />
                </div>
                <motion.select
                  id="vehiculoId"
                  name="vehiculoId"
                  value={formData.vehiculoId}
                  onChange={handleChange}
                  whileFocus="focus"
                  whileTap="tap"
                  variants={inputAnimation}
                  className="pl-10 block w-full rounded-lg border border-gray-300 bg-white py-3 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">Seleccione un vehículo (opcional)</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.marca} {vehicle.modelo} ({vehicle.año})
                    </option>
                  ))}
                </motion.select>
                {renderFieldStatus('vehiculoId')}
              </div>
            </div>
            
            {/* Fecha (campo obligatorio) */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center" htmlFor="fecha">
                Fecha <span className="text-red-500 ml-1">*</span>
                <button 
                  type="button"
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onMouseEnter={() => showFieldTooltip('fecha')}
                  onMouseLeave={hideTooltip}
                >
                  <IoInformationCircleOutline className="h-4 w-4" />
                </button>
                {tooltip && tooltip.field === 'fecha' && renderTooltip()}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoCalendarOutline className={`h-5 w-5 ${hasError('fecha') ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <motion.input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
                  whileFocus="focus"
                  whileTap="tap"
                  variants={inputAnimation}
                  className={`pl-10 block w-full rounded-lg border ${
                    hasError('fecha') 
                      ? 'border-red-300 text-red-600 bg-red-50' 
                      : isValid('fecha')
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 bg-white'
                  } py-3 pr-10 focus:outline-none focus:ring-2 ${
                    hasError('fecha') ? 'focus:ring-red-200' : 'focus:ring-blue-200'
                  } focus:border-blue-500 transition-all duration-200`}
                  required
                />
                {renderFieldStatus('fecha')}
              </div>
              <AnimatePresence>
                {hasError('fecha') && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1 text-sm text-red-600 flex items-center"
                  >
                    <IoAlertCircleOutline className="h-4 w-4 mr-1" />
                    {errors.fecha}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            {/* Hora (campo obligatorio) */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center" htmlFor="hora">
                Hora <span className="text-red-500 ml-1">*</span>
                <button 
                  type="button"
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onMouseEnter={() => showFieldTooltip('hora')}
                  onMouseLeave={hideTooltip}
                >
                  <IoInformationCircleOutline className="h-4 w-4" />
                </button>
                {tooltip && tooltip.field === 'hora' && renderTooltip()}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoTimeOutline className={`h-5 w-5 ${hasError('hora') ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <motion.input
                  type="time"
                  id="hora"
                  name="hora"
                  value={formData.hora}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  whileFocus="focus"
                  whileTap="tap"
                  variants={inputAnimation}
                  className={`pl-10 block w-full rounded-lg border ${
                    hasError('hora') 
                      ? 'border-red-300 text-red-600 bg-red-50' 
                      : isValid('hora')
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 bg-white'
                  } py-3 pr-10 focus:outline-none focus:ring-2 ${
                    hasError('hora') ? 'focus:ring-red-200' : 'focus:ring-blue-200'
                  } focus:border-blue-500 transition-all duration-200`}
                  required
                />
                {renderFieldStatus('hora')}
              </div>
              <AnimatePresence>
                {hasError('hora') && (
                  <motion.p 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1 text-sm text-red-600 flex items-center"
                  >
                    <IoAlertCircleOutline className="h-4 w-4 mr-1" />
                    {errors.hora}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            {/* Lugar (opcional) */}
            <div className="relative md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center" htmlFor="lugar">
                Lugar
                <button 
                  type="button"
                  className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  onMouseEnter={() => showFieldTooltip('lugar')}
                  onMouseLeave={hideTooltip}
                >
                  <IoInformationCircleOutline className="h-4 w-4" />
                </button>
                {tooltip && tooltip.field === 'lugar' && renderTooltip()}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoLocationOutline className="h-5 w-5 text-gray-400" />
                </div>
                <motion.input
                  type="text"
                  id="lugar"
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleChange}
                  placeholder="Ubicación de la cita"
                  whileFocus="focus"
                  whileTap="tap"
                  variants={inputAnimation}
                  className="pl-10 block w-full rounded-lg border border-gray-300 bg-white py-3 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>
          
          {/* Comentarios (opcional) */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center" htmlFor="comentarios">
              Comentarios
              <button 
                type="button"
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onMouseEnter={() => showFieldTooltip('comentarios')}
                onMouseLeave={hideTooltip}
              >
                <IoInformationCircleOutline className="h-4 w-4" />
              </button>
              {tooltip && tooltip.field === 'comentarios' && renderTooltip()}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                <IoChatboxOutline className="h-5 w-5 text-gray-400" />
              </div>
              <motion.textarea
                id="comentarios"
                name="comentarios"
                value={formData.comentarios}
                onChange={handleChange}
                rows="4"
                placeholder="Detalles adicionales o notas para la cita"
                whileFocus="focus"
                whileTap="tap"
                variants={inputAnimation}
                className="pl-10 block w-full rounded-lg border border-gray-300 bg-white py-3 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>
          
          {/* Resumen de la cita */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <IoInformationCircleOutline className="h-5 w-5 mr-1 text-blue-500" />
              Resumen de la cita
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Cliente:</span>{' '}
                {formData.clienteId 
                  ? clients.find(c => c.id === parseInt(formData.clienteId))?.nombre + ' ' + 
                    clients.find(c => c.id === parseInt(formData.clienteId))?.apellidos
                  : 'No seleccionado'}
              </div>
              <div>
                <span className="font-medium">Fecha:</span>{' '}
                {formData.fecha ? new Date(formData.fecha).toLocaleDateString('es-MX') : 'No seleccionada'}
              </div>
              <div>
                <span className="font-medium">Hora:</span>{' '}
                {formData.hora || 'No seleccionada'}
              </div>
              <div>
                <span className="font-medium">Lugar:</span>{' '}
                {formData.lugar || 'No especificado'}
              </div>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <motion.button
              type="button"
              onClick={onCancel}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <IoCloseOutline className="h-5 w-5 mr-1" />
              Cancelar
            </motion.button>
            <motion.button
              type="submit"
              variants={buttonAnimation}
              whileHover="hover"
              whileTap="tap"
              className="inline-flex justify-center items-center px-5 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              {isEditing ? (
                <>
                  <IoSaveOutline className="h-5 w-5 mr-2" />
                  Actualizar Cita
                </>
              ) : (
                <>
                  <IoAddOutline className="h-5 w-5 mr-2" />
                  Crear Cita
                </>
              )}
            </motion.button>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default AppointmentForm;