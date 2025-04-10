import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BANCOS, PLAZOS } from './constants/BankData';
import { formatCurrency, calculateMonthlyPayment } from './utils/CreditUtils';
import { FaCarSide, FaUser, FaMoneyCheckAlt, FaAngleRight, FaAngleLeft, FaSpinner } from 'react-icons/fa';

// Validation patterns
const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-.]+$/;
const PHONE_PATTERN = /^[0-9]{10}$/;
const EMAIL_PATTERN = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,6}$/;
const PLATES_PATTERN = /^[A-Z0-9]{3,7}$/;

// Default form values
const initialFormState = {
  // Cliente
  nombre: '',
  apellidos: '',
  telefono: '',
  email: '',
  // Vehículo
  marca: '',
  modelo: '',
  anio: new Date().getFullYear(),
  precio: '',
  placas: '',
  // Crédito
  enganche: 20, // Porcentaje por defecto
  montoEnganche: 0,
  plazo: 60, // Meses por defecto
  bancoId: 1, // Banco por defecto
  tasaPersonalizada: false,
  tasa: '',
  catPersonalizado: false,
  cat: ''
};

// Validación errores
const initialErrorState = {
  nombre: '',
  apellidos: '',
  telefono: '',
  email: '',
  marca: '',
  modelo: '',
  anio: '',
  precio: '',
  placas: '',
  enganche: '',
  montoEnganche: '',
  plazo: '',
  tasa: '',
  cat: ''
};

