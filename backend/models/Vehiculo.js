module.exports = (sequelize, DataTypes) => {
  const Vehiculo = sequelize.define('Vehiculo', {
    id_vehiculo: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: 'id_vehiculo'
    },
    vin: {
      type: DataTypes.STRING(17),
      unique: true,
      allowNull: true,
      field: 'vin',
      validate: {
        is: /^[A-HJ-NPR-Z0-9]{17}$/
      }
    },
    num_serie: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: true,
      field: 'num_serie'
    },
    marca: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'marca'
    },
    modelo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'modelo'
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'anio',
      validate: {
        min: 1900,
        max: new Date().getFullYear() + 1
      }
    },
    version: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'version'
    },
    tipo_vehiculo: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'automovil',
      field: 'tipo_vehiculo'
    },
    color_exterior: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: 'color_exterior'
    },
    color_interior: {
      type: DataTypes.STRING(30),
      allowNull: true,
      field: 'color_interior'
    },
    transmision: {
      type: DataTypes.ENUM('manual', 'automatica', 'cvt', 'semi_automatica', 'doble_embrague', 'secuencial'),
      allowNull: false,
      field: 'transmision'
    },
    combustible: {
      type: DataTypes.ENUM('gasolina', 'diesel', 'hibrido', 'electrico', 'gas_lp', 'gas_natural', 'otro'),
      allowNull: false,
      field: 'combustible'
    },
    cilindros: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'cilindros'
    },
    cilindrada: {
      type: DataTypes.DECIMAL(5, 1),
      allowNull: true,
      field: 'cilindrada'
    },
    potencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'potencia'
    },
    rendimiento_ciudad: {
      type: DataTypes.DECIMAL(5, 1),
      allowNull: true,
      field: 'rendimiento_ciudad'
    },
    rendimiento_carretera: {
      type: DataTypes.DECIMAL(5, 1),
      allowNull: true,
      field: 'rendimiento_carretera'
    },
    odometro: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'odometro',
      validate: {
        min: 0
      }
    },
    unidad_odometro: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: 'km',
      field: 'unidad_odometro'
    },
    condicion: {
      type: DataTypes.ENUM('nuevo', 'seminuevo', 'usado', 'reconstruido', 'salvamento', 'clasico'),
      allowNull: false,
      defaultValue: 'usado',
      field: 'condicion'
    },
    origen: {
      type: DataTypes.ENUM('nacional', 'importado', 'fronterizo', 'regularizado', 'diplomatico'),
      allowNull: false,
      defaultValue: 'nacional',
      field: 'origen'
    },
    estatus_legal: {
      type: DataTypes.ENUM('limpio', 'en_proceso', 'reportado', 'recuperado', 'pendiente_documentos', 'restricciones'),
      allowNull: false,
      defaultValue: 'limpio',
      field: 'estatus_legal'
    },
    precio_compra: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'precio_compra',
      validate: {
        min: 0
      }
    },
    precio_lista: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'precio_lista',
      validate: {
        min: 0
      }
    },
    precio_minimo: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'precio_minimo',
      validate: {
        min: 0
      }
    },
    adquisicion: {
      type: DataTypes.ENUM('compra_directa', 'consignacion', 'intercambio', 'subasta', 'importacion', 'recuperacion'),
      allowNull: false,
      field: 'adquisicion'
    },
    fecha_adquisicion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'fecha_adquisicion'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'descripcion'
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'observaciones'
    },
    disponible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'disponible'
    },
    destacado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'destacado'
    },
    creado_por: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'creado_por',
      references: {
        model: 'usuarios',
        key: 'id_usuario'
      }
    },
    actualizado_por: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'actualizado_por',
      references: {
        model: 'usuarios',
        key: 'id_usuario'
      }
    }
  }, {
    tableName: 'vehiculos',
    schema: 'inventario',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  Vehiculo.associate = function(models) {
    // Comentamos temporalmente todas las asociaciones para evitar errores
    // Las iremos descomentando una vez que el modelo básico funcione
    
    /* 
    // Un vehículo puede estar en muchos créditos
    Vehiculo.hasMany(models.Credito, {
      foreignKey: 'id_vehiculo',
      as: 'creditos'
    });

    // Un vehículo puede estar en muchos contratos (relación muchos a muchos)
    Vehiculo.belongsToMany(models.Contrato, {
      through: models.ContratoVehiculo,
      foreignKey: 'id_vehiculo',
      otherKey: 'id_contrato',
      as: 'contratos'
    });
    
    // Un vehículo fue creado por un usuario
    Vehiculo.belongsTo(models.Usuario, {
      foreignKey: 'creado_por',
      as: 'creador'
    });
    
    // Un vehículo fue actualizado por un usuario
    Vehiculo.belongsTo(models.Usuario, {
      foreignKey: 'actualizado_por',
      as: 'actualizador'
    });
    */
  };

  return Vehiculo;
};
