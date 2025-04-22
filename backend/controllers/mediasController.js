const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { uploadFile, deleteFile } = require('../config/cloudinary');
const { sequelize } = require('../config/configDB');
const authMiddleware = require('../middleware/authMiddleware');

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

// Definir la ruta del directorio de uploads
const uploadDir = path.join(__dirname, '..', 'tmp', 'uploads');

// Asegurar que existe el directorio tmp/uploads usando fs-extra
try {
  fs.ensureDirSync(uploadDir);
  console.log('✅ Directorio de uploads verificado:', uploadDir);
} catch (error) {
  console.error('❌ Error al crear directorio temporal:', error);
}

// Ruta de prueba sin autenticación para diagnóstico
router.post('/test-upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha proporcionado un archivo' });
    }

    const filePath = req.file.path;
    
    // Opciones específicas para la carga
    const options = {
      folder: 'test-uploads',
      resource_type: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
    };

    // Subir a Cloudinary
    const cloudinaryResult = await uploadFile(filePath, options);
    
    // Eliminar archivo temporal después de subir
    await fs.remove(filePath);
    console.log(`✅ Archivo temporal eliminado: ${filePath}`);
    
    // Responder con los datos del archivo
    res.status(201).json({
      message: 'Archivo subido correctamente (prueba)',
      url: cloudinaryResult.url,
      public_id: cloudinaryResult.public_id,
      formato: cloudinaryResult.format,
      tamano: cloudinaryResult.bytes
    });
  } catch (error) {
    console.error('Error en test-upload:', error);
    res.status(500).json({
      message: 'Error al subir el archivo en prueba',
      error: error.message
    });
  }
});

// Middleware de autenticación para el resto de las rutas
router.use(authMiddleware);

/**
 * Subir un archivo a Cloudinary
 * POST /api/media/upload
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha proporcionado un archivo' });
    }

    const filePath = req.file.path;
    const vehiculoId = req.body.vehiculo_id;
    const esPrincipal = req.body.es_principal === 'true';
    const orden = parseInt(req.body.orden || '0');
    
    // Determinar tipo de archivo
    let tipoMedia = 'foto';
    if (req.file.mimetype.startsWith('video/')) {
      tipoMedia = 'video';
    } else if (!req.file.mimetype.startsWith('image/')) {
      tipoMedia = 'raw';
    }

    // Opciones específicas para la carga
    const options = {
      folder: `vehiculos/${vehiculoId || 'temp'}`,
      resource_type: tipoMedia === 'video' ? 'video' : 'image',
    };

    // Subir a Cloudinary
    const cloudinaryResult = await uploadFile(filePath, options);
    
    // Eliminar archivo temporal después de subir
    await fs.unlink(filePath);
    
    // Guardar en la base de datos en una transacción
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Insertar en archivos.medias
      const [mediaInsertResult] = await sequelize.query(`
        INSERT INTO archivos.medias (
          tipo_media, public_id, url, formato, tamano_bytes, 
          ancho, alto, duracion, metadata, creado_por
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING id_media
      `, {
        replacements: [
          tipoMedia,
          cloudinaryResult.public_id,
          cloudinaryResult.url,
          cloudinaryResult.format,
          cloudinaryResult.bytes,
          cloudinaryResult.width,
          cloudinaryResult.height,
          cloudinaryResult.duration || null,
          JSON.stringify(cloudinaryResult),
          req.usuario.id_usuario
        ],
        transaction
      });
      
      const idMedia = mediaInsertResult[0].id_media;
      
      // 2. Si se proporcionó un vehiculo_id, vincular con el vehículo
      if (vehiculoId) {
        // Si es principal, actualizar otros archivos para que no sean principales
        if (esPrincipal) {
          await sequelize.query(`
            UPDATE archivos.vehiculo_medias
            SET es_principal = false
            WHERE id_vehiculo = ?
          `, {
            replacements: [vehiculoId],
            transaction
          });
        }
        
        // Insertar la relación
        await sequelize.query(`
          INSERT INTO archivos.vehiculo_medias (
            id_vehiculo, id_media, es_principal, orden, creado_por
          ) VALUES (?, ?, ?, ?, ?)
        `, {
          replacements: [
            vehiculoId,
            idMedia,
            esPrincipal,
            orden,
            req.usuario.id_usuario
          ],
          transaction
        });
      }
      
      await transaction.commit();
      
      // Responder con los datos del archivo
      res.status(201).json({
        id: idMedia,
        url: cloudinaryResult.url,
        public_id: cloudinaryResult.public_id,
        tipo: tipoMedia,
        formato: cloudinaryResult.format,
        tamano: cloudinaryResult.bytes,
        ancho: cloudinaryResult.width,
        alto: cloudinaryResult.height,
        duracion: cloudinaryResult.duration,
        es_principal: esPrincipal,
        orden: orden
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Error al guardar en base de datos:', error);
      
      // Intentar eliminar el archivo de Cloudinary si falló la BD
      try {
        await deleteFile(
          cloudinaryResult.public_id,
          tipoMedia === 'video' ? 'video' : 'image'
        );
      } catch (deleteError) {
        console.error('Error adicional al limpiar de Cloudinary:', deleteError);
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error en upload:', error);
    res.status(500).json({
      message: 'Error al subir el archivo',
      error: error.message
    });
  }
});

/**
 * Obtener archivos de un vehículo
 * GET /api/media/vehiculo/:id
 */
