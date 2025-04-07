import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  IoPeopleOutline, 
  IoPersonOutline, 
  IoCodeOutline, 
  IoTvOutline,
  IoMegaphoneOutline,
  IoCardOutline,
  IoStorefrontOutline,
  IoDocumentOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoBusinessOutline,
  IoArrowForwardOutline,
  IoArrowBackOutline,
  IoGitNetworkOutline
} from 'react-icons/io5'

// Datos de la jerarquía organizacional
const organizationData = {
  ceo: {
    name: "RICARDO GARCIA RAMIREZ",
    position: "Presidente de Cliquéalo de México",
    role: "CEO",
  },
  partners: [
    {
      name: "Ricardo García Pérez",
      position: "Director y Líder de ventas operativas",
      role: "Socio",
      departments: [
        { name: "Departamento de Ventas", icon: <IoStorefrontOutline /> },
        { name: "Créditos", icon: <IoCardOutline /> },
        { name: "Captura", icon: <IoDocumentOutline /> }
      ]
    },
    {
      name: "Cristian García Pérez",
      position: "Director y Líder de Tecnología e innovación",
      role: "Socio",
      departments: [
        { name: "Proyecto CliqueATools", icon: <IoCodeOutline /> },
        { name: "Desarrollo de Software", icon: <IoCodeOutline /> },
        { name: "Software Interno", icon: <IoCodeOutline /> }
      ]
    },
    {
      name: "Evans García Pérez",
      position: "Director y Líder de CliqueArt y medios audiovisuales",
      role: "Socio",
      departments: [
        { name: "Medio Creativo", icon: <IoTvOutline /> },
        { name: "Estudio Cliquealo", icon: <IoTvOutline /> },
        { name: "Marketing", icon: <IoMegaphoneOutline /> }
      ]
    }
  ]
}

