/**
 * Vehicle Service - Punto de entrada del microservicio
 * Sigue la arquitectura hexagonal (puertos y adaptadores)
 */

// Dependencias
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Repositorios
const InMemoryVehicleRepository = require('./infrastructure/adapters/persistence/InMemoryVehicleRepository');
const PostgreSQLVehicleRepository = require('./infrastructure/adapters/persistence/PostgreSQLVehicleRepository');
// Casos de uso
const GetAllVehicles = require('./application/use-cases/GetAllVehicles');
const GetVehicleById = require('./application/use-cases/GetVehicleById');
const CreateVehicle = require('./application/use-cases/CreateVehicle');
const UpdateVehicle = require('./application/use-cases/UpdateVehicle');
const DeleteVehicle = require('./application/use-cases/DeleteVehicle');

// Controlador y rutas
const VehicleController = require('./interface/controllers/VehicleController');
const vehicleRoutes = require('./interface/routes/vehicleRoutes');

// Configuración
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Determinar qué repositorio usar basado en las variables de entorno
let vehicleRepository;
if (process.env.USE_IN_MEMORY_DB === 'true') {
  console.log('Usando repositorio en memoria para vehículos');
  vehicleRepository = new InMemoryVehicleRepository();
} else {
  console.log('Usando repositorio PostgreSQL para vehículos');
  vehicleRepository = new PostgreSQLVehicleRepository();
}

// Inicializar casos de uso
const useCases = {
  getAllVehicles: new GetAllVehicles(vehicleRepository),
  getVehicleById: new GetVehicleById(vehicleRepository),
  createVehicle: new CreateVehicle(vehicleRepository),
  updateVehicle: new UpdateVehicle(vehicleRepository),
  deleteVehicle: new DeleteVehicle(vehicleRepository)
};

// Inicializar controlador
const vehicleController = new VehicleController(useCases);

// Configurar rutas
const apiRouter = express.Router();

// Ruta raíz - información del servicio
app.get('/', (req, res) => {
  res.json({ service: 'vehicle-service', status: 'running' });
});

// Rutas de la API
apiRouter.use('/vehicles', vehicleRoutes(vehicleController));
app.use('/api', apiRouter);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`vehicle-service running on port ${PORT}`);
  
  // Agregar vehículos de ejemplo para desarrollo si es necesario
  if (process.env.NODE_ENV === 'development') {
    vehicleRepository.addSampleVehicles()
      .then(() => {
        console.log('Sample vehicles added successfully');
      })
      .catch(error => {
        console.error('Error adding sample vehicles:', error);
      });
  }
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});