const cloudinary = require('cloudinary').v2;
const fs = require('fs-extra');

// Configuración con variables de entorno CORRECTAS
// Nota: Verifica estos valores en tu dashboard de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Verificar configuración
console.log('Cloudinary configurado con:', {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKeyConfigured: !!process.env.CLOUDINARY_API_KEY,
  apiSecretConfigured: !!process.env.CLOUDINARY_API_SECRET
});

// Función de prueba de conexión
const testConnection = async () => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.api.ping((error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
    console.log('Conexión a Cloudinary exitosa:', result);
    return true;
  } catch (error) {
    console.error('Error conectando a Cloudinary:', error);
    return false;
  }
};

/**
 * Función para subir archivo a Cloudinary
 * @param {string} filePath - Ruta al archivo temporal
 * @param {Object} options - Opciones adicionales (folder, transformation)
 * @returns {Promise<Object>} - Resultado de la subida
 */
const uploadFile = async (filePath, options = {}) => {
  try {
    // Verificar que el archivo existe
    const fileExists = await fs.pathExists(filePath);
    if (!fileExists) {
      throw new Error(`El archivo no existe en la ruta: ${filePath}`);
    }

    // Opciones por defecto
    const defaultOptions = {
      folder: 'vehiculos',
      resource_type: 'auto',
      // Transformaciones por defecto
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    };

    const uploadOptions = { ...defaultOptions, ...options };
    console.log(`Subiendo archivo a Cloudinary: ${filePath}`, uploadOptions);
    
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    console.log(`✅ Archivo subido exitosamente a Cloudinary: ${result.public_id}`);
    
    return {
      public_id: result.public_id,
      url: result.secure_url,
      format: result.format,
      resource_type: result.resource_type,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      duration: result.duration,
      created_at: result.created_at
    };
  } catch (error) {
    console.error('❌ Error al subir a Cloudinary:', error);
    
    // Mejorar el mensaje de error con más detalles
    let errorMessage = `Error en la subida a Cloudinary: ${error.message}`;
    
    if (error.http_code) {
      errorMessage += ` (HTTP ${error.http_code})`;
    }
    
    if (error.error && error.error.message) {
      errorMessage += ` - ${error.error.message}`;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Función para eliminar archivo de Cloudinary
 * @param {string} publicId - ID público del recurso
 * @param {string} resourceType - Tipo de recurso (image, video, raw)
 * @returns {Promise<Object>} - Resultado de la eliminación
 */
const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    console.log(`Eliminando archivo de Cloudinary: ${publicId} (tipo: ${resourceType})`);
    
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    
    if (result.result === 'ok' || result.result === 'not found') {
      console.log(`✅ Archivo eliminado de Cloudinary: ${publicId}`);
      return result;
    } else {
      throw new Error(`Resultado inesperado: ${result.result}`);
    }
  } catch (error) {
    console.error('❌ Error al eliminar de Cloudinary:', error);
    
    // Mejorar el mensaje de error con más detalles
    let errorMessage = `Error al eliminar de Cloudinary: ${error.message}`;
    
    if (error.http_code) {
      errorMessage += ` (HTTP ${error.http_code})`;
    }
    
    throw new Error(errorMessage);
  }
};

module.exports = {
  cloudinary,
  uploadFile,
  deleteFile,
  testConnection
};