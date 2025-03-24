import { useState, useContext, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

// Componentes modulares
import VehicleList from '../components/vehicle/VehicleList';
import VehicleFormAdd from '../components/vehicle/VehicleFormAdd';
import VehicleFormEdit from '../components/vehicle/VehicleFormEdit';
import { VehicleModals } from '../components/vehicle/VehicleModals';

// Hook personalizado para la gestión de vehículos
import useVehicles from '../hooks/useVehicles';

/**
 * Componente principal para la gestión de vehículos. 
 * Permite agregar, editar, listar y eliminar vehículos.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.vehicles - Lista de vehículos (opcional, para estado externo)
 * @param {Function} props.onAddVehicle - Función para añadir vehículos al estado externo
 * @param {Function} props.onUpdateVehicle - Función para actualizar vehículos en el estado externo
 * @param {Function} props.onRemoveVehicle - Función para eliminar vehículos del estado externo
 * @returns {JSX.Element}
 */
const VehicleForm = ({ vehicles: externalVehicles, onAddVehicle, onUpdateVehicle, onRemoveVehicle }) => {
  // Contexto de autenticación para obtener el token
  const { token } = useContext(AuthContext);
  
  // Estados para modales
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteVehicleId, setDeleteVehicleId] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  
  // Definir funciones para sincronizar con estado externo (si existen las props)
  // Usando useCallback para prevenir creaciones de funciones innecesarias en cada renderizado
  const syncWithExternalState = useCallback((operation, data, emptyFn = null) => {
    // Nueva operación 'load' para cargar múltiples vehículos a la vez
    if (operation === 'load' && data.vehicles && Array.isArray(data.vehicles)) {
      // Si existen funciones para manejar el estado externo, sincronizamos los vehículos
      if (typeof onAddVehicle === 'function') {
        // Usamos la función que tenga mayor sentido según el componente padre
        // Podría ser onAddVehicle, onUpdateVehicle o una función especial para carga inicial
        data.vehicles.forEach(vehicle => onAddVehicle(vehicle));
      }
      return;
    }
    
    // Operaciones individuales existentes
    if (operation === 'add' && typeof onAddVehicle === 'function') {
      return onAddVehicle(data);
    } else if (operation === 'update' && typeof onUpdateVehicle === 'function') {
      return onUpdateVehicle(data.id, data);
    } else if (operation === 'remove' && typeof onRemoveVehicle === 'function') {
      return onRemoveVehicle(data.id);
    }
    
    return emptyFn ? emptyFn() : null;
  }, [onAddVehicle, onUpdateVehicle, onRemoveVehicle]);

  // Usar el hook personalizado para gestionar los vehículos
  const { 
    vehicles, 
    loading, 
    error, 
    addVehicle, 
    updateVehicle, 
    removeVehicle,
    clearError 
  } = useVehicles(token, syncWithExternalState);

  // Comprueba si el modal informativo ya se mostró para esta sesión
  const checkIfModalShown = () => {
    return localStorage.getItem('vehicleInfoModalShown') === 'true';
  };
  
  // Marca el modal como mostrado en localStorage
  const markModalAsShown = () => {
    localStorage.setItem('vehicleInfoModalShown', 'true');
  };
  
  // Gestión de modales
  const handleCloseInfoModal = () => {
    setShowInfoModal(false);
    markModalAsShown();
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    clearError();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingVehicle(null);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteVehicleId(null);
  };

  // Manejadores de eventos para vehículos
  
  // Agregar nuevo vehículo
  const handleAddVehicle = async (vehicleData) => {
    try {
      const newVehicle = await addVehicle(vehicleData);
      
      // Mostrar el modal informativo solo si no se ha mostrado antes
      if (newVehicle && !checkIfModalShown()) {
        setShowInfoModal(true);
      }
      
      return !!newVehicle; // Devolver true si se creó correctamente
    } catch (err) {
      setShowErrorModal(true);
      return false;
    }
  };
  
  // Abrir modal de edición
  const handleOpenEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowEditModal(true);
  };
  
  // Actualizar vehículo
  const handleUpdateVehicle = async (vehicleData) => {
    try {
      const success = await updateVehicle(vehicleData);
      if (success) {
        handleCloseEditModal();
      }
      return success;
    } catch (err) {
      setShowErrorModal(true);
      return false;
    }
  };
  
  // Confirmar eliminación de vehículo
  const handleConfirmDelete = (id) => {
    const vehicleToDelete = vehicles.find(v => v.id === id);
    setDeleteVehicleId(id);
    setShowDeleteModal(true);
    return vehicleToDelete;
  };
  
  // Eliminar vehículo
  const handleDeleteVehicle = async () => {
    if (!deleteVehicleId) return;
    
    try {
      await removeVehicle(deleteVehicleId);
    } catch (err) {
      setShowErrorModal(true);
    }
  };

  return (
    <div className="space-y-8">
      {/* Modales */}
      <VehicleModals.SuccessModal 
        isOpen={showInfoModal} 
        onClose={handleCloseInfoModal} 
      />
      
      <VehicleModals.ErrorModal 
        isOpen={showErrorModal} 
        onClose={handleCloseErrorModal} 
        error={error}
      />
      
      <VehicleModals.DeleteConfirmModal 
        isOpen={showDeleteModal} 
        onClose={handleCloseDeleteModal} 
        onConfirm={handleDeleteVehicle}
        vehicle={deleteVehicleId ? vehicles.find(v => v.id === deleteVehicleId) : null}
      />
      
      {/* Modal de Edición */}
      {showEditModal && editingVehicle && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <VehicleFormEdit 
              vehicle={editingVehicle} 
              onSubmit={handleUpdateVehicle}
              onCancel={handleCloseEditModal}
              loading={loading}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Formulario para agregar vehículos */}
      <VehicleFormAdd 
        onSubmit={handleAddVehicle}
        loading={loading}
      />
      
      {/* Lista de vehículos */}
      <VehicleList 
        vehicles={vehicles} 
        loading={loading}
        onEdit={handleOpenEditModal}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default VehicleForm;