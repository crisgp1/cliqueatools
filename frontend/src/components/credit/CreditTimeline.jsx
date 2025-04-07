import React from 'react';
import { 
  FaCarSide, 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaUniversity, // Changed from FaBuildingColumns to FaUniversity
  FaChartBar, 
  FaFileInvoiceDollar 
} from 'react-icons/fa';

const CreditTimeline = ({ currentStep = 1 }) => {
  const steps = [
    { id: 1, name: 'Vehículo', icon: <FaCarSide /> },
    { id: 2, name: 'Enganche', icon: <FaMoneyBillWave /> },
    { id: 3, name: 'Plazo', icon: <FaCalendarAlt /> },
    { id: 4, name: 'Bancos', icon: <FaUniversity /> }, // Changed icon
    { id: 5, name: 'Comparación', icon: <FaChartBar /> },
    { id: 6, name: 'Amortización', icon: <FaFileInvoiceDollar /> },
  ];

  return (
    <div className="mb-8">
      <div className="hidden md:block"> {/* Versión para pantallas medianas y grandes */}
        <div className="flex items-center justify-between w-full">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Paso */}
              <div className="flex flex-col items-center">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full
                  ${currentStep >= step.id ? 'bg-royal-black text-white' : 'bg-gray-200 text-gray-600'}
                  ${currentStep === step.id ? 'ring-4 ring-gray-300' : ''}
                `}>
                  {step.icon}
                </div>
                <p className={`
                  mt-2 text-xs font-medium
                  ${currentStep >= step.id ? 'text-royal-black' : 'text-gray-500'}
                `}>
                  {step.name}
                </p>
              </div>
              {/* Línea conectora entre pasos (excepto el último) */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div className={`
                    h-1
                    ${currentStep > step.id ? 'bg-royal-black' : 'bg-gray-200'}
                  `}></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Versión móvil para pantallas pequeñas */}
      <div className="block md:hidden">
        <div className="flex overflow-x-auto pb-3 hide-scrollbar">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center mr-6 last:mr-0 relative">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full
                ${currentStep >= step.id ? 'bg-royal-black text-white' : 'bg-gray-200 text-gray-500'}
                ${currentStep === step.id ? 'ring-2 ring-gray-300' : ''}
              `}>
                {step.icon}
              </div>
              <p className={`
                mt-1 text-xs font-medium
                ${currentStep >= step.id ? 'text-royal-black' : 'text-gray-500'}
              `}>
                {step.name}
              </p>
            </div>
          ))}
        </div>
        {/* Conectores móviles como componente separado para evitar problemas de posicionamiento */}
        <div className="relative h-0.5 mt-2">
          {steps.slice(0, -1).map((step, index) => (
            <div key={`connector-${step.id}`} className="absolute top-0" style={{ 
              left: `calc(${(index) * (100 / (steps.length - 1))}%)`, 
              right: `calc(${100 - ((index + 1) * (100 / (steps.length - 1)))}%)` 
            }}>
              <div className={`h-0.5 ${currentStep > step.id ? 'bg-royal-black' : 'bg-gray-200'}`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Estilo CSS para ocultar la barra de desplazamiento en móvil */}
      <style jsx="true">{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default CreditTimeline;