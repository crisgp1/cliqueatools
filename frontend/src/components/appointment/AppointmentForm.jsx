import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  IoCalendarOutline, 
  IoPersonOutline, 
  IoCarSportOutline, 
  IoTimeOutline,
  IoLocationOutline,
  IoChatboxOutline,
  IoSaveOutline,
  IoCloseOutline,
  IoAddOutline
} from 'react-icons/io5';
import { AuthContext } from '../../context/AuthContext';
import useVehicleStore from '../../store/vehicleStore';

/**
 * Componente para crear o editar citas
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
        
        // Aquí se cargarían los clientes y usuarios desde la API
        // Por ahora, usamos datos de ejemplo
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
  
  // Simulación de carga de clientes (en producción, se obtendría de la API)
  const fetchClients = async () => {
    // Simular retardo para mostrar la carga
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Datos de ejemplo - reemplazar por llamada a API real
    const mockClients = [
      { id: 1, nombre: 'Juan', apellidos: 'Pérez López' },
      { id: 2, nombre: 'María', apellidos: 'González Rodríguez' },
      { id: 3, nombre: 'Carlos', apellidos: 'Martínez Silva' }
    ];
    
    setClients(mockClients);
  };
  
  // Simulación de carga de usuarios (en producción, se obtendría de la API)
  const fetchUsers = async () => {
    // Simular retardo para mostrar la carga
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Datos de ejemplo - reemplazar por llamada a API real
    const mockUsers = [
      { usuario_id: 1, usuario: 'admin', rol: 'admin' },
      { usuario_id: 2, usuario: 'vendedor1', rol: 'capturista' },
      { usuario_id: 3, usuario: 'gerente', rol: 'gerencia' }
    ];
    
    setUsers(mockUsers);
  };
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error si el campo tiene valor
    if (value.trim() && errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validar el formulario antes de enviar
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.clienteId) {
      newErrors.clienteId = 'Debe seleccionar un cliente';
    }
    
    if (!formData.fecha) {
      newErrors.fecha = 'Debe seleccionar una fecha';
    } else {
      // Validar que la fecha no sea anterior a hoy
      const selectedDate = new Date(formData.fecha);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Eliminar horas para comparar solo fechas
      
      if (selectedDate < today) {
        newErrors.fecha = 'La fecha no puede ser anterior a hoy';
      }
    }
    
    if (!formData.hora) {
      newErrors.hora = 'Debe seleccionar una hora';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
  
  return (
    <motion.div
      className="bg-white shadow rounded-md p-6"
      variants={formAnimation}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
        <IoCalendarOutline className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">
          {isEditing ? 'Editar Cita' : 'Nueva Cita'}
        </h2>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Cargando formulario...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Cliente (campo obligatorio) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="clienteId">
                Cliente <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoPersonOutline className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="clienteId"
                  name="clienteId"
                  value={formData.clienteId}
                  onChange={handleChange}
                  className={`pl-10 block w-full rounded-md border ${
                    errors.clienteId ? 'border-red-300' : 'border-gray-300'
                  } bg-white py-2 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  required
                >
                  <option value="">Seleccione un cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.nombre} {client.apellidos}
                    </option>
                  ))}
                </select>
              </div>
              {errors.clienteId && (
                <p className="mt-1 text-sm text-red-600">{errors.clienteId}</p>
              )}
            </div>
            
            {/* Usuario asignado (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="usuarioId">
                Usuario asignado
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoPersonOutline className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="usuarioId"
                  name="usuarioId"
                  value={formData.usuarioId}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sin asignar</option>
                  {users.map(user => (
                    <option key={user.usuario_id} value={user.usuario_id}>
                      {user.usuario} ({user.rol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Vehículo (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="vehiculoId">
                Vehículo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoCarSportOutline className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="vehiculoId"
                  name="vehiculoId"
                  value={formData.vehiculoId}
                  onChange={handleChange}
                  className="pl-10 block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccione un vehículo (opcional)</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.marca} {vehicle.modelo} ({vehicle.año})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Fecha (campo obligatorio) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fecha">
                Fecha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoCalendarOutline className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="fecha"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
                  className={`pl-10 block w-full rounded-md border ${
                    errors.fecha ? 'border-red-300' : 'border-gray-300'
                  } bg-white py-2 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
              </div>
              {errors.fecha && (
                <p className="mt-1 text-sm text-red-600">{errors.fecha}</p>
              )}
            </div>
            
            {/* Hora (campo obligatorio) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="hora">
                Hora <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoTimeOutline className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  id="hora"
                  name="hora"
                  value={formData.hora}
                  onChange={handleChange}
                  className={`pl-10 block w-full rounded-md border ${
                    errors.hora ? 'border-red-300' : 'border-gray-300'
                  } bg-white py-2 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  required
                />
              </div>
              {errors.hora && (
                <p className="mt-1 text-sm text-red-600">{errors.hora}</p>
              )}
            </div>
            
            {/* Lugar (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lugar">
                Lugar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoLocationOutline className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="lugar"
                  name="lugar"
                  value={formData.lugar}
                  onChange={handleChange}
                  placeholder="Ubicación de la cita"
                  className="pl-10 block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Comentarios (opcional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="comentarios">
              Comentarios
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                <IoChatboxOutline className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="comentarios"
                name="comentarios"
                value={formData.comentarios}
                onChange={handleChange}
                rows="3"
                placeholder="Detalles adicionales o notas para la cita"
                className="pl-10 block w-full rounded-md border border-gray-300 bg-white py-2 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <IoCloseOutline className="h-5 w-5 mr-1" />
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isEditing ? (
                <>
                  <IoSaveOutline className="h-5 w-5 mr-1" />
                  Actualizar
                </>
              ) : (
                <>
                  <IoAddOutline className="h-5 w-5 mr-1" />
                  Crear Cita
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default AppointmentForm;