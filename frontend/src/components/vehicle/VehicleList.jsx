import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoCarSportOutline, 
  IoPencilOutline, 
  IoTrashOutline, 
  IoSearchOutline,
  IoGridOutline,
  IoListOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoFilterOutline,
  IoCloseCircleOutline
} from 'react-icons/io5';
import { formatCurrency, calculateTotalValue } from './VehicleUtils';

/**
 * Componente que muestra la lista de vehículos con opciones para editar y eliminar
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.vehicles - Lista de vehículos a mostrar
 * @param {boolean} props.loading - Indica si está cargando datos
 * @param {Function} props.onEdit - Función a llamar al hacer clic en editar vehículo
 * @param {Function} props.onDelete - Función a llamar al hacer clic en eliminar vehículo
 * @returns {JSX.Element}
 */
const VehicleList = ({ vehicles = [], loading = false, onEdit, onDelete }) => {
  // Estado para búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' o 'grid'
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Ajustar según necesidad
  
  // Filtrar vehículos basado en término de búsqueda
  const filteredVehicles = useMemo(() => {
    if (!searchTerm.trim()) return vehicles;
    
    const searchLower = searchTerm.toLowerCase();
    return vehicles.filter(vehicle => 
      vehicle.marca.toLowerCase().includes(searchLower) || 
      vehicle.modelo.toLowerCase().includes(searchLower) ||
      vehicle.año.toString().includes(searchLower) ||
      vehicle.descripcion?.toLowerCase().includes(searchLower)
    );
  }, [vehicles, searchTerm]);
  
  // Obtener vehículos para la página actual
  const currentVehicles = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredVehicles.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredVehicles, currentPage, itemsPerPage]);
  
  // Calcular número total de páginas
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  
  // Resetear a la primera página cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Si no hay vehículos, mostrar mensaje
  if (vehicles.length === 0 && !loading) {
    return (
      <div className="mt-4 text-center p-6 bg-gray-50 rounded-md border border-gray-200">
        <IoCarSportOutline className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay vehículos</h3>
        <p className="mt-1 text-sm text-gray-500">
          Agrega tu primer vehículo usando el formulario superior.
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

  // Calcular valor total de los vehículos filtrados
  const totalValue = calculateTotalValue(filteredVehicles);
  
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
              Marca/Modelo
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Año
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <AnimatePresence>
            {currentVehicles.map((vehicle) => (
              <motion.tr 
                key={vehicle.id}
                variants={itemAnimation}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
                className="sm:table-row flex flex-col border-b border-gray-200 pb-3 mb-3 sm:pb-0 sm:mb-0"
              >
                <td className="px-6 py-4 whitespace-nowrap sm:table-cell block" data-label="Marca/Modelo:">
                  <span className="sm:hidden font-bold inline-block mb-1">Marca/Modelo:</span>
                  <div className="text-sm font-medium text-gray-900">{vehicle.marca} {vehicle.modelo}</div>
                  {vehicle.descripcion && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1 sm:hidden">{vehicle.descripcion}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap sm:table-cell block" data-label="Año:">
                  <span className="sm:hidden font-bold inline-block mb-1">Año:</span>
                  <div className="text-sm text-gray-500">{vehicle.año}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap sm:table-cell block" data-label="Valor:">
                  <span className="sm:hidden font-bold inline-block mb-1">Valor:</span>
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(vehicle.valor)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sm:table-cell block">
                  <div className="flex justify-end space-x-3">
                    <motion.button
                      onClick={() => onEdit(vehicle)}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar vehículo"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IoPencilOutline className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => onDelete(vehicle.id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar vehículo"
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
        <tfoot>
          <tr key={`total-row-${filteredVehicles.length}`} className="bg-gray-50 font-bold">
            <td colSpan="2" className="px-6 py-4 text-left sm:text-right">
              Valor total ({filteredVehicles.length} vehículos):
            </td>
            <td colSpan="2" className="px-6 py-4 text-left sm:text-left font-bold text-blue-600">
              {formatCurrency(totalValue)}
            </td>
          </tr>
        </tfoot>
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
        {currentVehicles.map((vehicle) => (
          <motion.div
            key={vehicle.id}
            variants={itemAnimation}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{vehicle.marca} {vehicle.modelo}</h3>
                  <p className="text-sm text-gray-500">Año: {vehicle.año}</p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                  {formatCurrency(vehicle.valor)}
                </div>
              </div>
              
              {vehicle.descripcion && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{vehicle.descripcion}</p>
              )}
              
              <div className="mt-4 flex justify-end space-x-2">
                <motion.button
                  onClick={() => onEdit(vehicle)}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50"
                  title="Editar vehículo"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <IoPencilOutline className="h-5 w-5" />
                </motion.button>
                <motion.button
                  onClick={() => onDelete(vehicle.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                  title="Eliminar vehículo"
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
          <IoCarSportOutline className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">Vehículos en Inventario</h2>
          <div className="ml-3 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
            Total: {filteredVehicles.length}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-grow max-w-xs">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar vehículo..."
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

      {/* Contenido: cargando, mensaje de no resultados o lista de vehículos */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Cargando vehículos...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <IoSearchOutline className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No se encontraron vehículos</h3>
          <p className="mt-1 text-gray-500">
            No hay resultados para "{searchTerm}". Intenta con otros términos.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Mostrar todos los vehículos
          </button>
        </div>
      ) : (
        <>
          {/* Vista principal: tabla o grid según el modo seleccionado */}
          {viewMode === 'table' ? renderTableView() : renderGridView()}
          
          {/* Resumen (solo para vista de grid) */}
          {viewMode === 'grid' && filteredVehicles.length > 0 && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Valor total ({filteredVehicles.length} vehículos):</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(totalValue)}</span>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Paginación */}
      {renderPagination()}
    </motion.div>
  );
};

export default VehicleList;