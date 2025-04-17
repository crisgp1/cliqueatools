#!/usr/bin/env node

/**
 * Script para probar la conexión a la base de datos y verificar estructuras
 * Este script no solo prueba la conexión, sino que también verifica
 * la existencia del esquema 'inventario' y sus tablas
 */

const { sequelize } = require('../config/configDB');
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
console.log('===============================================');

async function runTest() {
  try {
    // Probar conexión básica
    await sequelize.authenticate();
    console.log('✅ CONEXIÓN EXITOSA a la base de datos.');
    
    // Listar todos los schemas
    console.log('\n📊 Analizando esquemas disponibles...');
    const schemas = await sequelize.query(
      'SELECT schema_name FROM information_schema.schemata',
      { type: sequelize.QueryTypes.SELECT }
    );
    console.log('Esquemas disponibles:');
    schemas.forEach(s => console.log(`- ${s.schema_name}`));
    
    // Verificar si existe el esquema inventario
    const hasInventario = schemas.some(s => s.schema_name === 'inventario');
    console.log(`\nEsquema 'inventario': ${hasInventario ? '✅ EXISTE' : '❌ NO EXISTE'}`);
    
    // Si inventario existe, listar sus tablas
    if (hasInventario) {
      console.log('\n📋 Analizando tablas en esquema inventario...');
      const tables = await sequelize.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'inventario'`,
        { type: sequelize.QueryTypes.SELECT }
      );
      
      if (tables.length === 0) {
        console.log('⚠️ No se encontraron tablas en el esquema inventario.');
      } else {
        console.log('Tablas encontradas:');
        tables.forEach(t => console.log(`- ${t.table_name}`));
      }
      
      // Verificar tabla vehiculos específicamente
      const vehiculosTable = tables.find(t => t.table_name === 'vehiculos');
      if (vehiculosTable) {
        console.log('\n🚗 Analizando estructura de tabla vehiculos...');
        const columns = await sequelize.query(
          `SELECT column_name, data_type, is_nullable 
           FROM information_schema.columns 
           WHERE table_schema = 'inventario' AND table_name = 'vehiculos'
           ORDER BY ordinal_position`,
          { type: sequelize.QueryTypes.SELECT }
        );
        
        console.log('Columnas en la tabla vehiculos:');
        columns.forEach(c => {
          console.log(`- ${c.column_name} (${c.data_type}) ${c.is_nullable === 'YES' ? 'NULLABLE' : 'NOT NULL'}`);
        });
        
        // Verificar clave primaria
        console.log('\nVerificando clave primaria:');
        const primaryKey = await sequelize.query(
          `SELECT c.column_name
           FROM information_schema.table_constraints tc
           JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name)
           JOIN information_schema.columns AS c ON c.table_schema = tc.constraint_schema
             AND tc.table_name = c.table_name AND ccu.column_name = c.column_name
           WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'inventario' AND tc.table_name = 'vehiculos'`,
          { type: sequelize.QueryTypes.SELECT }
        );
        
        if (primaryKey.length > 0) {
          console.log(`✅ Clave primaria: ${primaryKey.map(pk => pk.column_name).join(', ')}`);
        } else {
          console.log('⚠️ No se encontró clave primaria definida');
        }
      } else {
        console.log('\n⚠️ No se encontró la tabla vehiculos en el esquema inventario');
      }
    }
    
    console.log('\n===============================================');
    console.log('✅ DIAGNÓSTICO COMPLETADO');
    console.log('===============================================');
    
  } catch (error) {
    console.error('===============================================');
    console.error('❌ ERROR: Excepción durante la prueba:', error);
    if (error.parent) {
      console.error('\nDetalles del error:');
      console.error(`- Mensaje: ${error.parent.message}`);
      console.error(`- Código: ${error.parent.code}`);
    }
    console.error('===============================================');
    process.exit(1);
  } finally {
    // Cerrar la conexión al terminar
    await sequelize.close();
    process.exit(0);
  }
}

runTest();