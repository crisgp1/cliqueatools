#!/usr/bin/env node

/**
 * Script para inicializar la base de datos
 * 
 * Implementa un enfoque en dos pasos:
 * 1. Crear la base de datos conectándose a 'postgres'
 * 2. Crear schemas y tablas conectándose a la base de datos creada
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Obtener las credenciales de la base de datos desde las variables de entorno
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME || 'cliqueatools';
const DB_SCHEMA = process.env.DB_SCHEMA || 'cliquea';

console.log('Iniciando la creación de la base de datos...');

// Función para ejecutar un comando
const runCommand = (command, description) => {
  return new Promise((resolve, reject) => {
    console.log(`Ejecutando: ${description}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error al ${description}: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr && !stderr.includes('CREATE DATABASE') && !stderr.includes('CREATE SCHEMA')) {
        console.log(`Mensajes del servidor PostgreSQL: ${stderr}`);
      }
      
      console.log(`${description} completado.`);
      resolve(stdout);
    });
  });
};

// Paso 1: Comprobar si la base de datos existe
const checkDatabaseCmd = DB_PASSWORD 
  ? `PGPASSWORD="${DB_PASSWORD}" psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d postgres -c "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'"`
  : `psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d postgres -c "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'"`;

// Paso 2: Crear la base de datos si no existe
const createDatabaseCmd = DB_PASSWORD
  ? `PGPASSWORD="${DB_PASSWORD}" psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d postgres -c "CREATE DATABASE ${DB_NAME}"`
  : `psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d postgres -c "CREATE DATABASE ${DB_NAME}"`;

// Paso 3: Crear el schema
const createSchemaCmd = DB_PASSWORD
  ? `PGPASSWORD="${DB_PASSWORD}" psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -c "CREATE SCHEMA IF NOT EXISTS ${DB_SCHEMA}"`
  : `psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -c "CREATE SCHEMA IF NOT EXISTS ${DB_SCHEMA}"`;

// Paso 4: Ejecutar el resto del script SQL (sin la creación de la base de datos)
const sqlScriptPath = path.resolve(__dirname, '../config/init.sql');
const runScriptCmd = DB_PASSWORD
  ? `PGPASSWORD="${DB_PASSWORD}" psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -f "${sqlScriptPath}"`
  : `psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -f "${sqlScriptPath}"`;

// Ejecutar todos los pasos en secuencia
runCommand(checkDatabaseCmd, "verificar si la base de datos existe")
  .then(result => {
    // Si la base de datos ya existe (la consulta devuelve una fila)
    if (result.includes('1 row')) {
      console.log(`La base de datos '${DB_NAME}' ya existe.`);
      return Promise.resolve();
    } else {
      // Si no existe, crearla
      return runCommand(createDatabaseCmd, `crear la base de datos '${DB_NAME}'`);
    }
  })
  .then(() => runCommand(createSchemaCmd, `crear el schema '${DB_SCHEMA}'`))
  .then(() => runCommand(runScriptCmd, "ejecutar script de inicialización de tablas"))
  .then(() => {
    console.log('\n===========================================');
    console.log(`✅ Base de datos '${DB_NAME}' inicializada correctamente.`);
    console.log(`✅ Schema '${DB_SCHEMA}' creado.`);
    console.log(`✅ Tablas y datos iniciales creados.`);
    console.log('===========================================');
    console.log('\nPuedes iniciar la aplicación ahora con:');
    console.log('npm run dev');
  })
  .catch(error => {
    console.error('\n===========================================');
    console.error('❌ Error al inicializar la base de datos');
    console.error('===========================================');
    console.log('\nPara crear la base de datos manualmente, sigue estos pasos:');
    console.log('1. Abre una terminal y ejecuta: psql -d postgres');
    console.log(`2. Crea la base de datos: CREATE DATABASE ${DB_NAME};`);
    console.log(`3. Conéctate a la base de datos: \\c ${DB_NAME}`);
    console.log(`4. Crea el schema: CREATE SCHEMA IF NOT EXISTS ${DB_SCHEMA};`);
    console.log('5. Sal de psql: \\q');
    console.log('6. Inicia la aplicación con: npm run dev');
  });