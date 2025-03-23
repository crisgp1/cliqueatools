const { Contrato, Cliente, Vehiculo, ContratoVehiculo, Sequelize } = require('../models');
const { Op } = Sequelize;

const contratoController = {
  // Crear un nuevo contrato
  crear: async (req, res) => {
    try {
      const { 
        cliente_id, 
        ciudad, 
        fecha_contrato, 
        hora_contrato, 
        precio_total, 
        forma_pago, 
        observaciones,
        vehiculos_ids  // Array de IDs de vehículos asociados al contrato
      } = req.body;

      // Validaciones básicas
      if (!cliente_id || !fecha_contrato || !hora_contrato) {
        return res.status(400).json({
          success: false,
          mensaje: 'Los campos cliente, fecha y hora son obligatorios'
        });
      }

      // Verificar que el cliente existe
      const cliente = await Cliente.findByPk(cliente_id);
      if (!cliente) {
        return res.status(404).json({
          success: false,
          mensaje: 'Cliente no encontrado'
        });
      }

      // Verificar que los vehículos existen si se proporcionan
      if (vehiculos_ids && vehiculos_ids.length > 0) {
        const vehiculosCount = await Vehiculo.count({
          where: {
            vehiculo_id: {
              [Op.in]: vehiculos_ids
            }
          }
        });

        if (vehiculosCount !== vehiculos_ids.length) {
          return res.status(404).json({
            success: false,
            mensaje: 'Uno o más vehículos no fueron encontrados'
          });
        }
      }

      // Crear contrato (transacción)
      const result = await Sequelize.transaction(async (t) => {
        // Crear el contrato
        const nuevoContrato = await Contrato.create({
          cliente_id,
          ciudad,
          fecha_contrato,
          hora_contrato,
          precio_total,
          forma_pago,
          observaciones
        }, { transaction: t });

        // Asociar vehículos al contrato si se proporcionan
        if (vehiculos_ids && vehiculos_ids.length > 0) {
          const contratoVehiculos = vehiculos_ids.map(vehiculo_id => ({
            contrato_id: nuevoContrato.contrato_id,
            vehiculo_id
          }));

          await ContratoVehiculo.bulkCreate(contratoVehiculos, { transaction: t });
        }

        return nuevoContrato;
      });

      // Obtener el contrato con sus vehículos
      const contratoCompleto = await Contrato.findByPk(result.contrato_id, {
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Vehiculo, as: 'vehiculos' }
        ]
      });

      res.status(201).json({
        success: true,
        mensaje: 'Contrato creado exitosamente',
        data: contratoCompleto
      });
    } catch (error) {
      console.error('Error al crear contrato:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Obtener todos los contratos
  obtenerTodos: async (req, res) => {
    try {
      const contratos = await Contrato.findAll({
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Vehiculo, as: 'vehiculos' }
        ]
      });

      res.json({
        success: true,
        data: contratos
      });
    } catch (error) {
      console.error('Error al obtener contratos:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Obtener un contrato por su ID
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const contrato = await Contrato.findByPk(id, {
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Vehiculo, as: 'vehiculos' }
        ]
      });

      if (!contrato) {
        return res.status(404).json({
          success: false,
          mensaje: 'Contrato no encontrado'
        });
      }

      res.json({
        success: true,
        data: contrato
      });
    } catch (error) {
      console.error('Error al obtener contrato por ID:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Actualizar un contrato
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        cliente_id, 
        ciudad, 
        fecha_contrato, 
        hora_contrato, 
        precio_total, 
        forma_pago, 
        observaciones,
        vehiculos_ids  // Array de IDs de vehículos asociados al contrato
      } = req.body;

      const contrato = await Contrato.findByPk(id);

      if (!contrato) {
        return res.status(404).json({
          success: false,
          mensaje: 'Contrato no encontrado'
        });
      }

      // Verificar que los vehículos existen si se proporcionan
      if (vehiculos_ids && vehiculos_ids.length > 0) {
        const vehiculosCount = await Vehiculo.count({
          where: {
            vehiculo_id: {
              [Op.in]: vehiculos_ids
            }
          }
        });

        if (vehiculosCount !== vehiculos_ids.length) {
          return res.status(404).json({
            success: false,
            mensaje: 'Uno o más vehículos no fueron encontrados'
          });
        }
      }

      // Actualizar contrato (transacción)
      await Sequelize.transaction(async (t) => {
        // Actualizar datos del contrato
        await contrato.update({
          cliente_id,
          ciudad,
          fecha_contrato,
          hora_contrato,
          precio_total,
          forma_pago,
          observaciones
        }, { transaction: t });

        // Si se proporcionan vehículos, actualizar las relaciones
        if (vehiculos_ids !== undefined) {
          // Eliminar todas las relaciones existentes
          await ContratoVehiculo.destroy({
            where: {
              contrato_id: id
            },
            transaction: t
          });

          // Crear nuevas relaciones
          if (vehiculos_ids && vehiculos_ids.length > 0) {
            const contratoVehiculos = vehiculos_ids.map(vehiculo_id => ({
              contrato_id: id,
              vehiculo_id
            }));

            await ContratoVehiculo.bulkCreate(contratoVehiculos, { transaction: t });
          }
        }
      });

      // Obtener el contrato actualizado con sus vehículos
      const contratoActualizado = await Contrato.findByPk(id, {
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Vehiculo, as: 'vehiculos' }
        ]
      });

      res.json({
        success: true,
        mensaje: 'Contrato actualizado exitosamente',
        data: contratoActualizado
      });
    } catch (error) {
      console.error('Error al actualizar contrato:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Eliminar un contrato
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      const contrato = await Contrato.findByPk(id);

      if (!contrato) {
        return res.status(404).json({
          success: false,
          mensaje: 'Contrato no encontrado'
        });
      }

      // Eliminar contrato (transacción)
      await Sequelize.transaction(async (t) => {
        // Eliminar las relaciones con vehículos
        await ContratoVehiculo.destroy({
          where: {
            contrato_id: id
          },
          transaction: t
        });

        // Eliminar el contrato
        await contrato.destroy({ transaction: t });
      });

      res.json({
        success: true,
        mensaje: 'Contrato eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar contrato:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Agregar vehículo a un contrato
  agregarVehiculo: async (req, res) => {
    try {
      const { contrato_id, vehiculo_id } = req.body;

      // Verificar que existen contrato y vehículo
      const contrato = await Contrato.findByPk(contrato_id);
      if (!contrato) {
        return res.status(404).json({
          success: false,
          mensaje: 'Contrato no encontrado'
        });
      }

      const vehiculo = await Vehiculo.findByPk(vehiculo_id);
      if (!vehiculo) {
        return res.status(404).json({
          success: false,
          mensaje: 'Vehículo no encontrado'
        });
      }

      // Verificar si ya existe la relación
      const relacion = await ContratoVehiculo.findOne({
        where: {
          contrato_id,
          vehiculo_id
        }
      });

      if (relacion) {
        return res.status(400).json({
          success: false,
          mensaje: 'El vehículo ya está asociado a este contrato'
        });
      }

      // Crear relación
      await ContratoVehiculo.create({
        contrato_id,
        vehiculo_id
      });

      res.status(201).json({
        success: true,
        mensaje: 'Vehículo agregado al contrato exitosamente'
      });
    } catch (error) {
      console.error('Error al agregar vehículo al contrato:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Quitar vehículo de un contrato
  quitarVehiculo: async (req, res) => {
    try {
      const { contrato_id, vehiculo_id } = req.params;

      // Verificar si existe la relación
      const relacion = await ContratoVehiculo.findOne({
        where: {
          contrato_id,
          vehiculo_id
        }
      });

      if (!relacion) {
        return res.status(404).json({
          success: false,
          mensaje: 'El vehículo no está asociado a este contrato'
        });
      }

      // Eliminar relación
      await relacion.destroy();

      res.json({
        success: true,
        mensaje: 'Vehículo removido del contrato exitosamente'
      });
    } catch (error) {
      console.error('Error al quitar vehículo del contrato:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = contratoController;