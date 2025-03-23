module.exports = (sequelize, DataTypes) => {
  const Vehiculo = sequelize.define('Vehiculo', {
    vehiculo_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'vehiculo_id'
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
        isInt: {
          msg: 'El año debe ser un número entero'
        },
        min: {
          args: [1900],
          msg: 'El año no puede ser anterior a 1900'
        },
        max: {
          args: [new Date().getFullYear() + 1],
          msg: 'El año no puede ser posterior al año siguiente'
        }
      }
    },
    valor: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'valor'
    },
    descripcion: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'descripcion'
    }
  }, {
    tableName: 'vehiculos',
    schema: 'cliquea',
    timestamps: false // La tabla vehiculos no tiene timestamps según el esquema
  });

  Vehiculo.associate = function(models) {
    // Un vehículo puede estar en muchos créditos
    Vehiculo.hasMany(models.Credito, {
      foreignKey: 'vehiculo_id',
      as: 'creditos'
    });

    // Un vehículo puede estar en muchos contratos (relación muchos a muchos)
    Vehiculo.belongsToMany(models.Contrato, {
      through: models.ContratoVehiculo,
      foreignKey: 'vehiculo_id',
      otherKey: 'contrato_id',
      as: 'contratos'
    });
  };

  return Vehiculo;
};