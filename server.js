/**
 * Servidor Express para el Simulador de Crédito Automotriz
 * Cliquéalo.mx
 * 
 * Este servidor proporciona una API REST para conectar el frontend con la base de datos PostgreSQL.
 */

// Importar dependencias
require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database/config');

// Configurar servidor
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ================================
// Rutas de la API
// ================================

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// === Bancos ===

// Obtener todos los bancos
app.get('/api/bancos', async (req, res) => {
  try {
    const bancos = await db.getBancos();
    res.json(bancos);
  } catch (err) {
    console.error('Error al obtener bancos:', err);
    res.status(500).json({ error: 'Error al obtener bancos', details: err.message });
  }
});

// === Clientes ===

// Crear un nuevo cliente
app.post('/api/clientes', async (req, res) => {
  try {
    const cliente = await db.createCliente(req.body);
    res.status(201).json(cliente);
  } catch (err) {
    console.error('Error al crear cliente:', err);
    res.status(500).json({ error: 'Error al crear cliente', details: err.message });
  }
});

// Obtener cliente por ID
app.get('/api/clientes/:id', async (req, res) => {
  try {
    const result = await db.pool.query('SELECT * FROM cliente WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener cliente:', err);
    res.status(500).json({ error: 'Error al obtener cliente', details: err.message });
  }
});

// === Vehículos ===

// Crear un nuevo vehículo
app.post('/api/vehiculos', async (req, res) => {
  try {
    const vehiculo = await db.createVehiculo(req.body);
    res.status(201).json(vehiculo);
  } catch (err) {
    console.error('Error al crear vehículo:', err);
    res.status(500).json({ error: 'Error al crear vehículo', details: err.message });
  }
});

// Obtener vehículos por IDs
app.get('/api/vehiculos', async (req, res) => {
  try {
    // Si se proporcionan IDs como query param
    if (req.query.ids) {
      const ids = req.query.ids.split(',').map(id => parseInt(id, 10));
      const result = await db.pool.query('SELECT * FROM vehiculo WHERE id = ANY($1)', [ids]);
      return res.json(result.rows);
    }
    
    // Si no hay IDs, devolver todos
    const result = await db.pool.query('SELECT * FROM vehiculo ORDER BY fecha_creacion DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener vehículos:', err);
    res.status(500).json({ error: 'Error al obtener vehículos', details: err.message });
  }
});

// === Créditos ===

// Crear un nuevo crédito
app.post('/api/creditos', async (req, res) => {
  try {
    const credito = await db.createCredito(req.body);
    res.status(201).json(credito);
  } catch (err) {
    console.error('Error al crear crédito:', err);
    res.status(500).json({ error: 'Error al crear crédito', details: err.message });
  }
});

// Obtener crédito por ID
app.get('/api/creditos/:id', async (req, res) => {
  try {
    // Obtener información del crédito
    const creditoResult = await db.pool.query(
      `SELECT c.*, b.nombre AS banco_nombre, b.logo AS banco_logo
       FROM credito c
       JOIN banco b ON c.banco_id = b.id
       WHERE c.id = $1`,
      [req.params.id]
    );
    
    if (creditoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Crédito no encontrado' });
    }
    
    const credito = creditoResult.rows[0];
    
    // Obtener cliente asociado
    const clienteResult = await db.pool.query(
      'SELECT * FROM cliente WHERE id = $1',
      [credito.cliente_id]
    );
    
    // Obtener vehículos asociados
    const vehiculosResult = await db.pool.query(
      `SELECT v.* FROM vehiculo v
       JOIN credito_vehiculo cv ON v.id = cv.vehiculo_id
       WHERE cv.credito_id = $1`,
      [req.params.id]
    );
    
    // Obtener tabla de amortización
    const amortizacionResult = await db.pool.query(
      `SELECT * FROM amortizacion_detalle
       WHERE credito_id = $1
       ORDER BY numero_pago`,
      [req.params.id]
    );
    
    // Construir respuesta completa
    const response = {
      credito,
      cliente: clienteResult.rows[0] || null,
      vehiculos: vehiculosResult.rows,
      amortizacion: amortizacionResult.rows
    };
    
    res.json(response);
  } catch (err) {
    console.error('Error al obtener crédito:', err);
    res.status(500).json({ error: 'Error al obtener crédito', details: err.message });
  }
});

// Obtener tabla de amortización
app.get('/api/creditos/:id/amortizacion', async (req, res) => {
  try {
    const tabla = await db.getTablaAmortizacion(req.params.id);
    res.json(tabla);
  } catch (err) {
    console.error('Error al obtener tabla de amortización:', err);
    res.status(500).json({ error: 'Error al obtener tabla de amortización', details: err.message });
  }
});

// Simular un crédito (sin guardar en base de datos)
app.post('/api/simular', (req, res) => {
  try {
    const { montoFinanciado, tasaInteres, plazoMeses } = req.body;
    
    // Validar parámetros
    if (!montoFinanciado || !tasaInteres || !plazoMeses) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }
    
    // Calcular pago mensual
    const tasaMensual = (tasaInteres / 100) / 12;
    const factor = Math.pow(1 + tasaMensual, plazoMeses);
    const pagoMensual = (montoFinanciado * tasaMensual * factor) / (factor - 1);
    
    // Generar tabla de amortización
    let saldoInsoluto = montoFinanciado;
    const tabla = [];
    
    for (let i = 1; i <= plazoMeses; i++) {
      const interesMensual = saldoInsoluto * tasaMensual;
      const capitalAmortizado = pagoMensual - interesMensual;
      saldoInsoluto -= capitalAmortizado;
      
      if (saldoInsoluto < 0.01) saldoInsoluto = 0;
      
      const fechaPago = new Date();
      fechaPago.setMonth(fechaPago.getMonth() + i);
      
      tabla.push({
        numeroPago: i,
        fechaPago: fechaPago.toISOString().split('T')[0],
        pagoMensual,
        capital: capitalAmortizado,
        interes: interesMensual,
        saldo: saldoInsoluto
      });
    }
    
    // Calcular totales
    const totalPagado = pagoMensual * plazoMeses;
    const totalIntereses = totalPagado - montoFinanciado;
    
    res.json({
      pagoMensual,
      totalPagado,
      totalIntereses,
      tabla
    });
  } catch (err) {
    console.error('Error al simular crédito:', err);
    res.status(500).json({ error: 'Error al simular crédito', details: err.message });
  }
});

// Inicializar y probar la base de datos al iniciar el servidor
const inicializarServidor = async () => {
  try {
    // Probar conexión a la base de datos
    const connected = await db.testConnection();
    
    if (!connected) {
      console.error('No se pudo conectar a la base de datos. Vea los logs para más detalles.');
      process.exit(1);
    }
    
    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`API disponible en http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('Error al inicializar el servidor:', err);
    process.exit(1);
  }
};

// Iniciar el servidor
inicializarServidor();