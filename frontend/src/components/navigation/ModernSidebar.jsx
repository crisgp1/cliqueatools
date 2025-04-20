import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import hamburgerAnimation from '../../assets/hamburger-menu-animation.json';
import useNavigationStore from '../../store/navigationStore';
import logoImg from '../../assets/logo.png';
import logoImgDark from '../../assets/logo-dark.png';

// Icons
import { 
  IoHomeOutline, 
  IoCarOutline,
  IoPersonOutline,
  IoCardOutline,
  IoCalculatorOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoFlashOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoChevronForwardOutline,
  IoChevronBackOutline,
  IoLogOutOutline
} from 'react-icons/io5';

const ModernSidebar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mobileMenu, toggleMobileMenu, setMobileMenuClosed } = useNavigationStore();
  
  // State for sidebar collapse on desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  
  // State for expanded menu sections on mobile
  const [expandedSection, setExpandedSection] = useState(null);
  
  // Ref for hamburger animation
  const lottieRef = useRef();
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && mobileMenu.isOpen) {
        setMobileMenuClosed();
      }
      
      // Auto-collapse sidebar on smaller screens
      if (window.innerWidth < 1024 && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenu.isOpen, setMobileMenuClosed, sidebarCollapsed]);
  
  // Handle hamburger button click
  const handleHamburgerClick = () => {
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
  };
  
  // Toggle section expansion on mobile
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  // Check if a route is active
  const isRouteActive = (route) => {
    if (route === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(route);
  };
  
  // Handle navigation
  const handleNavigation = (route) => {
    navigate(route);
    if (window.innerWidth < 768) {
      setMobileMenuClosed();
    }
  };
  
  // Sidebar animation variants
  const sidebarVariants = {
    expanded: {
      width: 280,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    collapsed: {
      width: 80,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    mobileOpen: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    mobileClosed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };
  
  // Menu item animation variants
  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };
  
  // Submenu animation variants
  const submenuVariants = {
    hidden: { 
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    },
    visible: { 
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };
  
  // Navigation items configuration
  const navItems = [
    {
      id: 'vehicles',
      title: 'Vehículos',
      icon: <IoCarOutline />,
      route: '/vehicles'
    },
    {
      id: 'cotizadores',
      title: 'Cotizadores',
      icon: <IoCalculatorOutline />,
      submenu: [
        {
          id: 'cotizador-normal',
          title: 'Cotizador Normal',
          icon: <IoDocumentTextOutline />,
          route: '/cotizadores/normal'
        },
        {
          id: 'cotizador-rapido',
          title: 'Cotizador Rápido',
          icon: <IoFlashOutline />,
          route: '/cotizadores/rapido'
        }
      ]
    },
    {
      id: 'appointments',
      title: 'Citas',
      icon: <IoCalendarOutline />,
      route: '/appointments'
    },
    {
      id: 'clients',
      title: 'Clientes',
      icon: <IoPersonOutline />,
      route: '/clients'
    },
    {
      id: 'contracts',
      title: 'Contratos',
      icon: <IoDocumentTextOutline />,
      route: '/contracts/create'
    },
    {
      id: 'organization',
      title: 'Organigrama',
      icon: <IoPeopleOutline />,
      route: '/organization'
    }
  ];
  
  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-20 bg-white shadow-sm md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleHamburgerClick}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none"
              aria-label={mobileMenu.isOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <div className="w-6 h-6">
                <Lottie
                  lottieRef={lottieRef}
                  animationData={hamburgerAnimation}
                  loop={false}
                  autoplay={false}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </button>
            <img src={logoImg} alt="Cliquéalo" className="h-8" />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
              {user?.usuario} <span className="text-gray-500">({user?.rol})</span>
            </span>
          </div>
        </div>
      </header>
      
      {/* Overlay for mobile */}
      <AnimatePresence>
        {mobileMenu.isOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={setMobileMenuClosed}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 z-40 flex flex-col overflow-hidden`}
        variants={sidebarVariants}
        initial={window.innerWidth < 768 ? "mobileClosed" : (sidebarCollapsed ? "collapsed" : "expanded")}
        animate={
          window.innerWidth < 768
            ? (mobileMenu.isOpen ? "mobileOpen" : "mobileClosed")
            : ((sidebarCollapsed && !sidebarHovered) ? "collapsed" : "expanded")
        }
        onMouseEnter={() => window.innerWidth >= 768 && setSidebarHovered(true)}
        onMouseLeave={() => window.innerWidth >= 768 && setSidebarHovered(false)}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3 overflow-hidden">
            <img src={logoImg} alt="Cliquéalo" className="h-8 w-auto" />
            
            {(!sidebarCollapsed || sidebarHovered || window.innerWidth < 768) && (
              <motion.span 
                className="font-semibold text-gray-800 whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                Cliquéalo
              </motion.span>
            )}
          </div>
          
          {/* Close button for mobile */}
          {window.innerWidth < 768 && (
            <button 
              onClick={setMobileMenuClosed}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
              aria-label="Cerrar menú"
            >
              <IoCloseOutline className="w-5 h-5" />
            </button>
          )}
          
          {/* Toggle button for desktop */}
          {window.innerWidth >= 768 && (
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-amber-500 transition-all duration-200 ${(!sidebarCollapsed || sidebarHovered) ? 'opacity-100' : 'opacity-0'}`}
              aria-label={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            >
              {sidebarCollapsed ? (
                <IoChevronForwardOutline className="w-4 h-4" />
              ) : (
                <IoChevronBackOutline className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        
        {/* User info - visible on mobile or expanded sidebar */}
        {(window.innerWidth < 768 || !sidebarCollapsed || sidebarHovered) && (
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                {user?.usuario?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              <motion.div 
                className="overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <p className="font-medium text-sm text-gray-800 truncate">
                  {user?.usuario || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.rol || 'Rol no definido'}
                </p>
              </motion.div>
            </div>
          </div>
        )}
        
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id} className="relative">
                {/* Main menu item */}
                {item.submenu ? (
                  // Item with submenu
                  <>
                    <button
                      onClick={() => toggleSection(item.id)}
                      className={`w-full flex items-center justify-between rounded-lg py-2.5 px-3 transition-colors duration-200 ${
                        item.submenu.some(subitem => isRouteActive(subitem.route))
                          ? 'bg-amber-50 text-amber-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center min-w-0">
                        <span className={`flex-shrink-0 ${
                          item.submenu.some(subitem => isRouteActive(subitem.route))
                            ? 'text-amber-500'
                            : 'text-gray-500 group-hover:text-amber-500'
                        }`}>
                          {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                        </span>
                        
                        {(!sidebarCollapsed || sidebarHovered || window.innerWidth < 768) && (
                          <motion.span 
                            className="ml-3 font-medium text-sm truncate"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </div>
                      
                      {(!sidebarCollapsed || sidebarHovered || window.innerWidth < 768) && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`transform transition-transform duration-200 ${
                            expandedSection === item.id ? 'rotate-90' : ''
                          }`}
                        >
                          <IoChevronForwardOutline className="w-4 h-4" />
                        </motion.span>
                      )}
                    </button>
                    
                    {/* Submenu items */}
                    <AnimatePresence>
                      {(expandedSection === item.id || 
                         ((!sidebarCollapsed || sidebarHovered) && 
                          item.submenu.some(subitem => isRouteActive(subitem.route)))) && (
                        <motion.ul
                          variants={submenuVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="mt-1 ml-2 space-y-1 overflow-hidden"
                        >
                          {item.submenu.map((subitem) => (
                            <motion.li 
                              key={subitem.id}
                              variants={menuItemVariants}
                            >
                              <button
                                onClick={() => handleNavigation(subitem.route)}
                                className={`w-full flex items-center rounded-lg py-2 px-3 transition-colors duration-200 ${
                                  isRouteActive(subitem.route)
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <span className={`flex-shrink-0 ${
                                  isRouteActive(subitem.route)
                                    ? 'text-amber-500'
                                    : 'text-gray-500 group-hover:text-amber-500'
                                }`}>
                                  {React.cloneElement(subitem.icon, { className: 'w-4 h-4' })}
                                </span>
                                
                                {(!sidebarCollapsed || sidebarHovered || window.innerWidth < 768) && (
                                  <motion.span 
                                    className="ml-3 text-sm truncate"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {subitem.title}
                                  </motion.span>
                                )}
                              </button>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  // Regular menu item
                  <button
                    onClick={() => handleNavigation(item.route)}
                    className={`w-full flex items-center rounded-lg py-2.5 px-3 transition-colors duration-200 ${
                      isRouteActive(item.route)
                        ? 'bg-amber-50 text-amber-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className={`flex-shrink-0 ${
                      isRouteActive(item.route)
                        ? 'text-amber-500'
                        : 'text-gray-500 group-hover:text-amber-500'
                    }`}>
                      {React.cloneElement(item.icon, { className: 'w-5 h-5' })}
                    </span>
                    
                    {(!sidebarCollapsed || sidebarHovered || window.innerWidth < 768) && (
                      <motion.span 
                        className="ml-3 font-medium text-sm truncate"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </button>
                )}
                
                {/* Tooltip for collapsed sidebar */}
                {(sidebarCollapsed && !sidebarHovered && window.innerWidth >= 768) && (
                  <div className="absolute left-full top-0 ml-2 pl-1 py-2 w-auto min-w-max opacity-0 group-hover:opacity-100 pointer-events-none z-50">
                    <div className="bg-gray-800 text-white text-xs rounded-md py-1 px-2 whitespace-nowrap">
                      {item.title}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Logout button */}
        <div className="mt-auto border-t border-gray-100 p-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center rounded-lg py-2.5 px-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          >
            <span className="flex-shrink-0 text-gray-500 group-hover:text-red-500">
              <IoLogOutOutline className="w-5 h-5" />
            </span>
            
            {(!sidebarCollapsed || sidebarHovered || window.innerWidth < 768) && (
              <motion.span 
                className="ml-3 font-medium text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                Cerrar sesión
              </motion.span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default ModernSidebar;