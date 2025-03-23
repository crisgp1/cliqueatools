module.exports = (sequelize, DataTypes) => {
  const Contrato = sequelize.define('Contrato', {
    contrato_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'contrato_id'
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'cliente_id',
      references: {
        model: 'clientes',
        key: 'cliente_id'
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
    schema: 'cliquea',
    timestamps: false // La tabla contratos no tiene timestamps según el esquema
  });

  Contrato.associate = function(models) {
    // Un contrato pertenece a un cliente
    Contrato.belongsTo(models.Cliente, {
      foreignKey: 'cliente_id',
      as: 'cliente'
    });

    // Un contrato puede tener muchos vehículos (relación muchos a muchos)
    Contrato.belongsToMany(models.Vehiculo, {
      through: models.ContratoVehiculo,
      foreignKey: 'contrato_id',
      otherKey: 'vehiculo_id',
      as: 'vehiculos'
    });
  };

  return Contrato;
};