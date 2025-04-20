module.exports = (sequelize, DataTypes) => {
  const Contrato = sequelize.define('Contrato', {
    id_contrato: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: 'id_contrato'
    },
    id_cliente: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'id_cliente',
      references: {
        model: 'datos',
        key: 'id_cliente'
      }
    },
    ciudad: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'ciudad'
    },
    fecha_contrato: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'fecha_contrato'
    },
    hora_contrato: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'hora_contrato'
    },
    precio_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'precio_total'
    },
    forma_pago: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'forma_pago'
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'observaciones'
    }
  }, {
    tableName: 'contratos',
    schema: 'ventas',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  Contrato.associate = function(models) {
    // Un contrato pertenece a un cliente
    Contrato.belongsTo(models.Cliente, {
      foreignKey: 'id_cliente',
      as: 'cliente'
    });

    // Un contrato puede tener muchos vehículos (relación muchos a muchos)
    Contrato.belongsToMany(models.Vehiculo, {
      through: models.ContratoVehiculo,
      foreignKey: 'id_contrato',
      otherKey: 'id_vehiculo',
      as: 'vehiculos'
    });
  };

  return Contrato;
};