const QuickCreditForm = ({ onSubmitForm, onBack }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState(initialErrorState);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stepValidity, setStepValidity] = useState({
    1: false,
    2: false,
    3: false
  });

  // Precio formateado para mostrar
  const formattedPrecio = formData.precio
    ? new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2
      }).format(formData.precio)
    : '';

  // Para cálculos en tiempo real
  const montoFinanciamiento = formData.precio
    ? formData.precio - formData.montoEnganche
    : 0;

  const bancoSeleccionado = BANCOS.find(b => b.id === formData.bancoId) || BANCOS[0];
  
  const tasaEfectiva = formData.tasaPersonalizada 
    ? parseFloat(formData.tasa) || 0 
    : bancoSeleccionado?.tasa || 0;
  
  const catEfectivo = formData.catPersonalizado 
    ? parseFloat(formData.cat) || 0 
    : formData.tasaPersonalizada 
      ? tasaEfectiva * 1.3 
      : bancoSeleccionado?.cat || 0;
  
  const pagoMensual = montoFinanciamiento > 0 && formData.plazo > 0 && tasaEfectiva > 0
    ? calculateMonthlyPayment(montoFinanciamiento, tasaEfectiva, formData.plazo)
    : 0;
  
  const montoTotal = pagoMensual * formData.plazo;
  const interesesTotales = montoTotal - montoFinanciamiento;

  // Actualizar monto de enganche cuando cambia el porcentaje o el precio
  useEffect(() => {
    if (formData.precio && formData.enganche) {
      const monto = (formData.precio * formData.enganche) / 100;
      setFormData(prev => ({
        ...prev,
        montoEnganche: monto
      }));
    }
  }, [formData.enganche, formData.precio]);

  // Actualizar porcentaje de enganche cuando cambia el monto (evitando loops)
  const updateDownPaymentPercentage = (monto) => {
    if (formData.precio && monto) {
      const porcentaje = (monto * 100) / formData.precio;
      setFormData(prev => ({
        ...prev,
        enganche: Math.min(100, Math.max(0, parseFloat(porcentaje.toFixed(2))))
      }));
    }
  };

  // Validación
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'nombre':
      case 'apellidos':
        if (!value.trim()) {
          error = `El campo ${name === 'nombre' ? 'nombre' : 'apellidos'} es obligatorio`;
        } else if (!NAME_PATTERN.test(value)) {
          error = `${name === 'nombre' ? 'El nombre' : 'Los apellidos'} solo puede contener letras y espacios`;
        }
        break;
      case 'telefono':
        if (!value) {
          error = 'El teléfono es obligatorio';
        } else if (!PHONE_PATTERN.test(value)) {
          error = 'El teléfono debe contener 10 dígitos';
        }
        break;
      case 'email':
        if (value && !EMAIL_PATTERN.test(value)) {
          error = 'El correo electrónico no es válido';
        }
        break;
      case 'marca':
        if (!value.trim()) {
          error = 'La marca es obligatoria';
        }
        break;
      case 'modelo':
        if (!value.trim()) {
          error = 'El modelo es obligatorio';
        }
        break;
      case 'anio':
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        if (!year) {
          error = 'El año es obligatorio';
        } else if (year < 1900 || year > currentYear + 1) {
          error = `El año debe estar entre 1900 y ${currentYear + 1}`;
        }
        break;
      case 'precio':
        if (!value) {
          error = 'El precio es obligatorio';
        } else if (parseFloat(value) <= 0) {
          error = 'El precio debe ser mayor a cero';
        }
        break;
      case 'placas':
        if (value && !PLATES_PATTERN.test(value.toUpperCase())) {
          error = 'Las placas deben contener entre 3 y 7 caracteres alfanuméricos';
        }
        break;
      case 'montoEnganche':
        if (parseFloat(value) > formData.precio) {
          error = 'El enganche no puede ser mayor al precio del vehículo';
        }
        break;
      case 'tasa':
        if (formData.tasaPersonalizada) {
          if (!value) {
            error = 'La tasa es obligatoria';
          } else if (parseFloat(value) < 0 || parseFloat(value) > 99) {
            error = 'La tasa debe estar entre 0% y 99%';
          }
        }
        break;
      case 'cat':
        if (formData.catPersonalizado) {
          if (!value) {
            error = 'El CAT es obligatorio';
          } else if (parseFloat(value) < 0 || parseFloat(value) > 99) {
            error = 'El CAT debe estar entre 0% y 99%';
          }
        }
        break;
      default:
        break;
    }

    return error;
  };

  // Validar el paso actual
  useEffect(() => {
    let isValid = false;
    
    switch (step) {
      case 1: // Información del cliente
        isValid = !errors.nombre && !errors.apellidos && 
                 !errors.telefono && !errors.email &&
                 formData.nombre && formData.apellidos && 
                 formData.telefono;
        break;
      case 2: // Información del vehículo
        isValid = !errors.marca && !errors.modelo && 
                 !errors.anio && !errors.precio && 
                 !errors.placas && formData.marca && 
                 formData.modelo && formData.precio;
        break;
      case 3: // Información del crédito
        isValid = !errors.enganche && !errors.montoEnganche && 
                 !errors.plazo && !errors.tasa && !errors.cat &&
                 formData.enganche > 0 && formData.enganche < 100 &&
                 formData.montoEnganche > 0 && formData.montoEnganche < formData.precio &&
                 formData.plazo > 0;
        
        if (formData.tasaPersonalizada && !formData.tasa) {
          isValid = false;
        }
        
        if (formData.catPersonalizado && !formData.cat) {
          isValid = false;
        }
        break;
      default:
        isValid = false;
    }
    
    setStepValidity(prev => ({
      ...prev,
      [step]: isValid
    }));
  }, [formData, errors, step]);

  // Maneja los cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
      
      // Si desmarcamos la tasa personalizada, limpiamos el campo
      if (name === 'tasaPersonalizada' && !checked) {
        setFormData(prev => ({
          ...prev,
          tasa: ''
        }));
        setErrors(prev => ({
          ...prev,
          tasa: ''
        }));
      }
      
      // Si desmarcamos el CAT personalizado, limpiamos el campo
      if (name === 'catPersonalizado' && !checked) {
        setFormData(prev => ({
          ...prev,
          cat: ''
        }));
        setErrors(prev => ({
          ...prev,
          cat: ''
        }));
      }
    } else {
      let processedValue = value;
      
      // Procesar algunos campos especiales
      if (name === 'telefono') {
        processedValue = value.replace(/\D/g, '').substring(0, 10);
      } else if (name === 'placas') {
        processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 7);
      } else if (name === 'precio' || name === 'montoEnganche' || name === 'tasa' || name === 'cat') {
        // Permitir solo números y un punto decimal
        processedValue = value.replace(/[^\d.]/g, '');
        // Si hay más de un punto decimal, mantener solo el primero
        const parts = processedValue.split('.');
        if (parts.length > 2) {
          processedValue = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Para precio y monto de enganche, convertir a número
        if ((name === 'precio' || name === 'montoEnganche') && processedValue) {
          processedValue = parseFloat(processedValue);
        }
        
        // Si estamos cambiando el monto del enganche, actualizar el porcentaje
        if (name === 'montoEnganche') {
          updateDownPaymentPercentage(processedValue);
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }
    
    // Validar el campo
    const errorMsg = validateField(name, type === 'checkbox' ? checked : value);
    setErrors({
      ...errors,
      [name]: errorMsg
    });
  };

  // Función para ir al siguiente paso
  const handleNext = () => {
    if (stepValidity[step]) {
      setStep(prevStep => Math.min(prevStep + 1, 4));
    }
  };

  // Función para ir al paso anterior
  const handlePrev = () => {
    setStep(prevStep => Math.max(prevStep - 1, 1));
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar todo el formulario
    let formIsValid = true;
    const newErrors = { ...initialErrorState };
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      newErrors[key] = error;
      if (error) {
        formIsValid = false;
      }
    });
    
    setErrors(newErrors);
    
    if (formIsValid) {
      setLoading(true);
      
      // Crear objeto con todos los datos necesarios para la cotización
      const cotizacion = {
        cliente: {
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          telefono: formData.telefono,
          email: formData.email
        },
        vehiculo: {
          marca: formData.marca,
          modelo: formData.modelo,
          anio: formData.anio,
          precio: parseFloat(formData.precio),
          placas: formData.placas
        },
        credito: {
          banco: bancoSeleccionado,
          plazo: parseInt(formData.plazo),
          tasaInteres: tasaEfectiva,
          cat: catEfectivo,
          enganchePorcentaje: parseFloat(formData.enganche),
          engancheMonto: formData.montoEnganche,
          montoFinanciamiento,
          pagoMensual,
          montoTotal,
          interesesTotales,
          comisionApertura: (montoFinanciamiento * bancoSeleccionado.comision) / 100,
          tasaPersonalizada: formData.tasaPersonalizada,
          catPersonalizado: formData.catPersonalizado
        },
        fecha: new Date().toISOString()
      };
      
      // Simular tiempo de carga
      setTimeout(() => {
        setLoading(false);
        onSubmitForm(cotizacion);
      }, 800);
    }
  };

  // Animaciones
  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.4,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 }
    }
  };

  // Clases para inputs
  const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent";
  const inputErrorClass = "w-full px-4 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const errorClass = "mt-1 text-xs text-red-500";
  const buttonClass = "px-6 py-2 bg-amber-500 text-white font-medium rounded-lg flex items-center justify-center transition-all hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500";
  const buttonDisabledClass = "px-6 py-2 bg-gray-300 text-gray-500 font-medium rounded-lg flex items-center justify-center";

  // Cálculo preliminar para mostrar
  const calculoPreliminar = () => {
    if (!formData.precio || !formData.enganche || !formData.plazo || !formData.bancoId) {
      return null;
    }

    return (
      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <h3 className="text-amber-800 font-medium mb-3">Cotización preliminar:</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Precio del vehículo:</span>
            <span className="ml-2 font-medium">{formatCurrency(formData.precio)}</span>
          </div>
          <div>
            <span className="text-gray-600">Enganche ({formData.enganche}%):</span>
            <span className="ml-2 font-medium">{formatCurrency(formData.montoEnganche)}</span>
          </div>
          <div>
            <span className="text-gray-600">Monto a financiar:</span>
            <span className="ml-2 font-medium">{formatCurrency(montoFinanciamiento)}</span>
          </div>
          <div>
            <span className="text-gray-600">Tasa anual:</span>
            <span className="ml-2 font-medium">{tasaEfectiva}%</span>
          </div>
          <div>
            <span className="text-gray-600">Plazo:</span>
            <span className="ml-2 font-medium">{formData.plazo} meses</span>
          </div>
          <div>
            <span className="text-gray-600">Pago mensual:</span>
            <span className="ml-2 font-medium text-amber-700">{formatCurrency(pagoMensual)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Renderiza el paso actual
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="flex items-center mb-4 pb-2 border-b border-amber-200">
              <FaUser className="text-amber-500 mr-2" />
              <h2 className="text-xl font-semibold">Información del Cliente</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="nombre" className={labelClass}>
                  Nombre(s) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={errors.nombre ? inputErrorClass : inputClass}
                  placeholder="Escribe tu nombre"
                />
                {errors.nombre && <p className={errorClass}>{errors.nombre}</p>}
              </div>
              
              <div>
                <label htmlFor="apellidos" className={labelClass}>
                  Apellidos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
                  onChange={handleChange}
                  className={errors.apellidos ? inputErrorClass : inputClass}
                  placeholder="Escribe tus apellidos"
                />
                {errors.apellidos && <p className={errorClass}>{errors.apellidos}</p>}
              </div>
              
              <div>
                <label htmlFor="telefono" className={labelClass}>
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className={errors.telefono ? inputErrorClass : inputClass}
                  placeholder="10 dígitos"
                  maxLength={10}
                />
                {errors.telefono && <p className={errorClass}>{errors.telefono}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className={labelClass}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? inputErrorClass : inputClass}
                  placeholder="ejemplo@correo.com"
                />
                {errors.email && <p className={errorClass}>{errors.email}</p>}
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-4">
              <p>Los campos marcados con <span className="text-red-500">*</span> son obligatorios.</p>
              <p>La información ingresada solo se utilizará para generar la cotización y no será almacenada.</p>
            </div>
          </motion.div>
        );
      
      case 2:
        return (
          <motion.div
            key="step2"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="flex items-center mb-4 pb-2 border-b border-amber-200">
              <FaCarSide className="text-amber-500 mr-2" />
              <h2 className="text-xl font-semibold">Información del Vehículo</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label htmlFor="marca" className={labelClass}>
                  Marca <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="marca"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  className={errors.marca ? inputErrorClass : inputClass}
                  placeholder="Ej. Toyota, Ford, BMW..."
                />
                {errors.marca && <p className={errorClass}>{errors.marca}</p>}
              </div>
              
              <div>
                <label htmlFor="modelo" className={labelClass}>
                  Modelo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="modelo"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  className={errors.modelo ? inputErrorClass : inputClass}
                  placeholder="Ej. Corolla, Mustang, X5..."
                />
                {errors.modelo && <p className={errorClass}>{errors.modelo}</p>}
              </div>
              
              <div>
                <label htmlFor="anio" className={labelClass}>
                  Año <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="anio"
                  name="anio"
                  value={formData.anio}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className={errors.anio ? inputErrorClass : inputClass}
                />
                {errors.anio && <p className={errorClass}>{errors.anio}</p>}
              </div>
              
              <div>
                <label htmlFor="precio" className={labelClass}>
                  Precio <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="text"
                    id="precio"
                    name="precio"
                    value={typeof formData.precio === 'number' ? formData.precio : formData.precio}
                    onChange={handleChange}
                    className={`${errors.precio ? inputErrorClass : inputClass} pl-8`}
                    placeholder="0.00"
                  />
                </div>
                {errors.precio && <p className={errorClass}>{errors.precio}</p>}
              </div>
              
              <div>
                <label htmlFor="placas" className={labelClass}>
                  Placas
                </label>
                <input
                  type="text"
                  id="placas"
                  name="placas"
                  value={formData.placas}
                  onChange={handleChange}
                  className={errors.placas ? inputErrorClass : inputClass}
                  placeholder="3-7 caracteres alfanuméricos"
                  maxLength={7}
                />
                {errors.placas && <p className={errorClass}>{errors.placas}</p>}
                <p className="mt-1 text-xs text-gray-500">Opcional</p>
              </div>
            </div>
            
            {formData.precio > 0 && (
              <div className="p-4 bg-amber-50 rounded-lg mt-4 border border-amber-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">Valor del vehículo:</span>
                  <span className="font-bold text-amber-700">{formattedPrecio}</span>
                </div>
              </div>
            )}
          </motion.div>
        );
      
      case 3:
        return (
          <motion.div
            key="step3"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="flex items-center mb-4 pb-2 border-b border-amber-200">
              <FaMoneyCheckAlt className="text-amber-500 mr-2" />
              <h2 className="text-xl font-semibold">Información del Crédito</h2>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg mb-6 border border-amber-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h3 className="font-medium text-amber-800 mb-1">Vehículo a financiar</h3>
                  <p className="text-sm">{formData.marca} {formData.modelo} {formData.anio}</p>
                </div>
                <div className="mt-2 md:mt-0 font-bold text-amber-700">
                  {formattedPrecio}
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Enganche */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <label htmlFor="enganche" className="font-medium text-gray-700 mb-2 block">
                  Enganche
                </label>
                
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Porcentaje:</span>
                      <span className="text-sm font-medium">{formData.enganche}%</span>
                    </div>
                    <input
                      type="range"
                      id="enganche"
                      name="enganche"
                      min="0"
                      max="90"
                      step="1"
                      value={formData.enganche}
                      onChange={handleChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>90%</span>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-48">
                    <label htmlFor="montoEnganche" className="text-sm text-gray-600 block mb-1">
                      Monto de enganche:
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="text"
                        id="montoEnganche"
                        name="montoEnganche"
                        value={typeof formData.montoEnganche === 'number' ? formData.montoEnganche : formData.montoEnganche}
                        onChange={handleChange}
                        className={`${errors.montoEnganche ? inputErrorClass : inputClass} pl-8 py-1.5`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.montoEnganche && <p className={errorClass}>{errors.montoEnganche}</p>}
                  </div>
                </div>
                
                <div className="mt-3 text-sm">
                  <div className="flex justify-between">
                    <span>Monto a financiar:</span>
                    <span className="font-medium">{formatCurrency(montoFinanciamiento)}</span>
                  </div>
                </div>
              </div>
              
              {/* Plazo */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <label htmlFor="plazo" className="font-medium text-gray-700 mb-2 block">
                  Plazo
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PLAZOS.map(plazo => (
                    <button
                      key={plazo}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, plazo }))}
                      className={`py-2 px-3 rounded-lg text-center transition ${
                        formData.plazo === plazo
                          ? 'bg-amber-500 text-white font-medium'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {plazo} meses
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Banco */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <label className="font-medium text-gray-700 mb-2 block">
                  Banco
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {BANCOS.slice(0, 5).map(banco => (
                    <button
                      key={banco.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, bancoId: banco.id }))}
                      className={`p-3 border rounded-lg flex flex-col items-center transition hover:shadow-md ${
                        formData.bancoId === banco.id
                          ? 'border-amber-500 bg-amber-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {typeof banco.logo === 'string' ? (
                        <div className="w-8 h-8 flex items-center justify-center mb-2">
                          {banco.logo}
                        </div>
                      ) : (
                        <img src={banco.logo} alt={banco.nombre} className="h-8 mb-2" />
                      )}
                      <span className="text-xs font-medium">{banco.nombre}</span>
                      <span className="text-xs mt-1 text-gray-600">{banco.tasa}%</span>
                    </button>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="tasaPersonalizada"
                        name="tasaPersonalizada"
                        checked={formData.tasaPersonalizada}
                        onChange={handleChange}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="tasaPersonalizada" className="ml-2 text-sm text-gray-700">
                        Usar tasa personalizada
                      </label>
                    </div>
                    
                    {formData.tasaPersonalizada && (
                      <div className="flex items-center ml-6 mt-1">
                        <input
                          type="text"
                          id="tasa"
                          name="tasa"
                          value={formData.tasa}
                          onChange={handleChange}
                          className={`${
                            errors.tasa ? 'border-red-300' : 'border-gray-300'
                          } w-20 px-2 py-1 border rounded-md focus:ring-amber-500 focus:border-amber-500`}
                          placeholder="0.00"
                        />
                        <span className="ml-2 text-sm">%</span>
                        {errors.tasa && (
                          <p className="ml-2 text-xs text-red-500">{errors.tasa}</p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        id="catPersonalizado"
                        name="catPersonalizado"
                        checked={formData.catPersonalizado}
                        onChange={handleChange}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="catPersonalizado" className="ml-2 text-sm text-gray-700">
                        Usar CAT personalizado
                      </label>
                    </div>
                    
                    {formData.catPersonalizado && (
                      <div className="flex items-center ml-6 mt-1">
                        <input
                          type="text"
                          id="cat"
                          name="cat"
                          value={formData.cat}
                          onChange={handleChange}
                          className={`${
                            errors.cat ? 'border-red-300' : 'border-gray-300'
                          } w-20 px-2 py-1 border rounded-md focus:ring-amber-500 focus:border-amber-500`}
                          placeholder="0.00"
                        />
                        <span className="ml-2 text-sm">%</span>
                        {errors.cat && (
                          <p className="ml-2 text-xs text-red-500">{errors.cat}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="text-sm font-medium mb-1">Banco seleccionado</div>
                    <div className="flex items-center">
                      {typeof bancoSeleccionado.logo === 'string' ? (
                        <div className="w-5 h-5 flex items-center justify-center">
                          {bancoSeleccionado.logo}
                        </div>
                      ) : (
                        <img src={bancoSeleccionado.logo} alt={bancoSeleccionado.nombre} className="h-5 mr-2" />
                      )}
                      <span className="text-sm ml-2">{bancoSeleccionado.nombre}</span>
                    </div>
                    <div className="text-xs mt-1">
                      <div className="flex justify-between">
                        <span>Tasa:</span>
                        <span>{formData.tasaPersonalizada ? formData.tasa : bancoSeleccionado.tasa}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CAT:</span>
                        <span>
                          {formData.catPersonalizado
                            ? formData.cat
                            : formData.tasaPersonalizada
                              ? `~${(parseFloat(formData.tasa) * 1.3).toFixed(1)}`
                              : bancoSeleccionado.cat}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Comisión:</span>
                        <span>{bancoSeleccionado.comision}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Cálculo preliminar */}
              {calculoPreliminar()}
            </div>
          </motion.div>
        );
      
      case 4:
        return (
          <motion.div
            key="step4"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="flex items-center mb-4 pb-2 border-b border-amber-200">
              <h2 className="text-xl font-semibold">Resumen de tu cotización</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-3 flex items-center">
                  <FaUser className="text-amber-500 mr-2" />
                  <span>Información del Cliente</span>
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium">{formData.nombre} {formData.apellidos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teléfono:</span>
                    <span className="font-medium">{formData.telefono}</span>
                  </div>
                  {formData.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.email}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-3 flex items-center">
                  <FaCarSide className="text-amber-500 mr-2" />
                  <span>Vehículo</span>
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehículo:</span>
                    <span className="font-medium">{formData.marca} {formData.modelo} {formData.anio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio:</span>
                    <span className="font-medium">{formatCurrency(formData.precio)}</span>
                  </div>
                  {formData.placas && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Placas:</span>
                      <span className="font-medium">{formData.placas}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 md:col-span-2">
                <h3 className="font-medium mb-3 flex items-center">
                  <FaMoneyCheckAlt className="text-amber-500 mr-2" />
                  <span>Condiciones del Crédito</span>
                </h3>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Banco:</span>
                      <span className="font-medium flex items-center">
                        {typeof bancoSeleccionado.logo === 'string' ? (
                          <span className="mr-1">{bancoSeleccionado.logo}</span>
                        ) : (
                          <img src={bancoSeleccionado.logo} alt={bancoSeleccionado.nombre} className="h-4 mr-1" />
                        )}
                        {bancoSeleccionado.nombre}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tasa anual:</span>
                      <span className="font-medium">
                        {tasaEfectiva}%
                        {formData.tasaPersonalizada && <span className="text-xs ml-1">(Personalizada)</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CAT:</span>
                      <span className="font-medium">
                        {catEfectivo.toFixed(2)}%
                        {formData.catPersonalizado && <span className="text-xs ml-1">(Personalizado)</span>}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plazo:</span>
                      <span className="font-medium">{formData.plazo} meses</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Comisión por apertura:</span>
                      <span className="font-medium">{formatCurrency((montoFinanciamiento * bancoSeleccionado.comision) / 100)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Precio del vehículo:</span>
                      <span className="font-medium">{formatCurrency(formData.precio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Enganche ({formData.enganche}%):</span>
                      <span className="font-medium">{formatCurrency(formData.montoEnganche)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monto a financiar:</span>
                      <span className="font-medium">{formatCurrency(montoFinanciamiento)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de intereses:</span>
                      <span className="font-medium">{formatCurrency(interesesTotales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monto total a pagar:</span>
                      <span className="font-medium">{formatCurrency(montoTotal)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex justify-between items-center">
                  <span className="font-medium text-amber-800">Pago mensual:</span>
                  <span className="text-xl font-bold text-amber-700">{formatCurrency(pagoMensual)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">
                Esta cotización es informativa y no representa un compromiso de financiamiento.
                Las tasas y condiciones están sujetas a aprobación de crédito y pueden variar.
              </p>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  // Botón de navegación
  const renderNavigation = () => {
    return (
      <div className="mt-8 flex justify-between">
        <div>
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg flex items-center hover:bg-gray-300 transition-all"
            >
              <FaAngleLeft className="mr-2" />
              Anterior
            </button>
          )}
          {step === 1 && (
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg flex items-center hover:bg-gray-300 transition-all"
            >
              <FaAngleLeft className="mr-2" />
              Volver
            </button>
          )}
        </div>
        
        <div>
          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!stepValidity[step]}
              className={stepValidity[step] ? buttonClass : buttonDisabledClass}
            >
              Siguiente
              <FaAngleRight className="ml-2" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className={`${buttonClass} min-w-[140px]`}
              onClick={handleSubmit}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                'Ver resultados'
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center">
            <span
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                step >= 1 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
              } mr-2`}
            >
              1
            </span>
            <span className={`hidden sm:inline-block text-sm ${step >= 1 ? 'text-gray-800' : 'text-gray-500'}`}>
              Cliente
            </span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step > 1 ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
          <div className="flex items-center">
            <span
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                step >= 2 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
              } mr-2`}
            >
              2
            </span>
            <span className={`hidden sm:inline-block text-sm ${step >= 2 ? 'text-gray-800' : 'text-gray-500'}`}>
              Vehículo
            </span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step > 2 ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
          <div className="flex items-center">
            <span
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                step >= 3 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
              } mr-2`}
            >
              3
            </span>
            <span className={`hidden sm:inline-block text-sm ${step >= 3 ? 'text-gray-800' : 'text-gray-500'}`}>
              Crédito
            </span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step > 3 ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
          <div className="flex items-center">
            <span
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                step >= 4 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
              } mr-2`}
            >
              4
            </span>
            <span className={`hidden sm:inline-block text-sm ${step >= 4 ? 'text-gray-800' : 'text-gray-500'}`}>
              Resumen
            </span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
        
        {renderNavigation()}
      </form>
    </div>
  );
};

export default QuickCreditForm;