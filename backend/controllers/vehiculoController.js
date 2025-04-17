const { Vehiculo, Sequelize } = require('../models');
const { Op } = Sequelize;

const vehiculoController = {
  // Crear un nuevo vehículo
  crear: async (req, res) => {
    try {
      const { 
        marca, 
        modelo, 
        anio, 
        valor, 
        descripcion,
        color_exterior,
        color_interior,
        transmision,
        combustible,
        cilindros,
        cilindrada,
        potencia,
        odometro,
        unidad_odometro,
        condicion,
        origen,
        estatus_legal,
        precio_lista,
        precio_compra,
        precio_minimo,
        adquisicion,
        fecha_adquisicion,
        observaciones,
        disponible,
        destacado,
        vin,
        num_serie,
        version,
        tipo_vehiculo
      } = req.body;

      // Validaciones básicas
      if (!marca || !modelo || !anio) {
        return res.status(400).json({
          success: false,
          mensaje: 'Los campos marca, modelo y año son obligatorios'
        });
      }

      // Debug: Registrar datos recibidos
      console.log('Datos de creación recibidos:', JSON.stringify(req.body, null, 2));

      // Crear vehículo con valores por defecto completos
      const nuevoVehiculo = await Vehiculo.create({
        marca: marca || '',
        modelo: modelo || '',
        anio: anio || new Date().getFullYear(),
        descripcion: descripcion || '',
        color_exterior: color_exterior?.trim() || 'No especificado',
        color_interior: color_interior?.trim() || 'No especificado',
        transmision: transmision?.toLowerCase() || 'automática',
        combustible: combustible?.toLowerCase() || 'gasolina',
        cilindros: cilindros || 4,
        cilindrada: cilindrada || 0,
        potencia: potencia || 0,
        odometro: odometro || 0,
        unidad_odometro: unidad_odometro?.toLowerCase() || 'km',
        condicion: condicion?.toLowerCase() || 'nuevo',
        origen: origen?.toLowerCase() || 'nacional',
        estatus_legal: estatus_legal?.toLowerCase() || 'limpio',
        precio_lista: Number(precio_lista || valor || 0),
        precio_compra: Number(precio_compra || 0),
        precio_minimo: Number(precio_minimo || 0),
        adquisicion: adquisicion?.toLowerCase() || 'compra directa',
        fecha_adquisicion: fecha_adquisicion || new Date(),
        observaciones: observaciones || '',
        disponible: disponible !== undefined ? disponible : true,
        destacado: destacado || false,
        vin: vin || '',
        num_serie: num_serie || '',
        version: version || '',
        tipo_vehiculo: tipo_vehiculo || 'automovil'
      });

      // Crear respuesta compatible con frontend
      const responseData = nuevoVehiculo.toJSON();
      responseData.vehiculo_id = responseData.id_vehiculo;

      res.status(201).json({
        success: true,
        mensaje: 'Vehículo creado exitosamente',
        data: responseData
      });
    } catch (error) {
      console.error('Error detallado:', {
        message: error.message,
        stack: error.stack,
        validationErrors: error.errors?.map(e => ({
          path: e.path,
          message: e.message,
          value: e.value
        }))
      });
      
      res.status(500).json({
        success: false,
        mensaje: 'Error en la creación del vehículo',
        error: {
          tipo: error.name,
          mensaje: error.message,
          validaciones: error.errors?.map(e => ({
            campo: e.path,
            mensaje: e.message.replace('Validation error: ', '')
          }))
        }
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
        order: [['id_vehiculo', 'DESC']] // Más recientes primero
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
      const { 
        marca, 
        modelo, 
        anio, 
        valor, 
        descripcion,
        color_exterior,
        color_interior,
        transmision,
        combustible,
        cilindros,
        cilindrada,
        potencia,
        odometro,
        unidad_odometro,
        condicion,
        origen,
        estatus_legal,
        precio_lista,
        precio_compra,
        precio_minimo,
        adquisicion,
        fecha_adquisicion,
        observaciones,
        disponible,
        destacado,
        vin,
        num_serie,
        version,
        tipo_vehiculo
      } = req.body;

      const vehiculo = await Vehiculo.findByPk(id);

      if (!vehiculo) {
        return res.status(404).json({
          success: false,
          mensaje: 'Vehículo no encontrado'
        });
      }

      // Actualizar vehículo con todos los campos disponibles
      await vehiculo.update({
        marca,
        modelo,
        anio,
        descripcion,
        color_exterior: color_exterior || vehiculo.color_exterior,
        color_interior,
        transmision: transmision || vehiculo.transmision,
        combustible: combustible || vehiculo.combustible,
        cilindros,
        cilindrada,
        potencia,
        odometro: odometro !== undefined ? odometro : vehiculo.odometro,
        unidad_odometro: unidad_odometro || vehiculo.unidad_odometro,
        condicion: condicion || vehiculo.condicion,
        origen: origen || vehiculo.origen,
        estatus_legal: estatus_legal || vehiculo.estatus_legal,
        precio_lista: precio_lista || valor || vehiculo.precio_lista,
        precio_compra,
        precio_minimo,
        adquisicion: adquisicion || vehiculo.adquisicion,
        fecha_adquisicion: fecha_adquisicion || vehiculo.fecha_adquisicion,
        observaciones,
        disponible: disponible !== undefined ? disponible : vehiculo.disponible,
        destacado: destacado !== undefined ? destacado : vehiculo.destacado,
        vin,
        num_serie,
        version,
        tipo_vehiculo: tipo_vehiculo || vehiculo.tipo_vehiculo
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