// Tarjeta para nodos del árbol con estilo corporativo
const CorporateNodeCard = ({ data, level = 0, isDepartment = false, onClick = null }) => {
  const getNodeStyle = () => {
    switch(level) {
      case 0: // CEO
        return {
          cardClass: "bg-gray-900 text-white border-l-4 border-blue-600",
          iconBgClass: "bg-blue-600",
          iconClass: "text-white",
          icon: <IoPeopleOutline className="h-5 w-5" />
        };
      case 1: // Partners
        return {
          cardClass: "bg-gray-800 text-white border-l-4 border-blue-500",
          iconBgClass: "bg-blue-500",
          iconClass: "text-white",
          icon: <IoPersonOutline className="h-5 w-5" />
        };
      default: // Departments
        return {
          cardClass: "bg-white text-gray-800 border-l-4 border-blue-400 shadow-md",
          iconBgClass: "bg-blue-400",
          iconClass: "text-white",
          icon: isDepartment ? data.icon : <IoDocumentOutline className="h-5 w-5" />
        };
    }
  };

  const style = getNodeStyle();

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ 
        scale: 1.01, 
        boxShadow: level < 2 ? "0 8px 30px rgba(0, 0, 0, 0.12)" : "0 4px 15px rgba(0, 0, 0, 0.08)" 
      }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-sm p-4 shadow-lg z-10 ${style.cardClass} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center">
        <div className={`h-10 w-10 rounded-sm flex items-center justify-center ${style.iconBgClass}`}>
          {style.icon}
        </div>
        <div className="ml-3 flex-1 min-w-0">
          {!isDepartment && level < 2 && (
            <p className={`text-xs font-medium uppercase tracking-wider opacity-80 ${level === 0 ? 'text-blue-200' : 'text-blue-200'}`}>
              {data.role}
            </p>
          )}
          <h2 className={`font-bold ${level === 0 ? 'text-xl' : 'text-base'} ${level === 0 ? '' : 'truncate'}`}>
            {data.name}
          </h2>
          {!isDepartment && (
            <p className={`text-xs mt-1 ${level === 0 ? '' : 'truncate'} ${level === 0 ? 'text-gray-300' : level === 1 ? 'text-gray-300' : 'text-gray-600'}`}>
              {data.position}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Carrusel para departamentos con estilo corporativo
const DepartmentCarousel = ({ departments }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalDepartments = departments.length;

  const nextDepartment = () => {
    setActiveIndex((current) => (current + 1) % totalDepartments);
  };

  const prevDepartment = () => {
    setActiveIndex((current) => (current - 1 + totalDepartments) % totalDepartments);
  };

  const handleCardClick = () => {
    nextDepartment();
  };
  
  return (
    <div className="relative py-2">
      <div className="relative">
        {/* Controles de navegación */}
        <div className="flex justify-between absolute top-1/2 left-0 right-0 transform -translate-y-1/2 z-10 px-1">
          <button
            onClick={prevDepartment}
            className="bg-white rounded-sm p-1.5 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Departamento anterior"
          >
            <IoArrowBackOutline className="h-3.5 w-3.5 text-gray-600" />
          </button>
          <button
            onClick={nextDepartment}
            className="bg-white rounded-sm p-1.5 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Siguiente departamento"
          >
            <IoArrowForwardOutline className="h-3.5 w-3.5 text-gray-600" />
          </button>
        </div>
        
        {/* Tarjeta actual con animación */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <CorporateNodeCard 
              data={departments[activeIndex]} 
              level={2}
              isDepartment={true} 
              onClick={handleCardClick}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Indicadores de carrusel */}
      <div className="flex justify-center mt-3 space-x-1">
        {departments.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-1 rounded-none transition-all ${
              activeIndex === index ? 'w-6 bg-blue-600' : 'w-3 bg-gray-300'
            }`}
            aria-label={`Ver departamento ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// Componente de rama para el árbol corporativo
const CorporateBranch = ({ branchType = "vertical", className = "" }) => {
  const getBranchStyle = () => {
    switch(branchType) {
      case "horizontal":
        return "w-full h-px bg-gray-300";
      case "vertical":
        return "w-px h-full bg-gray-300 mx-auto";
      case "vertical-thick":
        return "w-0.5 h-full bg-gray-400 mx-auto";
      default:
        return "w-px h-full bg-gray-300 mx-auto";
    }
  };

  return (
    <div className={`${getBranchStyle()} ${className}`}></div>
  );
};

// Sección para CEO
const CEOSection = ({ data }) => {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="w-64 relative">
        <CorporateNodeCard data={data} level={0} />
      </div>
      <CorporateBranch branchType="vertical" className="h-12" />
    </div>
  );
};

// Sección para socios
const PartnersSection = ({ partners }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-center mb-6">
        <CorporateBranch branchType="horizontal" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {partners.map((partner, index) => (
          <PartnerBranch key={index} partner={partner} />
        ))}
      </div>
    </div>
  );
};

// Sección de rama para cada socio
const PartnerBranch = ({ partner }) => {
  return (
    <div className="flex flex-col items-center">
      <CorporateBranch branchType="vertical" className="h-10" />
      <div className="w-full max-w-xs relative mb-4">
        <CorporateNodeCard data={partner} level={1} />
      </div>
      <CorporateBranch branchType="vertical" className="h-6" />
      <DepartmentCarousel departments={partner.departments} />
    </div>
  );
};

// Sección informativa
const InfoSection = () => {
  const [expandedInfo, setExpandedInfo] = useState(true);
  
  return (
    <div className="mt-12 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b border-gray-300 pb-2 mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <div className="bg-gray-900 p-1.5 rounded-sm mr-2 text-white">
            <IoBusinessOutline className="h-5 w-5" />
          </div>
          Acerca de nuestra estructura
        </h2>
        <button 
          onClick={() => setExpandedInfo(!expandedInfo)}
          className="bg-white rounded-sm p-1.5 shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          {expandedInfo ? (
            <IoChevronUpOutline className="h-4 w-4 text-gray-600" />
          ) : (
            <IoChevronDownOutline className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>
      
      <AnimatePresence>
        {expandedInfo && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-6">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                Cliquéalo de México opera bajo un liderazgo colaborativo encabezado por nuestro Presidente y CEO,
                con tres socios directores que lideran áreas estratégicas clave para garantizar 
                la excelencia en todos nuestros servicios.
              </p>
              
              <div>
                <h3 className="text-base font-medium text-gray-800 mb-3">
                  Cada área cuenta con departamentos especializados que trabajan de manera sinérgica:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-sm shadow-md border-l-4 border-blue-400">
                    <div className="flex items-center mb-2">
                      <div className="bg-blue-400 p-2 rounded-sm mr-2">
                        <IoStorefrontOutline className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-sm text-gray-800">Ventas operativas</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">Gestión comercial, créditos y captura de datos para una atención óptima.</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-sm shadow-md border-l-4 border-blue-400">
                    <div className="flex items-center mb-2">
                      <div className="bg-blue-400 p-2 rounded-sm mr-2">
                        <IoCodeOutline className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-sm text-gray-800">Tecnología e innovación</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">Desarrollo de software, herramientas internas y el proyecto CliqueATools.</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-sm shadow-md border-l-4 border-blue-400">
                    <div className="flex items-center mb-2">
                      <div className="bg-blue-400 p-2 rounded-sm mr-2">
                        <IoTvOutline className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-sm text-gray-800">Medios audiovisuales</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">Creación de contenidos, estudio de producción y estrategias de marketing.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-sm border-l-4 border-gray-800">
                <p className="text-gray-700 italic text-sm sm:text-base">
                  Esta estructura organizacional nos permite mantener un enfoque centrado en el cliente,
                  con una toma de decisiones ágil y un fuerte compromiso con la innovación.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente principal del organigrama corporativo
const OrganizationChart = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 bg-white rounded-sm shadow-md border border-gray-200">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
          <div className="bg-gray-900 p-2 rounded-sm mr-3 text-white flex-shrink-0">
            <IoGitNetworkOutline className="h-6 w-6" />
          </div>
          <span>
            Estructura Organizacional
          </span>
        </h1>
        <p className="text-blue-600 text-sm sm:text-base font-medium">Cliquéalo de México</p>
      </motion.div>
      
      <div className="px-4 py-6 bg-white rounded-sm shadow-inner border border-gray-200 mb-8">
        <div className="relative">
          {/* Estructura del árbol corporativo */}
          <CEOSection data={organizationData.ceo} />
          <PartnersSection partners={organizationData.partners} />
        </div>
      </div>

      {/* Sección informativa */}
      <InfoSection />
    </div>
  );
};

export default OrganizationChart