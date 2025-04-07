import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoCalendarOutline, 
  IoPencilOutline, 
  IoTrashOutline, 
  IoSearchOutline,
  IoGridOutline,
  IoListOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoFilterOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoCarSportOutline,
  IoLocationOutline,
  IoEyeOutline
} from 'react-icons/io5';

/**
 * Componente que muestra la lista de citas con opciones para editar y eliminar
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.appointments - Lista de citas a mostrar
 * @param {boolean} props.loading - Indica si está cargando datos
 * @param {Function} props.onEdit - Función a llamar al hacer clic en editar cita
 * @param {Function} props.onDelete - Función a llamar al hacer clic en eliminar cita
 * @param {Function} props.onView - Función a llamar al hacer clic en ver detalles
 * @returns {JSX.Element}
 */
const AppointmentList = ({ appointments = [], loading = false, onEdit, onDelete, onView }) => {
  // Estado para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' o 'grid'
  const [filterDate, setFilterDate] = useState('');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Ajustar según necesidad
  
  // Filtrar citas basado en término de búsqueda y fecha
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;
    
    // Filtrar por fecha si se especifica
    if (filterDate) {
      filtered = filtered.filter(appointment => 
        appointment.fecha === filterDate
      );
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(appointment => 
        (appointment.cliente && appointment.cliente.toLowerCase().includes(searchLower)) || 
        (appointment.usuario && appointment.usuario.toLowerCase().includes(searchLower)) ||
        (appointment.vehiculo && appointment.vehiculo.toLowerCase().includes(searchLower)) ||
        (appointment.lugar && appointment.lugar.toLowerCase().includes(searchLower)) ||
        (appointment.comentarios && appointment.comentarios.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
  }, [appointments, searchTerm, filterDate]);
  
  // Obtener citas para la página actual
  const currentAppointments = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredAppointments, currentPage, itemsPerPage]);
  
  // Calcular número total de páginas
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  
  // Resetear a la primera página cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDate]);

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

  // Si no hay citas, mostrar mensaje
  if (appointments.length === 0 && !loading) {
    return (
      <div className="mt-4 text-center p-6 bg-gray-50 rounded-md border border-gray-200">
        <IoCalendarOutline className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
        <p className="mt-1 text-sm text-gray-500">
          Agrega tu primera cita usando el formulario superior.
        </p>
      </div>
    );
  }

  // Animaciones
  const containerAnimation = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05
      }
    }
  };
  
  const itemAnimation = {
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
  
  // Función para cambiar de página
  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };
  
  // Renderizar botones de paginación
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex justify-center items-center mt-6 space-x-1">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
        >
          <IoChevronBackOutline className="h-5 w-5" />
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => paginate(1)}
              className="px-3 py-1 rounded-md hover:bg-gray-100 text-gray-700"
            >
              1
            </button>
            {startPage > 2 && <span className="text-gray-500">...</span>}
          </>
        )}
        
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`px-3 py-1 rounded-md ${
              currentPage === number
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            {number}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
            <button
              onClick={() => paginate(totalPages)}
              className="px-3 py-1 rounded-md hover:bg-gray-100 text-gray-700"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
        >
          <IoChevronForwardOutline className="h-5 w-5" />
        </button>
      </div>
    );
  };

  // Renderizar vista en modo tabla
  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 hidden sm:table-header-group">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha / Hora
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vehículo
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lugar
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <AnimatePresence>
            {currentAppointments.map((appointment) => (
              <motion.tr 
                key={appointment.id}
                variants={itemAnimation}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
                className="sm:table-row flex flex-col border-b border-gray-200 pb-3 mb-3 sm:pb-0 sm:mb-0"
              >
                <td className="px-6 py-4 whitespace-nowrap sm:table-cell block" data-label="Cliente:">
                  <span className="sm:hidden font-bold inline-block mb-1">Cliente:</span>
                  <div className="text-sm font-medium text-gray-900">{appointment.cliente}</div>
                  {appointment.usuario && (
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                      <IoPersonOutline className="mr-1" /> {appointment.usuario}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap sm:table-cell block" data-label="Fecha/Hora:">
                  <span className="sm:hidden font-bold inline-block mb-1">Fecha/Hora:</span>
                  <div className="text-sm text-gray-900">{formatDate(appointment.fecha)}</div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <IoTimeOutline className="mr-1" /> {formatTime(appointment.hora)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap sm:table-cell block" data-label="Vehículo:">
                  <span className="sm:hidden font-bold inline-block mb-1">Vehículo:</span>
                  <div className="text-sm text-gray-900">
                    {appointment.vehiculo || <span className="text-gray-400">No especificado</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap sm:table-cell block" data-label="Lugar:">
                  <span className="sm:hidden font-bold inline-block mb-1">Lugar:</span>
                  <div className="text-sm text-gray-900">
                    {appointment.lugar || <span className="text-gray-400">No especificado</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sm:table-cell block">
                  <div className="flex justify-end space-x-3">
                    <motion.button
                      onClick={() => onView(appointment)}
                      disabled={loading}
                      className="text-green-600 hover:text-green-900"
                      title="Ver detalles"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IoEyeOutline className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => onEdit(appointment)}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar cita"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IoPencilOutline className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => onDelete(appointment.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar cita"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IoTrashOutline className="h-5 w-5" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
  
  // Renderizar vista en modo grid (tarjetas)
  const renderGridView = () => (
    <motion.div 
      variants={containerAnimation}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
    >
      <AnimatePresence>
        {currentAppointments.map((appointment) => (
          <motion.div
            key={appointment.id}
            variants={itemAnimation}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{appointment.cliente}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <IoCalendarOutline className="mr-1" /> 
                    {formatDate(appointment.fecha)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <IoTimeOutline className="mr-1" /> 
                    {formatTime(appointment.hora)}
                  </div>
                </div>
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                  {appointment.usuario || 'Sin asignar'}
                </div>
              </div>
              
              {appointment.vehiculo && (
                <div className="mt-3 flex items-center text-sm text-gray-600">
                  <IoCarSportOutline className="mr-1 text-gray-500" />
                  {appointment.vehiculo}
                </div>
              )}
              
              {appointment.lugar && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <IoLocationOutline className="mr-1 text-gray-500" />
                  {appointment.lugar}
                </div>
              )}
              
              {appointment.comentarios && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{appointment.comentarios}</p>
              )}
              
              <div className="mt-4 flex justify-end space-x-2">
                <motion.button
                  onClick={() => onView(appointment)}
                  disabled={loading}
                  className="text-green-600 hover:text-green-900 p-2 rounded-full hover:bg-green-50"
                  title="Ver detalles"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IoEyeOutline className="h-5 w-5" />
                </motion.button>
                <motion.button
                  onClick={() => onEdit(appointment)}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50"
                  title="Editar cita"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IoPencilOutline className="h-5 w-5" />
                </motion.button>
                <motion.button
                  onClick={() => onDelete(appointment.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                  title="Eliminar cita"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IoTrashOutline className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <motion.div 
      className="bg-white shadow rounded-md p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header con título y controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center mb-4 sm:mb-0">
          <IoCalendarOutline className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">Citas Programadas</h2>
          <div className="ml-3 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
            Total: {filteredAppointments.length}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, usuario o vehículo..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearchOutline className="h-5 w-5 text-gray-400" />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <IoCloseCircleOutline className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <div className="relative">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <IoCloseCircleOutline className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md ${
                viewMode === 'table' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title="Vista de tabla"
            >
              <IoListOutline className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title="Vista de tarjetas"
            >
              <IoGridOutline className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido: cargando, mensaje de no resultados o lista de citas */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Cargando citas...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <IoSearchOutline className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No se encontraron citas</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm || filterDate ? 
              `No hay resultados para los filtros aplicados.` : 
              'No hay citas programadas.'}
          </p>
          {(searchTerm || filterDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterDate('');
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Mostrar todas las citas
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Vista principal: tabla o grid según el modo seleccionado */}
          {viewMode === 'table' ? renderTableView() : renderGridView()}
        </>
      )}
      
      {/* Paginación */}
      {renderPagination()}
    </motion.div>
  );
};

export default AppointmentList;