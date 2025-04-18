import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NotificationContainer from './components/common/NotificationContainer';
import { registerRedirectFunction } from './utils/apiUtils';
import useVehicleStore from './store/vehicleStore';
import useNavigationStore from './store/navigationStore';

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
import hamburgerAnimation from './assets/hamburger-menu-animation.json';
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
  
  // Estado del menú móvil desde navigationStore
  const { mobileMenu, toggleMobileMenu, setMobileMenuClosed } = useNavigationStore();
  
  // Estado para controlar si el sidebar está expandido o contraído (inicia colapsado)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  // Estado para controlar el modo de auto-expansión del sidebar
  const [sidebarHovered, setSidebarHovered] = useState(false);
  
  // Referencia para la animación del botón hamburguesa
  const lottieRef = useRef();
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

  // Manejar clic en el botón hamburguesa
  const handleHamburgerClick = () => {
    toggleMobileMenu();
    
    // Controlar la animación del botón hamburguesa
    if (lottieRef.current) {
      if (!mobileMenu.isOpen) {
        lottieRef.current.setDirection(1);
        lottieRef.current.playSegments([30, 60], true);
      } else {
        lottieRef.current.setDirection(-1);
        lottieRef.current.playSegments([60, 30], true);
      }
    }
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

      {/* Header */}x|
      <header className="uber-header relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {/* Botón hamburguesa en dispositivos móviles */}
              <div className="md:hidden mr-3">
                <button 
                  onClick={handleHamburgerClick}
                  className="p-2 rounded-md text-amber-600 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
                  aria-expanded={mobileMenu.isOpen}
                >
                  <span className="sr-only">Abrir menú principal</span>
                  <div className="w-8 h-8">
                    <Lottie
                      lottieRef={lottieRef}
                      animationData={hamburgerAnimation}
                      loop={false}
                      autoplay={false}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </button>
              </div>
              
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
      
      {/* Sidebar moderno y minimalista con funcionalidad responsive */}
        <AnimatePresence>
          {/* Overlay mejorado para cerrar el menú móvil al hacer clic fuera */}
          {mobileMenu.isOpen && window.innerWidth < 768 && (
            <motion.div 
              className="fixed inset-0 bg-gray-800/70 backdrop-blur-sm z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={setMobileMenuClosed}
            />
          )}
          
          <motion.aside 
            className={`bg-white shadow-lg border-r border-gray-100 ${sidebarCollapsed && !sidebarHovered ? 'w-16' : 'w-72'} transition-all duration-300 ease-in-out md:relative fixed h-screen top-0 left-0 bottom-0 z-40 flex flex-col`}
            initial={{ 
              width: sidebarCollapsed && !sidebarHovered ? 64 : 288,
              x: window.innerWidth < 768 && !mobileMenu.isOpen ? -300 : 0
            }}
            animate={{ 
              width: sidebarCollapsed && !sidebarHovered ? 64 : 288,
              x: window.innerWidth < 768 && !mobileMenu.isOpen ? -300 : 0
            }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
            onMouseEnter={() => window.innerWidth >= 768 && setSidebarHovered(true)}
            onMouseLeave={() => window.innerWidth >= 768 && setSidebarHovered(false)}
        >
          {/* Botón para fijar/liberar el sidebar - Rediseñado */}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute right-2 top-3 p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-amber-500 transition-all duration-200 shadow-sm z-10 hidden md:block"
            title={sidebarCollapsed ? "Fijar sidebar abierto" : "Permitir auto-contracción"}
          >
            {sidebarCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
          
          {/* Cabecera del sidebar rediseñada */}
          <div className="py-4 px-3 flex justify-between items-center border-b border-gray-100">
            <div className={`flex flex-col ${sidebarCollapsed && !sidebarHovered ? 'items-center' : 'items-start'}`}>
              <motion.div
                initial={false}
                animate={{ 
                  width: sidebarCollapsed && !sidebarHovered ? 32 : 110,
                  opacity: 1
                }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
                className="relative overflow-hidden"
              >
                <img 
                  src={logoImg} 
                  alt="Cliquéalo" 
                  className="object-contain w-full"
                />
              </motion.div>
            </div>
            
            {/* Botón de cerrar menú en móvil */}
            {window.innerWidth < 768 && (
              <button 
                onClick={setMobileMenuClosed}
                className="p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-amber-500 transition-all duration-200 md:hidden"
                aria-label="Cerrar menú"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Información del usuario en el sidebar - visible en móvil */}
          {(!sidebarCollapsed || window.innerWidth < 768) && (
            <div className="px-3 py-3 text-center md:hidden border-b border-gray-100">
              <div className="font-medium text-gray-800 text-sm">
                {user?.usuario} <span className="text-gray-500">({user?.rol})</span>
              </div>
            </div>
          )}
          
          {/* Navegación del sidebar rediseñada */}
          <nav className="mt-2 px-2 flex-1 overflow-y-auto">
            <div className="font-semibold text-xs text-gray-400 uppercase tracking-wider px-3 py-2">
              Menú Principal
            </div>
            <ul className="space-y-1">
              {/* Vehículos */}
              <li>
                <motion.button
                  onClick={() => {
                    navigate('/vehicles');
                    window.innerWidth < 768 && setMobileMenuClosed();
                  }}
                  className={`w-full rounded-lg ${sidebarCollapsed && !sidebarHovered ? 'px-0 justify-center' : 'pl-3 pr-2 justify-start'} py-2.5 flex items-center gap-3 text-gray-700 hover:bg-gray-50 hover:text-amber-600 transition-all duration-200 group relative`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <IoCarOutline className={`h-5 w-5 ${sidebarCollapsed && !sidebarHovered ? 'mx-auto' : ''} text-gray-500 group-hover:text-amber-500 transition-colors`} />
                  
                  {(!sidebarCollapsed || sidebarHovered) && (
                    <span className="font-medium text-sm whitespace-nowrap overflow-hidden">Vehículos</span>
                  )}
                  
                  {/* Tooltip para menú colapsado */}
                  {(sidebarCollapsed && !sidebarHovered) && (
                    <div className="absolute left-full ml-2 pl-2 py-1 w-auto min-w-max rounded-md shadow-md bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      Vehículos
                    </div>
                  )}
                </motion.button>
              </li>
              
              {/* Cotizadores - Sección con subitems */}
              <li className="relative">
                <div className={`w-full rounded-lg ${sidebarCollapsed && !sidebarHovered ? 'px-0 justify-center' : 'pl-3 pr-2 justify-start'} py-2.5 flex items-center gap-3 bg-amber-50 text-amber-800 group relative`}>
                  <IoCalculatorOutline className={`h-5 w-5 ${sidebarCollapsed && !sidebarHovered ? 'mx-auto' : ''} text-amber-600`} />
                  
                  {(!sidebarCollapsed || sidebarHovered) && (
                    <span className="font-medium text-sm whitespace-nowrap overflow-hidden">Cotizadores</span>
                  )}
                  
                  {/* Tooltip para menú colapsado */}
                  {(sidebarCollapsed && !sidebarHovered) && (
                    <div className="absolute left-full ml-2 pl-2 py-1 w-auto min-w-max rounded-md shadow-md bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      Cotizadores
                    </div>
                  )}
                </div>
                
                <ul className={`mt-1 space-y-1 ${sidebarCollapsed && !sidebarHovered ? 'px-0' : 'pl-2'}`}>
                  <li>
                    <motion.button
                      onClick={() => {
                        navigate('/cotizadores/normal');
                        window.innerWidth < 768 && setMobileMenuClosed();
                      }}
                      className={`w-full rounded-lg ${sidebarCollapsed && !sidebarHovered ? 'px-0 justify-center' : 'pl-3 pr-2 justify-start'} py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-amber-600 transition-all duration-200 group relative`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <IoDocumentTextOutline className={`h-4 w-4 ${sidebarCollapsed && !sidebarHovered ? 'mx-auto' : ''} text-gray-500 group-hover:text-amber-500 transition-colors`} />
                      
                      {(!sidebarCollapsed || sidebarHovered) && (
                        <span className="text-xs whitespace-nowrap overflow-hidden">Cotizador Normal</span>
                      )}
                      
                      {/* Tooltip para submenú colapsado */}
                      {(sidebarCollapsed && !sidebarHovered) && (
                        <div className="absolute left-full ml-2 pl-2 py-1 w-auto min-w-max rounded-md shadow-md bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          Cotizador Normal
                        </div>
                      )}
                    </motion.button>
                  </li>
                  <li>
                    <motion.button
                      onClick={() => {
                        navigate('/cotizadores/rapido');
                        window.innerWidth < 768 && setMobileMenuClosed();
                      }}
                      className={`w-full rounded-lg ${sidebarCollapsed && !sidebarHovered ? 'px-0 justify-center' : 'pl-3 pr-2 justify-start'} py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-amber-600 transition-all duration-200 group relative`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <IoFlashOutline className={`h-4 w-4 ${sidebarCollapsed && !sidebarHovered ? 'mx-auto' : ''} text-gray-500 group-hover:text-amber-500 transition-colors`} />
                      
                      {(!sidebarCollapsed || sidebarHovered) && (
                        <span className="text-xs whitespace-nowrap overflow-hidden">Cotizador Rápido</span>
                      )}
                      
                      {/* Tooltip para submenú colapsado */}
                      {(sidebarCollapsed && !sidebarHovered) && (
                        <div className="absolute left-full ml-2 pl-2 py-1 w-auto min-w-max rounded-md shadow-md bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          Cotizador Rápido
                        </div>
                      )}
                    </motion.button>
                  </li>
                </ul>
              </li>
              
              {/* Citas */}
              <li>
                <motion.button
                  onClick={() => {
                    navigate('/appointments');
                    window.innerWidth < 768 && setMobileMenuClosed();
                  }}
                  className={`w-full rounded-lg ${sidebarCollapsed && !sidebarHovered ? 'px-0 justify-center' : 'pl-3 pr-2 justify-start'} py-2.5 flex items-center gap-3 text-gray-700 hover:bg-gray-50 hover:text-amber-600 transition-all duration-200 group relative`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <IoCalendarOutline className={`h-5 w-5 ${sidebarCollapsed && !sidebarHovered ? 'mx-auto' : ''} text-gray-500 group-hover:text-amber-500 transition-colors`} />
                  
                  {(!sidebarCollapsed || sidebarHovered) && (
                    <span className="font-medium text-sm whitespace-nowrap overflow-hidden">Citas</span>
                  )}
                  
                  {/* Tooltip para menú colapsado */}
                  {(sidebarCollapsed && !sidebarHovered) && (
                    <div className="absolute left-full ml-2 pl-2 py-1 w-auto min-w-max rounded-md shadow-md bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      Citas
                    </div>
                  )}
                </motion.button>
              </li>
              
              {/* Clientes */}
              <li>
                <motion.button
                  onClick={() => {
                    navigate('/clients');
                    window.innerWidth < 768 && setMobileMenuClosed();
                  }}
                  className={`w-full rounded-lg ${sidebarCollapsed && !sidebarHovered ? 'px-0 justify-center' : 'pl-3 pr-2 justify-start'} py-2.5 flex items-center gap-3 text-gray-700 hover:bg-gray-50 hover:text-amber-600 transition-all duration-200 group relative`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <IoPersonOutline className={`h-5 w-5 ${sidebarCollapsed && !sidebarHovered ? 'mx-auto' : ''} text-gray-500 group-hover:text-amber-500 transition-colors`} />
                  
                  {(!sidebarCollapsed || sidebarHovered) && (
                    <span className="font-medium text-sm whitespace-nowrap overflow-hidden">Clientes</span>
                  )}
                  
                  {/* Tooltip para menú colapsado */}
                  {(sidebarCollapsed && !sidebarHovered) && (
                    <div className="absolute left-full ml-2 pl-2 py-1 w-auto min-w-max rounded-md shadow-md bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      Clientes
                    </div>
                  )}
                </motion.button>
              </li>
              
              {/* Contratos */}
              <li>
                <motion.button
                  onClick={() => {
                    navigate('/contracts/create');
                    window.innerWidth < 768 && setMobileMenuClosed();
                  }}
                  className={`w-full rounded-lg ${sidebarCollapsed && !sidebarHovered ? 'px-0 justify-center' : 'pl-3 pr-2 justify-start'} py-2.5 flex items-center gap-3 text-gray-700 hover:bg-gray-50 hover:text-amber-600 transition-all duration-200 group relative`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <IoDocumentTextOutline className={`h-5 w-5 ${sidebarCollapsed && !sidebarHovered ? 'mx-auto' : ''} text-gray-500 group-hover:text-amber-500 transition-colors`} />
                  
                  {(!sidebarCollapsed || sidebarHovered) && (
                    <span className="font-medium text-sm whitespace-nowrap overflow-hidden">Contratos</span>
                  )}
                  
                  {/* Tooltip para menú colapsado */}
                  {(sidebarCollapsed && !sidebarHovered) && (
                    <div className="absolute left-full ml-2 pl-2 py-1 w-auto min-w-max rounded-md shadow-md bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      Contratos
                    </div>
                  )}
                </motion.button>
              </li>
              
              {/* Organigrama */}
              <li>
                <motion.button
                  onClick={() => {
                    navigate('/organization');
                    window.innerWidth < 768 && setMobileMenuClosed();
                  }}
                  className={`w-full rounded-lg ${sidebarCollapsed && !sidebarHovered ? 'px-0 justify-center' : 'pl-3 pr-2 justify-start'} py-2.5 flex items-center gap-3 text-gray-700 hover:bg-gray-50 hover:text-amber-600 transition-all duration-200 group relative`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <IoPeopleOutline className={`h-5 w-5 ${sidebarCollapsed && !sidebarHovered ? 'mx-auto' : ''} text-gray-500 group-hover:text-amber-500 transition-colors`} />
                  
                  {(!sidebarCollapsed || sidebarHovered) && (
                    <span className="font-medium text-sm whitespace-nowrap overflow-hidden">Organigrama</span>
                  )}
                  
                  {/* Tooltip para menú colapsado */}
                  {(sidebarCollapsed && !sidebarHovered) && (
                    <div className="absolute left-full ml-2 pl-2 py-1 w-auto min-w-max rounded-md shadow-md bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      Organigrama
                    </div>
                  )}
                </motion.button>
              </li>
            </ul>
          </nav>
          
          {/* Botón de cerrar sesión en la parte inferior del sidebar */}
          <div className="mt-auto border-t border-gray-100 pt-2 pb-4 px-2">
            <motion.button
              onClick={handleLogout}
              className={`w-full rounded-lg ${sidebarCollapsed && !sidebarHovered ? 'px-0 justify-center' : 'pl-3 pr-2 justify-start'} py-2.5 flex items-center gap-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group relative`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 ${sidebarCollapsed && !sidebarHovered ? 'mx-auto' : ''} text-gray-500 group-hover:text-red-500 transition-colors`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              
              {(!sidebarCollapsed || sidebarHovered) && (
                <span className="font-medium text-sm whitespace-nowrap overflow-hidden">Cerrar sesión</span>
              )}
              
              {/* Tooltip para menú colapsado */}
              {(sidebarCollapsed && !sidebarHovered) && (
                <div className="absolute left-full ml-2 pl-2 py-1 w-auto min-w-max rounded-md shadow-md bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Cerrar sesión
                </div>
              )}
            </motion.button>
          </div>
        </motion.aside>
        </AnimatePresence>
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