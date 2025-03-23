const { Credito, Cliente, Vehiculo, Banco, Sequelize } = require('../models');
const { Op } = Sequelize;

// Función auxiliar para calcular tabla de amortización
const calcularTablaAmortizacion = (montoFinanciado, plazoMeses, tasaAnual) => {
  // Convertir tasa anual a tasa mensual
  const tasaMensual = (tasaAnual / 100) / 12;
  
  // Calcular pago mensual
  const pagoMensual = (montoFinanciado * tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) / 
                     (Math.pow(1 + tasaMensual, plazoMeses) - 1);
  
  // Generar tabla de amortización
  let saldoInsoluto = montoFinanciado;
  const tabla = [];
  
  for (let periodo = 1; periodo <= plazoMeses; periodo++) {
    // Calcular interés del periodo
    const interesPeriodo = saldoInsoluto * tasaMensual;
    
    // Calcular abono a capital
    const abonoCapital = pagoMensual - interesPeriodo;
    
    // Actualizar saldo insoluto
    saldoInsoluto -= abonoCapital;
    
    // Agregar registro a la tabla
    tabla.push({
      periodo,
      pagoMensual: pagoMensual.toFixed(2),
      interesPeriodo: interesPeriodo.toFixed(2),
      abonoCapital: abonoCapital.toFixed(2),
      saldoInsoluto: saldoInsoluto.toFixed(2)
    });
  }
  
  return {
    pagoMensual: pagoMensual.toFixed(2),
    tabla
  };
};

const creditoController = {
  // Crear un nuevo crédito
  crear: async (req, res) => {
    try {
      const { 
        cliente_id, 
        vehiculo_id, 
        banco_id, 
        monto_financiado, 
        plazo_meses, 
        tasa_anual, 
        cat_personalizado 
      } = req.body;

      // Validaciones básicas
      if (!cliente_id || !vehiculo_id || !banco_id || !monto_financiado || !plazo_meses) {
        return res.status(400).json({
          success: false,
          mensaje: 'Faltan campos obligatorios para crear el crédito'
        });
      }

      // Verificar que existan cliente, vehículo y banco
      const cliente = await Cliente.findByPk(cliente_id);
      if (!cliente) {
        return res.status(404).json({
          success: false,
          mensaje: 'Cliente no encontrado'
        });
      }

      const vehiculo = await Vehiculo.findByPk(vehiculo_id);
      if (!vehiculo) {
        return res.status(404).json({
          success: false,
          mensaje: 'Vehículo no encontrado'
        });
      }

      const banco = await Banco.findByPk(banco_id);
      if (!banco) {
        return res.status(404).json({
          success: false,
          mensaje: 'Banco no encontrado'
        });
      }

      // Usar la tasa del banco si no se proporciona una específica
      const tasaEfectiva = tasa_anual || banco.tasa;

      // Crear crédito
      const nuevoCredito = await Credito.create({
        cliente_id,
        vehiculo_id,
        banco_id,
        monto_financiado,
        plazo_meses,
        tasa_anual: tasaEfectiva,
        cat_personalizado
      });

      res.status(201).json({
        success: true,
        mensaje: 'Crédito creado exitosamente',
        data: nuevoCredito
      });
    } catch (error) {
      console.error('Error al crear crédito:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Obtener todos los créditos
  obtenerTodos: async (req, res) => {
    try {
      const creditos = await Credito.findAll({
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Vehiculo, as: 'vehiculo' },
          { model: Banco, as: 'banco' }
        ]
      });

      res.json({
        success: true,
        data: creditos
      });
    } catch (error) {
      console.error('Error al obtener créditos:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Obtener un crédito por su ID
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const credito = await Credito.findByPk(id, {
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Vehiculo, as: 'vehiculo' },
          { model: Banco, as: 'banco' }
        ]
      });

      if (!credito) {
        return res.status(404).json({
          success: false,
          mensaje: 'Crédito no encontrado'
        });
      }

      res.json({
        success: true,
        data: credito
      });
    } catch (error) {
      console.error('Error al obtener crédito por ID:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Actualizar un crédito
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        cliente_id, 
        vehiculo_id, 
        banco_id, 
        monto_financiado, 
        plazo_meses, 
        tasa_anual, 
        cat_personalizado 
      } = req.body;

      const credito = await Credito.findByPk(id);

      if (!credito) {
        return res.status(404).json({
          success: false,
          mensaje: 'Crédito no encontrado'
        });
      }

      // Actualizar crédito
      await credito.update({
        cliente_id,
        vehiculo_id,
        banco_id,
        monto_financiado,
        plazo_meses,
        tasa_anual,
        cat_personalizado
      });

      res.json({
        success: true,
        mensaje: 'Crédito actualizado exitosamente',
        data: credito
      });
    } catch (error) {
      console.error('Error al actualizar crédito:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Eliminar un crédito
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      const credito = await Credito.findByPk(id);

      if (!credito) {
        return res.status(404).json({
          success: false,
          mensaje: 'Crédito no encontrado'
        });
      }

      // Eliminar crédito
      await credito.destroy();

      res.json({
        success: true,
        mensaje: 'Crédito eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar crédito:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Generar tabla de amortización para un crédito
  generarTablaAmortizacion: async (req, res) => {
    try {
      const { id } = req.params;

      const credito = await Credito.findByPk(id, {
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Vehiculo, as: 'vehiculo' },
          { model: Banco, as: 'banco' }
        ]
      });

      if (!credito) {
        return res.status(404).json({
          success: false,
          mensaje: 'Crédito no encontrado'
        });
      }

      // Calcular tabla de amortización
      const amortizacion = calcularTablaAmortizacion(
        credito.monto_financiado,
        credito.plazo_meses,
        credito.tasa_anual
      );

      res.json({
        success: true,
        data: {
          credito,
          amortizacion
        }
      });
    } catch (error) {
      console.error('Error al generar tabla de amortización:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Simulador de crédito (sin crearlo en la base de datos)
  simularCredito: async (req, res) => {
    try {
      const { monto_financiado, plazo_meses, tasa_anual, banco_id } = req.body;

      // Validaciones básicas
      if (!monto_financiado || !plazo_meses) {
        return res.status(400).json({
          success: false,
          mensaje: 'Se requiere monto a financiar y plazo en meses'
        });
      }

      let tasaEfectiva = tasa_anual;

      // Si se proporciona un banco_id, obtener la tasa de ese banco
      if (banco_id && !tasa_anual) {
        const banco = await Banco.findByPk(banco_id);
        if (banco) {
          tasaEfectiva = banco.tasa;
        } else {
          return res.status(404).json({
            success: false,
            mensaje: 'Banco no encontrado'
          });
        }
      }

      // Verificar que tengamos una tasa para calcular
      if (!tasaEfectiva) {
        return res.status(400).json({
          success: false,
          mensaje: 'Se requiere una tasa anual o un banco válido'
        });
      }

      // Calcular tabla de amortización
      const amortizacion = calcularTablaAmortizacion(
        monto_financiado,
        plazo_meses,
        tasaEfectiva
      );

      res.json({
        success: true,
        data: {
          monto_financiado,
          plazo_meses,
          tasa_anual: tasaEfectiva,
          amortizacion
        }
      });
    } catch (error) {
      console.error('Error al simular crédito:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = creditoController;