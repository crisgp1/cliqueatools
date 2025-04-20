import { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

// Componentes modulares
import VehicleList from '../components/vehicle/VehicleList';
import VehicleFormAdd from '../components/vehicle/VehicleFormAdd';
import VehicleFormEdit from '../components/vehicle/VehicleFormEdit';
import { VehicleModals } from '../components/vehicle/VehicleModals';

// Store centralizado con Zustand
import useVehicleStore from '../store/vehicleStore';

/**
 * Componente principal para la gestión de vehículos. 
 * Permite agregar, editar, listar y eliminar vehículos.
 * 
 * @returns {JSX.Element}
 */
const VehicleForm = () => {
  // Contexto de autenticación para obtener el token
  const { token } = useContext(AuthContext);
  
  // Estados para modales
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteVehicleId, setDeleteVehicleId] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  
  // Usar el store centralizado
  const { 
    vehicles, 
    loading, 
    error, 
    loadVehicles,
    addVehicle, 
    updateVehicle, 
    removeVehicle,
    clearError 
  } = useVehicleStore();
  
  // Cargar vehículos al montar el componente
  useEffect(() => {
    if (token) {
      loadVehicles(token);
    }
  }, [token, loadVehicles]);
  
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
      const newVehicle = await addVehicle(token, vehicleData);
      
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
      const success = await updateVehicle(token, vehicleData);
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
      await removeVehicle(token, deleteVehicleId);
      handleCloseDeleteModal();
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
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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

      {/* Botón para abrir el modal de agregar vehículo */}
      <div className="flex justify-end mb-4">
        <motion.button
          onClick={() => setShowAddModal(true)}
          className="govuk-button bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Agregar vehículo
        </motion.button>
      </div>

      {/* Modal para agregar vehículos */}
      <VehicleModals.FormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
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