#!/usr/bin/env node

/**
 * Script para probar la conexión a la base de datos
 * Este script utiliza la función testConnection() del módulo configDB.js
 * para verificar que podemos conectarnos correctamente a la base de datos
 * configurada en el archivo .env
 */

const { testConnection } = require('../config/configDB');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

console.log('===============================================');
console.log('Probando conexión a la base de datos...');
console.log('===============================================');
console.log('Configuración utilizada:');
console.log(`- Host: ${process.env.DB_HOST}`);
console.log(`- Puerto: ${process.env.DB_PORT}`);
console.log(`- Base de datos: ${process.env.DB_NAME}`);
console.log(`- Usuario: ${process.env.DB_USER}`);
console.log(`- Schema: ${process.env.DB_SCHEMA}`);
console.log('===============================================');

async function runTest() {
  try {
    const connected = await testConnection();
    
    if (connected) {
      console.log('===============================================');
      console.log('✅ CONEXIÓN EXITOSA a la base de datos.');
      console.log('===============================================');
      process.exit(0);
    } else {
      console.error('===============================================');
      console.error('❌ ERROR: No se pudo conectar a la base de datos.');
      console.error('===============================================');
      process.exit(1);
    }
  } catch (error) {
    console.error('===============================================');
    console.error('❌ ERROR: Excepción al probar la conexión:', error);
    console.error('===============================================');
    process.exit(1);
  }
}

runTest();