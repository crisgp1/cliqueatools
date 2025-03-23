import { useState, useEffect } from 'react';

const ClientForm = ({ initialClient, onClientChange }) => {
  const [client, setClient] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    rfc: '',
    direccion: '',
    ciudad: '',
    codigoPostal: ''
  });
  
  const [errors, setErrors] = useState({});

  // Sincronizar con initialClient si se proporciona
  useEffect(() => {
    if (initialClient) {
      setClient(initialClient);
    }
  }, [initialClient]);

  // Validar correo electrónico
  const validateEmail = (email) => {
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

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Limpiar error del campo cuando cambia
    setErrors({
      ...errors,
      [name]: ''
    });
    
    // Actualizar valor del campo
    setClient({
      ...client,
      [name]: value
    });
    
    // Actualizar en el componente padre
    onClientChange({
      ...client,
      [name]: value
    });
  };

  // Validar todos los campos
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
    if (client.codigoPostal && !validatePostalCode(client.codigoPostal)) {
      newErrors.codigoPostal = 'Debe ser de 5 dígitos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar submit del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Cliente válido:', client);
      // La actualización ya se está enviando en handleChange
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="govuk-form-section">
        <h3 className="govuk-form-section-title">Información personal</h3>
        
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-half">
            <div className="govuk-form-group">
              <label htmlFor="nombre" className="govuk-label">
                Nombre(s) <span className="text-royal-red">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={client.nombre}
                onChange={handleChange}
                className={`govuk-input ${errors.nombre ? 'govuk-input-error' : ''}`}
              />
              {errors.nombre && (
                <p className="govuk-error-message">{errors.nombre}</p>
              )}
            </div>
          </div>
          
          <div className="govuk-grid-column-one-half">
            <div className="govuk-form-group">
              <label htmlFor="apellidos" className="govuk-label">
                Apellidos <span className="text-royal-red">*</span>
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={client.apellidos}
                onChange={handleChange}
                className={`govuk-input ${errors.apellidos ? 'govuk-input-error' : ''}`}
              />
              {errors.apellidos && (
                <p className="govuk-error-message">{errors.apellidos}</p>
              )}
            </div>
          </div>
          
          <div className="govuk-grid-column-one-half">
            <div className="govuk-form-group">
              <label htmlFor="email" className="govuk-label">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={client.email}
                onChange={handleChange}
                className={`govuk-input ${errors.email ? 'govuk-input-error' : ''}`}
              />
              {errors.email && (
                <p className="govuk-error-message">{errors.email}</p>
              )}
            </div>
          </div>
          
          <div className="govuk-grid-column-one-half">
            <div className="govuk-form-group">
              <label htmlFor="telefono" className="govuk-label">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={client.telefono}
                onChange={handleChange}
                className={`govuk-input ${errors.telefono ? 'govuk-input-error' : ''}`}
              />
              <span className="govuk-form-hint">Formato: 10 dígitos sin espacios</span>
              {errors.telefono && (
                <p className="govuk-error-message">{errors.telefono}</p>
              )}
            </div>
          </div>
          
          <div className="govuk-grid-column-one-half">
            <div className="govuk-form-group">
              <label htmlFor="rfc" className="govuk-label">
                RFC
              </label>
              <input
                type="text"
                id="rfc"
                name="rfc"
                value={client.rfc}
                onChange={handleChange}
                className={`govuk-input ${errors.rfc ? 'govuk-input-error' : ''}`}
              />
              {errors.rfc && (
                <p className="govuk-error-message">{errors.rfc}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="govuk-form-section">
        <h3 className="govuk-form-section-title">Dirección</h3>
        
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <div className="govuk-form-group">
              <label htmlFor="direccion" className="govuk-label">
                Dirección
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={client.direccion}
                onChange={handleChange}
                className="govuk-input"
                placeholder="Calle, número, colonia"
              />
            </div>
          </div>
          
          <div className="govuk-grid-column-one-half">
            <div className="govuk-form-group">
              <label htmlFor="ciudad" className="govuk-label">
                Ciudad
              </label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={client.ciudad}
                onChange={handleChange}
                className="govuk-input"
                placeholder="Ej: Ciudad de México"
              />
            </div>
          </div>
          
          <div className="govuk-grid-column-one-half">
            <div className="govuk-form-group">
              <label htmlFor="codigoPostal" className="govuk-label">
                Código Postal
              </label>
              <input
                type="text"
                id="codigoPostal"
                name="codigoPostal"
                value={client.codigoPostal}
                onChange={handleChange}
                className={`govuk-input ${errors.codigoPostal ? 'govuk-input-error' : ''}`}
                placeholder="5 dígitos"
              />
              {errors.codigoPostal && (
                <p className="govuk-error-message">{errors.codigoPostal}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          className="govuk-button"
        >
          Guardar información
        </button>
      </div>
    </form>
  );
};

export default ClientForm;