import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoPersonOutline, 
  IoMailOutline, 
  IoCallOutline,
  IoLocationOutline,
  IoChatboxOutline,
  IoSaveOutline,
  IoCloseOutline,
  IoAddOutline,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline,
  IoIdCardOutline,
  IoBusinessOutline,
  IoMailOpenOutline
} from 'react-icons/io5';

/**
 * Componente para crear o editar clientes con UI mejorada
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.initialValues - Valores iniciales para el formulario (cuando se edita)
 * @param {boolean} props.isEditing - Indica si se está editando un cliente existente
 * @param {Function} props.onSubmit - Función a llamar al enviar el formulario
 * @param {Function} props.onCancel - Función a llamar al cancelar
 * @returns {JSX.Element}
 */
const ClientForm = ({ initialValues = {}, isEditing = false, onSubmit, onCancel, onClientChange }) => {
  // Estado para el formulario
  const [client, setClient] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    rfc: '',
    direccion: '',
    ciudad: '',
    codigo_postal: ''
  });
  
  // Estado para errores de formulario
  const [errors, setErrors] = useState({});
  // Estado para campos que han sido tocados (para validación)
  const [touched, setTouched] = useState({});
  // Estado para mostrar tooltip
  const [tooltip, setTooltip] = useState(null);
  
  // Sincronizar con initialValues si se proporciona
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setClient({
        nombre: initialValues.nombre || '',
        apellidos: initialValues.apellidos || '',
        email: initialValues.email || '',
        telefono: initialValues.telefono || '',
        rfc: initialValues.rfc || '',
        direccion: initialValues.direccion || '',
        ciudad: initialValues.ciudad || '',
        codigo_postal: initialValues.codigo_postal || ''
      });
    }
  }, [initialValues]);

  // Validar correo electrónico
  const validateEmail = (email) => {
    if (!email) return true; // Permitir vacío
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validar RFC mexicano (versión simplificada)
  const validateRFC = (rfc) => {
    if (!rfc) return true; // Permitir vacío
    const re = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    return re.test(rfc);
  };

  // Validar teléfono mexicano
  const validatePhone = (phone) => {
    if (!phone) return true; // Permitir vacío
    const re = /^[0-9]{10}$/;
    return re.test(phone);
  };

  // Validar código postal mexicano
  const validatePostalCode = (cp) => {
    if (!cp) return true; // Permitir vacío
    const re = /^[0-9]{5}$/;
    return re.test(cp);
  };

  // Validar un campo específico
  const validateField = (name, value) => {
    let fieldError = null;
    
    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          fieldError = 'El nombre es obligatorio';
        }
        break;
      case 'apellidos':
        if (!value.trim()) {
          fieldError = 'Los apellidos son obligatorios';
        }
        break;
      case 'email':
        if (value && !validateEmail(value)) {
          fieldError = 'Correo electrónico inválido';
        }
        break;
      case 'telefono':
        if (value && !validatePhone(value)) {
          fieldError = 'Debe ser de 10 dígitos';
        }
        break;
      case 'rfc':
        if (value && !validateRFC(value)) {
          fieldError = 'Formato de RFC inválido';
        }
        break;
      case 'codigo_postal':
        if (value && !validatePostalCode(value)) {
          fieldError = 'Debe ser de 5 dígitos';
        }
        break;
      default:
        // No hay validaciones adicionales para otros campos
        break;
    }
    
    // Actualizar estado de errores
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
    
    return !fieldError;
  };
  
  // Validar el formulario completo
  const validateForm = () => {
    const newErrors = {};
    
    // Validar campos obligatorios
    if (!client.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    if (!client.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios';
    }
    
    // Validar email si está presente
    if (client.email && !validateEmail(client.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }
    
    // Validar RFC si está presente
    if (client.rfc && !validateRFC(client.rfc)) {
      newErrors.rfc = 'Formato de RFC inválido';
    }
    
    // Validar teléfono si está presente
    if (client.telefono && !validatePhone(client.telefono)) {
      newErrors.telefono = 'Debe ser de 10 dígitos';
    }
    
    // Validar código postal si está presente
    if (client.codigo_postal && !validatePostalCode(client.codigo_postal)) {
      newErrors.codigo_postal = 'Debe ser de 5 dígitos';
    }
    
    // Marcar todos los campos como tocados
    const allTouched = {};
    Object.keys(client).forEach(key => {
      allTouched[key] = true;
    });
    
    setTouched(allTouched);
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    try {
      const { name, value } = e.target;
      
      // Actualizar valor del campo
      const updatedClient = {
        ...client,
        [name]: value
      };
      
      setClient(updatedClient);
      
      // Marcar el campo como tocado
      if (!touched[name]) {
        setTouched(prev => ({
          ...prev,
          [name]: true
        }));
      }
      
      // Validar el campo
      validateField(name, value);
      
      // Notificar al componente padre si existe la función onClientChange
      if (typeof onClientChange === 'function') {
        onClientChange(updatedClient);
      }
    } catch (error) {
      console.error("Error al procesar cambio de campo:", error);
    }
  };
  
  // Manejar pérdida de foco en campos para validación
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };
  
  // Mostrar tooltip de ayuda
  const showFieldTooltip = (fieldName) => {
    const tooltips = {
      nombre: 'Ingresa el nombre del cliente',
      apellidos: 'Ingresa los apellidos del cliente',
      email: 'Correo electrónico de contacto (formato: ejemplo@dominio.com)',
      telefono: 'Número telefónico de 10 dígitos sin espacios ni guiones',
      rfc: 'Registro Federal de Contribuyentes (opcional)',
      direccion: 'Dirección completa: calle, número y colonia',
      ciudad: 'Ciudad o municipio de residencia',
      codigo_postal: 'Código postal de 5 dígitos'
    };
    
    setTooltip({
      field: fieldName,
      text: tooltips[fieldName] || 'Campo del formulario'
    });
  };
  
  // Ocultar tooltip
  const hideTooltip = () => {
    setTooltip(null);
  };
  
  // Verificar si un campo tiene errores y ha sido tocado
  const hasError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };
  
  // Verificar si un campo es válido y ha sido tocado
  const isValid = (fieldName) => {
    return touched[fieldName] && !errors[fieldName] && client[fieldName];
  };
  
  // Renderizar indicador de estado del campo
  const renderFieldStatus = (fieldName) => {
    if (hasError(fieldName)) {
      return (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <IoAlertCircleOutline className="h-5 w-5 text-red-500" />
        </div>
      );
    }
    
    if (isValid(fieldName)) {
      return (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <IoCheckmarkCircleOutline className="h-5 w-5 text-green-500" />
        </div>
      );
    }
    
    return null;
  };
  
  // Renderizar tooltip
  const renderTooltip = () => {
    if (!tooltip) return null;
    
    return (
      <div className="absolute z-10 mt-2 bg-gray-800 text-white p-2 rounded-md text-sm shadow-lg max-w-xs">
        {tooltip.text}
        <div className="absolute -top-2 left-4 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-800"></div>
      </div>
    );
  };
  
  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Enviando formulario de cliente", client);
    
    if (validateForm()) {
      console.log("Formulario válido, procesando datos");
      const formattedData = {
        ...client
      };
      
      if (isEditing && initialValues.cliente_id) {
        formattedData.cliente_id = initialValues.cliente_id;
      }
      
      try {
        onSubmit(formattedData);
        console.log("Datos de cliente enviados correctamente");
      } catch (error) {
        console.error("Error al enviar datos del cliente:", error);
      }
    } else {
      console.warn("Formulario inválido, no se enviaron datos");
    }
  };
  
  // Animaciones
  const formAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  const inputAnimation = {
    focus: { scale: 1.02, boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" },
    tap: { scale: 0.98 }
  };
  
  const buttonAnimation = {
    hover: { scale: 1.05, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)" },
    tap: { scale: 0.95 }
  };
  
  return (
    <motion.div
      className="bg-white shadow-lg rounded-xl overflow-hidden"
      variants={formAnimation}
      initial="hidden"
      animate="visible"
    >
      {/* Encabezado del formulario con degradado */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
        <div className="flex items-center">
          <div className="bg-white p-2 rounded-full mr-3">
            <IoPersonOutline className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold">
            {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
        </div>
        <p className="text-blue-100 mt-1 text-sm">
          {isEditing 
            ? 'Actualiza los datos de tu cliente existente' 
            : 'Completa la información para registrar un nuevo cliente'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Nombre (campo obligatorio) */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center" htmlFor="nombre">
              Nombre <span className="text-red-500 ml-1">*</span>
              <button 
                type="button"
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onMouseEnter={() => showFieldTooltip('nombre')}
                onMouseLeave={hideTooltip}
              >
                <IoInformationCircleOutline className="h-4 w-4" />
              </button>
              {tooltip && tooltip.field === 'nombre' && renderTooltip()}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoPersonOutline className={`h-5 w-5 ${hasError('nombre') ? 'text-red-400' : 'text-gray-400'}`} />
              </div>
              <motion.input
                type="text"
                id="nombre"
                name="nombre"
                value={client.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                whileFocus="focus"
                whileTap="tap"
                variants={inputAnimation}
                className={`pl-10 block w-full rounded-lg border ${
                  hasError('nombre') 
                    ? 'border-red-300 text-red-600 bg-red-50' 
                    : isValid('nombre')
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 bg-white'
                } py-3 pr-10 focus:outline-none focus:ring-2 ${
                  hasError('nombre') ? 'focus:ring-red-200' : 'focus:ring-blue-200'
                } focus:border-blue-500 transition-colors duration-200`}
                required
              />
              {renderFieldStatus('nombre')}
            </div>
            <AnimatePresence>
              {hasError('nombre') && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1 text-sm text-red-600 flex items-center"
                >
                  <IoAlertCircleOutline className="h-4 w-4 mr-1" />
                  {errors.nombre}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          
          {/* Apellidos (campo obligatorio) */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center" htmlFor="apellidos">
              Apellidos <span className="text-red-500 ml-1">*</span>
              <button 
                type="button"
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onMouseEnter={() => showFieldTooltip('apellidos')}
                onMouseLeave={hideTooltip}
              >
                <IoInformationCircleOutline className="h-4 w-4" />
              </button>
              {tooltip && tooltip.field === 'apellidos' && renderTooltip()}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoPersonOutline className={`h-5 w-5 ${hasError('apellidos') ? 'text-red-400' : 'text-gray-400'}`} />
              </div>
              <motion.input
                type="text"
                id="apellidos"
                name="apellidos"
                value={client.apellidos}
                onChange={handleChange}
                onBlur={handleBlur}
                whileFocus="focus"
                whileTap="tap"
                variants={inputAnimation}
                className={`pl-10 block w-full rounded-lg border ${
                  hasError('apellidos') 
                    ? 'border-red-300 text-red-600 bg-red-50' 
                    : isValid('apellidos')
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 bg-white'
                } py-3 pr-10 focus:outline-none focus:ring-2 ${
                  hasError('apellidos') ? 'focus:ring-red-200' : 'focus:ring-blue-200'
                } focus:border-blue-500 transition-colors duration-200`}
                required
              />
              {renderFieldStatus('apellidos')}
            </div>
            <AnimatePresence>
              {hasError('apellidos') && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1 text-sm text-red-600 flex items-center"
                >
                  <IoAlertCircleOutline className="h-4 w-4 mr-1" />
                  {errors.apellidos}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          
          {/* Email */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center" htmlFor="email">
              Correo electrónico
              <button 
                type="button"
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onMouseEnter={() => showFieldTooltip('email')}
                onMouseLeave={hideTooltip}
              >
                <IoInformationCircleOutline className="h-4 w-4" />
              </button>
              {tooltip && tooltip.field === 'email' && renderTooltip()}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoMailOutline className={`h-5 w-5 ${hasError('email') ? 'text-red-400' : 'text-gray-400'}`} />
              </div>
              <motion.input
                type="email"
                id="email"
                name="email"
                value={client.email}
                onChange={handleChange}
                onBlur={handleBlur}
                whileFocus="focus"
                whileTap="tap"
                variants={inputAnimation}
                className={`pl-10 block w-full rounded-lg border ${
                  hasError('email') 
                    ? 'border-red-300 text-red-600 bg-red-50' 
                    : isValid('email')
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 bg-white'
                } py-3 pr-10 focus:outline-none focus:ring-2 ${
                  hasError('email') ? 'focus:ring-red-200' : 'focus:ring-blue-200'
                } focus:border-blue-500 transition-colors duration-200`}
                placeholder="ejemplo@dominio.com"
              />
              {renderFieldStatus('email')}
            </div>
            <AnimatePresence>
              {hasError('email') && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1 text-sm text-red-600 flex items-center"
                >
                  <IoAlertCircleOutline className="h-4 w-4 mr-1" />
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          
          {/* Teléfono */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center" htmlFor="telefono">
              Teléfono
              <button 
                type="button"
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onMouseEnter={() => showFieldTooltip('telefono')}
                onMouseLeave={hideTooltip}
              >
                <IoInformationCircleOutline className="h-4 w-4" />
              </button>
              {tooltip && tooltip.field === 'telefono' && renderTooltip()}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoCallOutline className={`h-5 w-5 ${hasError('telefono') ? 'text-red-400' : 'text-gray-400'}`} />
              </div>
              <motion.input
                type="tel"
                id="telefono"
                name="telefono"
                value={client.telefono}
                onChange={handleChange}
                onBlur={handleBlur}
                whileFocus="focus"
                whileTap="tap"
                variants={inputAnimation}
                className={`pl-10 block w-full rounded-lg border ${
                  hasError('telefono') 
                    ? 'border-red-300 text-red-600 bg-red-50' 
                    : isValid('telefono')
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 bg-white'
                } py-3 pr-10 focus:outline-none focus:ring-2 ${
                  hasError('telefono') ? 'focus:ring-red-200' : 'focus:ring-blue-200'
                } focus:border-blue-500 transition-colors duration-200`}
                placeholder="10 dígitos"
              />
              {renderFieldStatus('telefono')}
            </div>
            <AnimatePresence>
              {hasError('telefono') && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1 text-sm text-red-600 flex items-center"
                >
                  <IoAlertCircleOutline className="h-4 w-4 mr-1" />
                  {errors.telefono}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          
          {/* RFC */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center" htmlFor="rfc">
              RFC
              <button 
                type="button"
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onMouseEnter={() => showFieldTooltip('rfc')}
                onMouseLeave={hideTooltip}
              >
                <IoInformationCircleOutline className="h-4 w-4" />
              </button>
              {tooltip && tooltip.field === 'rfc' && renderTooltip()}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoIdCardOutline className={`h-5 w-5 ${hasError('rfc') ? 'text-red-400' : 'text-gray-400'}`} />
              </div>
              <motion.input
                type="text"
                id="rfc"
                name="rfc"
                value={client.rfc}
                onChange={handleChange}
                onBlur={handleBlur}
                whileFocus="focus"
                whileTap="tap"
                variants={inputAnimation}
                className={`pl-10 block w-full rounded-lg border ${
                  hasError('rfc') 
                    ? 'border-red-300 text-red-600 bg-red-50' 
                    : isValid('rfc')
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 bg-white'
                } py-3 pr-10 focus:outline-none focus:ring-2 ${
                  hasError('rfc') ? 'focus:ring-red-200' : 'focus:ring-blue-200'
                } focus:border-blue-500 transition-colors duration-200`}
                placeholder="Ej: XAXX010101000"
              />
              {renderFieldStatus('rfc')}
            </div>
            <AnimatePresence>
              {hasError('rfc') && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1 text-sm text-red-600 flex items-center"
                >
                  <IoAlertCircleOutline className="h-4 w-4 mr-1" />
                  {errors.rfc}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          
          {/* Dirección */}
          <div className="relative md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center" htmlFor="direccion">
              Dirección
              <button 
                type="button"
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onMouseEnter={() => showFieldTooltip('direccion')}
                onMouseLeave={hideTooltip}
              >
                <IoInformationCircleOutline className="h-4 w-4" />
              </button>
              {tooltip && tooltip.field === 'direccion' && renderTooltip()}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoLocationOutline className="h-5 w-5 text-gray-400" />
              </div>
              <motion.input
                type="text"
                id="direccion"
                name="direccion"
                value={client.direccion}
                onChange={handleChange}
                whileFocus="focus"
                whileTap="tap"
                variants={inputAnimation}
                className="pl-10 block w-full rounded-lg border border-gray-300 bg-white py-3 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                placeholder="Calle, número, colonia"
              />
            </div>
          </div>
          
          {/* Ciudad */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center" htmlFor="ciudad">
              Ciudad
              <button 
                type="button"
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onMouseEnter={() => showFieldTooltip('ciudad')}
                onMouseLeave={hideTooltip}
              >
                <IoInformationCircleOutline className="h-4 w-4" />
              </button>
              {tooltip && tooltip.field === 'ciudad' && renderTooltip()}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoBusinessOutline className="h-5 w-5 text-gray-400" />
              </div>
              <motion.input
                type="text"
                id="ciudad"
                name="ciudad"
                value={client.ciudad}
                onChange={handleChange}
                whileFocus="focus"
                whileTap="tap"
                variants={inputAnimation}
                className="pl-10 block w-full rounded-lg border border-gray-300 bg-white py-3 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                placeholder="Ej: Ciudad de México"
              />
            </div>
          </div>
          
          {/* Código Postal */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center" htmlFor="codigo_postal">
              Código Postal
              <button 
                type="button"
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                onMouseEnter={() => showFieldTooltip('codigo_postal')}
                onMouseLeave={hideTooltip}
              >
                <IoInformationCircleOutline className="h-4 w-4" />
              </button>
              {tooltip && tooltip.field === 'codigo_postal' && renderTooltip()}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoMailOpenOutline className={`h-5 w-5 ${hasError('codigo_postal') ? 'text-red-400' : 'text-gray-400'}`} />
              </div>
              <motion.input
                type="text"
                id="codigo_postal"
                name="codigo_postal"
                value={client.codigo_postal}
                onChange={handleChange}
                onBlur={handleBlur}
                whileFocus="focus"
                whileTap="tap"
                variants={inputAnimation}
                className={`pl-10 block w-full rounded-lg border ${
                  hasError('codigo_postal') 
                    ? 'border-red-300 text-red-600 bg-red-50' 
                    : isValid('codigo_postal')
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 bg-white'
                } py-3 pr-10 focus:outline-none focus:ring-2 ${
                  hasError('codigo_postal') ? 'focus:ring-red-200' : 'focus:ring-blue-200'
                } focus:border-blue-500 transition-colors duration-200`}
                placeholder="5 dígitos"
              />
              {renderFieldStatus('codigo_postal')}
            </div>
            <AnimatePresence>
              {hasError('codigo_postal') && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1 text-sm text-red-600 flex items-center"
                >
                  <IoAlertCircleOutline className="h-4 w-4 mr-1" />
                  {errors.codigo_postal}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Resumen de datos del cliente */}
        {Object.values(client).some(value => value) && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <IoInformationCircleOutline className="h-5 w-5 mr-1 text-blue-500" />
              Resumen del cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Nombre completo:</span>{' '}
                {client.nombre && client.apellidos
                  ? `${client.nombre} ${client.apellidos}`
                  : 'Pendiente de completar'}
              </div>
              {client.email && (
                <div>
                  <span className="font-medium">Email:</span>{' '}
                  {client.email}
                </div>
              )}
              {client.telefono && (
                <div>
                  <span className="font-medium">Teléfono:</span>{' '}
                  {client.telefono}
                </div>
              )}
              {client.rfc && (
                <div>
                  <span className="font-medium">RFC:</span>{' '}
                  {client.rfc}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <IoCloseOutline className="h-5 w-5 mr-1" />
            Cancelar
          </motion.button>
          <motion.button
            type="submit"
            onClick={(e) => {
              if (!validateForm()) {
                e.preventDefault();
                console.warn("Validación fallida en botón de submit");
              } else {
                console.log("Enviando formulario desde botón");
              }
            }}
            variants={buttonAnimation}
            whileHover="hover"
            whileTap="tap"
            className="inline-flex justify-center items-center px-5 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            {isEditing ? (
              <>
                <IoSaveOutline className="h-5 w-5 mr-2" />
                Actualizar Cliente
              </>
            ) : (
              <>
                <IoAddOutline className="h-5 w-5 mr-2" />
                Crear Cliente
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ClientForm;