import { useState, useEffect } from 'react'
import VehicleForm from './components/VehicleForm'
import ClientForm from './components/ClientForm'
import LoginPage from './components/LoginPage'
import CreateAccountPage from './components/CreateAccountPage'
import logoImg from './assets/logo.png'
import logoImgDark from './assets/logo-dark.png'
import CreditForm from './components/CreditForm'
import BankComparison from './components/BankComparison'
import AmortizationTable from './components/AmortizationTable'
import { 
  IoHomeOutline, 
  IoCarSportOutline,
  IoPersonOutline,
  IoCardOutline,
  IoStatsChartOutline,
  IoGridOutline,
  IoAddOutline,
  IoTrashOutline,
  IoMenuOutline,
  IoCloseOutline
} from 'react-icons/io5'

// Componente de Preloader estilo gov.uk mejorado con variantes
const Preloader = ({ 
  message = "Cargando...", 
  submessage = "Por favor espere mientras cargamos el sistema",
  type = "default" // Puede ser "default", "login-success", "logout"
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center max-w-md px-6">
        {type === "login-success" ? (
          <div className="login-success-animation">
            <div className="crown"></div>
            <div className="circle"></div>
            <div className="checkmark"></div>
          </div>
        ) : type === "logout" ? (
          <div className="logout-animation">
            <div className="royal-emblem">
              <div className="royal-circle"></div>
              <div className="royal-symbol"></div>
            </div>
          </div>
        ) : (
          <div className="preloader">
            <div className="preloader__spinner">
              <div className="preloader__spinner-left"></div>
              <div className="preloader__spinner-right"></div>
            </div>
          </div>
        )}
        
        <p className={`mt-6 text-xl font-semibold ${type === "login-success" ? "text-royal-blue preloader-success" : type === "logout" ? "text-royal-blue preloader-royal" : "text-gray-800 preloader-text"}`}>
          {message}
        </p>
        <p className={`mt-2 text-md ${type === "login-success" ? "text-royal-gold preloader-success-sub" : type === "logout" ? "text-royal-gold preloader-royal-sub" : "text-gray-600 preloader-subtext"}`}>
          {submessage}
        </p>
        <div className={`mt-8 mb-2 logo-container ${type === "login-success" ? "success-logo" : type === "logout" ? "royal-logo" : ""}`}>
          <img src={logoImg} alt="Cliquéalo" className={`mx-auto ${type === "login-success" ? "h-12 preloader-success-logo" : type === "logout" ? "h-10 preloader-royal-logo" : "h-10 preloader-logo"}`} />
        </div>
      </div>
      <style jsx="true">{`
        .preloader {
          display: inline-block;
          position: relative;
          width: 80px;
          height: 80px;
        }
        .preloader__spinner {
          position: absolute;
          border: 5px solid #f0f4f8;
          border-radius: 50%;
          width: 70px;
          height: 70px;
          margin: 5px;
          animation: pulse 2s ease-in-out infinite;
          box-shadow: 0 0 15px rgba(29, 112, 184, 0.1);
        }
        .preloader__spinner-left,
        .preloader__spinner-right {
          content: '';
          position: absolute;
          top: 0;
          height: 100%;
          width: 50%;
          background: #ffffff;
        }
        .preloader__spinner-left {
          left: 0;
          border-radius: 100% 0 0 100% / 50% 0 0 50%;
          transform-origin: 100% 50%;
          animation: rotate-left 1.2s cubic-bezier(0.42, 0, 0.58, 1) infinite;
        }
        .preloader__spinner-right {
          right: 0;
          border-radius: 0 100% 100% 0 / 0 50% 50% 0;
          transform-origin: 0% 50%;
          animation: rotate-right 1.2s cubic-bezier(0.42, 0, 0.58, 1) infinite;
        }
        
        /* Animación de éxito de login */
        .login-success-animation {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto;
        }
        .crown {
          position: absolute;
          width: 70px;
          height: 35px;
          background: linear-gradient(to bottom, #d4af37, #f9e076);
          border-radius: 35px 35px 0 0;
          top: 0;
          left: 50%;
          transform: translateX(-50%) scale(0);
          animation: crown-appear 0.6s cubic-bezier(0.17, 0.67, 0.83, 0.67) forwards 0.2s;
          z-index: 2;
        }
        .crown:before, .crown:after {
          content: '';
          position: absolute;
          width: 10px;
          height: 15px;
          background: #d4af37;
          top: -10px;
        }
        .crown:before {
          left: 15px;
          border-radius: 5px 5px 0 0;
        }
        .crown:after {
          right: 15px;
          border-radius: 5px 5px 0 0;
        }
        .crown:after {
          content: '';
          position: absolute;
          width: 10px;
          height: 15px;
          background: #d4af37;
          top: -10px;
          left: 30px;
          border-radius: 5px 5px 0 0;
        }
        .circle {
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 5px solid #1d3a8a; /* Royal Blue */
          top: 20px;
          left: 50%;
          transform: translateX(-50%) scale(0);
          animation: circle-appear 0.8s cubic-bezier(0.17, 0.67, 0.83, 0.67) forwards;
        }
        .checkmark {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 50px;
          height: 50px;
          transform: translate(-50%, -40%) scale(0);
          z-index: 3;
        }
        .checkmark:before {
          content: '';
          position: absolute;
          width: 25px;
          height: 5px;
          background-color: #1d3a8a;
          transform: rotate(45deg);
          left: 5px;
          top: 25px;
        }
        .checkmark:after {
          content: '';
          position: absolute;
          width: 40px;
          height: 5px;
          background-color: #1d3a8a;
          transform: rotate(-45deg);
          left: 15px;
          top: 20px;
        }
        
        /* Animación de Logout estilo Royal UK */
        .logout-animation {
          position: relative;
          width: 100px;
          height: 100px;
          margin: 0 auto;
        }
        .royal-emblem {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .royal-circle {
          position: absolute;
          width: 80px;
          height: 80px;
          border: 3px solid #c8102e; /* Royal Red */
          border-radius: 50%;
          top: 10px;
          left: 10px;
          animation: royal-circle 1.2s ease forwards;
        }
        .royal-symbol {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 3px solid #d4af37; /* Royal Gold */
          border-radius: 50%;
          top: 30px;
          left: 30px;
          animation: royal-symbol 1s ease forwards 0.3s;
          opacity: 0;
        }
        .royal-symbol:before {
          content: '';
          position: absolute;
          width: 60px;
          height: 3px;
          background: #1d3a8a; /* Royal Blue */
          top: 18.5px;
          left: -10px;
          transform: scaleX(0);
          transform-origin: center;
          animation: royal-line 0.5s ease forwards 0.8s;
        }
        
        /* Estilos para textos con animaciones */
        .preloader-text, .preloader-subtext, .preloader-logo {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
        .preloader-text { animation-delay: 0.2s; }
        .preloader-subtext { animation-delay: 0.4s; }
        .preloader-logo { 
          animation: fade-in 0.5s ease-out forwards, float 3s ease-in-out infinite;
          animation-delay: 0.6s;
        }
        
        .preloader-success, .preloader-success-sub, .preloader-success-logo {
          opacity: 0;
        }
        .preloader-success { 
          animation: success-text-appear 0.5s ease forwards 1.2s;
          color: #1d3a8a; /* Royal Blue */
        }
        .preloader-success-sub { 
          animation: success-text-appear 0.5s ease forwards 1.4s;
          color: #d4af37; /* Royal Gold */
        }
        .preloader-success-logo { 
          animation: success-logo 0.5s ease forwards 1.6s;
        }
        
        .preloader-royal, .preloader-royal-sub, .preloader-royal-logo {
          opacity: 0;
        }
        .preloader-royal { 
          animation: royal-text-appear 0.5s ease forwards 1s;
          color: #1d3a8a; /* Royal Blue */
        }
        .preloader-royal-sub { 
          animation: royal-text-appear 0.5s ease forwards 1.2s;
          color: #d4af37; /* Royal Gold */
        }
        .preloader-royal-logo { 
          animation: royal-logo 0.5s ease forwards 1.4s, royal-float 3s ease-in-out infinite 1.9s;
        }
        
        /* Animaciones */
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(29, 112, 184, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(29, 112, 184, 0); }
          100% { box-shadow: 0 0 0 0 rgba(29, 112, 184, 0); }
        }
        @keyframes rotate-left {
          0% { transform: rotate(0deg); border-top: 5px solid #1d70b8; }
          50% { transform: rotate(180deg); border-top: 5px solid #003078; }
          100% { transform: rotate(360deg); border-top: 5px solid #1d70b8; }
        }
        @keyframes rotate-right {
          0% { transform: rotate(0deg); border-top: 5px solid #1d70b8; }
          50% { transform: rotate(-180deg); border-top: 5px solid #003078; }
          100% { transform: rotate(-360deg); border-top: 5px solid #1d70b8; }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        
        /* Animaciones de Login Success */
        @keyframes crown-appear {
          0% { transform: translateX(-50%) scale(0); }
          100% { transform: translateX(-50%) scale(1); }
        }
        @keyframes circle-appear {
          0% { transform: translateX(-50%) scale(0); }
          100% { transform: translateX(-50%) scale(1); }
        }
        @keyframes success-text-appear {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes success-logo {
          0% { opacity: 0; transform: scale(0.8); }
          60% { transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        /* Animaciones de checkmark */
        .checkmark {
          animation: checkmark-appear 0.5s ease forwards 0.8s;
        }
        @keyframes checkmark-appear {
          0% { transform: translate(-50%, -40%) scale(0); }
          50% { transform: translate(-50%, -40%) scale(1.2); }
          100% { transform: translate(-50%, -40%) scale(1); }
        }
        
        /* Animaciones de Logout Royal */
        @keyframes royal-circle {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes royal-symbol {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes royal-line {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        @keyframes royal-text-appear {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes royal-logo {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes royal-float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

function App() {
  // Estados para controlar el preloader
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Cargando...");
  const [loadingSubmessage, setLoadingSubmessage] = useState("Por favor espere mientras cargamos el sistema");
  const [preloaderType, setPreloaderType] = useState("default");
  
  // Función para mostrar el preloader con mensajes personalizados
  const showPreloader = (message = "Cargando...", submessage = "Por favor espere", type = "default") => {
    setLoadingMessage(message);
    setLoadingSubmessage(submessage);
    setPreloaderType(type);
    setLoading(true);
  };
  
  // Función para ocultar el preloader
  const hidePreloader = () => {
    setLoading(false);
    // Reiniciar el tipo a default después de ocultarlo
    setTimeout(() => setPreloaderType("default"), 300);
  };
  
  // Simulación de carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      hidePreloader();
    }, 2000); // Mostrar preloader por 2 segundos
    
    return () => clearTimeout(timer);
  }, []);
  // Estado para gestionar la autenticación y navegación
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' o 'register'
  
  // Verificar si el usuario está autenticado al cargar la aplicación
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);
  
  // Función para manejar el inicio de sesión exitoso
  const handleLogin = (userData) => {
    // Primero mostrar el preloader de validación
    showPreloader("Iniciando sesión...", "Validando credenciales");
    
    // Simular tiempo de procesamiento de login
    setTimeout(() => {
      // Almacenar los datos del usuario
      setUser(userData);
      setIsAuthenticated(true);
      
      // Cambiar a preloader de éxito
      showPreloader("Acceso concedido", "Bienvenido a Cliquéalo", "login-success");
      
      // Mostrar la animación por un tiempo suficiente antes de ocultarla
      setTimeout(() => {
        hidePreloader();
      }, 2200);
    }, 1500);
  };
  
  // Función para cerrar sesión
  const handleLogout = () => {
    // Mostrar el preloader de cierre de sesión con estilo royal UK
    showPreloader("Cerrando sesión...", "Gracias por utilizar nuestro servicio", "logout");
    
    // Dar tiempo para que se muestre la animación
    setTimeout(() => {
      // Limpiar datos de sesión
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      
      // Ocultar el preloader
      hidePreloader();
    }, 1800); // Tiempo suficiente para apreciar la animación elegante
  };
  
  // Función para manejar el cambio de sección con preloader
  const handleSectionChange = (sectionId) => {
    if (sectionId === activeSection) return;
    
    let sectionName = "";
    sections.forEach(section => {
      if (section.id === sectionId) {
        sectionName = section.name;
      }
    });
    
    showPreloader(`Cargando ${sectionName}...`, "Preparando información");
    
    setTimeout(() => {
      setActiveSection(sectionId);
      hidePreloader();
    }, 800);
  };
  
  // Estado para gestionar vehículos
  const [vehicles, setVehicles] = useState([])
  
  // Estado para datos del cliente
  const [client, setClient] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    rfc: '',
    direccion: '',
    ciudad: '',
    codigoPostal: ''
  })
  
  // Estado para configuración del crédito
  const [creditConfig, setCreditConfig] = useState({
    downPaymentPercentage: 20,
    downPaymentAmount: 0,
    term: 36,
    selectedBankId: null,
    financingAmount: 0
  })
  
  // Estado para resultados de crédito
  const [creditResults, setCreditResults] = useState([])
  
  // Estado para banco seleccionado
  const [selectedBank, setSelectedBank] = useState(null)
  
  // Estado para controlar la sección activa en el panel central
  const [activeSection, setActiveSection] = useState('home')
  
  // Estado para controlar si el menú móvil está abierto
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Calcular valor total de vehículos
  const totalVehicleValue = vehicles.reduce((sum, vehicle) => sum + vehicle.valor, 0)
  
  // Secciones disponibles para la navegación
  const sections = [
    { id: 'home', name: 'Inicio', icon: 'home' },
    { id: 'vehicles', name: 'Vehículos', icon: 'car', count: vehicles.length },
    // Cliente deshabilitado según requerimiento
    { id: 'credit', name: 'Configurar Crédito', icon: 'credit-card', disabled: vehicles.length === 0 },
    { id: 'results', name: 'Resultados', icon: 'chart', disabled: creditResults.length === 0 },
    { id: 'amortization', name: 'Tabla de Amortización', icon: 'table', disabled: !selectedBank }
  ]
  
  // Actualizar monto de enganche cuando cambia el valor total de vehículos
  useEffect(() => {
    setCreditConfig(prevConfig => ({
      ...prevConfig,
      downPaymentAmount: (totalVehicleValue * prevConfig.downPaymentPercentage) / 100,
      financingAmount: totalVehicleValue - ((totalVehicleValue * prevConfig.downPaymentPercentage) / 100)
    }))
  }, [totalVehicleValue])
  
  // Funciones para gestionar vehículos
  const handleAddVehicle = (vehicle) => {
    setVehicles([...vehicles, vehicle])
  }
  
  const handleRemoveVehicle = (id) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id))
  }
  
  const handleUpdateVehicle = (id, updatedVehicle) => {
    setVehicles(vehicles.map(vehicle => vehicle.id === id ? updatedVehicle : vehicle))
  }
  
  // Función para actualizar datos del cliente
  const handleClientChange = (updatedClient) => {
    setClient(updatedClient)
  }
  
  // Función para actualizar configuración del crédito
  const handleCreditConfigChange = (updatedConfig) => {
    setCreditConfig(updatedConfig)
  }
  
  // Función para calcular resultados
  const handleCalculateResults = (results) => {
    showPreloader("Calculando resultados...", "Procesando información financiera");
    
    setTimeout(() => {
      setCreditResults(results);
      setActiveSection('results');
      hidePreloader();
    }, 1200);
  }
  
  // Función para seleccionar un banco
  const handleSelectBank = (bank) => {
    showPreloader("Generando tabla de amortización...", "Calculando pagos mensuales");
    
    setTimeout(() => {
      setSelectedBank(bank);
      setActiveSection('amortization');
      hidePreloader();
    }, 1500);
  }
  
  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  // Función para renderizar icono según ID con react-icons
  const renderIcon = (iconId) => {
    switch(iconId) {
      case 'home':
        return <IoHomeOutline className="h-5 w-5" />
      case 'car':
        return <IoCarSportOutline className="h-5 w-5" />
      case 'user':
        return <IoPersonOutline className="h-5 w-5" />
      case 'credit-card':
        return <IoCardOutline className="h-5 w-5" />
      case 'chart':
        return <IoStatsChartOutline className="h-5 w-5" />
      case 'table':
        return <IoGridOutline className="h-5 w-5" />
      default:
        return null
    }
  }

  // Función para renderizar el contenido correcto según la sección activa
  const renderContent = () => {
    switch(activeSection) {
      case 'vehicles':
        return (
          <div className="bg-white shadow-md p-6 border-l-4 border-l-blue-700">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              <span className="inline-flex items-center">
                <IoCarSportOutline className="h-6 w-6 mr-2 text-blue-600" />
                Gestión de Vehículos
              </span>
            </h2>
            <VehicleForm 
              vehicles={vehicles}
              onAddVehicle={handleAddVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onRemoveVehicle={handleRemoveVehicle}
            />
          </div>
        )
      case 'credit':
        return (
          <div className="bg-white shadow-md p-6 border-l-4 border-l-purple-700">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              <span className="inline-flex items-center">
                <IoCardOutline className="h-6 w-6 mr-2 text-purple-600" />
                Configuración del Crédito
              </span>
            </h2>
            <CreditForm 
              vehiclesValue={totalVehicleValue}
              onCreditConfigChange={handleCreditConfigChange}
              onCalculateResults={handleCalculateResults}
            />
          </div>
        )
      case 'results':
        return (
          <div className="bg-white shadow-md p-6 border-l-4 border-l-indigo-700">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              <span className="inline-flex items-center">
                <IoStatsChartOutline className="h-6 w-6 mr-2 text-indigo-600" />
                Resultados de la Simulación
              </span>
            </h2>
            <BankComparison 
              results={creditResults}
              onSelectBank={handleSelectBank}
            />
          </div>
        )
      case 'amortization':
        return (
          <div className="bg-white shadow-md p-6 border-l-4 border-l-green-700">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              <span className="inline-flex items-center">
                <IoGridOutline className="h-6 w-6 mr-2 text-green-600" />
                Tabla de Amortización
              </span>
            </h2>
            {selectedBank && (
              <AmortizationTable 
                bank={selectedBank}
                client={client}
                vehicles={vehicles}
                creditConfig={creditConfig}
                onBack={() => setActiveSection('results')}
              />
            )}
          </div>
        )
      default:
        return (
          <div className="bg-white shadow-md p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Simula tu Crédito Automotriz</h2>
                <p className="text-gray-600 mb-6">
                  Bienvenido al simulador de crédito automotriz de Cliquéalo.mx, donde podrás comparar las mejores opciones de financiamiento para tu(s) vehículo(s). Sigue estos sencillos pasos:
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-800 flex items-center justify-center text-white font-bold">1</div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Agrega los vehículos a financiar</h3>
                      <p className="text-gray-600">Ingresa los detalles de uno o varios vehículos que deseas incluir en tu financiamiento.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-800 flex items-center justify-center text-white font-bold">2</div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Captura tus datos personales</h3>
                      <p className="text-gray-600">Proporciona la información necesaria para generar tu simulación personalizada.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-800 flex items-center justify-center text-white font-bold">3</div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Configura las condiciones del crédito</h3>
                      <p className="text-gray-600">Elige el enganche, plazo y otras opciones para tu financiamiento.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 h-8 w-8 bg-blue-800 flex items-center justify-center text-white font-bold">4</div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Compara opciones y genera tu tabla de amortización</h3>
                      <p className="text-gray-600">Analiza las diferentes opciones de financiamiento y exporta tu tabla de pagos a PDF.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => setActiveSection('vehicles')}
                    className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium shadow-md text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700"
                  >
                    <IoAddOutline className="h-5 w-5 mr-2" />
                    Comenzar ahora
                  </button>
                </div>
              </div>
              
              <div className="md:w-1/3 bg-gray-100 p-4 border border-l-4 border-l-blue-700">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">Resumen actual</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Vehículos</h4>
                    {vehicles.length > 0 ? (
                      <div className="mt-1 text-sm">
                        <p className="font-medium">{vehicles.length} vehículo(s) agregado(s)</p>
                        <p className="text-blue-800 font-bold">{formatCurrency(totalVehicleValue)}</p>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">No hay vehículos agregados</p>
                    )}
                  </div>
                  
                  {/* Sección de cliente deshabilitada */}
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Crédito</h4>
                    {vehicles.length > 0 ? (
                      <div className="mt-1 text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Enganche ({creditConfig.downPaymentPercentage}%):</span>
                          <span>{formatCurrency(creditConfig.downPaymentAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>A financiar:</span>
                          <span className="font-medium">{formatCurrency(creditConfig.financingAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Plazo:</span>
                          <span>{creditConfig.term} meses</span>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">Agrega vehículos primero</p>
                    )}
                  </div>
                  
                  {creditResults.length > 0 && (
                    <div className="pt-3 border-t border-gray-300">
                      <h4 className="text-sm font-medium text-gray-700">Mejor opción:</h4>
                      <div className="mt-2 bg-white p-3 border-l-4 border-l-blue-700 shadow-md">
                        <div className="flex items-center mb-2">
                          {typeof creditResults[0].logo === 'string' && !creditResults[0].logo.includes('.') ? (
                            <div className="text-2xl mr-2">{creditResults[0].logo}</div>
                          ) : (
                            <img src={creditResults[0].logo} alt={creditResults[0].nombre} className="h-8 mr-2" />
                          )}
                          <div className="font-medium">{creditResults[0].nombre}</div>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pago mensual:</span>
                            <span className="font-bold text-blue-800">{formatCurrency(creditResults[0].monthlyPayment)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tasa:</span>
                            <span>{creditResults[0].tasa.toFixed(2)}%</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveSection('results')}
                          className="mt-2 w-full text-xs text-blue-800 hover:text-blue-900 font-medium"
                        >
                          Ver todas las opciones
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Función para cambiar a la vista de registro
  const handleRegisterClick = () => {
    showPreloader("Cargando formulario...", "Preparando registro de cuenta");
    setTimeout(() => {
      setAuthView('register');
      hidePreloader();
    }, 800);
  };

  // Función para volver a la vista de login
  const handleBackToLogin = () => {
    showPreloader("Volviendo al login...", "Cargando pantalla de inicio de sesión");
    setTimeout(() => {
      setAuthView('login');
      hidePreloader();
    }, 800);
  };

  // Mostrar preloader mientras carga
  if (loading) {
    return <Preloader />;
  }

  // Si el usuario no está autenticado, mostrar la página de login o registro
  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginPage 
        onLogin={handleLogin}
        onRegisterClick={handleRegisterClick}
      />
    ) : (
      <CreateAccountPage
        onLogin={handleLogin}
        onBackToLogin={handleBackToLogin}
      />
    );
  }
  
  // El usuario está autenticado, mostrar la aplicación principal
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header con botón de cierre de sesión */}
      <header className="bg-gray-800 shadow-md py-3 sticky top-0 z-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src={logoImgDark} alt="Cliquéalo" className="h-6" />
            </div>
            <div className="flex items-center">
              {user && (
                <div className="text-white mr-4 hidden md:block">
                  <span className="text-gray-300 text-sm mr-1">Usuario:</span>
                  <span className="font-medium">{user.username}</span>
                </div>
              )}
              <button 
                onClick={handleLogout}
                className="text-white bg-red-700 hover:bg-red-800 px-3 py-1 text-sm rounded mr-2"
              >
                Cerrar sesión
              </button>
              <button 
                className="md:hidden text-white p-2"
                onClick={toggleMobileMenu}
                aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                {mobileMenuOpen ? 
                  <IoCloseOutline className="h-6 w-6" /> : 
                  <IoMenuOutline className="h-6 w-6" />
                }
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Overlay - Appears when menu button is clicked */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900 z-10 md:hidden pt-16 pb-20">
          <nav className="h-full overflow-y-auto px-4 py-2">
            <ul className="space-y-1">
              {sections.map(section => (
                <li key={section.id}>
                  <button
                    onClick={() => {
                      setActiveSection(section.id);
                      setMobileMenuOpen(false);
                    }}
                    disabled={section.disabled}
                    className={`w-full text-left px-4 py-4 flex items-center space-x-4 ${
                      activeSection === section.id
                        ? 'bg-gray-800 text-white border-l-4 border-blue-600'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    } ${section.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className="flex-shrink-0">
                      {renderIcon(section.icon)}
                    </span>
                    <span className="font-medium text-lg">{section.name}</span>
                    {section.count && (
                      <span className="ml-auto bg-blue-900 text-blue-100 text-xs px-2 py-1 rounded">
                        {section.count}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}

      {/* Main Content with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 shadow-xl hidden md:block">
          <div className="p-5 border-b border-gray-700">
            <img src={logoImgDark} alt="Cliquéalo" className="h-8 mb-3" />
            <h2 className="text-lg font-semibold text-white">Simulador de Crédito</h2>
          </div>
          <nav className="mt-2">
            <ul>
              {sections.map(section => (
                <li key={section.id}>
                  <button
                    onClick={() => setActiveSection(section.id)}
                    disabled={section.disabled}
                    className={`w-full text-left px-4 py-3 flex items-center space-x-3 ${
                      activeSection === section.id
                        ? 'bg-gray-800 text-white border-l-4 border-blue-600'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    } ${section.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className="flex-shrink-0">
                      {renderIcon(section.icon)}
                    </span>
                    <span className="font-medium">{section.name}</span>
                    {section.count && (
                      <span className="ml-auto bg-blue-900 text-blue-100 text-xs px-2 py-1 rounded">
                        {section.count}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Mobile Section Pills - Only visible on mobile when menu is closed */}
        {!mobileMenuOpen && (
          <div className="md:hidden bg-gray-800 shadow-md sticky top-16 z-10 overflow-x-auto">
            <div className="flex whitespace-nowrap p-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  disabled={section.disabled}
                  className={`inline-flex items-center px-3 py-2 rounded text-sm font-medium mr-2 ${
                    activeSection === section.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  } ${section.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="mr-1">{renderIcon(section.icon)}</span>
                  <span>{section.name}</span>
                  {section.count && (
                    <span className="ml-1 bg-blue-800 text-white text-xs px-1.5 py-0.5 rounded">
                      {section.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-white">
          {renderContent()}
        </main>
      </div>  

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 text-center md:text-left">
                <img src={logoImgDark} alt="Cliquéalo" className="h-8 md:h-10" />
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-xs md:text-sm text-gray-400">© {new Date().getFullYear()} Cliquéalo.mx - Todos los derechos reservados</p>
              <p className="text-xs md:text-sm text-gray-400">USO INTERNO - Este sitio es propiedad de Cliquéalo.mx</p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Mobile Bottom Navigation - Fixed at bottom for quick access */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 shadow-lg z-10">
        <div className="flex justify-around items-center py-2">
          {sections.slice(0, 5).map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              disabled={section.disabled}
              className={`flex flex-col items-center px-2 py-1 ${
                activeSection === section.id
                  ? 'text-white'
                  : 'text-gray-400'
              } ${section.disabled ? 'opacity-50' : ''}`}
            >
              <span className="text-xl">{renderIcon(section.icon)}</span>
              <span className="text-xs mt-1">{section.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App