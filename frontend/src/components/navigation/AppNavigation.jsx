import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  IoCalculatorOutline, 
  IoCarOutline, 
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoFlashOutline
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

  // State for dropdown menus
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src="/logo.png" alt="Cliquéalo" />
            </div>
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
      </div>
    </nav>
  );
};

export default AppNavigation;