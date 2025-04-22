/**
 * Script para probar la carga de archivos con autenticación
 * 
 * Este script prueba tanto la ruta protegida como la ruta de prueba
 * para verificar que la autenticación funciona correctamente.
 * 
 * Uso:
 * node scripts/test-auth-upload.js
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Configuración
const API_URL = 'http://localhost:3000/api/media'; // Ajustar según tu configuración
const TEST_IMAGE_PATH = path.join(__dirname, '../tmp/test-image.jpg'); // Ajustar a una imagen de prueba
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''; // Token de autenticación (obtener de localStorage en el navegador)

// Crear una imagen de prueba si no existe
const createTestImage = async () => {
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.log('Creando imagen de prueba...');
    
    // Asegurar que existe el directorio
    const dir = path.dirname(TEST_IMAGE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Copiar una imagen de ejemplo o crear una imagen básica
    // Aquí simplemente creamos un archivo vacío para la prueba
    fs.writeFileSync(TEST_IMAGE_PATH, 'Test image content');
    
    console.log(`Imagen de prueba creada en: ${TEST_IMAGE_PATH}`);
  }
};

// Probar la ruta protegida con autenticación
const testAuthenticatedUpload = async () => {
  console.log('\n--- Probando carga con autenticación ---');
  
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(TEST_IMAGE_PATH));
    formData.append('es_principal', 'true');
    formData.append('orden', '0');
    
    const response = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    console.log('✅ Carga con autenticación exitosa:');
    console.log(`URL: ${response.data.url}`);
    console.log(`ID: ${response.data.id}`);
  } catch (error) {
    console.error('❌ Error en carga con autenticación:');
    console.error(`Status: ${error.response?.status}`);
    console.error(`Mensaje: ${error.response?.data?.message || error.message}`);
    console.error('Detalles:', error.response?.data);
  }
};

// Probar la ruta de prueba sin autenticación
const testUnauthenticatedUpload = async () => {
  console.log('\n--- Probando carga sin autenticación (ruta de prueba) ---');
  
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(TEST_IMAGE_PATH));
    
    const response = await axios.post(`${API_URL}/test-upload`, formData, {
      headers: formData.getHeaders()
    });
    
    console.log('✅ Carga sin autenticación exitosa:');
    console.log(`URL: ${response.data.url}`);
    console.log(`Mensaje: ${response.data.message}`);
  } catch (error) {
    console.error('❌ Error en carga sin autenticación:');
    console.error(`Status: ${error.response?.status}`);
    console.error(`Mensaje: ${error.response?.data?.message || error.message}`);
  }
};

// Función principal
const main = async () => {
  try {
    console.log('Iniciando pruebas de carga de archivos...');
    
    // Verificar token
    if (!AUTH_TOKEN) {
      console.warn('⚠️ No se ha proporcionado un token de autenticación.');
      console.warn('La prueba con autenticación probablemente fallará.');
      console.warn('Establece la variable de entorno AUTH_TOKEN o modifica este script.');
    }
    
    // Crear imagen de prueba
    await createTestImage();
    
    // Ejecutar pruebas
    await testUnauthenticatedUpload();
    await testAuthenticatedUpload();
    
    console.log('\n--- Pruebas completadas ---');
  } catch (error) {
    console.error('Error general en las pruebas:', error);
  }
};

// Ejecutar script
main();