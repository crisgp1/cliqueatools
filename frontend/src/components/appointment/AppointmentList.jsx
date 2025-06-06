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
  IoEyeOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline
} from 'react-icons/io5';

/**
 * Componente mejorado que muestra la lista de citas con opciones para editar y eliminar
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
  const [viewMode, setViewMode] = useState('grid'); // 'table' o 'grid'
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
      <div className="mt-4 text-center p-8 bg-white rounded-xl shadow-md border border-gray-100">
        <div className="bg-blue-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <IoCalendarOutline className="h-10 w-10 text-blue-500" />
        </div>
        <h3 className="mt-2 text-lg font-semibold text-gray-900">No hay citas</h3>
        <p className="mt-2 text-base text-gray-600 max-w-md mx-auto">
          Añade tu primera cita usando el botón "Nueva Cita" para comenzar a gestionar tus compromisos.
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
      <div className="flex justify-center items-center mt-8 space-x-1">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 shadow-sm transition-all duration-200"
        >
          <IoChevronBackOutline className="h-5 w-5" />
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => paginate(1)}
              className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm transition-all duration-200"
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
            className={`px-4 py-2 rounded-lg ${
              currentPage === number
                ? 'bg-blue-600 text-white shadow-md border border-blue-700'
                : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm hover:shadow'
            } transition-all duration-200`}
          >
            {number}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
            <button
              onClick={() => paginate(totalPages)}
              className="px-4 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm transition-all duration-200"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 shadow-sm transition-all duration-200"
        >
          <IoChevronForwardOutline className="h-5 w-5" />
        </button>
      </div>
    );
  };

  // Renderizar vista en modo tabla
  const renderTableView = () => (
    <div className="overflow-x-auto rounded-xl shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hidden sm:table-header-group">
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
        <tbody className="bg-white divide-y divide-gray-100">
          <AnimatePresence>
            {currentAppointments.map((appointment) => (
              <motion.tr 
                key={appointment.id}
                variants={itemAnimation}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
                className="sm:table-row flex flex-col border-b border-gray-200 pb-3 mb-3 sm:pb-0 sm:mb-0 hover:bg-blue-50 transition-colors duration-150"
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
                  <div className="flex justify-end space-x-1">
                    <motion.button
                      onClick={() => onView(appointment)}
                      disabled={loading}
                      className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors duration-200"
                      title="Ver detalles"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IoEyeOutline className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => onEdit(appointment)}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200"
                      title="Editar cita"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IoPencilOutline className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => onDelete(appointment.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors duration-200"
                      title="Eliminar cita"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300"
          >
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-3 border-b border-blue-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{appointment.cliente}</h3>
                <div className="bg-white text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-200">
                  {appointment.usuario || 'Sin asignar'}
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                    <IoCalendarOutline className="mr-1" /> 
                    {formatDate(appointment.fecha)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <IoTimeOutline className="mr-1" /> 
                    {formatTime(appointment.hora)}
                  </div>
              
                {appointment.vehiculo && (
                  <div className="flex items-center text-sm text-gray-600">
                    <IoCarSportOutline className="mr-2 text-blue-500" />
                    {appointment.vehiculo}
                  </div>
                )}
                
                {appointment.lugar && (
                  <div className="flex items-center text-sm text-gray-600">
                    <IoLocationOutline className="mr-2 text-blue-500" />
                    {appointment.lugar}
                  </div>
                )}
              </div>
              
              {appointment.comentarios && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-600 line-clamp-2">{appointment.comentarios}</p>
                </div>
              )}
              
              <div className="mt-4 flex justify-end space-x-2 border-t border-gray-100 pt-4">
                <motion.button
                  onClick={() => onView(appointment)}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 hover:border-green-300 px-3 py-1 rounded-lg flex items-center"
                  title="Ver detalles"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <IoEyeOutline className="h-4 w-4 mr-1" />
                  <span className="text-xs">Ver</span>
                </motion.button>
                <motion.button
                  onClick={() => onEdit(appointment)}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 px-3 py-1 rounded-lg flex items-center"
                  title="Editar cita"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <IoPencilOutline className="h-4 w-4 mr-1" />
                  <span className="text-xs">Editar</span>
                </motion.button>
                <motion.button
                  onClick={() => onDelete(appointment.id)}
                  disabled={loading}
                  className="bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 hover:border-red-300 px-3 py-1 rounded-lg flex items-center"
                  title="Eliminar cita"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
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
      className="bg-white shadow-lg rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header con título y controles */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="bg-white p-2 rounded-full mr-3">
              <IoCalendarOutline className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Citas Programadas</h2>
              <p className="text-blue-100 text-sm mt-1">Gestiona todas tus citas de manera sencilla</p>
            </div>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm px-3 py-1 rounded-full text-white flex items-center">
            <IoInformationCircleOutline className="mr-1" />
            Total: {filteredAppointments.length}
          </div>
        </div>
        
      </div>
      
      {/* Barra de herramientas */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-grow max-w-md">
            <motion.input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, usuario o vehículo..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)" }}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearchOutline className="h-5 w-5 text-blue-400" />
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
            <motion.div whileHover={{ scale: 1.02 }} className="flex">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoCalendarOutline className="h-5 w-5 text-blue-400" />
              </div>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="pl-10 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <IoCloseCircleOutline className="h-5 w-5" />
                </button>
              )}
            </motion.div>
          </div>
          
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg shadow-sm">
            <motion.button
              onClick={() => setViewMode('table')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'table' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title="Vista de tabla"
            >
              <IoListOutline className="h-5 w-5" />
            </motion.button>
            <motion.button
              onClick={() => setViewMode('grid')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title="Vista de tarjetas"
            >
              <IoGridOutline className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Contenido: cargando, mensaje de no resultados o lista de citas */}
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full mb-6"></div>
            <p className="text-lg text-gray-600">Cargando citas...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-12 bg-blue-50 rounded-xl border border-blue-200">
            <div className="mx-auto bg-white p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 shadow-sm">
              <IoSearchOutline className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="mt-2 text-xl font-medium text-gray-900">No se encontraron citas</h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              {searchTerm || filterDate ? 
                `No hay resultados para los filtros aplicados.` : 
                'No hay citas programadas.'}
            </p>
            {(searchTerm || filterDate) && (
              <motion.button
                onClick={() => {
                  setSearchTerm('');
                  setFilterDate('');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 inline-flex items-center px-5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Mostrar todas las citas
              </motion.button>
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
      </div>
    </motion.div>
  );
};

export default AppointmentList;