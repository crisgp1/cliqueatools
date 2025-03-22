import { useState, useEffect } from 'react'
import VehicleForm from './components/VehicleForm'
import ClientForm from './components/ClientForm'
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
  IoTrashOutline
} from 'react-icons/io5'

function App() {
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 shadow-md py-3 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src={logoImgDark} alt="Cliquéalo" className="h-6" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex-1 flex">
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

        {/* Mobile Sidebar */}
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
                <img src={logoImgDark} alt="Cliquéalo" className="h-10" />
               
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400">© {new Date().getFullYear()} Cliquéalo.mx - Todos los derechos reservados</p>
              <p className="text-sm text-gray-400">USO INTERNO - Este sitio es propiedad de Cliquéalo.mx</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App