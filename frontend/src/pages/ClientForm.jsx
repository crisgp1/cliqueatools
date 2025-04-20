import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import ClientList from '../components/client/ClientList';
import ClientService from '../services/ClientService';

const ClientFormPage = () => {
  // Contexto de autenticación para obtener el token
  const { token } = useContext(AuthContext);
  
  // Estados para la gestión de clientes
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado para el formulario
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
  
  // Cargar clientes al montar el componente
  useEffect(() => {
    if (token) {
      loadClients();
    }
  }, [token]);
  
  // Cargar clientes desde la API
  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await ClientService.getClients(token);
      if (response.success) {
        setClients(response.data);
      } else {
        setError(response.message || 'Error al cargar los clientes');
        alert('Error al cargar los clientes: ' + (response.message || 'Error desconocido'));
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los clientes');
      alert('Error al cargar los clientes: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };
  
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
  
  // Agregar nuevo cliente
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Formatear datos para la API
      const clientData = {
        nombre: client.nombre,
        apellidos: client.apellidos,
        email: client.email || null,
        telefono: client.telefono || null,
        rfc: client.rfc || null,
        direccion: client.direccion || null,
        ciudad: client.ciudad || null,
        codigo_postal: client.codigoPostal || null
      };
      
      const response = await ClientService.createClient(token, clientData);
      
      if (response.success) {
        // Limpiar formulario
        setClient({
          nombre: '',
          apellidos: '',
          email: '',
          telefono: '',
          rfc: '',
          direccion: '',
          ciudad: '',
          codigoPostal: ''
        });
        
        // Mostrar mensaje de éxito
        alert('Cliente guardado correctamente');
        
        // Recargar lista de clientes
        loadClients();
      } else {
        setError(response.message || 'Error al crear el cliente');
        alert('Error al crear el cliente: ' + (response.message || 'Error desconocido'));
      }
    } catch (err) {
      setError(err.message || 'Error al crear el cliente');
      alert('Error al crear el cliente: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };
  
  // Editar cliente
  const handleEditClient = (client) => {
    // Implementar edición de cliente
    console.log('Editar cliente:', client);
  };
  
  // Eliminar cliente
  const handleDeleteClient = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      setLoading(true);
      try {
        const response = await ClientService.deleteClient(token, id);
        
        if (response.success) {
          // Recargar lista de clientes
          loadClients();
        } else {
          setError(response.message || 'Error al eliminar el cliente');
          alert('Error al eliminar el cliente: ' + (response.message || 'Error desconocido'));
        }
      } catch (err) {
        setError(err.message || 'Error al eliminar el cliente');
        alert('Error al eliminar el cliente: ' + (err.message || 'Error desconocido'));
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Ver detalles del cliente
  const handleViewClient = (client) => {
    // Implementar vista de detalles del cliente
    console.log('Ver cliente:', client);
  };

  return (
    <div className="space-y-8">
      {/* Formulario para agregar clientes */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 text-white">
          <h2 className="text-xl font-bold">Nuevo Cliente</h2>
          <p className="text-blue-100 mt-1 text-sm">
            Completa la información para registrar un nuevo cliente
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Nombre (campo obligatorio) */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nombre">
                Nombre <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={client.nombre}
                onChange={handleChange}
                className={`block w-full rounded-lg border ${
                  errors.nombre ? 'border-red-300 text-red-600 bg-red-50' : 'border-gray-300 bg-white'
                } py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors duration-200`}
                required
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
              )}
            </div>
            
            {/* Apellidos (campo obligatorio) */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="apellidos">
                Apellidos <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={client.apellidos}
                onChange={handleChange}
                className={`block w-full rounded-lg border ${
                  errors.apellidos ? 'border-red-300 text-red-600 bg-red-50' : 'border-gray-300 bg-white'
                } py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors duration-200`}
                required
              />
              {errors.apellidos && (
                <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>
              )}
            </div>
            
            {/* Email */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={client.email}
                onChange={handleChange}
                className={`block w-full rounded-lg border ${
                  errors.email ? 'border-red-300 text-red-600 bg-red-50' : 'border-gray-300 bg-white'
                } py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors duration-200`}
                placeholder="ejemplo@dominio.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            {/* Teléfono */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="telefono">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={client.telefono}
                onChange={handleChange}
                className={`block w-full rounded-lg border ${
                  errors.telefono ? 'border-red-300 text-red-600 bg-red-50' : 'border-gray-300 bg-white'
                } py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors duration-200`}
                placeholder="10 dígitos"
              />
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
              )}
            </div>
            
            {/* RFC */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rfc">
                RFC
              </label>
              <input
                type="text"
                id="rfc"
                name="rfc"
                value={client.rfc}
                onChange={handleChange}
                className={`block w-full rounded-lg border ${
                  errors.rfc ? 'border-red-300 text-red-600 bg-red-50' : 'border-gray-300 bg-white'
                } py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors duration-200`}
                placeholder="Ej: XAXX010101000"
              />
              {errors.rfc && (
                <p className="mt-1 text-sm text-red-600">{errors.rfc}</p>
              )}
            </div>
            
            {/* Dirección */}
            <div className="relative md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="direccion">
                Dirección
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={client.direccion}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                placeholder="Calle, número, colonia"
              />
            </div>
            
            {/* Ciudad */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="ciudad">
                Ciudad
              </label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={client.ciudad}
                onChange={handleChange}
                className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                placeholder="Ej: Ciudad de México"
              />
            </div>
            
            {/* Código Postal */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="codigoPostal">
                Código Postal
              </label>
              <input
                type="text"
                id="codigoPostal"
                name="codigoPostal"
                value={client.codigoPostal}
                onChange={handleChange}
                className={`block w-full rounded-lg border ${
                  errors.codigoPostal ? 'border-red-300 text-red-600 bg-red-50' : 'border-gray-300 bg-white'
                } py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors duration-200`}
                placeholder="5 dígitos"
              />
              {errors.codigoPostal && (
                <p className="mt-1 text-sm text-red-600">{errors.codigoPostal}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
            >
              {loading ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Lista de clientes */}
      <ClientList 
        clients={clients} 
        loading={loading}
        onEdit={handleEditClient}
        onDelete={handleDeleteClient}
        onView={handleViewClient}
      />
    </div>
  );
};

export default ClientFormPage;
