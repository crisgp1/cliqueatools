    const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000';
const LOGIN_ENDPOINT = '/api/usuarios/login';
const VEHICLE_ENDPOINT = '/api/vehiculos';

// Test user credentials
const credentials = {
  usuario: 'cristiangp2001', // Use the username from the logs
  password: 'password123'    // This is a guess, replace with actual password
};

// Test vehicle data
const vehicleData = {
  marca: 'FORD',
  modelo: 'MUSTANG',
  anio: 2025,
  valor: 49000,
  precio_lista: 49000,
  descripcion: 'Vehículo de prueba',
  color_exterior: 'ROJO',
  tipo_vehiculo: 'automovil',
  num_serie: '12345',
  transmision: 'manual',
  combustible: 'gasolina',
  odometro: 0,
  condicion: 'usado',
  origen: 'nacional',
  adquisicion: 'compra_directa',
  estatus_legal: 'limpio',
  disponible: true
};

// Login and then create a vehicle
async function testVehicleCreation() {
  try {
    console.log('Attempting to login...');
    const loginResponse = await axios.post(`${API_URL}${LOGIN_ENDPOINT}`, credentials);
    
    if (!loginResponse.data.success) {
      console.error('Login failed:', loginResponse.data.mensaje);
      return;
    }
    
    console.log('Login successful!');
    const token = loginResponse.data.data.token;
    
    console.log('Attempting to create a vehicle...');
    const vehicleResponse = await axios.post(
      `${API_URL}${VEHICLE_ENDPOINT}`,
      vehicleData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Vehicle creation response:', JSON.stringify(vehicleResponse.data, null, 2));
    
    if (vehicleResponse.data.success) {
      console.log('Vehicle created successfully!');
    } else {
      console.error('Vehicle creation failed:', vehicleResponse.data.mensaje);
    }
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
testVehicleCreation();
