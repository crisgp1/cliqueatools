import React from 'react';
import { motion } from 'framer-motion';
import { IoCarSportOutline, IoPencilOutline, IoTrashOutline } from 'react-icons/io5';
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
  const tableAnimation = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 25,
        delay: 0.1
      }
    }
  };

  // Calcular valor total de los vehículos
  const totalValue = calculateTotalValue(vehicles);

  return (
    <motion.div 
      className="govuk-card p-6 bg-white shadow rounded-md"
      initial="hidden"
      animate="visible"
      variants={tableAnimation}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <IoCarSportOutline className="h-5 w-5 text-blue-600 mr-2" />
            Vehículos en el lote
          </div>
          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
            Total: {vehicles.length}
          </span>
        </div>
      </h3>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
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
              {vehicles.map((vehicle) => (
                <motion.tr 
                  key={vehicle.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="sm:table-row flex flex-col border-b border-gray-200 pb-3 mb-3 sm:pb-0 sm:mb-0"
                >
                  <td className="px-6 py-4 whitespace-nowrap sm:table-cell block" data-label="Marca/Modelo:">
                    <span className="sm:hidden font-bold inline-block mb-1">Marca/Modelo:</span>
                    <div className="text-sm font-medium text-gray-900">{vehicle.marca} {vehicle.modelo}</div>
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
            </tbody>
            <tfoot>
              <tr key="total-row" className="bg-gray-50 font-bold">
                <td colSpan="2" className="px-6 py-4 text-left sm:text-right">
                  Valor total:
                </td>
                <td colSpan="2" className="px-6 py-4 text-left sm:text-left font-bold text-blue-600">
                  {formatCurrency(totalValue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default VehicleList;