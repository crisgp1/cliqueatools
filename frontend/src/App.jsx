import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NotificationContainer from './components/common/NotificationContainer';
import { registerRedirectFunction } from './utils/apiUtils';
import useVehicleStore from './store/vehicleStore';

// Componentes de páginas
import VehicleForm from './pages/VehicleForm';
import AppointmentPage from './pages/AppointmentPage';
import ClientFormPage from './pages/ClientForm';
import ContractForm from './pages/ContractForm';
import QuickCredit from './pages/QuickCredit';
import NormalQuote from './pages/NormalQuote'; // Nuevo componente para el cotizador normal
import OrganizationChart from './pages/OrganizationChart';
import Login from './pages/Login';
import CreateAccount from './pages/CreateAccount';

// Contexto de autenticación
import { AuthProvider, AuthContext } from './context/AuthContext';

// Navegación
import AppNavigation from './components/navigation/AppNavigation';
import { useNavigate } from 'react-router-dom';

// Animaciones
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import logoutAnimation from './assets/logout-animation.json';
import logoImg from './assets/logo.png';
import logoImgDark from './assets/logo-dark.png';

// Iconos para el sidebar
import { 
  IoHomeOutline, 
  IoCarOutline,
  IoPersonOutline,
  IoCardOutline,
  IoCalculatorOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoFlashOutline
} from 'react-icons/io5';

