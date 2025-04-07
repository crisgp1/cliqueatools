import { useState, useEffect, useContext } from 'react'
import useVehicleStore from './store/vehicleStore'
import VehicleForm from './pages/VehicleForm'
import ClientFormPage from './pages/ClientForm'
import ClientForm from './components/client/ClientForm'
import Login from './pages/Login'
import CreateAccount from './pages/CreateAccount'
import ApiReference from './pages/ApiReference'
import OrganizationChart from './pages/OrganizationChart'
import { AuthProvider, AuthContext } from './context/AuthContext'
import logoImg from './assets/logo.png'
import logoImgDark from './assets/logo-dark.png'
import { motion, AnimatePresence } from 'framer-motion'
import Lottie from 'lottie-react'
import logoutAnimation from './assets/logout-animation.json'
import CreditForm from './pages/CreditForm'
import BankComparison from './pages/BankComparison'
import AmortizationTable from './pages/AmortizationTable'
import ContractForm from './pages/ContractForm'
import AppointmentPage from './pages/AppointmentPage'
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
  IoCloseOutline,
  IoDocumentTextOutline,
  IoCodeOutline,
  IoCalendarOutline,
  IoPeopleOutline
} from 'react-icons/io5'

// Animaciones para las transiciones
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 }
}

const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.5, ease: "easeOut" }
}

