const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { uploadFile, deleteFile } = require('../config/cloudinary');
const { sequelize } = require('../config/configDB');

// Definir la ruta del directorio de uploads
const uploadDir = path.join(__dirname, '..', 'tmp', 'uploads');

// Asegurar que existe el directorio tmp/uploads usando fs-extra
try {
  fs.ensureDirSync(uploadDir);
  console.log('✅ Directorio de uploads para pruebas verificado:', uploadDir);
} catch (error) {
  console.error('❌ Error al crear directorio temporal para pruebas:', error);
}

// Configuración de multer para almacenamiento temporal
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Asegurar que el directorio existe antes de cada subida
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
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

// Ruta de prueba sin autenticación
router.post('/upload-test', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha proporcionado un archivo' });
    }

    const filePath = req.file.path;
    
    // En vez de usar req.usuario.id_usuario, usa un valor fijo para pruebas
    const testUserId = '00000000-0000-0000-0000-000000000000'; 
    
    // Determinar tipo de archivo
    let tipoMedia = 'foto';
    if (req.file.mimetype.startsWith('video/')) {
      tipoMedia = 'video';
    } else if (!req.file.mimetype.startsWith('image/')) {
      tipoMedia = 'raw';
    }
    
    // Opciones específicas para la carga
    const options = {
      folder: `test-uploads`,
      resource_type: tipoMedia === 'video' ? 'video' : 'image',
    };

    // Subir a Cloudinary
    const cloudinaryResult = await uploadFile(filePath, options);
    
    // Eliminar archivo temporal después de subir
    await fs.remove(filePath);
    console.log(`✅ Archivo temporal eliminado: ${filePath}`);
    
    // Responder con los datos del archivo sin guardar en BD
    res.status(201).json({
      message: 'Archivo subido correctamente (prueba)',
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
    console.error('Error en upload-test:', error);
    res.status(500).json({
      message: 'Error al subir el archivo (prueba)',
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;