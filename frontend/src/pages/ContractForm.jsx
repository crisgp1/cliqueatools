import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { IoDocumentOutline, IoPrintOutline, IoSaveOutline } from 'react-icons/io5';
import Modal from './Modal';

// Import modular components
import GeneralInfoSection from '../components/contract/form/GeneralInfoSection';
import BuyerInfoSection from '../components/contract/form/BuyerInfoSection';
import VehicleInfoSection from '../components/contract/form/VehicleInfoSection';
import PaymentInfoSection from '../components/contract/form/PaymentInfoSection';
import ObservationsSection from '../components/contract/form/ObservationsSection';
import SignatureManager from '../components/contract/signature/SignatureManager';
import ContractPreview from '../components/contract/preview/ContractPreview';
import IdentificationModal from '../components/contract/modals/IdentificationModal';
import AddressProofModal from '../components/contract/modals/AddressProofModal';

// Import utilities
import { getCurrentFormattedDateTime, numeroATexto } from '../components/contract/utils/ContractUtils';

const ContractForm = ({ vehicles = [], client = {} }) => {
  // Verificación de IDs duplicados en vehículos
  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      // Crear un objeto para contar las ocurrencias de cada ID
      const idCounts = {};
      vehicles.forEach(vehicle => {
        if (vehicle.id) {
          idCounts[vehicle.id] = (idCounts[vehicle.id] || 0) + 1;
        }
      });
      
      // Filtrar los IDs que aparecen más de una vez
      const duplicatedIds = Object.keys(idCounts).filter(id => idCounts[id] > 1);
      
      if (duplicatedIds.length > 0) {
        console.warn("[VehicleForm] ⚠️ IDs duplicados encontrados:", duplicatedIds);
      }
    }
  }, [vehicles]);

  // Get current formatted date and time
  const { formattedDate, formattedTime } = getCurrentFormattedDateTime();

  // Contract form data state
  const [contractData, setContractData] = useState({
    // Información general
    ciudad: '',
    estado: '',
    fecha: formattedDate,
    hora: formattedTime,
    codigoPostal: '',
    colonia: '',

    // Información del comprador
    nombreComprador: client.nombre ? `${client.nombre} ${client.apellidos || ''}` : '',
    domicilioComprador: client.direccion || '',
    telefonoComprador: client.telefono || '',
    emailComprador: client.email || '',
    identificacionComprador: '',
    numeroIdentificacion: '',

    // Información del vehículo
    marca: vehicles.length > 0 ? vehicles[0].marca || '' : '',
    modelo: vehicles.length > 0 ? vehicles[0].modelo || '' : '',
    color: '',
    tipo: '',
    numeroMotor: '',
    numeroSerie: '',
    placas: '',
    numeroCirculacion: '',
    numeroFactura: '',
    refrendos: '',
    rfcVehiculo: '',

    // Información de pago
    precioTotal: vehicles.length > 0 ? vehicles[0].valor || 0 : 0,
    precioTotalTexto: '',
    formaPago: 'Transferencia bancaria',

    // Observaciones adicionales
    observaciones: ''
  });

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [showIdCopyModal, setShowIdCopyModal] = useState(false);
  const [showAddressProofModal, setShowAddressProofModal] = useState(false);
  const [idModalShown, setIdModalShown] = useState(false);
  
  // Signature state
  const [signatures, setSignatures] = useState({
    vendor: null,
    buyer: null
  });

  // References
  const contractRef = useRef(null);

  // Manejar cambios en los campos
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    if (name === 'precioTotal') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setContractData({
          ...contractData,
          [name]: numValue,
          precioTotalTexto: numeroATexto(numValue)
        });
      }
    } else {
      setContractData({
        ...contractData,
        [name]: value
      });
    }
  }, [contractData]);

  // Manejador para los cambios de ubicación (estado/ciudad/codigo postal/colonia)
  const handleLocationChange = useCallback(({ state, city, colony, zipCode }) => {
    setContractData(prevData => ({
      ...prevData,
      estado: state,
      ciudad: city,
      colonia: colony || prevData.colonia,
      codigoPostal: zipCode || prevData.codigoPostal
    }));
  }, []);

  // Toggle between form and preview modes
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  // Seleccionar identificación del modal
  const handleSelectIdentification = useCallback((identificacion) => {
    setContractData(prevData => ({
      ...prevData,
      identificacionComprador: identificacion
    }));
    setShowIdCopyModal(false);
  }, []);

  // Animation variants for the form container
  const formAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  // Handle open signature window - delegated to SignatureManager
  const handleOpenSignatureWindow = (type) => {
    // This is just a pass-through function to maintain the API
    // The actual implementation is in the SignatureManager component
  };

  return (
    <div className="contract-form">
      {showPreview ? (
        <ContractPreview 
          contractData={contractData}
          signatures={signatures}
          togglePreview={togglePreview}
          handleOpenSignatureWindow={handleOpenSignatureWindow}
        />
      ) : (
        <motion.div
          className="space-y-8"
          initial="hidden"
          animate="visible"
          variants={formAnimation}
        >
          {/* General Information Section */}
          <GeneralInfoSection 
            formData={contractData}
            handleChange={handleChange}
            handleLocationChange={handleLocationChange}
          />

          {/* Buyer Information Section */}
          <BuyerInfoSection 
            formData={contractData}
            handleChange={handleChange}
            idModalShown={idModalShown}
            setIdModalShown={setIdModalShown}
            setShowIdCopyModal={setShowIdCopyModal}
            setShowAddressProofModal={setShowAddressProofModal}
          />

          {/* Vehicle Information Section */}
          <VehicleInfoSection 
            formData={contractData}
            handleChange={handleChange}
          />

          {/* Payment Information Section */}
          <PaymentInfoSection 
            formData={contractData}
            handleChange={handleChange}
          />

          {/* Observations Section */}
          <ObservationsSection 
            formData={contractData}
            handleChange={handleChange}
          />

          {/* Signatures Section */}
          <SignatureManager 
            signatures={signatures}
            setSignatures={setSignatures}
          />

          {/* Form Actions */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={togglePreview}
              className="govuk-button govuk-button-secondary flex items-center"
            >
              <IoDocumentOutline className="h-5 w-5 mr-2" />
              Vista Previa
            </button>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <IdentificationModal 
        isOpen={showIdCopyModal}
        onClose={() => setShowIdCopyModal(false)}
        onSelectIdentification={handleSelectIdentification}
      />

      <AddressProofModal 
        isOpen={showAddressProofModal}
        onClose={() => setShowAddressProofModal(false)}
      />
    </div>
  );
};

export default ContractForm;