// Componente principal
const MainApp = () => {
  // Obtener estado y funciones de autenticación
  const { user, logout } = useContext(AuthContext);
  // Estado para mostrar el preloader de cierre de sesión
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);
  // Acceder al store centralizado de vehículos
  const { vehicles, getTotalValue } = useVehicleStore()
  
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
    selectedBanks: [],
    financingAmount: 0,
    customizedBanks: {}
  })
  
  // Estado para resultados de crédito
  const [creditResults, setCreditResults] = useState([])
  
  // Estado para banco seleccionado
  const [selectedBank, setSelectedBank] = useState(null)
  
  // Estado para controlar si estamos en modo comparación
  const [comparisonMode, setComparisonMode] = useState(false)
  
  // Estado para controlar la sección activa en el panel central
  const [activeSection, setActiveSection] = useState('home')
  
  // Estado para controlar si el menú móvil está abierto
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Calcular valor total de vehículos
  const totalVehicleValue = vehicles.reduce((sum, vehicle) => sum + vehicle.valor, 0)

  // Manejar cerrar sesión con animación mejorada
  const handleLogout = () => {
    // Mostrar animación de cierre de sesión
    setShowLogoutAnimation(true);
    
    // Esperar a que se complete la animación antes de cerrar la sesión
    setTimeout(() => {
      logout();
      // Mantenemos la animación visible un poco más para una mejor experiencia
      setTimeout(() => {
        setShowLogoutAnimation(false);
      }, 500);
    }, 2000);
  };
  
  // Secciones disponibles para la navegación
  const sections = [
    { id: 'home', name: 'Inicio', icon: 'home' },
    { id: 'vehicles', name: 'Vehículos', icon: 'car' },
    { id: 'clients', name: 'Clientes', icon: 'user' },
    { id: 'credit', name: 'Configurar Crédito', icon: 'credit-card', disabled: vehicles.length === 0 },
    { id: 'results', name: 'Resultados', icon: 'chart', disabled: creditResults.length === 0 },
    { id: 'amortization', name: 'Tabla de Amortización', icon: 'table', disabled: !selectedBank },
    { id: 'contract', name: 'Contrato', icon: 'document', disabled: vehicles.length === 0 },
    { id: 'appointments', name: 'Citas', icon: 'calendar' },
    { id: 'organization', name: 'Organigrama', icon: 'organization' },
    { id: 'api', name: 'API Reference', icon: 'code' }
  ]
  
  // Actualizar monto de enganche cuando cambia el valor total de vehículos
  useEffect(() => {
    setCreditConfig(prevConfig => ({
      ...prevConfig,
      downPaymentAmount: (totalVehicleValue * prevConfig.downPaymentPercentage) / 100,
      financingAmount: totalVehicleValue - ((totalVehicleValue * prevConfig.downPaymentPercentage) / 100)
    }))
  }, [totalVehicleValue])
  
  // Las funciones de gestión de vehículos ahora se manejan en el store central
  
  // Función para actualizar datos del cliente
  const handleClientChange = (updatedClient) => {
    setClient(updatedClient)
  }
  
  // Función para actualizar configuración del crédito
  const handleCreditConfigChange = (updatedConfig) => {
    setCreditConfig(updatedConfig)
    
    // Si hay bancos seleccionados para comparación, establecer modo comparación
    if (updatedConfig.selectedBanks && updatedConfig.selectedBanks.length > 0) {
      setComparisonMode(true)
    } else {
      setComparisonMode(false)
    }
  }
  
  // Función para calcular resultados
  const handleCalculateResults = (results) => {
    setCreditResults(results)
    setActiveSection('results')
  }
  
  // Función para seleccionar un banco
  const handleSelectBank = (bank) => {
    setSelectedBank(bank)
    setActiveSection('amortization')
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
      case 'document':
        return <IoDocumentTextOutline className="h-5 w-5" />
      case 'calendar':
        return <IoCalendarOutline className="h-5 w-5" />
      case 'organization':
        return <IoPeopleOutline className="h-5 w-5" />
      case 'code':
        return <IoCodeOutline className="h-5 w-5" />
      default:
        return null
    }
  }

  // Función para renderizar el contenido correcto según la sección activa
  const renderContent = () => {
    switch(activeSection) {
      case 'vehicles':
        return (
          <div className="uber-card">
            <h2 className="text-xl font-bold text-uber-black mb-4">
              <span className="inline-flex items-center">
                <IoCarSportOutline className="h-6 w-6 mr-2 text-uber-accent-blue" />
                Gestión de Vehículos
              </span>
            </h2>
            <VehicleForm />
          </div>
        )
      case 'clients':
        return (
          <div className="uber-card">
            <h2 className="text-xl font-bold text-uber-black mb-4">
              <span className="inline-flex items-center">
                <IoPersonOutline className="h-6 w-6 mr-2 text-uber-accent-blue" />
                Gestión de Clientes
              </span>
            </h2>
            <ClientForm 
              initialValues={client}
              isEditing={false}
              onSubmit={handleClientChange}
              onCancel={() => setActiveSection('home')}
            />
          </div>
        )
      case 'credit':
        return (
          <div className="uber-card">
            <h2 className="text-xl font-bold text-uber-black mb-4">
              <span className="inline-flex items-center">
                <IoCardOutline className="h-6 w-6 mr-2 text-uber-accent-blue" />
                Configuración del Crédito
              </span>
            </h2>
            <CreditForm 
              vehiclesValue={totalVehicleValue}
              vehicles={vehicles}
              onCreditConfigChange={handleCreditConfigChange}
              onCalculateResults={handleCalculateResults}
            />
          </div>
        )
      case 'results':
        return (
          <div className="uber-card">
            <h2 className="text-xl font-bold text-uber-black mb-4">
              <span className="inline-flex items-center">
                <IoStatsChartOutline className="h-6 w-6 mr-2 text-uber-accent-blue" />
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
          <div className="uber-card">
            <h2 className="text-xl font-bold text-uber-black mb-4">
              <span className="inline-flex items-center">
                <IoGridOutline className="h-6 w-6 mr-2 text-uber-accent-blue" />
                Tabla de Amortización
              </span>
            </h2>
              {selectedBank && (
              <AmortizationTable 
                bank={selectedBank}
                client={client}
                vehicles={vehicles}
                creditConfig={
                  // Si el banco tiene configuración personalizada, usarla
                  selectedBank.hasCustomConfig && creditConfig.customizedBanks[selectedBank.id]
                    ? {
                        ...creditConfig,
                        downPaymentPercentage: selectedBank.downPaymentPercentage,
                        downPaymentAmount: selectedBank.downPaymentAmount,
                        term: selectedBank.term,
                        financingAmount: selectedBank.financingAmount,
                        useCustomRate: selectedBank.tasa !== selectedBank.originalTasa,
                        customRate: selectedBank.tasa,
                        useCustomCat: selectedBank.cat !== selectedBank.originalCat,
                        customCat: selectedBank.cat
                      }
                    : creditConfig
                }
                onBack={() => setActiveSection('results')}
              />
            )}
          </div>
        )
      case 'contract':
        return (
          <div className="uber-card">
            <h2 className="text-xl font-bold text-uber-black mb-4">
              <span className="inline-flex items-center">
                <IoDocumentTextOutline className="h-6 w-6 mr-2 text-uber-accent-blue" />
                Contrato de Compraventa
              </span> 
            </h2>
            <ContractForm 
              vehicles={vehicles}
              client={client}
            />
          </div>
        )
      case 'appointments':
        return (
          <div className="uber-card">
            <AppointmentPage />
          </div>
        )
      case 'organization':
        return (
          <OrganizationChart />
        )
      case 'api':
        return (
          <div className="uber-card">
            <h2 className="text-xl font-bold text-uber-black mb-4">
              <span className="inline-flex items-center">
                <IoCodeOutline className="h-6 w-6 mr-2 text-uber-accent-blue" />
                API Reference
              </span>
            </h2>
            <ApiReference />
          </div>
        )
      default:
        return (
          <div className="uber-card">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-2/3">
                <h2 className="text-2xl font-bold text-uber-black mb-4 border-b border-uber-gray-200 pb-2">Simula tu Crédito Automotriz</h2>
                <p className="text-uber-gray-600 mb-6">
                  Bienvenido al simulador de crédito automotriz de Cliquéalo.mx, donde podrás comparar las mejores opciones de financiamiento para tu(s) vehículo(s). Sigue estos sencillos pasos:
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 h-8 w-8 bg-uber-accent-blue rounded-full flex items-center justify-center text-uber-white font-bold">1</div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-uber-black">Agrega los vehículos a financiar</h3>
                      <p className="text-uber-gray-600">Ingresa los detalles de uno o varios vehículos que deseas incluir en tu financiamiento.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 h-8 w-8 bg-uber-accent-blue rounded-full flex items-center justify-center text-uber-white font-bold">2</div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-uber-black">Captura tus datos personales</h3>
                      <p className="text-uber-gray-600">Proporciona la información necesaria para generar tu simulación personalizada.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 h-8 w-8 bg-uber-accent-blue rounded-full flex items-center justify-center text-uber-white font-bold">3</div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-uber-black">Configura las condiciones del crédito</h3>
                      <p className="text-uber-gray-600">Elige el enganche, plazo y otras opciones para tu financiamiento.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start mb-6">
                    <div className="flex-shrink-0 h-8 w-8 bg-uber-accent-blue rounded-full flex items-center justify-center text-uber-white font-bold">4</div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-uber-black">Compara opciones y genera tu tabla de amortización</h3>
                      <p className="text-uber-gray-600">Analiza las diferentes opciones de financiamiento y exporta tu tabla de pagos a PDF.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => setActiveSection('vehicles')}
                    className="uber-button inline-flex items-center px-5 py-3"
                  >
                    <IoAddOutline className="h-5 w-5 mr-2" />
                    Comenzar ahora
                  </button>
                </div>
              </div>
              
              <div className="md:w-1/3 bg-uber-gray-50 p-4 rounded-uber shadow-uber">
                <h3 className="text-lg font-medium text-uber-black mb-4 border-b border-uber-gray-200 pb-2">Resumen actual</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-uber-gray-700">Vehículos</h4>
                    {vehicles.length > 0 ? (
                      <div className="mt-1 text-sm">
                        <p className="font-medium">{vehicles.length} vehículo(s) agregado(s)</p>
                        <p className="text-uber-accent-blue font-bold">{formatCurrency(totalVehicleValue)}</p>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-uber-gray-500">No hay vehículos agregados</p>
                    )}
                  </div>
                  
                  {/* Sección de cliente deshabilitada */}
                  
                  <div>
                    <h4 className="text-sm font-medium text-uber-gray-700">Crédito</h4>
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
                      <p className="mt-1 text-sm text-uber-gray-500">Agrega vehículos primero</p>
                    )}
                  </div>
                  
                  {creditResults.length > 0 && (
                    <div className="pt-3 border-t border-uber-gray-300">
                      <h4 className="text-sm font-medium text-uber-gray-700">
                        {comparisonMode && creditConfig.selectedBanks.length > 1 
                          ? `Comparando ${creditConfig.selectedBanks.length} bancos` 
                          : "Mejor opción:"}
                      </h4>
                      <div className="mt-2 bg-uber-white p-3 rounded-uber shadow-uber">
                        <div className="flex items-center mb-2">
                          {typeof creditResults[0].logo === 'string' && !creditResults[0].logo.includes('.') ? (
                            <div className="text-2xl mr-2">{creditResults[0].logo}</div>
                          ) : (
                            <img src={creditResults[0].logo} alt={creditResults[0].nombre} className="h-8 mr-2" />
                          )}
                          <div className="font-medium">
                            {creditResults[0].nombre}
                            {creditResults[0].hasCustomConfig && (
                              <span className="ml-2 text-xs text-uber-accent-green">(Personalizado)</span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-uber-gray-600">Pago mensual:</span>
                            <span className="font-bold text-uber-accent-blue">{formatCurrency(creditResults[0].monthlyPayment)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-uber-gray-600">Tasa:</span>
                            <span>{creditResults[0].tasa.toFixed(2)}%</span>
                          </div>
                          {comparisonMode && creditResults.length > 1 && (
                            <div className="flex justify-between text-uber-accent-green">
                              <span>Ahorro vs. peor opción:</span>
                              <span className="font-medium">
                                {formatCurrency((creditResults[creditResults.length - 1].monthlyPayment - creditResults[0].monthlyPayment) * creditResults[0].term)}
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setActiveSection('results')}
                          className="mt-2 w-full text-xs text-uber-accent-blue hover:text-uber-accent-blue/80 font-medium"
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
  
  return (
    <motion.div 
      className="min-h-screen bg-gray-100 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Preloader de cierre de sesión con animación mejorada */}
      <AnimatePresence>
        {showLogoutAnimation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 100 }}
              className="w-64 h-64"
            >
              <Lottie 
                animationData={logoutAnimation} 
                loop={true}
                className="w-full h-full"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6 font-bold text-xl text-blue-800"
            >
              Cerrando sesión...
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-3 text-gray-600 max-w-xs text-center"
            >
              Gracias por usar nuestra plataforma
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <header className="uber-header">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src={logoImg} alt="Cliquéalo" className="h-6" />
            </div>
            <div className="flex items-center">
              {/* Información del usuario */}
              <div className="hidden md:flex items-center mr-4">
                <span className="text-uber-black text-sm font-medium">
                  {user?.usuario} <span className="text-uber-gray-600">({user?.rol})</span>
                </span>
              </div>
              {/* Botón de cerrar sesión */}
              <button 
                onClick={handleLogout}
                className="text-uber-black hover:bg-uber-gray-100 text-sm px-4 py-2 mr-4 rounded-uber transition-colors"
              >
                Cerrar sesión
              </button>
              <button 
                className="md:hidden text-uber-black p-2"
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
        <div className="fixed inset-0 bg-uber-white z-10 md:hidden pt-16 pb-20">
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
                    className={`w-full text-left px-4 py-4 flex items-center space-x-4 rounded-uber ${
                      activeSection === section.id
                        ? 'bg-uber-gray-50 text-uber-black border-l-4 border-uber-accent-blue pl-3'
                        : 'text-uber-gray-700 hover:bg-uber-gray-50 hover:text-uber-black'
                    } ${section.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className="flex-shrink-0">
                      {renderIcon(section.icon)}
                    </span>
                    <span className="font-medium text-lg">{section.name}</span>
                    {section.count && (
                      <span className="ml-auto bg-uber-accent-blue text-uber-white text-xs px-2 py-1 rounded-full">
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
        <aside className="uber-sidebar">
          <div className="p-5 border-b border-uber-gray-200">
            <img src={logoImg} alt="Cliquéalo" className="h-8 mb-3" />
            <h2 className="text-lg font-semibold text-uber-black">Simulador de Crédito</h2>
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
                        ? 'uber-nav-item-active'
                        : 'uber-nav-item'
                    } ${section.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className="flex-shrink-0">
                      {renderIcon(section.icon)}
                    </span>
                    <span className="font-medium">{section.name}</span>
                    {section.count && (
                      <span className="ml-auto bg-uber-accent-blue text-uber-white text-xs px-2 py-1 rounded-full">
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
          <div className="uber-mobile-nav md:hidden">
            <div className="flex whitespace-nowrap p-2">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  disabled={section.disabled}
                  className={`${
                    activeSection === section.id
                      ? 'uber-mobile-nav-item-active'
                      : 'uber-mobile-nav-item'
                  } ${section.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="mr-1">{renderIcon(section.icon)}</span>
                  <span>{section.name}</span>
                  {section.count && (
                    <span className="ml-1 bg-uber-accent-blue text-uber-white text-xs px-1.5 py-0.5 rounded-full">
                      {section.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-uber-white">
          {renderContent()}
        </main>
      </div>

      {/* Footer */}
      <motion.footer 
        className="bg-uber-white border-t border-uber-gray-200 py-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 text-center md:text-left">
                <img src={logoImg} alt="Cliquéalo" className="h-8 md:h-10" />
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-xs md:text-sm text-uber-gray-600">© {new Date().getFullYear()} Cliquéalo.mx - Todos los derechos reservados</p>
              <p className="text-xs md:text-sm text-uber-gray-600">USO INTERNO - Este sitio es propiedad de Cliquéalo.mx</p>
            </div>
          </div>
        </div>
      </motion.footer>
      
      {/* Mobile Bottom Navigation - Fixed at bottom for quick access */}
      <div className="uber-bottom-nav md:hidden">
        <div className="flex justify-around items-center">
          {sections.slice(0, 5).map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              disabled={section.disabled}
              className={`${
                activeSection === section.id
                  ? 'uber-bottom-nav-item-active'
                  : 'uber-bottom-nav-item'
              } ${section.disabled ? 'opacity-50' : ''}`}
            >
              <span className="text-xl">{renderIcon(section.icon)}</span>
              <span className="text-xs mt-1">{section.name}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Componente App con autenticación
function App() {
  // Estado para controlar si se muestra la página de login o de registro
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  // Obtener estado y funciones de autenticación
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  // Mostrar indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800 mx-auto"></div>
          <p className="mt-4 text-gray-700">Cargando...</p>
        </div>
      </div>
    );
  }
  
  return (
    <AnimatePresence mode="wait">
      {/* Si el usuario está autenticado, mostrar la aplicación principal con animación */}
      {isAuthenticated() ? (
        <motion.div
          key="main-app"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <MainApp />
        </motion.div>
      ) : (
        // Si no está autenticado, mostrar la página de login o de registro según el estado
        showCreateAccount ? (
          <motion.div
            key="create-account"
            {...slideUp}
          >
            <CreateAccount onLoginClick={() => setShowCreateAccount(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="login"
            {...fadeIn}
          >
            <Login onCreateAccountClick={() => setShowCreateAccount(true)} />
          </motion.div>
        )
      )}
    </AnimatePresence>
  );
}

// Envolver App con el proveedor de autenticación
const AppWithAuth = () => {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
};

export default AppWithAuth;
