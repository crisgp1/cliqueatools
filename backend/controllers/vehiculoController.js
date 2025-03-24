const { Vehiculo, Sequelize } = require('../models');
const { Op } = Sequelize;

const vehiculoController = {
  // Crear un nuevo vehículo
  crear: async (req, res) => {
    try {
      const { marca, modelo, anio, valor, descripcion } = req.body;

      // Validaciones básicas
      if (!marca || !modelo || !anio || !valor) {
        return res.status(400).json({
          success: false,
          mensaje: 'Los campos marca, modelo, año y valor son obligatorios'
        });
      }

      // Crear vehículo
      const nuevoVehiculo = await Vehiculo.create({
        marca,
        modelo,
        anio,
        valor,
        descripcion
      });

      res.status(201).json({
        success: true,
        mensaje: 'Vehículo creado exitosamente',
        data: nuevoVehiculo
      });
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Obtener todos los vehículos con paginación
  obtenerTodos: async (req, res) => {
    try {
      // Parámetros de paginación (opcionales)
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      // Obtener total de registros para metadatos de paginación
      const totalCount = await Vehiculo.count();
      
      // Consulta con paginación
      const vehiculos = await Vehiculo.findAll({
        limit,
        offset,
        order: [['vehiculo_id', 'DESC']] // Más recientes primero
      });

      res.json({
        success: true,
        data: vehiculos,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Obtener un vehículo por su ID
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const vehiculo = await Vehiculo.findByPk(id);

      if (!vehiculo) {
        return res.status(404).json({
          success: false,
          mensaje: 'Vehículo no encontrado'
        });
      }

      res.json({
        success: true,
        data: vehiculo
      });
    } catch (error) {
      console.error('Error al obtener vehículo por ID:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Actualizar un vehículo
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { marca, modelo, anio, valor, descripcion } = req.body;

      const vehiculo = await Vehiculo.findByPk(id);

      if (!vehiculo) {
        return res.status(404).json({
          success: false,
          mensaje: 'Vehículo no encontrado'
        });
      }

      // Actualizar vehículo
      await vehiculo.update({
        marca,
        modelo,
        anio,
        valor,
        descripcion
      });

      res.json({
        success: true,
        mensaje: 'Vehículo actualizado exitosamente',
        data: vehiculo
      });
    } catch (error) {
      console.error('Error al actualizar vehículo:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Eliminar un vehículo
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      const vehiculo = await Vehiculo.findByPk(id);

      if (!vehiculo) {
        return res.status(404).json({
          success: false,
          mensaje: 'Vehículo no encontrado'
        });
      }

      // Eliminar vehículo
      await vehiculo.destroy();

      res.json({
        success: true,
        mensaje: 'Vehículo eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar vehículo:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Buscar vehículos por marca, modelo o año
  buscar: async (req, res) => {
    try {
      const { termino } = req.query;
      const { anioMin, anioMax, valorMin, valorMax } = req.query;
      
      const where = {};
      
      // Búsqueda por término (marca o modelo)
      if (termino) {
        where[Op.or] = [
          { marca: { [Op.iLike]: `%${termino}%` } },
          { modelo: { [Op.iLike]: `%${termino}%` } }
        ];
      }
      
      // Filtro por rango de años
      if (anioMin || anioMax) {
        where.anio = {};
        if (anioMin) where.anio[Op.gte] = parseInt(anioMin);
        if (anioMax) where.anio[Op.lte] = parseInt(anioMax);
      }
      
      // Filtro por rango de valor
      if (valorMin || valorMax) {
        where.valor = {};
        if (valorMin) where.valor[Op.gte] = parseFloat(valorMin);
        if (valorMax) where.valor[Op.lte] = parseFloat(valorMax);
      }

      const vehiculos = await Vehiculo.findAll({ where });

      res.json({
        success: true,
        data: vehiculos
      });
    } catch (error) {
      console.error('Error al buscar vehículos:', error);
      res.status(500).json({
        success: false,
        mensaje: 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = vehiculoController;