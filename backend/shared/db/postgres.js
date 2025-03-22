// PostgreSQL database connection utility
const { Pool } = require('pg');

// Cargar variables de entorno
require('dotenv').config();

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cliqueatools',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  // Configuración adicional
  max: 20, // Tamaño máximo del pool de conexiones
  idleTimeoutMillis: 30000, // Tiempo de inactividad antes de cerrar una conexión
  connectionTimeoutMillis: 2000, // Tiempo de espera para establecer una conexión
};

// Crear pool de conexiones
const pool = new Pool(dbConfig);

// Manejar errores de conexión
pool.on('error', (err) => {
  console.error('Error inesperado en el cliente PostgreSQL:', err);
});

// Función para ejecutar consultas
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Consulta ejecutada', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error al ejecutar consulta:', error);
    throw error;
  }
}

// Función para obtener un cliente del pool
async function getClient() {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  
  // Monitorear liberación del cliente
  client.release = () => {
    release.apply(client);
  };
  
  // Sobrescribir método de consulta para agregar logging
  client.query = async (text, params) => {
    const start = Date.now();
    try {
      const res = await query.apply(client, [text, params]);
      const duration = Date.now() - start;
      console.log('Consulta cliente ejecutada', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Error al ejecutar consulta de cliente:', error);
      throw error;
    }
  };
  
  return client;
}

module.exports = {
  query,
  getClient,
  pool
};