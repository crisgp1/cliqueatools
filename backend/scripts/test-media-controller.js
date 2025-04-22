/**
 * Controlador simplificado para pruebas de Cloudinary
 * Este script proporciona un servidor Express simple para probar la carga de archivos a Cloudinary
 * sin necesidad de autenticación.
 * 
 * Uso:
 * node scripts/test-media-controller.js
 */

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { uploadFile, deleteFile } = require('../config/cloudinary');
const { sequelize } = require('../config/configDB');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de multer para almacenamiento temporal
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'tmp/uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtro para aceptar solo imágenes y videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|webm/i;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Formato de archivo no soportado. Por favor sube imágenes (JPEG, PNG, GIF, WebP) o videos (MP4, MOV, AVI, WebM).'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB límite
});

// Asegurar que existe el directorio tmp/uploads
(async () => {
  try {
    await fs.mkdir('tmp/uploads', { recursive: true });
  } catch (error) {
    console.error('Error al crear directorio temporal:', error);
  }
})();

// Middleware para parsear JSON
app.use(express.json());

// Ruta para subir archivos
app.post('/api/test/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha proporcionado un archivo' });
    }

    const filePath = req.file.path;
    
    // Determinar tipo de archivo
    let tipoMedia = 'foto';
    if (req.file.mimetype.startsWith('video/')) {
      tipoMedia = 'video';
    } else if (!req.file.mimetype.startsWith('image/')) {
      tipoMedia = 'raw';
    }

    // Opciones específicas para la carga
    const options = {
      folder: `test`,
      resource_type: tipoMedia === 'video' ? 'video' : 'image',
    };

    // Subir a Cloudinary
    console.log('⏳ Subiendo archivo a Cloudinary...');
    const cloudinaryResult = await uploadFile(filePath, options);
    
    // Eliminar archivo temporal después de subir
    await fs.unlink(filePath);
    
    console.log('✅ Archivo subido correctamente');
    console.log('📋 Detalles:');
    console.log(`   - URL: ${cloudinaryResult.url}`);
    console.log(`   - Public ID: ${cloudinaryResult.public_id}`);
    console.log(`   - Formato: ${cloudinaryResult.format}`);
    console.log(`   - Tamaño: ${(cloudinaryResult.bytes / 1024).toFixed(2)} KB`);
    console.log(`   - Dimensiones: ${cloudinaryResult.width}x${cloudinaryResult.height} px`);
    
    // Responder con los datos del archivo
    res.status(201).json({
      url: cloudinaryResult.url,
      public_id: cloudinaryResult.public_id,
      tipo: tipoMedia,
      formato: cloudinaryResult.format,
      tamano: cloudinaryResult.bytes,
      ancho: cloudinaryResult.width,
      alto: cloudinaryResult.height,
      duracion: cloudinaryResult.duration
    });
  } catch (error) {
    console.error('Error en upload:', error);
    res.status(500).json({
      message: 'Error al subir el archivo',
      error: error.message
    });
  }
});

// Ruta para eliminar archivos
app.delete('/api/test/delete/:publicId', async (req, res) => {
  try {
    const publicId = req.params.publicId;
    const resourceType = req.query.type || 'image';
    
    console.log(`⏳ Eliminando archivo ${publicId}...`);
    await deleteFile(publicId, resourceType);
    
    console.log('✅ Archivo eliminado correctamente');
    res.json({ message: 'Archivo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({
      message: 'Error al eliminar archivo',
      error: error.message
    });
  }
});

// Ruta para probar la conexión
app.get('/api/test/status', async (req, res) => {
  try {
    // Probar conexión a Cloudinary
    const cloudinaryStatus = await cloudinary.api.ping();
    
    // Probar conexión a la base de datos
    let dbStatus = 'error';
    try {
      await sequelize.authenticate();
      dbStatus = 'ok';
    } catch (dbError) {
      console.error('Error al conectar con la base de datos:', dbError);
    }
    
    res.json({
      cloudinary: cloudinaryStatus.status,
      database: dbStatus,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error al verificar estado:', error);
    res.status(500).json({
      message: 'Error al verificar estado',
      error: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
🚀 Servidor de prueba iniciado en http://localhost:${PORT}

Rutas disponibles:
- POST /api/test/upload - Subir archivo (usar form-data con campo 'file')
- DELETE /api/test/delete/:publicId - Eliminar archivo
- GET /api/test/status - Verificar estado de conexiones

Para probar la carga de archivos con curl:
curl -X POST -F "file=@ruta/a/imagen.jpg" http://localhost:${PORT}/api/test/upload

Para probar la eliminación de archivos con curl:
curl -X DELETE http://localhost:${PORT}/api/test/delete/test/nombre_archivo

Presiona Ctrl+C para detener el servidor
`);
});