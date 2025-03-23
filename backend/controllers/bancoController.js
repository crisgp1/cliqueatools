const { Banco, Sequelize } = require('../models');
const { Op } = Sequelize;

const bancoController = {
  // Crear un nuevo banco
  crear: async (req, res) => {
    try {
      const { nombre, tasa, cat, comision, logo } = req.body;

      // Validaciones básicas
      if (!nombre) {
        return res.status(400).json({
          success: false,
          mensaje: 'El nombre del banco es obligatorio'
        });
      }

      // Crear banco
      const nuevoBanco = await Banco.create({
        nombre,
        tasa,
        cat,
        comision,
        logo
      });

      res.status(201).json({
        success: true,
        mensaje: 'Banco creado exitosamente',
        data: nuevoBanco
      });
    } catch (error) {
      console.error('Error al crear banco:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Obtener todos los bancos
  obtenerTodos: async (req, res) => {
    try {
      const bancos = await Banco.findAll();

      res.json({
        success: true,
        data: bancos
      });
    } catch (error) {
      console.error('Error al obtener bancos:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Obtener un banco por su ID
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const banco = await Banco.findByPk(id);

      if (!banco) {
        return res.status(404).json({
          success: false,
          mensaje: 'Banco no encontrado'
        });
      }

      res.json({
        success: true,
        data: banco
      });
    } catch (error) {
      console.error('Error al obtener banco por ID:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Actualizar un banco
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, tasa, cat, comision, logo } = req.body;

      const banco = await Banco.findByPk(id);

      if (!banco) {
        return res.status(404).json({
          success: false,
          mensaje: 'Banco no encontrado'
        });
      }

      // Actualizar banco
      await banco.update({
        nombre,
        tasa,
        cat,
        comision,
        logo
      });

      res.json({
        success: true,
        mensaje: 'Banco actualizado exitosamente',
        data: banco
      });
    } catch (error) {
      console.error('Error al actualizar banco:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Eliminar un banco
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      const banco = await Banco.findByPk(id);

      if (!banco) {
        return res.status(404).json({
          success: false,
          mensaje: 'Banco no encontrado'
        });
      }

      // Eliminar banco
      await banco.destroy();

      res.json({
        success: true,
        mensaje: 'Banco eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar banco:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Comparar bancos por tasa, CAT y comisión
  compararBancos: async (req, res) => {
    try {
      // Obtener parámetros para la comparación
      const { montoCredito, plazoMeses, ordenarPor = 'tasa' } = req.query;
      
      // Determinar el orden (ascendente por defecto para todos los campos)
      const orden = [
        [ordenarPor, 'ASC']
      ];
      
      // Obtener todos los bancos ordenados según el criterio
      const bancos = await Banco.findAll({
        order: orden
      });
      
      // Si se proporcionan monto y plazo, calcular pagos mensuales estimados
      if (montoCredito && plazoMeses) {
        const bancosConCalculos = bancos.map(banco => {
          const bancoData = banco.toJSON();
          
          // Convertir tasa anual a tasa mensual (tasa anual / 12)
          const tasaMensual = (banco.tasa / 100) / 12;
          
          // Calcular pago mensual usando la fórmula de amortización
          // Pago = P * r * (1 + r)^n / ((1 + r)^n - 1)
          // Donde: P = principal, r = tasa mensual, n = número de pagos
          const pagoMensual = (montoCredito * tasaMensual * Math.pow(1 + tasaMensual, plazoMeses)) / 
                             (Math.pow(1 + tasaMensual, plazoMeses) - 1);
          
          // Calcular costo total del crédito
          const costoTotal = pagoMensual * plazoMeses;
          
          // Calcular intereses totales
          const interesesTotales = costoTotal - montoCredito;
          
          // Calcular comisión por apertura
          const comisionApertura = montoCredito * (banco.comision / 100);
          
          return {
            ...bancoData,
            pagoMensual: pagoMensual.toFixed(2),
            costoTotal: costoTotal.toFixed(2),
            interesesTotales: interesesTotales.toFixed(2),
            comisionApertura: comisionApertura.toFixed(2)
          };
        });
        
        return res.json({
          success: true,
          data: bancosConCalculos
        });
      }
      
      res.json({
        success: true,
        data: bancos
      });
    } catch (error) {
      console.error('Error al comparar bancos:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = bancoController;