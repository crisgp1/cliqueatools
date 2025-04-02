import { useState, useContext, useCallback, useEffect } from 'react';
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
  
  // Log para depuración: vehículos recibidos como props
  console.log('[VehicleForm] Vehículos externos recibidos como props:', externalVehicles);
  
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
    console.log(`[VehicleForm] Sync llamada con operación: ${operation}`, data);
    
    // Nueva operación 'load' para cargar múltiples vehículos a la vez
    if (operation === 'load' && data.vehicles && Array.isArray(data.vehicles)) {
      console.log('[VehicleForm] Omitiendo sincronización de carga inicial para evitar duplicados');
      // No sincronizamos los vehículos al cargarlos desde la API para evitar duplicados
      // Los datos ya están disponibles a través del hook useVehicles
      return;
    }
    
    // Operaciones individuales existentes
    if (operation === 'add' && typeof onAddVehicle === 'function') {
      console.log('[VehicleForm] Sincronizando AÑADIR vehículo:', data);
      return onAddVehicle(data);
    } else if (operation === 'update' && typeof onUpdateVehicle === 'function') {
      console.log('[VehicleForm] Sincronizando ACTUALIZAR vehículo:', data);
      return onUpdateVehicle(data.id, data);
    } else if (operation === 'remove' && typeof onRemoveVehicle === 'function') {
      console.log('[VehicleForm] Sincronizando ELIMINAR vehículo con ID:', data.id);
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
  
  // Log para depuración: comparar vehículos del hook con externos
  console.log('[VehicleForm] Vehículos del hook useVehicles:', vehicles);
  
  // Verificar si hay duplicados entre hook y props externas
  useEffect(() => {
    if (externalVehicles && externalVehicles.length > 0 && vehicles.length > 0) {
      console.log('[VehicleForm] Comparando arreglos de vehículos:');
      console.log('  - Externos (props):', externalVehicles.length);
      console.log('  - Internos (hook):', vehicles.length);
      
      // Detectar posibles duplicados (mismos IDs en ambos arrays)
      const externalIds = externalVehicles.map(v => v.id);
      const hookIds = vehicles.map(v => v.id);
      const duplicatedIds = externalIds.filter(id => hookIds.includes(id));
      
      if (duplicatedIds.length > 0) {
        console.log('[VehicleForm] ⚠️ IDs duplicados encontrados:', duplicatedIds);
        console.log('[VehicleForm] Vehículos externos con estos IDs:', 
          externalVehicles.filter(v => duplicatedIds.includes(v.id)));
        console.log('[VehicleForm] Vehículos internos con estos IDs:', 
          vehicles.filter(v => duplicatedIds.includes(v.id)));
      }
    }
  }, [externalVehicles, vehicles]);

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