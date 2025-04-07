import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSearch, IoCarSport, IoClose, IoCheckmarkCircle } from 'react-icons/io5';

/**
 * Componente para la selección de vehículos con interfaz de búsqueda estética
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.vehicles - Lista de vehículos disponibles
 * @param {Object} props.selectedVehicle - Vehículo seleccionado actualmente
 * @param {Function} props.onVehicleSelect - Función para manejar la selección de un vehículo
 * @returns {JSX.Element} - Componente selector de vehículos
 */
const VehicleSelector = ({ 
  vehicles, 
  selectedVehicle, 
  onVehicleSelect 
}) => {
  // Estado para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  // Estado para controlar la visibilidad del panel de selección
  const [isSelectionOpen, setIsSelectionOpen] = useState(false);

  // Formatear el precio en formato de moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Filtrar vehículos basados en el término de búsqueda
  const filteredVehicles = useMemo(() => {
    if (!searchTerm.trim()) {
      return vehicles;
    }

    // Filtrar por término de búsqueda
    const lowerSearch = searchTerm.toLowerCase().trim();
    return vehicles.filter(vehicle => 
      vehicle.marca?.toLowerCase().includes(lowerSearch) ||
      vehicle.modelo?.toLowerCase().includes(lowerSearch) ||
      vehicle.año?.toString().includes(lowerSearch) ||
      vehicle.color?.toLowerCase().includes(lowerSearch) ||
      vehicle.tipo?.toLowerCase().includes(lowerSearch)
    );
  }, [vehicles, searchTerm]);

  // Manejar cambio en el input de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isSelectionOpen) {
      setIsSelectionOpen(true);
    }
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
  };

  // Manejar la selección de un vehículo
  const handleSelectVehicle = (vehicle) => {
    onVehicleSelect(vehicle);
    setIsSelectionOpen(false);
    setSearchTerm('');
  };

  // Alternar panel de selección
  const toggleSelectionPanel = () => {
    setIsSelectionOpen(!isSelectionOpen);
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

  // Animación para el panel de selección
  const panelVariants = {
    hidden: { opacity: 0, height: 0, overflow: 'hidden' },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { 
        opacity: { duration: 0.3 },
        height: { duration: 0.3 }
      }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: { 
        opacity: { duration: 0.2 },
        height: { duration: 0.2 }
      }
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="govuk-label text-lg font-semibold flex items-center">
          <IoCarSport className="mr-2 text-blue-600" size={20} />
          Seleccionar Vehículo
        </label>
        {selectedVehicle && (
          <div className="text-blue-700 font-medium">
            {formatCurrency(selectedVehicle.valor || 0)}
          </div>
        )}
      </div>

      {/* Vista previa del vehículo seleccionado */}
      {selectedVehicle && (
        <div 
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 cursor-pointer hover:bg-blue-100 transition"
          onClick={toggleSelectionPanel}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-blue-800">
                {selectedVehicle.marca} {selectedVehicle.modelo} ({selectedVehicle.año})
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="inline-block mr-3">Color: {selectedVehicle.color}</span>
                <span className="inline-block mr-3">Tipo: {selectedVehicle.tipo}</span>
                <span className="inline-block">Placas: {selectedVehicle.placas}</span>
              </div>
            </div>
            <div className="text-blue-700 font-bold">
              {formatCurrency(selectedVehicle.valor || 0)}
            </div>
          </div>
        </div>
      )}

      {/* Controles de búsqueda */}
      <div className="relative">
        <div className="flex gap-2 mb-2">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onClick={() => setIsSelectionOpen(true)}
              placeholder="Buscar vehículo por marca, modelo, año, color..."
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
          
          <button
            onClick={toggleSelectionPanel}
            className="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none transition-colors"
          >
            {isSelectionOpen ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {/* Panel de selección de vehículos con animación */}
        <AnimatePresence>
          {isSelectionOpen && (
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1"
            >
              <div className="max-h-80 overflow-y-auto">
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
                        const isSelected = selectedVehicle && selectedVehicle.id === vehicle.id;
                        
                        return (
                          <motion.div 
                            key={vehicle.id}
                            variants={itemVariants}
                            className={`p-3 flex justify-between items-center cursor-pointer transition ${
                              isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-100'
                            }`}
                            onClick={() => handleSelectVehicle(vehicle)}
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
                                <div className="font-medium text-gray-800">
                                  {vehicle.marca} {vehicle.modelo} ({vehicle.año})
                                </div>
                                <div className="text-sm text-gray-600 flex gap-2">
                                  <span>Color: {vehicle.color}</span>
                                  <span>• Placas: {vehicle.placas}</span>
                                </div>
                              </div>
                            </div>
                            <div className="font-bold text-blue-700">{formatCurrency(vehicle.valor || 0)}</div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm 
                      ? `No se encontraron vehículos que coincidan con "${searchTerm}"`
                      : "No hay vehículos disponibles"}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VehicleSelector;