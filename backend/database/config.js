/**
 * Configuración de conexión a PostgreSQL para el simulador de créditos automotrices
 * Cliquéalo.mx
 */

// Importar el cliente de PostgreSQL
const { Pool } = require('pg');

// Configuración de la conexión
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'simulador_credito',
  password: process.env.DB_PASSWORD || 'tu_contraseña',
  port: process.env.DB_PORT || 5432,
};

// Crear un pool de conexiones
const pool = new Pool(dbConfig);

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Conexión a PostgreSQL establecida correctamente');
    const res = await client.query('SELECT NOW()');
    console.log('Hora del servidor de base de datos:', res.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('Error al conectar a PostgreSQL:', err);
    return false;
  }
};

// Función para inicializar la base de datos (ejecutar schema.sql)
const initializeDatabase = async () => {
  try {
    console.log('Inicializando base de datos...');
    const fs = require('fs');
    const path = require('path');
    
    // Leer el archivo schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Conectar a la base de datos
    const client = await pool.connect();
    
    // Ejecutar el script SQL
    await client.query(schemaSql);
    
    console.log('Base de datos inicializada correctamente');
    client.release();
    return true;
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
    return false;
  }
};

// Exportar funciones y pool de conexión
module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  // Funciones de utilidad para operaciones CRUD
  
  // Obtener todos los bancos
  getBancos: async () => {
    try {
      const result = await pool.query('SELECT * FROM banco WHERE activo = TRUE ORDER BY tasa_interes ASC');
      return result.rows;
    } catch (err) {
      console.error('Error al obtener bancos:', err);
      throw err;
    }
  },
  
  // Crear un nuevo cliente
  createCliente: async (clienteData) => {
    try {
      const { nombre, apellidos, email, telefono, rfc, direccion, ciudad, codigoPostal } = clienteData;
      
      const query = `
        INSERT INTO cliente (nombre, apellidos, email, telefono, rfc, direccion, ciudad, codigo_postal)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const values = [nombre, apellidos, email, telefono, rfc, direccion, ciudad, codigoPostal];
      const result = await pool.query(query, values);
      
      return result.rows[0];
    } catch (err) {
      console.error('Error al crear cliente:', err);
      throw err;
    }
  },
  
  // Crear un nuevo vehículo
  createVehiculo: async (vehiculoData) => {
    try {
      const { descripcion, marca, modelo, anio, valor } = vehiculoData;
      
      const query = `
        INSERT INTO vehiculo (descripcion, marca, modelo, anio, valor)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const values = [descripcion, marca, modelo, anio, valor];
      const result = await pool.query(query, values);
      
      return result.rows[0];
    } catch (err) {
      console.error('Error al crear vehículo:', err);
      throw err;
    }
  },
  
  // Crear un nuevo crédito
  createCredito: async (creditoData) => {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const {
        clienteId,
        bancoId,
        montoTotal,
        porcentajeEnganche,
        montoEnganche,
        montoFinanciado,
        plazoMeses,
        tasaInteres,
        pagoMensual,
        cat,
        comisionApertura,
        montoTotalPagar,
        vehiculoIds
      } = creditoData;
      
      // Insertar el crédito
      const creditoQuery = `
        INSERT INTO credito (
          cliente_id, banco_id, monto_total, porcentaje_enganche, monto_enganche,
          monto_financiado, plazo_meses, tasa_interes, pago_mensual, cat,
          comision_apertura, monto_total_pagar
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;
      
      const creditoValues = [
        clienteId, bancoId, montoTotal, porcentajeEnganche, montoEnganche,
        montoFinanciado, plazoMeses, tasaInteres, pagoMensual, cat,
        comisionApertura, montoTotalPagar
      ];
      
      const creditoResult = await client.query(creditoQuery, creditoValues);
      const creditoId = creditoResult.rows[0].id;
      
      // Asociar vehículos al crédito
      for (const vehiculoId of vehiculoIds) {
        await client.query(
          'INSERT INTO credito_vehiculo (credito_id, vehiculo_id) VALUES ($1, $2)',
          [creditoId, vehiculoId]
        );
      }
      
      // Generar tabla de amortización
      await client.query('SELECT generar_tabla_amortizacion($1)', [creditoId]);
      
      await client.query('COMMIT');
      
      // Obtener el crédito completo con su tabla de amortización
      const creditoCompleto = await client.query(
        `SELECT c.*, a.* FROM credito c
         LEFT JOIN amortizacion_detalle a ON c.id = a.credito_id
         WHERE c.id = $1
         ORDER BY a.numero_pago`,
        [creditoId]
      );
      
      return creditoCompleto.rows;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error al crear crédito:', err);
      throw err;
    } finally {
      client.release();
    }
  },
  
  // Obtener tabla de amortización
  getTablaAmortizacion: async (creditoId) => {
    try {
      const result = await pool.query(
        `SELECT * FROM amortizacion_detalle 
         WHERE credito_id = $1
         ORDER BY numero_pago`,
        [creditoId]
      );
      return result.rows;
    } catch (err) {
      console.error('Error al obtener tabla de amortización:', err);
      throw err;
    }
  }
};