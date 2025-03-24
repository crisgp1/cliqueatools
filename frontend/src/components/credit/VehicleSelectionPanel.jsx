import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from './utils/CreditUtils';

/**
 * Componente para la selección de vehículos
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
  return (
    <div className="mt-3 mb-4 bg-gray-50 border-2 border-gray-300 rounded-md p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-base font-bold text-gray-800">
          {selectedVehicles.length > 0 
            ? `Vehículos seleccionados (${selectedVehicles.length})` 
            : 'Vehículos disponibles'}
        </h4>
        <div className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm">
          {formatCurrency(effectiveVehiclesValue)}
        </div>
      </div>
      
      {/* Lista de vehículos para seleccionar */}
      {vehicles.length > 0 ? (
        <div className="mb-4 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
          {vehicles.map(vehicle => {
            const isSelected = selectedVehicles.some(v => v.id === vehicle.id);
            
            return (
              <motion.div 
                key={vehicle.id}
                className={`p-3 border-b border-gray-200 last:border-b-0 flex justify-between items-center cursor-pointer transition ${
                  isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-100'
                }`}
                onClick={() => onVehicleToggle(vehicle)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div>
                  <div className="font-medium">{vehicle.marca} {vehicle.modelo}</div>
                  <div className="text-sm text-gray-600">Año: {vehicle.año}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-blue-800">{formatCurrency(vehicle.valor)}</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-blue-600 text-white' : 'border border-gray-400'
                  }`}>
                    {isSelected && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500">
          No hay vehículos disponibles para financiar
        </div>
      )}
    </div>
  );
};

export default VehicleSelectionPanel;