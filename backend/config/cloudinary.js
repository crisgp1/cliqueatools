const cloudinary = require('cloudinary').v2;

// Configurar con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'cliqueatools',
  api_key: process.env.CLOUDINARY_API_KEY || '916231453571933',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'juONTFLEVV6HxhxN3j2Y-fesZjs',
  secure: true
});

/**
 * Función para subir archivo a Cloudinary
 * @param {string} filePath - Ruta al archivo temporal
 * @param {Object} options - Opciones adicionales (folder, transformation)
 * @returns {Promise<Object>} - Resultado de la subida
 */
const uploadFile = async (filePath, options = {}) => {
  try {
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
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);
    
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
    console.error('Error al subir a Cloudinary:', error);
    throw new Error(`Error en la subida a Cloudinary: ${error.message}`);
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
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Error al eliminar de Cloudinary:', error);
    throw new Error(`Error al eliminar de Cloudinary: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadFile,
  deleteFile
};