import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  IoCalendarOutline, 
  IoAddOutline, 
  IoArrowBackOutline,
  IoInformationCircleOutline,
  IoCloseOutline
} from 'react-icons/io5';
import { AuthContext } from '../context/AuthContext';
import useAppointmentStore from '../store/appointmentStore';
import AppointmentList from '../components/appointment/AppointmentList';
import AppointmentForm from '../components/appointment/AppointmentForm';

/**
 * Página para gestionar citas (lista, creación, edición)
 */
const AppointmentPage = () => {
  const { user } = useContext(AuthContext);
  const { 
    appointments, 
    selectedAppointment,
    loading, 
    error,
    loadAppointments,
    addAppointment,
    updateAppointment,
    removeAppointment,
    selectAppointment,
    clearSelectedAppointment
  } = useAppointmentStore();
  
  // Estados para la interfaz
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Cargar citas al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await loadAppointments(token);
      }
    };
    
    fetchData();
  }, []);
  
  // Mostrar notificación temporal
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };
  
  // Mostrar formulario para crear nueva cita
  const handleCreateNew = () => {
    try {
      console.log("Iniciando creación de nueva cita");
      clearSelectedAppointment();
      setIsEditing(false);
      setShowDetails(false);
      // Forzar una actualización asíncrona
      setTimeout(() => {
        setShowForm(true);
        console.log("Formulario de cita visible:", true);
      }, 0);
    } catch (error) {
      console.error("Error al intentar crear nueva cita:", error);
    }
  };
  
  // Mostrar formulario para editar cita existente
  const handleEdit = (appointment) => {
    selectAppointment(appointment);
    setIsEditing(true);
    setShowForm(true);
    setShowDetails(false);
  };
  
  // Mostrar detalles de una cita
  const handleView = (appointment) => {
    selectAppointment(appointment);
    setShowDetails(true);
    setShowForm(false);
  };
  
  // Confirmar eliminación de cita
  const handleDeleteConfirmation = (id) => {
    setConfirmDelete(id);
  };
  
  // Cancelar eliminación
  const handleCancelDelete = () => {
    setConfirmDelete(null);
  };
  
  // Ejecutar eliminación de cita
  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (token) {
      const success = await removeAppointment(token, id);
      if (success) {
        showNotification('Cita eliminada exitosamente');
        setConfirmDelete(null);
      } else {
        showNotification('Error al eliminar la cita', 'error');
      }
    }
  };
  
  // Manejar envío del formulario (crear o actualizar)
  const handleSubmit = async (formData) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      if (isEditing) {
        // Actualizar cita existente
        await updateAppointment(token, formData);
        showNotification('Cita actualizada exitosamente');
      } else {
        // Crear nueva cita
        await addAppointment(token, formData);
        showNotification('Cita creada exitosamente');
      }
      
      // Volver a la lista
      setShowForm(false);
      setShowDetails(false);
    } catch (err) {
      showNotification(err.message || 'Error al guardar la cita', 'error');
    }
  };
  
  // Cancelar formulario
  const handleCancel = () => {
    setShowForm(false);
    if (isEditing || showDetails) {
      setIsEditing(false);
      setShowDetails(false);
      clearSelectedAppointment();
    }
  };
  
  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-MX', options);
  };
  
  // Formatear hora para mostrar
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // Extraer HH:MM
  };
  
  // Renderizar detalles de la cita
  const renderAppointmentDetails = () => {
    if (!selectedAppointment) return null;
    
    return (
      <motion.div
        className="bg-white shadow rounded-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center">
            <IoCalendarOutline className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Detalles de la Cita</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <IoCloseOutline className="h-6 w-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Información del Cliente */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Información del Cliente</h3>
            <p className="text-gray-700 font-medium">{selectedAppointment.cliente}</p>
            {selectedAppointment.clienteObj && (
              <>
                {selectedAppointment.clienteObj.email && (
                  <p className="text-gray-600 mt-1">Email: {selectedAppointment.clienteObj.email}</p>
                )}
                {selectedAppointment.clienteObj.telefono && (
                  <p className="text-gray-600">Teléfono: {selectedAppointment.clienteObj.telefono}</p>
                )}
              </>
            )}
          </div>
          
          {/* Información de la Cita */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Detalles de la Cita</h3>
            <p className="text-gray-700"><span className="font-medium">Fecha:</span> {formatDate(selectedAppointment.fecha)}</p>
            <p className="text-gray-700"><span className="font-medium">Hora:</span> {formatTime(selectedAppointment.hora)}</p>
            <p className="text-gray-700"><span className="font-medium">Lugar:</span> {selectedAppointment.lugar || 'No especificado'}</p>
          </div>
          
          {/* Vehículo (si aplica) */}
          {selectedAppointment.vehiculo && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Vehículo</h3>
              <p className="text-gray-700">{selectedAppointment.vehiculo}</p>
              {selectedAppointment.vehiculoObj && (
                <p className="text-gray-600 mt-1">
                  {selectedAppointment.vehiculoObj.descripcion}
                </p>
              )}
            </div>
          )}
          
          {/* Usuario Asignado */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Usuario Asignado</h3>
            {selectedAppointment.usuario ? (
              <p className="text-gray-700">{selectedAppointment.usuario}</p>
            ) : (
              <p className="text-gray-500 italic">Sin usuario asignado</p>
            )}
          </div>
        </div>
        
        {/* Comentarios */}
        {selectedAppointment.comentarios && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Comentarios</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">{selectedAppointment.comentarios}</p>
            </div>
          </div>
        )}
        
        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <IoArrowBackOutline className="h-5 w-5 mr-1" />
            Volver
          </button>
          <button
            onClick={() => handleEdit(selectedAppointment)}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Editar Cita
          </button>
        </div>
      </motion.div>
    );
  };
  
  // Renderizar notificación
  const renderNotification = () => {
    if (!notification) return null;
    
    const bgColor = notification.type === 'error' ? 'bg-red-100' : 'bg-green-100';
    const textColor = notification.type === 'error' ? 'text-red-800' : 'text-green-800';
    const iconColor = notification.type === 'error' ? 'text-red-400' : 'text-green-400';
    
    return (
      <motion.div
        className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg ${bgColor} max-w-md z-50`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <div className="flex items-center">
          <IoInformationCircleOutline className={`h-5 w-5 ${iconColor} mr-2`} />
          <span className={`text-sm font-medium ${textColor}`}>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className={`ml-auto ${textColor} hover:${textColor}`}
          >
            <IoCloseOutline className="h-5 w-5" />
          </button>
        </div>
      </motion.div>
    );
  };
  
  // Renderizar modal de confirmación para eliminar
  const renderDeleteConfirmation = () => {
    if (confirmDelete === null) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar eliminación</h3>
          <p className="text-gray-600 mb-4">
            ¿Está seguro que desea eliminar esta cita? Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancelDelete}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleDelete(confirmDelete)}
              className="px-4 py-2 border border-transparent rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </motion.div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Encabezado principal */}
      {!showForm && !showDetails && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <IoCalendarOutline className="h-7 w-7 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Sistema de Citas</h1>
          </div>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleCreateNew();
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <IoAddOutline className="h-5 w-5 mr-1" />
            Nueva Cita
          </button>
        </div>
      )}
      
      {/* Mostrar error global si existe */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {/* Contenido principal */}
      {showForm ? (
        <AppointmentForm
          initialValues={isEditing ? selectedAppointment : {}}
          isEditing={isEditing}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : showDetails ? (
        renderAppointmentDetails()
      ) : (
        <AppointmentList
          appointments={appointments}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteConfirmation}
          onView={handleView}
        />
      )}
      
      {/* Notificación */}
      {renderNotification()}
      
      {/* Modal de confirmación para eliminar */}
      {renderDeleteConfirmation()}
    </div>
  );
};

export default AppointmentPage;