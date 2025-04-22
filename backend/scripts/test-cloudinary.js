require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('Iniciando prueba de conexión a Cloudinary...');
console.log('Variables de entorno:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '[CONFIGURADO]' : '[NO CONFIGURADO]');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '[CONFIGURADO]' : '[NO CONFIGURADO]');

// Configuración manual para pruebas
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Prueba simple de ping
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error('Error al conectar con Cloudinary:', error);
    process.exit(1);
  } else {
    console.log('Conexión exitosa a Cloudinary:', result);
    process.exit(0);
  }
});