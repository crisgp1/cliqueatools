import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoPersonOutline, 
  IoPencilOutline, 
  IoTrashOutline, 
  IoSearchOutline,
  IoGridOutline,
  IoListOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCloseCircleOutline,
  IoMailOutline,
  IoCallOutline,
  IoIdCardOutline,
  IoLocationOutline,
  IoEyeOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline
} from 'react-icons/io5';

/**
 * Componente mejorado que muestra la lista de clientes con opciones para editar y eliminar
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.clients - Lista de clientes a mostrar
 * @param {boolean} props.loading - Indica si está cargando datos
 * @param {Function} props.onEdit - Función a llamar al hacer clic en editar cliente
 * @param {Function} props.onDelete - Función a llamar al hacer clic en eliminar cliente
 * @param {Function} props.onView - Función a llamar al hacer clic en ver detalles
 * @returns {JSX.Element}
 */
const ClientList = ({ clients = [], loading = false, onEdit, onDelete, onView }) => {
  // Estado para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'table' o 'grid'
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Ajustar según necesidad
  
  // Filtrar clientes basado en término de búsqueda
  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    
    const searchLower = searchTerm.toLowerCase();
    return clients.filter(client => 
      (client.nombre && client.nombre.toLowerCase().includes(searchLower)) || 
      (client.apellidos && client.apellidos.toLowerCase().includes(searchLower)) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      (client.telefono && client.telefono.toLowerCase().includes(searchLower)) ||
      (client.rfc && client.rfc.toLowerCase().includes(searchLower)) ||
      (client.direccion && client.direccion.toLowerCase().includes(searchLower)) ||
      (client.ciudad && client.ciudad.toLowerCase().includes(searchLower))
    );
  }, [clients, searchTerm]);
  
  // Obtener clientes para la página actual
  const currentClients = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredClients.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredClients, currentPage, itemsPerPage]);
  
  // Calcular número total de páginas
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  
  // Resetear a la primera página cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Si no hay clientes, mostrar mensaje
  if (clients.length === 0 && !loading) {
    return (
      <div className="mt-4 text-center p-8 bg-white rounded-xl shadow-md border border-gray-100">
        <div className="bg-blue-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <IoPersonOutline className="h-10 w-10 text-blue-500" />
        </div>
        <h3 className="mt-2 text-lg font-semibold text-gray-900">No hay clientes</h3>
        <p className="mt-2 text-base text-gray-600 max-w-md mx-auto">
          Añade tu primer cliente usando el botón "Nuevo Cliente" para comenzar a gestionar tus contactos.
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
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Nombre
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Contacto
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              RFC
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              Ubicación
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          <AnimatePresence>
            {currentClients.map((client) => (
              <motion.tr 
                key={client.cliente_id}
                variants={itemAnimation}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
                className="sm:table-row flex flex-col border-b border-gray-200 pb-3 mb-3 sm:pb-0 sm:mb-0 hover:bg-blue-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap sm:table-cell block" data-label="Nombre:">
                  <span className="sm:hidden font-bold inline-block mb-1">Nombre:</span>
                  <div className="text-sm font-medium text-gray-900">{`${client.nombre} ${client.apellidos}`}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap sm:table-cell block" data-label="Contacto:">
                  <span className="sm:hidden font-bold inline-block mb-1">Contacto:</span>
                  <div className="text-sm text-gray-600 flex items-center">
                    <IoMailOutline className="mr-1 text-gray-400" /> {client.email || 'No especificado'}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center mt-1">
                    <IoCallOutline className="mr-1 text-gray-400" /> {client.telefono || 'No especificado'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap sm:table-cell block" data-label="RFC:">
                  <span className="sm:hidden font-bold inline-block mb-1">RFC:</span>
                  <div className="text-sm text-gray-900 flex items-center">
                    <IoIdCardOutline className="mr-1 text-gray-400" /> 
                    {client.rfc || <span className="text-gray-400 italic">No especificado</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap sm:table-cell block" data-label="Ubicación:">
                  <span className="sm:hidden font-bold inline-block mb-1">Ubicación:</span>
                  <div className="text-sm text-gray-900">
                    {client.ciudad || <span className="text-gray-400">No especificada</span>}
                  </div>
                  {client.direccion && (
                    <div className="text-sm text-gray-500 truncate max-w-xs">{client.direccion}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sm:table-cell block">
                  <div className="flex justify-end space-x-1">
                    <motion.button
                      onClick={() => onView(client)}
                      disabled={loading}
                      className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors duration-200"
                      title="Ver detalles"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IoEyeOutline className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => onEdit(client)}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors duration-200"
                      title="Editar cliente"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <IoPencilOutline className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => onDelete(client.cliente_id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors duration-200"
                      title="Eliminar cliente"
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
        {currentClients.map((client) => (
          <motion.div
            key={client.cliente_id}
            variants={itemAnimation}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300"
          >
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-3 border-b border-blue-200">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2">
                  <IoPersonOutline className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 ml-3 truncate">{`${client.nombre} ${client.apellidos}`}</h3>
              </div>
            </div>
            <div className="p-5">
              <div className="flex flex-col space-y-3">
                <div className="flex items-start">
                  <IoMailOutline className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" /> 
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-600">{client.email || 'No especificado'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <IoCallOutline className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" /> 
                  <div>
                    <p className="text-sm font-medium text-gray-700">Teléfono</p>
                    <p className="text-sm text-gray-600">{client.telefono || 'No especificado'}</p>
                  </div>
                </div>
                
                {client.rfc && (
                  <div className="flex items-start">
                    <IoIdCardOutline className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" /> 
                    <div>
                      <p className="text-sm font-medium text-gray-700">RFC</p>
                      <p className="text-sm text-gray-600">{client.rfc}</p>
                    </div>
                  </div>
                )}
                
                {(client.direccion || client.ciudad) && (
                  <div className="flex items-start">
                    <IoLocationOutline className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" /> 
                    <div>
                      <p className="text-sm font-medium text-gray-700">Dirección</p>
                      <p className="text-sm text-gray-600">
                        {client.direccion && <span className="block">{client.direccion}</span>}
                        {client.ciudad && <span className="block">{client.ciudad}</span>}
                        {client.codigo_postal && <span>CP: {client.codigo_postal}</span>}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-end space-x-2 border-t border-gray-100 pt-4">
                <motion.button
                  onClick={() => onView(client)}
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
                  onClick={() => onEdit(client)}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 px-3 py-1 rounded-lg flex items-center"
                  title="Editar cliente"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <IoPencilOutline className="h-4 w-4 mr-1" />
                  <span className="text-xs">Editar</span>
                </motion.button>
                <motion.button
                  onClick={() => onDelete(client.cliente_id)}
                  disabled={loading}
                  className="bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 hover:border-red-300 px-3 py-1 rounded-lg flex items-center"
                  title="Eliminar cliente"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <IoTrashOutline className="h-4 w-4 mr-1" />
                  <span className="text-xs">Eliminar</span>
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
              <IoPersonOutline className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Directorio de Clientes</h2>
              <p className="text-blue-100 text-sm mt-1">Gestiona tu base de clientes de manera sencilla</p>
            </div>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-sm px-3 py-1 rounded-full text-white flex items-center">
            <IoInformationCircleOutline className="mr-1" />
            Total: {filteredClients.length}
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
              placeholder="Buscar por nombre, email, teléfono..."
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

      {/* Contenido: cargando, mensaje de no resultados o lista de clientes */}
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full mb-6"></div>
            <p className="text-lg text-gray-600">Cargando clientes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12 bg-blue-50 rounded-xl border border-blue-200">
            <div className="mx-auto bg-white p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4 shadow-sm">
              <IoSearchOutline className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="mt-2 text-xl font-medium text-gray-900">No se encontraron clientes</h3>
            <p className="mt-2 text-gray-600 max-w-md mx-auto">
              {searchTerm ? 
                `No hay resultados para "${searchTerm}".` : 
                'No hay clientes registrados.'}
            </p>
            {searchTerm && (
              <motion.button
                onClick={() => setSearchTerm('')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 inline-flex items-center px-5 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                Mostrar todos los clientes
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

export default ClientList;