import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import hamburgerAnimation from '../../assets/hamburger-menu-animation.json';
import useNavigationStore from '../../store/navigationStore';
import { 
  IoCalculatorOutline, 
  IoCarOutline, 
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoFlashOutline,
  IoCloseOutline
} from 'react-icons/io5';

const AppNavigation = () => {
  // Animation for dropdown menus
  const dropdownVariants = {
    hidden: { opacity: 0, height: 0, overflow: 'hidden' },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { duration: 0.3 }
    }
  };

  // Animation for mobile menu
  const mobileMenuVariants = {
    closed: {
      x: '-100%',
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.07,
        delayChildren: 0.2
      }
    }
  };

  const menuItemVariants = {
    closed: { x: -20, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  // Lottie animation control
  const lottieRef = useRef();
  
  // Navigation store for mobile menu state
  const { mobileMenu, toggleMobileMenu, setMobileMenuClosed } = useNavigationStore();
  
  // State for dropdown menus
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };
  
  // Handle click on mobile menu item - close menu after navigation
  const handleMobileItemClick = () => {
    setMobileMenuClosed();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo y hamburguesa */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src="/logo.png" alt="Cliquéalo" />
            </div>
            
            {/* Botón de menú hamburguesa (solo visible en móviles) */}
            <div className="sm:hidden ml-4">
              <button 
                onClick={() => {
                  toggleMobileMenu();
                  if (lottieRef.current) {
                    if (!mobileMenu.isOpen) {
                      lottieRef.current.setDirection(1);
                      lottieRef.current.playSegments([30, 60], true);
                    } else {
                      lottieRef.current.setDirection(-1);
                      lottieRef.current.playSegments([60, 30], true);
                    }
                  }
                }}
                className="p-2 rounded-md text-amber-600 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
                aria-expanded={mobileMenu.isOpen}
                aria-controls="mobile-menu"
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
          </div>
          
          {/* Menú de navegación horizontal (solo visible en pantallas SM y superiores) */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {/* Vehículos */}
            <NavLink 
              to="/vehicles" 
              className={({ isActive }) => 
                `${isActive ? 'border-amber-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} 
                inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
              }
            >
              <IoCarOutline className="mr-1 h-5 w-5" />
              Vehículos
            </NavLink>

            {/* Cotizadores - NUEVO MENÚ REESTRUCTURADO */}
            <div className="relative">
              <button 
                onClick={() => toggleMenu('cotizadores')}
                className={`${openMenu === 'cotizadores' ? 'border-amber-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} 
                inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <IoCalculatorOutline className="mr-1 h-5 w-5" />
                Cotizadores
                <svg className={`ml-2 h-5 w-5 transition-transform ${openMenu === 'cotizadores' ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <motion.div 
                className="absolute z-10 -ml-4 mt-3 transform px-2 w-screen max-w-md sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2"
                variants={dropdownVariants}
                initial="hidden"
                animate={openMenu === 'cotizadores' ? 'visible' : 'hidden'}
              >
                <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                  <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                    {/* Cotizador Normal */}
                    <NavLink 
                      to="/cotizadores/normal"
                      className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 transition ease-in-out duration-150"
                    >
                      <IoDocumentTextOutline className="flex-shrink-0 h-6 w-6 text-amber-600" />
                      <div className="ml-4">
                        <p className="text-base font-medium text-gray-900">
                          Cotizador Normal
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Genera cotizaciones completas con guardado en base de datos
                        </p>
                      </div>
                    </NavLink>
                    
                    {/* Cotizador Rápido */}
                    <NavLink 
                      to="/cotizadores/rapido"
                      className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 transition ease-in-out duration-150"
                    >
                      <IoFlashOutline className="flex-shrink-0 h-6 w-6 text-amber-600" />
                      <div className="ml-4">
                        <p className="text-base font-medium text-gray-900">
                          Cotizador Rápido
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Genera cotizaciones instantáneas sin necesidad de guardado
                        </p>
                      </div>
                    </NavLink>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Citas */}
            <NavLink 
              to="/appointments" 
              className={({ isActive }) => 
                `${isActive ? 'border-amber-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} 
                inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
              }
            >
              <IoCalendarOutline className="mr-1 h-5 w-5" />
              Citas
            </NavLink>

            {/* Clientes */}
            <NavLink 
              to="/clients" 
              className={({ isActive }) => 
                `${isActive ? 'border-amber-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} 
                inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
              }
            >
              <IoPersonOutline className="mr-1 h-5 w-5" />
              Clientes
            </NavLink>
          </div>
        </div>
      </div>
      
      {/* Menú móvil */}
      <AnimatePresence>
        {mobileMenu.isOpen && (
          <>
            {/* Overlay para cerrar el menú al hacer clic fuera */}
            <motion.div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={setMobileMenuClosed}
            />
            
            {/* Menú lateral */}
            <motion.div
              className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-sm bg-white shadow-xl z-30"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <div className="flex items-center">
                  <img className="h-8 w-auto" src="/logo.png" alt="Cliquéalo" />
                </div>
                <button 
                  onClick={setMobileMenuClosed}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Cerrar menú</span>
                  <IoCloseOutline className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {/* Vehículos */}
                  <motion.div variants={menuItemVariants}>
                    <NavLink 
                      to="/vehicles" 
                      className={({ isActive }) => 
                        `${isActive ? 'bg-amber-50 text-amber-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} 
                        group flex items-center px-3 py-2 text-base font-medium rounded-md`
                      }
                      onClick={handleMobileItemClick}
                    >
                      <IoCarOutline className="mr-4 flex-shrink-0 h-6 w-6 text-amber-500" />
                      Vehículos
                    </NavLink>
                  </motion.div>
                  
                  {/* Cotizadores */}
                  <motion.div variants={menuItemVariants}>
                    <NavLink 
                      to="/cotizadores/normal" 
                      className={({ isActive }) => 
                        `${isActive ? 'bg-amber-50 text-amber-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} 
                        group flex items-center px-3 py-2 text-base font-medium rounded-md`
                      }
                      onClick={handleMobileItemClick}
                    >
                      <IoDocumentTextOutline className="mr-4 flex-shrink-0 h-6 w-6 text-amber-500" />
                      Cotizador Normal
                    </NavLink>
                  </motion.div>
                  
                  <motion.div variants={menuItemVariants}>
                    <NavLink 
                      to="/cotizadores/rapido" 
                      className={({ isActive }) => 
                        `${isActive ? 'bg-amber-50 text-amber-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} 
                        group flex items-center px-3 py-2 text-base font-medium rounded-md`
                      }
                      onClick={handleMobileItemClick}
                    >
                      <IoFlashOutline className="mr-4 flex-shrink-0 h-6 w-6 text-amber-500" />
                      Cotizador Rápido
                    </NavLink>
                  </motion.div>
                  
                  {/* Citas */}
                  <motion.div variants={menuItemVariants}>
                    <NavLink 
                      to="/appointments" 
                      className={({ isActive }) => 
                        `${isActive ? 'bg-amber-50 text-amber-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} 
                        group flex items-center px-3 py-2 text-base font-medium rounded-md`
                      }
                      onClick={handleMobileItemClick}
                    >
                      <IoCalendarOutline className="mr-4 flex-shrink-0 h-6 w-6 text-amber-500" />
                      Citas
                    </NavLink>
                  </motion.div>
                  
                  {/* Clientes */}
                  <motion.div variants={menuItemVariants}>
                    <NavLink 
                      to="/clients" 
                      className={({ isActive }) => 
                        `${isActive ? 'bg-amber-50 text-amber-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'} 
                        group flex items-center px-3 py-2 text-base font-medium rounded-md`
                      }
                      onClick={handleMobileItemClick}
                    >
                      <IoPersonOutline className="mr-4 flex-shrink-0 h-6 w-6 text-amber-500" />
                      Clientes
                    </NavLink>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default AppNavigation;