router.get('/vehiculo/:id', async (req, res) => {
  try {
    const vehiculoId = req.params.id;
    
    const [result] = await sequelize.query(`
      SELECT 
        m.id_media, m.tipo_media, m.public_id, m.url, 
        m.formato, m.tamano_bytes, m.ancho, m.alto, m.duracion,
        vm.es_principal, vm.orden
      FROM archivos.medias m
      JOIN archivos.vehiculo_medias vm ON m.id_media = vm.id_media
      WHERE vm.id_vehiculo = ?
      ORDER BY vm.es_principal DESC, vm.orden ASC
    `, {
      replacements: [vehiculoId]
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error al obtener archivos del vehículo:', error);
    res.status(500).json({
      message: 'Error al obtener archivos',
      error: error.message
    });
  }
});

/**
 * Eliminar un archivo
 * DELETE /api/media/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const mediaId = req.params.id;
    
    // Obtener detalles del archivo
    const [mediaResult] = await sequelize.query(`
      SELECT id_media, tipo_media, public_id 
      FROM archivos.medias 
      WHERE id_media = ?
    `, {
      replacements: [mediaId]
    });
    
    if (mediaResult.length === 0) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
    
    const media = mediaResult[0];
    const resourceType = media.tipo_media === 'video' ? 'video' : 'image';
    
    // Eliminar de Cloudinary
    await deleteFile(media.public_id, resourceType);
    
    // Eliminar de la base de datos (las relaciones se eliminarán en cascada)
    await sequelize.query(`
      DELETE FROM archivos.medias WHERE id_media = ?
    `, {
      replacements: [mediaId]
    });
    
    res.json({ message: 'Archivo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({
      message: 'Error al eliminar archivo',
      error: error.message
    });
  }
});

/**
 * Cambiar orden o estado principal de un archivo
 * PATCH /api/media/:id/vehiculo/:vehiculoId
 */
router.patch('/:id/vehiculo/:vehiculoId', async (req, res) => {
  try {
    const mediaId = req.params.id;
    const vehiculoId = req.params.vehiculoId;
    const { es_principal, orden } = req.body;
    
    const transaction = await sequelize.transaction();
    
    try {
      // Si se marca como principal, actualizar otros archivos
      if (es_principal) {
        await sequelize.query(`
          UPDATE archivos.vehiculo_medias
          SET es_principal = false
          WHERE id_vehiculo = ?
        `, {
          replacements: [vehiculoId],
          transaction
        });
      }
      
      // Actualizar este archivo
      await sequelize.query(`
        UPDATE archivos.vehiculo_medias
        SET 
          es_principal = COALESCE(?, es_principal),
          orden = COALESCE(?, orden)
        WHERE id_vehiculo = ? AND id_media = ?
      `, {
        replacements: [
          es_principal !== undefined ? es_principal : null,
          orden !== undefined ? orden : null,
          vehiculoId,
          mediaId
        ],
        transaction
      });
      
      await transaction.commit();
      
      res.json({ message: 'Archivo actualizado correctamente' });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error al actualizar archivo:', error);
    res.status(500).json({
      message: 'Error al actualizar archivo',
      error: error.message
    });
  }
});

module.exports = router;