// Componente principal
const MainApp = () => {
  // Hook para navegación
  const navigate = useNavigate();
  
  // Obtener estado y funciones de autenticación
  const { user, logout } = React.useContext(AuthContext);
  // Estado para controlar si el sidebar está expandido o contraído (inicia colapsado)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  // Estado para controlar el modo de auto-expansión del sidebar
  const [sidebarHovered, setSidebarHovered] = useState(false);
  // Estado para mostrar el preloader de cierre de sesión
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);
  
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex-1 flex flex-col md:flex-row">
      
        {/* Sidebar con funcionalidad de auto-contracción */}
        <motion.aside 
          className={`uber-sidebar ${sidebarCollapsed && !sidebarHovered ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out`}
          initial={{ width: sidebarCollapsed && !sidebarHovered ? 64 : 256 }}
          animate={{ width: sidebarCollapsed && !sidebarHovered ? 64 : 256 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          {/* Botón para fijar/liberar el sidebar */}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute right-2 top-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors z-10"
            title={sidebarCollapsed ? "Fijar sidebar abierto" : "Permitir auto-contracción"}
          >
            {sidebarCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5l-6 6 6 6" />
              </svg>
            )}
          </button>
          
          <div className={`p-5 border-b border-uber-gray-200 flex ${sidebarCollapsed && !sidebarHovered ? 'justify-center' : 'justify-start'}`}>
            <div className={`flex flex-col ${sidebarCollapsed && !sidebarHovered ? 'items-center' : 'items-start'}`}>
              <motion.div
                initial={false}
                animate={{ 
                  width: sidebarCollapsed && !sidebarHovered ? 32 : 120,
                  height: sidebarCollapsed && !sidebarHovered ? 32 : 40 
                }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
                className="relative overflow-hidden mb-3"
              >
                <img 
                  src={logoImg} 
                  alt="Cliquéalo" 
                  className="object-contain w-full h-full"
                />
              </motion.div>
              <motion.div
                initial={false}
                animate={{ 
                  opacity: sidebarCollapsed && !sidebarHovered ? 0 : 1,
                  height: sidebarCollapsed && !sidebarHovered ? 0 : 'auto'
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <h2 className="text-lg font-semibold text-uber-black">Simulador de Crédito</h2>
              </motion.div>
            </div>
          </div>
          
          <nav className="mt-2 overflow-hidden">
            <ul>
              {/* Vehículos */}
              <li>
                <motion.button
                  onClick={() => navigate('/vehicles')}
                  className={`w-full text-left ${sidebarCollapsed ? 'px-0 justify-center' : 'px-4 justify-start'} py-3 flex items-center space-x-3 uber-nav-item hover:bg-gray-100 hover:text-blue-600 transition-all duration-200`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex-shrink-0">
                    <IoCarOutline className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : 'ml-2 mr-3'}`} />
                  </span>
                  {!sidebarCollapsed && <span className="font-medium">Vehículos</span>}
                </motion.button>
              </li>
              
              {/* Cotizadores - Nuevo menú con subitems */}
              <li className="relative">
                <div className={`w-full text-left ${sidebarCollapsed && !sidebarHovered ? 'px-0 justify-center' : 'px-4 justify-start'} py-3 flex items-center space-x-3 uber-nav-item-active`}>
                  <span className="flex-shrink-0">
                    <IoCalculatorOutline className={`h-5 w-5 ${sidebarCollapsed && !sidebarHovered ? 'mx-auto' : 'ml-2 mr-3'}`} />
                  </span>
                  <motion.span 
                    className="font-medium"
                    initial={false}
                    animate={{ 
                      opacity: sidebarCollapsed && !sidebarHovered ? 0 : 1,
                      width: sidebarCollapsed && !sidebarHovered ? 0 : 'auto'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    Cotizadores
                  </motion.span>
                </div>
                <ul className={`${sidebarCollapsed && !sidebarHovered ? 'pl-0' : 'pl-8'} bg-gray-50`}>
                  <li>
                    <motion.button
                      onClick={() => navigate('/cotizadores/normal')}
                      className={`w-full text-left ${sidebarCollapsed && !sidebarHovered ? 'px-0 justify-center' : 'px-4 justify-start'} py-2 flex items-center space-x-2 hover:bg-gray-100 hover:text-amber-600 transition-colors`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex-shrink-0">
                        <IoDocumentTextOutline className={`h-4 w-4 text-amber-600 ${sidebarCollapsed && !sidebarHovered ? 'mx-auto' : ''}`} />
                      </span>
                      <motion.span 
                        className="text-sm"
                        initial={false}
                        animate={{ 
                          opacity: sidebarCollapsed && !sidebarHovered ? 0 : 1,
                          width: sidebarCollapsed && !sidebarHovered ? 0 : 'auto'
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        Cotizador Normal
                      </motion.span>
                    </motion.button>
                  </li>
                  <li>
                    <motion.button
                      onClick={() => navigate('/cotizadores/rapido')}
                      className={`w-full text-left ${sidebarCollapsed && !sidebarHovered ? 'px-0 justify-center' : 'px-4 justify-start'} py-2 flex items-center space-x-2 hover:bg-gray-100 hover:text-amber-600 transition-colors`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex-shrink-0">
                        <IoFlashOutline className={`h-4 w-4 text-amber-600 ${sidebarCollapsed && !sidebarHovered ? 'mx-auto' : ''}`} />
                      </span>
                      <motion.span 
                        className="text-sm"
                        initial={false}
                        animate={{ 
                          opacity: sidebarCollapsed && !sidebarHovered ? 0 : 1,
                          width: sidebarCollapsed && !sidebarHovered ? 0 : 'auto'
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        Cotizador Rápido
                      </motion.span>
                    </motion.button>
                  </li>
                </ul>
              </li>
              
              {/* Citas */}
              <li>
                <motion.button
                  onClick={() => navigate('/appointments')}
                  className={`w-full text-left ${sidebarCollapsed && !sidebarHovered ? 'px-0 justify-center' : 'px-4 justify-start'} py-3 flex items-center space-x-3 uber-nav-item hover:bg-gray-100 hover:text-blue-600 transition-all duration-200`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex-shrink-0">
                    <IoCalendarOutline className={`h-5 w-5 ${sidebarCollapsed && !sidebarHovered ? 'mx-auto' : 'ml-2 mr-3'}`} />
                  </span>
                  <motion.span 
                    className="font-medium"
                    initial={false}
                    animate={{ 
                      opacity: sidebarCollapsed && !sidebarHovered ? 0 : 1,
                      width: sidebarCollapsed && !sidebarHovered ? 0 : 'auto'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    Citas
                  </motion.span>
                </motion.button>
              </li>
              
              {/* Clientes */}
              <li>
                <motion.button
                  onClick={() => navigate('/clients')}
                  className={`w-full text-left ${sidebarCollapsed && !sidebarHovered ? 'px-0 justify-center' : 'px-4 justify-start'} py-3 flex items-center space-x-3 uber-nav-item hover:bg-gray-100 hover:text-blue-600 transition-all duration-200`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex-shrink-0">
                    <IoPersonOutline className={`h-5 w-5 ${sidebarCollapsed && !sidebarHovered ? 'mx-auto' : 'ml-2 mr-3'}`} />
                  </span>
                  <motion.span 
                    className="font-medium"
                    initial={false}
                    animate={{ 
                      opacity: sidebarCollapsed && !sidebarHovered ? 0 : 1,
                      width: sidebarCollapsed && !sidebarHovered ? 0 : 'auto'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    Clientes
                  </motion.span>
                </motion.button>
              </li>
              
              {/* Contratos */}
              <li>
                <motion.button
                  onClick={() => navigate('/contracts/create')}
                  className={`w-full text-left ${sidebarCollapsed && !sidebarHovered ? 'px-0 justify-center' : 'px-4 justify-start'} py-3 flex items-center space-x-3 uber-nav-item hover:bg-gray-100 hover:text-blue-600 transition-all duration-200`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex-shrink-0">
                    <IoDocumentTextOutline className={`h-5 w-5 ${sidebarCollapsed && !sidebarHovered ? 'mx-auto' : 'ml-2 mr-3'}`} />
                  </span>
                  <motion.span 
                    className="font-medium"
                    initial={false}
                    animate={{ 
                      opacity: sidebarCollapsed && !sidebarHovered ? 0 : 1,
                      width: sidebarCollapsed && !sidebarHovered ? 0 : 'auto'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    Contratos
                  </motion.span>
                </motion.button>
              </li>
              
              {/* Organigrama */}
              <li>
                <motion.button
                  onClick={() => navigate('/organization')}
                  className={`w-full text-left ${sidebarCollapsed && !sidebarHovered ? 'px-0 justify-center' : 'px-4 justify-start'} py-3 flex items-center space-x-3 uber-nav-item hover:bg-gray-100 hover:text-blue-600 transition-all duration-200`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex-shrink-0">
                    <IoPeopleOutline className={`h-5 w-5 ${sidebarCollapsed && !sidebarHovered ? 'mx-auto' : 'ml-2 mr-3'}`} />
                  </span>
                  <motion.span 
                    className="font-medium"
                    initial={false}
                    animate={{ 
                      opacity: sidebarCollapsed && !sidebarHovered ? 0 : 1,
                      width: sidebarCollapsed && !sidebarHovered ? 0 : 'auto'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    Organigrama
                  </motion.span>
                </motion.button>
              </li>
            </ul>
          </nav>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-uber-white">
          <Routes>
            {/* Ruta por defecto redirige a cotizadores/normal */}
            <Route path="/" element={<Navigate to="/cotizadores/normal" />} />
            
            {/* Vehículos */}
            <Route path="/vehicles" element={<VehicleForm />} />
            
            {/* Cotizadores - Nueva estructura */}
            <Route path="/cotizadores/normal/*" element={<NormalQuote />} />
            <Route path="/cotizadores/rapido/*" element={<QuickCredit />} />
            
            {/* Citas */}
            <Route path="/appointments" element={<AppointmentPage />} />
            
            {/* Clientes */}
            <Route path="/clients" element={<ClientFormPage />} />
            
            {/* Contratos */}
            <Route path="/contracts/create" element={<ContractForm />} />
            
            {/* Organigrama */}
            <Route path="/organization" element={<OrganizationChart />} />
            
            {/* Ruta de fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      {/* Footer */}
      <motion.footer 
        className="bg-white border-t border-gray-200 py-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <img src="/assets/logo.png" alt="Cliquéalo" className="h-8 md:h-10" />
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-xs md:text-sm text-gray-600">© {new Date().getFullYear()} Cliquéalo.mx - Todos los derechos reservados</p>
              <p className="text-xs md:text-sm text-gray-600">USO INTERNO - Este sitio es propiedad de Cliquéalo.mx</p>
            </div>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
};

// Componente App con autenticación
function App() {
  // Estado para controlar si se muestra la página de login o de registro
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  // Obtener estado y funciones de autenticación
  const { 
    isAuthenticated, 
    token, 
    loading, 
    shouldRedirectToLogin,
    forceRedirectToLogin
  } = React.useContext(AuthContext);
  
  // Estado para forzar renderizados cuando cambia el estado de autenticación
  const [authState, setAuthState] = useState(false);
  
  // Registrar la función de redirección con las utilidades de API
  useEffect(() => {
    if (forceRedirectToLogin) {
      // Registrar la función para que apiUtils pueda usarla cuando detecte un 401
      registerRedirectFunction(forceRedirectToLogin);
      console.log('Función de redirección registrada con las utilidades de API');
    }
  }, [forceRedirectToLogin]);
  
  // Efecto para detectar cambios en el estado de autenticación
  useEffect(() => {
    // Verificar redirección forzada primero
    if (shouldRedirectToLogin) {
      // Si hay una redirección forzada, establecer el estado de autenticación a falso
      setAuthState(false);
      return;
    }
    
    // Usar el valor actual de isAuthenticated
    const isAuth = isAuthenticated();
    // Actualizar el estado de autenticación local
    setAuthState(isAuth);
  }, [isAuthenticated, token, shouldRedirectToLogin]); // Añadir shouldRedirectToLogin como dependencia
  
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
    <>
      {/* Contenedor de notificaciones (siempre visible) */}
      <NotificationContainer />
      
      <AnimatePresence mode="wait">
        {/* Si el usuario está autenticado, mostrar la aplicación principal con animación */}
        {authState ? (
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <CreateAccount onLoginClick={() => setShowCreateAccount(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Login onCreateAccountClick={() => setShowCreateAccount(true)} />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </>
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