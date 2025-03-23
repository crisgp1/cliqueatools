module.exports = (sequelize, DataTypes) => {
  const Credito = sequelize.define('Credito', {
    credito_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'credito_id'
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
    vehiculo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'vehiculo_id',
      references: {
        model: 'vehiculos',
        key: 'vehiculo_id'
      }
    },
    banco_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'banco_id',
      references: {
        model: 'bancos',
        key: 'banco_id'
      }
    },
    monto_financiado: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'monto_financiado'
    },
    plazo_meses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'plazo_meses',
      validate: {
        isInt: {
          msg: 'El plazo debe ser un número entero'
        },
        min: {
          args: [1],
          msg: 'El plazo mínimo es de 1 mes'
        }
      }
    },
    tasa_anual: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'tasa_anual',
      comment: 'Tasa de interés anual, ej: 12.50 = 12.5%'
    },
    cat_personalizado: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'cat_personalizado',
      comment: 'CAT personalizado, si es diferente al del banco'
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'fecha_creacion'
    }
  }, {
    tableName: 'creditos',
    schema: 'cliquea',
    timestamps: false, // Usamos fecha_creacion en su lugar
    underscored: true
  });

  Credito.associate = function(models) {
    // Un crédito pertenece a un cliente
    Credito.belongsTo(models.Cliente, {
      foreignKey: 'cliente_id',
      as: 'cliente'
    });

    // Un crédito pertenece a un vehículo
    Credito.belongsTo(models.Vehiculo, {
      foreignKey: 'vehiculo_id',
      as: 'vehiculo'
    });

    // Un crédito pertenece a un banco
    Credito.belongsTo(models.Banco, {
      foreignKey: 'banco_id',
      as: 'banco'
    });
  };

  return Credito;
};