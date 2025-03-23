const { Cliente, Sequelize } = require('../models');
const { Op } = Sequelize;

const clienteController = {
  // Crear un nuevo cliente
  crear: async (req, res) => {
    try {
      const { nombre, apellidos, email, telefono, rfc, direccion, ciudad, codigo_postal } = req.body;

      // Validaciones básicas
      if (!nombre || !apellidos) {
        return res.status(400).json({
          success: false,
          mensaje: 'Los campos nombre y apellidos son obligatorios'
        });
      }

      // Crear cliente
      const nuevoCliente = await Cliente.create({
        nombre,
        apellidos,
        email,
        telefono,
        rfc,
        direccion,
        ciudad,
        codigo_postal
      });

      res.status(201).json({
        success: true,
        mensaje: 'Cliente creado exitosamente',
        data: nuevoCliente
      });
    } catch (error) {
      console.error('Error al crear cliente:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Obtener todos los clientes
  obtenerTodos: async (req, res) => {
    try {
      const clientes = await Cliente.findAll();

      res.json({
        success: true,
        data: clientes
      });
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Obtener un cliente por su ID
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        return res.status(404).json({
          success: false,
          mensaje: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        data: cliente
      });
    } catch (error) {
      console.error('Error al obtener cliente por ID:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Actualizar un cliente
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, apellidos, email, telefono, rfc, direccion, ciudad, codigo_postal } = req.body;

      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        return res.status(404).json({
          success: false,
          mensaje: 'Cliente no encontrado'
        });
      }

      // Actualizar cliente
      await cliente.update({
        nombre,
        apellidos,
        email,
        telefono,
        rfc,
        direccion,
        ciudad,
        codigo_postal
      });

      res.json({
        success: true,
        mensaje: 'Cliente actualizado exitosamente',
        data: cliente
      });
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Eliminar un cliente
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        return res.status(404).json({
          success: false,
          mensaje: 'Cliente no encontrado'
        });
      }

      // Eliminar cliente
      await cliente.destroy();

      res.json({
        success: true,
        mensaje: 'Cliente eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Buscar clientes por nombre, apellidos o RFC
  buscar: async (req, res) => {
    try {
      const { termino } = req.query;
      
      if (!termino) {
        return res.status(400).json({
          success: false,
          mensaje: 'Se requiere un término de búsqueda'
        });
      }

      const clientes = await Cliente.findAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.iLike]: `%${termino}%` } },
            { apellidos: { [Op.iLike]: `%${termino}%` } },
            { rfc: { [Op.iLike]: `%${termino}%` } }
          ]
        }
      });

      res.json({
        success: true,
        data: clientes
      });
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = clienteController;