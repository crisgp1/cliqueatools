const { Cita, Cliente, Usuario, Vehiculo, Sequelize } = require('../models');
const { Op } = Sequelize;

const citaController = {
  // Crear una nueva cita
  crear: async (req, res) => {
    try {
      const { cliente_id, usuario_id, vehiculo_id, fecha_cita, hora_cita, lugar, comentarios } = req.body;

      // Validaciones básicas
      if (!cliente_id || !fecha_cita || !hora_cita) {
        return res.status(400).json({
          success: false,
          mensaje: 'Los campos cliente_id, fecha_cita y hora_cita son obligatorios'
        });
      }

      // Validar que la fecha no sea en el pasado
      const fechaHoraCita = new Date(`${fecha_cita}T${hora_cita}`);
      const ahora = new Date();
      
      if (fechaHoraCita < ahora) {
        return res.status(400).json({
          success: false,
          mensaje: 'No se pueden programar citas en fechas pasadas'
        });
      }

      // Validar que el cliente exista
      const clienteExiste = await Cliente.findByPk(cliente_id);
      if (!clienteExiste) {
        return res.status(404).json({
          success: false,
          mensaje: 'El cliente especificado no existe'
        });
      }

      // Validar que el usuario exista (si se proporcionó)
      if (usuario_id) {
        const usuarioExiste = await Usuario.findByPk(usuario_id);
        if (!usuarioExiste) {
          return res.status(404).json({
            success: false,
            mensaje: 'El usuario especificado no existe'
          });
        }
      }

      // Validar que el vehículo exista (si se proporcionó)
      if (vehiculo_id) {
        const vehiculoExiste = await Vehiculo.findByPk(vehiculo_id);
        if (!vehiculoExiste) {
          return res.status(404).json({
            success: false,
            mensaje: 'El vehículo especificado no existe'
          });
        }
      }

      // Verificar disponibilidad (no permitir citas solapadas para el mismo usuario)
      if (usuario_id) {
        const citasSolapadas = await Cita.findOne({
          where: {
            usuario_id,
            fecha_cita,
            hora_cita,
          }
        });

        if (citasSolapadas) {
          return res.status(400).json({
            success: false,
            mensaje: 'El usuario ya tiene una cita programada para esa fecha y hora'
          });
        }
      }

      // Crear cita
      const nuevaCita = await Cita.create({
        cliente_id,
        usuario_id,
        vehiculo_id,
        fecha_cita,
        hora_cita,
        lugar,
        comentarios
      });

      res.status(201).json({
        success: true,
        mensaje: 'Cita creada exitosamente',
        data: nuevaCita
      });
    } catch (error) {
      console.error('Error al crear cita:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Obtener todas las citas
  obtenerTodas: async (req, res) => {
    try {
      const citas = await Cita.findAll({
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Usuario, as: 'usuario' },
          { model: Vehiculo, as: 'vehiculo' }
        ],
        order: [['fecha_cita', 'ASC'], ['hora_cita', 'ASC']]
      });

      res.json({
        success: true,
        data: citas
      });
    } catch (error) {
      console.error('Error al obtener citas:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Obtener una cita por su ID
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const cita = await Cita.findByPk(id, {
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Usuario, as: 'usuario' },
          { model: Vehiculo, as: 'vehiculo' }
        ]
      });

      if (!cita) {
        return res.status(404).json({
          success: false,
          mensaje: 'Cita no encontrada'
        });
      }

      res.json({
        success: true,
        data: cita
      });
    } catch (error) {
      console.error('Error al obtener cita por ID:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Actualizar una cita
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { cliente_id, usuario_id, vehiculo_id, fecha_cita, hora_cita, lugar, comentarios } = req.body;

      const cita = await Cita.findByPk(id);

      if (!cita) {
        return res.status(404).json({
          success: false,
          mensaje: 'Cita no encontrada'
        });
      }

      // Validar que la fecha no sea en el pasado
      if (fecha_cita && hora_cita) {
        const fechaHoraCita = new Date(`${fecha_cita}T${hora_cita}`);
        const ahora = new Date();
        
        if (fechaHoraCita < ahora) {
          return res.status(400).json({
            success: false,
            mensaje: 'No se pueden programar citas en fechas pasadas'
          });
        }
      }

      // Validar que el cliente exista (si se proporcionó)
      if (cliente_id) {
        const clienteExiste = await Cliente.findByPk(cliente_id);
        if (!clienteExiste) {
          return res.status(404).json({
            success: false,
            mensaje: 'El cliente especificado no existe'
          });
        }
      }

      // Validar que el usuario exista (si se proporcionó)
      if (usuario_id) {
        const usuarioExiste = await Usuario.findByPk(usuario_id);
        if (!usuarioExiste) {
          return res.status(404).json({
            success: false,
            mensaje: 'El usuario especificado no existe'
          });
        }
      }

      // Validar que el vehículo exista (si se proporcionó)
      if (vehiculo_id) {
        const vehiculoExiste = await Vehiculo.findByPk(vehiculo_id);
        if (!vehiculoExiste) {
          return res.status(404).json({
            success: false,
            mensaje: 'El vehículo especificado no existe'
          });
        }
      }

      // Verificar disponibilidad (no permitir citas solapadas para el mismo usuario)
      if (usuario_id && fecha_cita && hora_cita) {
        const citasSolapadas = await Cita.findOne({
          where: {
            usuario_id,
            fecha_cita,
            hora_cita,
            cita_id: { [Op.ne]: id } // Excluir la cita actual
          }
        });

        if (citasSolapadas) {
          return res.status(400).json({
            success: false,
            mensaje: 'El usuario ya tiene una cita programada para esa fecha y hora'
          });
        }
      }

      // Actualizar cita
      await cita.update({
        cliente_id,
        usuario_id,
        vehiculo_id,
        fecha_cita,
        hora_cita,
        lugar,
        comentarios
      });

      res.json({
        success: true,
        mensaje: 'Cita actualizada exitosamente',
        data: cita
      });
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Eliminar una cita
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      const cita = await Cita.findByPk(id);

      if (!cita) {
        return res.status(404).json({
          success: false,
          mensaje: 'Cita no encontrada'
        });
      }

      // Eliminar cita
      await cita.destroy();

      res.json({
        success: true,
        mensaje: 'Cita eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Obtener citas por fecha
  obtenerPorFecha: async (req, res) => {
    try {
      const { fecha } = req.params;
      
      if (!fecha) {
        return res.status(400).json({
          success: false,
          mensaje: 'Se requiere una fecha'
        });
      }

      const citas = await Cita.findAll({
        where: {
          fecha_cita: fecha
        },
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Usuario, as: 'usuario' },
          { model: Vehiculo, as: 'vehiculo' }
        ],
        order: [['hora_cita', 'ASC']]
      });

      res.json({
        success: true,
        data: citas
      });
    } catch (error) {
      console.error('Error al obtener citas por fecha:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Obtener citas por cliente
  obtenerPorCliente: async (req, res) => {
    try {
      const { clienteId } = req.params;
      
      if (!clienteId) {
        return res.status(400).json({
          success: false,
          mensaje: 'Se requiere un ID de cliente'
        });
      }

      const citas = await Cita.findAll({
        where: {
          cliente_id: clienteId
        },
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Usuario, as: 'usuario' },
          { model: Vehiculo, as: 'vehiculo' }
        ],
        order: [['fecha_cita', 'ASC'], ['hora_cita', 'ASC']]
      });

      res.json({
        success: true,
        data: citas
      });
    } catch (error) {
      console.error('Error al obtener citas por cliente:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Obtener citas por usuario
  obtenerPorUsuario: async (req, res) => {
    try {
      const { usuarioId } = req.params;
      
      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          mensaje: 'Se requiere un ID de usuario'
        });
      }

      const citas = await Cita.findAll({
        where: {
          usuario_id: usuarioId
        },
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Usuario, as: 'usuario' },
          { model: Vehiculo, as: 'vehiculo' }
        ],
        order: [['fecha_cita', 'ASC'], ['hora_cita', 'ASC']]
      });

      res.json({
        success: true,
        data: citas
      });
    } catch (error) {
      console.error('Error al obtener citas por usuario:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Buscar citas (por fecha, cliente o usuario)
  buscar: async (req, res) => {
    try {
      const { termino, tipo } = req.query;
      
      if (!termino) {
        return res.status(400).json({
          success: false,
          mensaje: 'Se requiere un término de búsqueda'
        });
      }

      let whereCondition = {};

      // Búsqueda por diferentes criterios
      switch (tipo) {
        case 'fecha':
          whereCondition = {
            fecha_cita: { [Op.eq]: termino }
          };
          break;
        case 'cliente':
          whereCondition = {
            '$cliente.nombre$': { [Op.iLike]: `%${termino}%` }
          };
          break;
        case 'usuario':
          whereCondition = {
            '$usuario.usuario$': { [Op.iLike]: `%${termino}%` }
          };
          break;
        case 'lugar':
          whereCondition = {
            lugar: { [Op.iLike]: `%${termino}%` }
          };
          break;
        default:
          // Búsqueda general
          whereCondition = {
            [Op.or]: [
              { fecha_cita: termino },
              { lugar: { [Op.iLike]: `%${termino}%` } },
              { comentarios: { [Op.iLike]: `%${termino}%` } }
            ]
          };
      }

      const citas = await Cita.findAll({
        where: whereCondition,
        include: [
          { model: Cliente, as: 'cliente' },
          { model: Usuario, as: 'usuario' },
          { model: Vehiculo, as: 'vehiculo' }
        ],
        order: [['fecha_cita', 'ASC'], ['hora_cita', 'ASC']]
      });

      res.json({
        success: true,
        data: citas
      });
    } catch (error) {
      console.error('Error al buscar citas:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = citaController;