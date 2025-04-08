import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { IoDocumentOutline, IoPrintOutline, IoSaveOutline } from 'react-icons/io5';
import Modal from './Modal';

// Import validation schema and error components
import { validateContractData } from '../components/contract/utils/ValidationSchema';
import ErrorSummary, { ErrorMessage, addErrorClass } from '../components/contract/utils/ErrorSummary';
import { IoInformationCircleOutline } from 'react-icons/io5';

// Import modular components
import GeneralInfoSection from '../components/contract/form/GeneralInfoSection';
import BuyerInfoSection from '../components/contract/form/BuyerInfoSection';
import VehicleSelector from '../components/contract/form/VehicleSelector';
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
    calle: '',
    numeroExterior: '',
    direccionCompleta: '',

    // Información del comprador
    nombreComprador: client.nombre ? `${client.nombre} ${client.apellidos || ''}` : '',
    domicilioComprador: client.domicilio ? `${client.ciudad} ${client.estado} ${client.codigoPostal}` : '', 
    telefonoComprador: client.telefono || '',
    emailComprador: client.email || '',
    identificacionComprador: '',
    numeroIdentificacion: '',

    // Información del vehículo
    marca: vehicles.length > 0 ? vehicles[0].marca || '' : '',
    modelo: vehicles.length > 0 ? vehicles[0].modelo || '' : '',
    color: vehicles.length > 0 ? vehicles[0].color || '' : '',
    tipo: vehicles.length > 0 ? vehicles[0].tipo || '' : '',
    numeroMotor: vehicles.length > 0 ? vehicles[0].numero_motor || '' : '',
    numeroSerie: vehicles.length > 0 ? vehicles[0].numero_serie || '' : '',
    placas: vehicles.length > 0 ? vehicles[0].placas || '' : '',
    numeroCirculacion: vehicles.length > 0 ? vehicles[0].numero_circulacion || '' : '',
    numeroFactura: vehicles.length > 0 ? vehicles[0].numero_factura || '' : '',
    refrendos: vehicles.length > 0 ? vehicles[0].refrendos || '' : '',
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
  const [validationErrors, setValidationErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showValidationError, setShowValidationError] = useState(false);
  
  // Address autocomplete states
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  
  // Vehículo seleccionado actualmente
  const [selectedVehicle, setSelectedVehicle] = useState(vehicles.length > 0 ? vehicles[0] : null);
  
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

  // Manejador para los cambios de ubicación (estado/ciudad/codigo postal/colonia/calle/etc)
  const handleLocationChange = useCallback(({ 
    state, city, colony, zipCode, street, houseNumber, fullAddress, // General address fields
    buyerState, buyerCity, buyerColony, buyerZipCode, buyerStreet, buyerHouseNumber, buyerFullAddress // Buyer address fields
  }) => {
    setContractData(prevData => {
      // Create update object
      const updates = { ...prevData };
      
      // Update general address fields if provided
      if (state || city || colony || zipCode || street || houseNumber || fullAddress) {
        updates.estado = state || prevData.estado;
        updates.ciudad = city || prevData.ciudad;
        updates.colonia = colony || prevData.colonia;
        updates.codigoPostal = zipCode || prevData.codigoPostal;
        updates.calle = street || prevData.calle;
        updates.numeroExterior = houseNumber || prevData.numeroExterior;
        updates.direccionCompleta = fullAddress || prevData.direccionCompleta;
      }
      
      // Update buyer address fields if provided
      if (buyerFullAddress) {
        updates.domicilioComprador = buyerFullAddress;
      }
      
      // Also update the main ciudad and estado fields from buyer data to fix validation
      if (buyerCity) {
        updates.ciudad = buyerCity;
      }
      if (buyerState) {
        updates.estado = buyerState;
      }
      
      return updates;
    });
  }, []);

  // Toggle between form and preview modes with validation
  const togglePreview = () => {
    if (!showPreview) {
      // Validar datos antes de mostrar la vista previa
      const { isValid, errors, fieldErrors } = validateContractData(contractData);
      if (!isValid) {
        setValidationErrors(errors);
        setFieldErrors(fieldErrors);
        setShowValidationError(true);
        // Desplazarse al principio del formulario para ver los errores
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    // Si está en vista previa o si pasó la validación
    setShowPreview(!showPreview);
    setShowValidationError(false);
  };

  // Seleccionar identificación del modal
  const handleSelectIdentification = useCallback((identificacion) => {
    setContractData(prevData => ({
      ...prevData,
      identificacionComprador: identificacion
    }));
    setShowIdCopyModal(false);
  }, []);
  
  // Función para buscar direcciones mediante la API
  const searchAddresses = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    
    setIsLoadingAddresses(true);
    try {
      // Usar el API_URL del entorno
      const apiUrl = `${import.meta.env.VITE_API_URL}/direcciones/buscar?q=${encodeURIComponent(searchTerm)}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Error al buscar direcciones');
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        setAddressSuggestions(data.data);
      } else {
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error('Error al buscar direcciones:', error);
      setAddressSuggestions([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Función para seleccionar una dirección de las sugerencias
  const handleSelectAddress = (address) => {
    const fullAddress = `${address.calle} ${address.numeroExterior}, ${address.colonia}, ${address.municipio}, ${address.estado}, CP ${address.codigoPostal}`;
    
    setContractData({
      ...contractData,
      domicilioComprador: fullAddress
    });
    
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  };

  // Manejador específico para el campo de domicilio
  const handleAddressChange = (e) => {
    const { value } = e.target;
    
    setContractData({
      ...contractData,
      domicilioComprador: value
    });
    
    setShowAddressSuggestions(true);
    searchAddresses(value);
  };

  // Verificar si la dirección está completa
  const checkAddressComplete = () => {
    if (!contractData.domicilioComprador || contractData.domicilioComprador.trim() === '') {
      showAddressProofReminder();
    }
  };

  // Mostrar modal de recordatorio de comprobante de domicilio
  const showAddressProofReminder = () => {
    setShowAddressProofModal(true);
  };

  // Manejar la selección de vehículo
  const handleVehicleSelect = useCallback((vehicle) => {
    if (!vehicle) return;
    
    setSelectedVehicle(vehicle);
    
    // Actualizar los datos del contrato con la información del vehículo seleccionado
    setContractData(prevData => ({
      ...prevData,
      marca: vehicle.marca || '',
      modelo: vehicle.modelo || '',
      color: vehicle.color || '',
      tipo: vehicle.tipo || '',
      numeroMotor: vehicle.numero_motor || '',
      numeroSerie: vehicle.numero_serie || '',
      placas: vehicle.placas || '',
      numeroCirculacion: vehicle.numero_circulacion || '',
      numeroFactura: vehicle.numero_factura || '',
      refrendos: vehicle.refrendos || '',
      precioTotal: vehicle.valor || 0,
      precioTotalTexto: numeroATexto(vehicle.valor || 0)
    }));
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
  
  // Animation variants for individual form items
  const itemAnimation = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 20 }
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
          {/* Gov.uk Style Error Summary */}
          <ErrorSummary 
            errors={fieldErrors} 
            visible={showValidationError} 
          />
          {/* General Information Section */}
          <GeneralInfoSection 
            formData={contractData}
            handleChange={handleChange}
            handleLocationChange={handleLocationChange}
            errors={fieldErrors}
          />

          {/* Buyer Information Section */}
          <BuyerInfoSection
            formData={contractData}
            handleChange={handleChange}
            handleLocationChange={handleLocationChange}
            idModalShown={idModalShown}
            setIdModalShown={setIdModalShown}
            setShowIdCopyModal={setShowIdCopyModal}
            setShowAddressProofModal={setShowAddressProofModal}
            errors={fieldErrors}
          />

          {/* Selector de Vehículos */}
          <div className="govuk-form-section">
            <h3 className="govuk-form-section-title">Selección del Vehículo</h3>
            <VehicleSelector 
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onVehicleSelect={handleVehicleSelect}
            />
          </div>

          {/* Vehicle Information Section */}
          <VehicleInfoSection 
            formData={contractData}
            handleChange={handleChange}
            errors={fieldErrors}
          />

          {/* Payment Information Section */}
          <PaymentInfoSection 
            formData={contractData}
            handleChange={handleChange}
            errors={fieldErrors}
          />

          {/* Observations Section */}
          <ObservationsSection 
            formData={contractData}
            handleChange={handleChange}
            errors={fieldErrors}
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