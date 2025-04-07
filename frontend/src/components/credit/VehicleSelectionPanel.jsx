import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from './utils/CreditUtils';
import { IoSearch, IoCarSport, IoClose, IoCheckmarkCircle } from 'react-icons/io5';

/**
 * Componente para la selección de vehículos con funcionalidad de búsqueda
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.vehicles - Lista de vehículos disponibles
 * @param {Array} props.selectedVehicles - Lista de vehículos seleccionados
 * @param {Function} props.onVehicleToggle - Función para alternar la selección de un vehículo
 * @param {number} props.effectiveVehiclesValue - Valor total de los vehículos (seleccionados o todos)
 * @returns {JSX.Element} - Componente de selección de vehículos
 */
const VehicleSelectionPanel = ({ 
  vehicles, 
  selectedVehicles, 
  onVehicleToggle, 
  effectiveVehiclesValue 
}) => {
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para mostrar solo vehículos seleccionados
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  // Reiniciar búsqueda al cambiar selección
  useEffect(() => {
    if (selectedVehicles.length === 0) {
      setShowOnlySelected(false);
    }
  }, [selectedVehicles]);

  // Filtrar vehículos basados en el término de búsqueda
  const filteredVehicles = useMemo(() => {
    if (!searchTerm.trim() && !showOnlySelected) {
      return vehicles;
    }

    // Verificar si debemos mostrar solo seleccionados
    const baseList = showOnlySelected
      ? vehicles.filter(v => selectedVehicles.some(sv => sv.id === v.id))
      : vehicles;

    // Si no hay término de búsqueda, retornar la lista base
    if (!searchTerm.trim()) {
      return baseList;
    }

    // Filtrar por término de búsqueda
    const lowerSearch = searchTerm.toLowerCase().trim();
    return baseList.filter(vehicle => 
      vehicle.marca.toLowerCase().includes(lowerSearch) ||
      vehicle.modelo.toLowerCase().includes(lowerSearch) ||
      vehicle.año.toString().includes(lowerSearch)
    );
  }, [vehicles, searchTerm, selectedVehicles, showOnlySelected]);

  // Manejar cambio en el input de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Alternar entre mostrar todos o solo seleccionados
  const toggleShowSelected = () => {
    setShowOnlySelected(prev => !prev);
  };

  // Animaciones para elementos de la lista
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 300, damping: 25 }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="mt-3 mb-4 bg-white border-2 border-blue-100 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold text-gray-800 flex items-center">
          <IoCarSport className="mr-2 text-blue-600" size={20} />
          {selectedVehicles.length > 0 
            ? `Vehículos (${selectedVehicles.length} seleccionados)` 
            : 'Vehículos disponibles'}
        </h4>
        <div className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-sm font-medium shadow-sm">
          {formatCurrency(effectiveVehiclesValue)}
        </div>
      </div>
      
      {/* Controles de búsqueda */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar vehículo por marca, modelo o año..."
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <IoClose className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        
        {selectedVehicles.length > 0 && (
          <button
            onClick={toggleShowSelected}
            className={`px-3 py-2 rounded-md text-sm font-medium focus:outline-none transition-colors ${
              showOnlySelected
                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {showOnlySelected ? 'Ver todos' : 'Ver seleccionados'}
          </button>
        )}
      </div>
      
      {/* Lista de vehículos */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-64 overflow-y-auto">
          {filteredVehicles.length > 0 ? (
            <AnimatePresence>
              <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
                className="divide-y divide-gray-200"
              >
                {filteredVehicles.map(vehicle => {
                  const isSelected = selectedVehicles.some(v => v.id === vehicle.id);
                  
                  return (
                    <motion.div 
                      key={vehicle.id}
                      variants={itemVariants}
                      className={`p-3 flex justify-between items-center cursor-pointer transition ${
                        isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => onVehicleToggle(vehicle)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                          isSelected ? 'bg-blue-600 text-white' : 'border-2 border-gray-300'
                        }`}>
                          {isSelected && <IoCheckmarkCircle className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{vehicle.marca} {vehicle.modelo}</div>
                          <div className="text-sm text-gray-600 flex gap-2">
                            <span>Año: {vehicle.año}</span>
                            {vehicle.color && <span>• {vehicle.color}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-blue-700">{formatCurrency(vehicle.valor)}</div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm 
                ? `No se encontraron vehículos que coincidan con "${searchTerm}"`
                : "No hay vehículos disponibles para financiar"}
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="block mx-auto mt-2 text-blue-600 hover:text-blue-800"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Mensaje informativo */}
      {vehicles.length > 0 && (
        <div className="mt-3 text-xs text-gray-500 italic text-center">
          Selecciona uno o más vehículos para configurar su financiamiento
        </div>
      )}
    </div>
  );
};

export default VehicleSelectionPanel;