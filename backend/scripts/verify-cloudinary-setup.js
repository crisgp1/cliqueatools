/**
 * Script para verificar la configuración de Cloudinary
 * 
 * Este script verifica que:
 * 1. Las variables de entorno de Cloudinary estén configuradas
 * 2. La conexión con Cloudinary funcione correctamente
 * 3. El directorio temporal para subidas exista
 * 4. El esquema de base de datos para archivos esté creado
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { cloudinary } = require('../config/cloudinary');
const { sequelize } = require('../config/configDB');

// Verificar si el middleware de autenticación existe
async function checkAuthMiddleware() {
  const authMiddlewarePath = path.join(__dirname, '..', 'middleware', 'authMiddleware.js');
  const authPath = path.join(__dirname, '..', 'middleware', 'auth.js');
  
  try {
    await fs.access(authMiddlewarePath);
    console.log('✅ Middleware de autenticación encontrado');
    return true;
  } catch (error) {
    try {
      await fs.access(authPath);
      console.log('⚠️ Middleware authMiddleware.js no encontrado, pero auth.js existe');
      console.log('   Creando authMiddleware.js...');
      
      const content = `/**
 * Middleware de autenticación para la API de medios
 * Este archivo reexporta el middleware de autenticación de auth.js
 */

const { verificarToken } = require('./auth');

// Exportar el middleware de verificación de token como middleware por defecto
module.exports = verificarToken;`;
      
      await fs.writeFile(authMiddlewarePath, content);
      console.log('✅ Middleware authMiddleware.js creado correctamente');
      return true;
    } catch (authError) {
      console.error('❌ Error: No se encontró ningún middleware de autenticación');
      console.log('   Esto puede causar problemas al usar el controlador de medias');
      return false;
    }
  }
}

async function verifyCloudinarySetup() {
  console.log('🔍 Verificando configuración de Cloudinary...\n');
  
  // 1. Verificar variables de entorno
  console.log('1️⃣ Verificando variables de entorno:');
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Error: Faltan variables de entorno de Cloudinary');
    console.log('   Por favor, configure las siguientes variables en el archivo .env:');
    console.log('   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    return false;
  }
  console.log('✅ Variables de entorno configuradas correctamente');
  
  // 2. Verificar conexión con Cloudinary
  console.log('\n2️⃣ Verificando conexión con Cloudinary:');
  try {
    const result = await cloudinary.api.ping();
    if (result.status === 'ok') {
      console.log('✅ Conexión con Cloudinary establecida correctamente');
    } else {
      console.error('❌ Error: No se pudo conectar con Cloudinary');
      return false;
    }
  } catch (error) {
    console.error('❌ Error al conectar con Cloudinary:', error.message);
    console.log('   Verifique sus credenciales y conexión a internet');
    return false;
  }
  
  // 3. Verificar directorio temporal
  console.log('\n3️⃣ Verificando directorio temporal:');
  const tmpDir = path.join(__dirname, '..', 'tmp', 'uploads');
  try {
    await fs.access(tmpDir);
    console.log('✅ Directorio temporal existe');
  } catch (error) {
    console.log('⚠️ Directorio temporal no existe, creándolo...');
    try {
      await fs.mkdir(tmpDir, { recursive: true });
      console.log('✅ Directorio temporal creado correctamente');
    } catch (mkdirError) {
      console.error('❌ Error al crear directorio temporal:', mkdirError.message);
      return false;
    }
  }
  
  // 4. Verificar esquema de base de datos
  console.log('\n4️⃣ Verificando esquema de base de datos:');
  try {
    const [schemaResult] = await sequelize.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'archivos'
    `);
    
    if (schemaResult.length > 0) {
      console.log('✅ Esquema "archivos" existe en la base de datos');
      
      // Verificar tablas
      const [tablesResult] = await sequelize.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'archivos' 
        AND table_name IN ('medias', 'vehiculo_medias')
      `);
      
      if (tablesResult.length === 2) {
        console.log('✅ Tablas "medias" y "vehiculo_medias" existen');
      } else {
        console.error('❌ Error: Faltan tablas en el esquema "archivos"');
        console.log('   Ejecute el script create_archivos_schema.sql para crear las tablas');
        return false;
      }
    } else {
      console.error('❌ Error: El esquema "archivos" no existe en la base de datos');
      console.log('   Ejecute el script create_archivos_schema.sql para crear el esquema');
      return false;
    }
  } catch (error) {
    console.error('❌ Error al verificar esquema de base de datos:', error.message);
    return false;
  }
  
  // 5. Verificar carpeta en Cloudinary
  console.log('\n5️⃣ Verificando carpeta en Cloudinary:');
  try {
    const result = await cloudinary.api.root_folders();
    const vehiculosFolder = result.folders.find(folder => folder.name === 'vehiculos');
    
    if (vehiculosFolder) {
      console.log('✅ Carpeta "vehiculos" existe en Cloudinary');
    } else {
      console.log('⚠️ Carpeta "vehiculos" no existe en Cloudinary');
      console.log('   Se creará automáticamente al subir la primera imagen');
    }
  } catch (error) {
    console.error('❌ Error al verificar carpetas en Cloudinary:', error.message);
    // No es un error crítico, continuamos
  }
  
  // 6. Verificar middleware de autenticación
  console.log('\n6️⃣ Verificando middleware de autenticación:');
  await checkAuthMiddleware();
  
  // Todo está configurado correctamente
  console.log('\n🎉 ¡Configuración de Cloudinary verificada correctamente!');
  console.log('   El sistema está listo para usar Cloudinary');
  return true;
}

// Ejecutar verificación
verifyCloudinarySetup()
  .then(success => {
    if (!success) {
      console.log('\n❌ La verificación ha fallado. Por favor, corrija los errores antes de continuar.');
      process.exit(1);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });