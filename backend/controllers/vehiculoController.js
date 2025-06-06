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
        tipo_vehiculo,
        tempImages // Nuevo campo para imágenes temporales
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
        marca: marca,
        modelo: modelo,
        anio: parseInt(anio),
        precio_lista: parseFloat(precio_lista),
        color_exterior: color_exterior,
        color_interior: color_interior,
        transmision: transmision,
        combustible: combustible,
        odometro: parseInt(odometro),
        unidad_odometro: unidad_odometro,
        condicion: condicion,
        origen: origen,
        estatus_legal: estatus_legal,
        adquisicion: adquisicion,
        fecha_adquisicion: fecha_adquisicion || new Date(),
        observaciones: observaciones || '',
        disponible: disponible !== undefined ? disponible : true,
        destacado: destacado || false,
        vin: vin || null,
        num_serie: num_serie || '',
        version: version || '',
        tipo_vehiculo: tipo_vehiculo || 'automovil'
      });

      // Crear respuesta compatible con frontend
      const responseData = {
        vehiculo_id: nuevoVehiculo.id_vehiculo,
        ...nuevoVehiculo.toJSON()
      };

      // Si hay imágenes temporales, asociarlas al vehículo
      if (tempImages && tempImages.length > 0) {
        try {
          const { sequelize } = require('../models');
          
          // Usar una transacción para asegurar la integridad de los datos
          const transaction = await sequelize.transaction();
          
          try {
            // Asociar cada imagen temporal al vehículo
            for (const img of tempImages) {
              // Usar id o id_media, dependiendo de cuál esté disponible
              const idMedia = img.id_media || img.id;
              
              if (!idMedia) {
                console.error('Error: imagen sin ID válido', img);
                continue;
              }
              
              await sequelize.query(`
                INSERT INTO archivos.vehiculo_medias (
                  id_vehiculo, id_media, es_principal, orden, creado_por
                ) VALUES (?, ?, ?, ?, ?)
              `, {
                replacements: [
                  nuevoVehiculo.id_vehiculo,
                  idMedia,
                  img.es_principal,
                  img.orden,
                  req.usuario?.id_usuario || 1
                ],
                transaction
              });
            }
            
            // Actualizar la carpeta de las imágenes en Cloudinary
            // Esto se podría hacer en un proceso en segundo plano para no bloquear la respuesta
            
            await transaction.commit();
            console.log(`Asociadas ${tempImages.length} imágenes al vehículo ${nuevoVehiculo.id_vehiculo}`);
          } catch (imgError) {
            await transaction.rollback();
            console.error('Error al asociar imágenes temporales:', imgError);
            // No fallamos la creación del vehículo si hay error en las imágenes
          }
        } catch (txError) {
          console.error('Error en transacción de imágenes:', txError);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Vehículo creado exitosamente',
        data: responseData,
        id: nuevoVehiculo.id_vehiculo
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
        message: 'Error en la creación del vehículo',
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
        vin: vin || null,
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