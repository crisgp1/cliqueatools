import { useState, useContext, useCallback, useEffect, useRef } from 'react';
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
  
  // Crear una referencia para las funciones de callback
  const callbacksRef = useRef({
    onAddVehicle,
    onUpdateVehicle,
    onRemoveVehicle
  });
  
  // Actualizar las referencias cuando cambien los callbacks
  useEffect(() => {
    callbacksRef.current = {
      onAddVehicle,
      onUpdateVehicle,
      onRemoveVehicle
    };
  }, [onAddVehicle, onUpdateVehicle, onRemoveVehicle]);
  
  // Referencia para controlar el bloqueo de actualizaciones
  const isUpdatingRef = useRef(false);
  
  // Definir funciones para sincronizar con estado externo (si existen las props)
  // Usando useCallback con referencias para evitar recreaciones innecesarias
  const syncWithExternalState = useCallback((operation, data, emptyFn = null) => {
    console.log(`[VehicleForm] Sync llamada con operación: ${operation}`, data);
    
    // Si ya estamos en medio de una actualización, evitar actualizaciones en cascada
    if (isUpdatingRef.current) {
      console.log('[VehicleForm] Bloqueando actualización durante sincronización en progreso');
      return;
    }
    
    // Permitir sincronizar la carga inicial de vehículos con el estado global
    if (operation === 'load' && data.vehicles && Array.isArray(data.vehicles)) {
      console.log('[VehicleForm] Sincronizando vehículos cargados inicialmente:', data.vehicles.length);
      // Permitir la sincronización para que el contador del sidebar se active
    }
    
    // Obtener las últimas versiones de los callbacks desde la referencia
    const { onAddVehicle, onUpdateVehicle, onRemoveVehicle } = callbacksRef.current;
    
    // Activar el bloqueo antes de realizar cambios
    isUpdatingRef.current = true;
    
    // Operaciones individuales con verificaciones de duplicados
    if (operation === 'add' && typeof onAddVehicle === 'function') {
      console.log('[VehicleForm] Sincronizando AÑADIR vehículo:', data);
      // Verificar si el vehículo ya existe en externalVehicles
      if (!externalVehicles || !externalVehicles.some(v => v.id === data.id)) {
        onAddVehicle(data);
      } else {
        console.log('[VehicleForm] Evitando añadir duplicado:', data.id);
      }
    } else if (operation === 'update' && typeof onUpdateVehicle === 'function') {
      console.log('[VehicleForm] Sincronizando ACTUALIZAR vehículo:', data);
      // Verificar si el vehículo ya está actualizado en externalVehicles
      const existingVehicle = externalVehicles?.find(v => v.id === data.id);
      if (existingVehicle && !isVehicleEqual(existingVehicle, data)) {
        onUpdateVehicle(data.id, data);
      } else {
        console.log('[VehicleForm] Evitando actualización redundante:', data.id);
      }
    } else if (operation === 'remove' && typeof onRemoveVehicle === 'function') {
      console.log('[VehicleForm] Sincronizando ELIMINAR vehículo con ID:', data.id);
      // Verificar si el vehículo existe en externalVehicles
      if (externalVehicles?.some(v => v.id === data.id)) {
        onRemoveVehicle(data.id);
      } else {
        console.log('[VehicleForm] Vehículo ya eliminado:', data.id);
      }
    }
    
    // Desactivar el bloqueo después de un tiempo mínimo
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 100);
    
    return emptyFn ? emptyFn() : null;
  }, [externalVehicles]); // Dependencia: vehículos externos para comparaciones
  
  // Función para comparar vehículos y determinar si son iguales
  const isVehicleEqual = (vehicle1, vehicle2) => {
    if (!vehicle1 || !vehicle2) return false;
    return (
      vehicle1.id === vehicle2.id &&
      vehicle1.marca === vehicle2.marca &&
      vehicle1.modelo === vehicle2.modelo &&
      vehicle1.año === vehicle2.año &&
      vehicle1.valor === vehicle2.valor &&
      vehicle1.descripcion === vehicle2.descripcion
    );
  };

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
  
  // Verificar si hay duplicados entre hook y props externas y sincronizar vehículos iniciales
  const initialCheckDoneRef = useRef(false);
  useEffect(() => {
    // Solo ejecutar una vez después de la carga inicial
    if (!initialCheckDoneRef.current && vehicles.length > 0) {
      console.log('[VehicleForm] Verificación única de duplicados y sincronización inicial:');
      
      // Sincronizar vehículos cargados inicialmente con el estado externo
      if (vehicles.length > 0 && typeof onAddVehicle === 'function') {
        console.log('[VehicleForm] Sincronizando vehículos iniciales con estado global:', vehicles.length);
        
        // Evitar actualizar si ya existen en el estado externo
        const vehiclesToSync = vehicles.filter(vehicle => 
          !externalVehicles || !externalVehicles.some(v => v.id === vehicle.id)
        );
        
        // Añadir cada vehículo al estado externo
        vehiclesToSync.forEach(vehicle => {
          onAddVehicle(vehicle);
        });
      }
      
      // Detectar posibles duplicados (mismos IDs en ambos arrays)
      if (externalVehicles?.length > 0) {
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
      
      initialCheckDoneRef.current = true; // Marcar como ejecutado
    }
  }, [externalVehicles, vehicles, onAddVehicle]);
  
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