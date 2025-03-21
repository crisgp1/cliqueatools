import { useState } from 'react';

const VehicleForm = ({ vehicles, onAddVehicle, onUpdateVehicle, onRemoveVehicle }) => {
  const [newVehicle, setNewVehicle] = useState({
    descripcion: '',
    marca: '',
    modelo: '',
    año: new Date().getFullYear(),
    valor: 300000
  });

  // Generar ID único
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Manejar cambios en el formulario de nuevo vehículo
  const handleNewVehicleChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle({
      ...newVehicle,
      [name]: name === 'valor' || name === 'año' ? Number(value) : value
    });
  };

  // Manejar submit del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Verificar que los campos obligatorios estén completos
    if (!newVehicle.descripcion || !newVehicle.marca || !newVehicle.modelo || !newVehicle.valor) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    
    // Agregar el nuevo vehículo
    onAddVehicle({
      ...newVehicle,
      id: generateId()
    });
    
    // Limpiar el formulario
    setNewVehicle({
      descripcion: '',
      marca: '',
      modelo: '',
      año: new Date().getFullYear(),
      valor: 300000
    });
  };

  return (
    <div className="space-y-8">
      <div className="govuk-form-section">
        <h3 className="govuk-form-section-title">Agregar nuevo vehículo</h3>
        <form onSubmit={handleSubmit}>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label htmlFor="descripcion" className="govuk-label">
                  Descripción <span className="text-royal-red">*</span>
                </label>
                <input
                  type="text"
                  id="descripcion"
                  name="descripcion"
                  value={newVehicle.descripcion}
                  onChange={handleNewVehicleChange}
                  className="govuk-input"
                  required
                />
                <span className="govuk-form-hint">Nombre o descripción breve del vehículo</span>
              </div>
            </div>
            
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label htmlFor="marca" className="govuk-label">
                  Marca <span className="text-royal-red">*</span>
                </label>
                <input
                  type="text"
                  id="marca"
                  name="marca"
                  value={newVehicle.marca}
                  onChange={handleNewVehicleChange}
                  className="govuk-input"
                  required
                />
              </div>
            </div>
            
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label htmlFor="modelo" className="govuk-label">
                  Modelo <span className="text-royal-red">*</span>
                </label>
                <input
                  type="text"
                  id="modelo"
                  name="modelo"
                  value={newVehicle.modelo}
                  onChange={handleNewVehicleChange}
                  className="govuk-input"
                  required
                />
              </div>
            </div>
            
            <div className="govuk-grid-column-one-half">
              <div className="govuk-form-group">
                <label htmlFor="año" className="govuk-label">
                  Año
                </label>
                <input
                  type="number"
                  id="año"
                  name="año"
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  value={newVehicle.año}
                  onChange={handleNewVehicleChange}
                  className="govuk-input"
                />
              </div>
            </div>
            
            <div className="govuk-grid-column-full">
              <div className="govuk-form-group">
                <label htmlFor="valor" className="govuk-label">
                  Valor del vehículo <span className="text-royal-red">*</span>
                </label>
                
                <div className="relative mb-2">
                  <div className="govuk-input-prefix">$</div>
                  <input
                    type="number"
                    id="valor"
                    name="valor"
                    min="50000"
                    max="3000000"
                    step="10000"
                    value={newVehicle.valor}
                    onChange={handleNewVehicleChange}
                    className="govuk-input govuk-input-with-prefix text-right"
                    required
                  />
                </div>
                
                <div className="mb-1 flex justify-between text-sm text-royal-gray-600">
                  <span>$50,000</span>
                  <span>$3,000,000</span>
                </div>
                
                <input
                  type="range"
                  min="50000"
                  max="3000000"
                  step="10000"
                  value={newVehicle.valor}
                  onChange={(e) => handleNewVehicleChange({ target: { name: 'valor', value: e.target.value } })}
                  className="govuk-slider"
                />
                
                <div className="text-base text-royal-black mt-2 text-right">
                  <span className="font-bold">{formatCurrency(newVehicle.valor)}</span>
                </div>
              </div>
            </div>
            
            <div className="govuk-grid-column-full flex justify-end mt-4">
              <button
                type="submit"
                className="govuk-button flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Agregar vehículo
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {vehicles.length > 0 && (
        <div className="govuk-form-section">
          <h3 className="govuk-form-section-title">Vehículos en el lote ({vehicles.length})</h3>
          <div className="overflow-x-auto">
            <table className="govuk-table">
              <thead>
                <tr>
                  <th scope="col" className="govuk-table__header">Descripción</th>
                  <th scope="col" className="govuk-table__header">Marca/Modelo</th>
                  <th scope="col" className="govuk-table__header">Año</th>
                  <th scope="col" className="govuk-table__header">Valor</th>
                  <th scope="col" className="govuk-table__header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="govuk-table__cell">
                      {vehicle.descripcion}
                    </td>
                    <td className="govuk-table__cell">
                      {vehicle.marca} {vehicle.modelo}
                    </td>
                    <td className="govuk-table__cell">
                      {vehicle.año}
                    </td>
                    <td className="govuk-table__cell">
                      {formatCurrency(vehicle.valor)}
                    </td>
                    <td className="govuk-table__cell text-right">
                      <button
                        onClick={() => onRemoveVehicle(vehicle.id)}
                        className="text-royal-red hover:text-royal-red/80"
                        title="Eliminar vehículo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td colSpan="3" className="govuk-table__cell text-right">
                    Valor total:
                  </td>
                  <td colSpan="2" className="govuk-table__cell">
                    {formatCurrency(vehicles.reduce((sum, vehicle) => sum + vehicle.valor, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleForm;