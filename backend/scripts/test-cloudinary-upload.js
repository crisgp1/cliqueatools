/**
 * Script para probar la carga de una imagen a Cloudinary
 * 
 * Este script:
 * 1. Carga una imagen de prueba a Cloudinary
 * 2. Muestra la URL de la imagen cargada
 * 3. Elimina la imagen de prueba (opcional)
 * 
 * Uso:
 * node scripts/test-cloudinary-upload.js [ruta-imagen] [eliminar]
 * 
 * Ejemplos:
 * - node scripts/test-cloudinary-upload.js ./test-image.jpg
 * - node scripts/test-cloudinary-upload.js ./test-image.jpg true
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { uploadFile, deleteFile } = require('../config/cloudinary');

// URL de imagen de prueba en línea (logo de Cloudinary)
const TEST_IMAGE_URL = 'https://res.cloudinary.com/cloudinary/image/upload/cloudinary_logo.png';

// Función para descargar una imagen de prueba si no se proporciona una
async function downloadTestImage() {
  console.log('Descargando imagen de prueba...');
  
  const tempDir = path.join(__dirname, '..', 'tmp', 'uploads');
  const tempImagePath = path.join(tempDir, 'test-image-temp.jpg');
  
  // Asegurarse de que el directorio temporal existe
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  try {
    // Intentar usar axios para descargar la imagen
    try {
      const axios = require('axios');
      const response = await axios.get(TEST_IMAGE_URL, { responseType: 'arraybuffer' });
      fs.writeFileSync(tempImagePath, Buffer.from(response.data));
      return tempImagePath;
    } catch (axiosError) {
      // Si axios falla o no está instalado, usar https nativo
      console.log('Usando método alternativo para descargar la imagen...');
      
      return new Promise((resolve, reject) => {
        const https = require('https');
        const file = fs.createWriteStream(tempImagePath);
        
        https.get(TEST_IMAGE_URL, (response) => {
          response.pipe(file);
          
          file.on('finish', () => {
            file.close();
            resolve(tempImagePath);
          });
        }).on('error', (err) => {
          fs.unlink(tempImagePath, () => {});
          reject(err);
        });
      });
    }
  } catch (error) {
    console.error('Error al descargar la imagen de prueba:', error.message);
    console.log('Por favor, proporcione una imagen de prueba manualmente.');
    process.exit(1);
  }
}

async function testCloudinaryUpload() {
  try {
    console.log('🚀 Iniciando prueba de carga a Cloudinary...\n');
    
    // Obtener argumentos
    const imagePath = process.argv[2] || await downloadTestImage();
    const shouldDelete = process.argv[3] === 'true';
    
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ Error: La imagen "${imagePath}" no existe`);
      process.exit(1);
    }
    
    console.log(`📁 Usando imagen: ${imagePath}`);
    
    // Subir imagen a Cloudinary
    console.log('⏳ Subiendo imagen a Cloudinary...');
    const uploadOptions = {
      folder: 'test',
      public_id: `test-upload-${Date.now()}`
    };
    
    const result = await uploadFile(imagePath, uploadOptions);
    
    console.log('\n✅ Imagen subida correctamente:');
    console.log('📋 Detalles:');
    console.log(`   - URL: ${result.url}`);
    console.log(`   - Public ID: ${result.public_id}`);
    console.log(`   - Formato: ${result.format}`);
    console.log(`   - Tamaño: ${(result.bytes / 1024).toFixed(2)} KB`);
    console.log(`   - Dimensiones: ${result.width}x${result.height} px`);
    
    // Eliminar imagen si se solicita
    if (shouldDelete) {
      console.log('\n⏳ Eliminando imagen de prueba...');
      await deleteFile(result.public_id);
      console.log('✅ Imagen eliminada correctamente');
    } else {
      console.log('\n💡 La imagen de prueba permanecerá en Cloudinary');
      console.log('   Para eliminarla, ejecute el script con el parámetro "true":');
      console.log(`   node scripts/test-cloudinary-upload.js ${imagePath} true`);
    }
    
    console.log('\n🎉 Prueba completada con éxito!');
    console.log('   La integración con Cloudinary funciona correctamente');
    
  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error.message);
    console.error('   Detalles:', error);
    process.exit(1);
  }
}

// Ejecutar prueba
testCloudinaryUpload();