module.exports = (sequelize, DataTypes) => {
  const Cita = sequelize.define('Cita', {
    cita_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'cita_id'
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
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'usuario_id',
      references: {
        model: 'usuarios',
        key: 'usuario_id'
      }
    },
    vehiculo_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'vehiculo_id',
      references: {
        model: 'vehiculos',
        key: 'vehiculo_id'
      }
    },
    fecha_cita: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'fecha_cita'
    },
    hora_cita: {
      type: DataTypes.TIME,
      allowNull: false,
      field: 'hora_cita'
    },
    lugar: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'lugar'
    },
    comentarios: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'comentarios'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'citas',
    schema: 'cliquea',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Cita.associate = function(models) {
    // Una cita pertenece a un cliente
    Cita.belongsTo(models.Cliente, {
      foreignKey: 'cliente_id',
      as: 'cliente'
    });

    // Una cita puede pertenecer a un usuario
    Cita.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'usuario'
    });

    // Una cita puede estar relacionada con un vehículo
    Cita.belongsTo(models.Vehiculo, {
      foreignKey: 'vehiculo_id',
      as: 'vehiculo'
    });
  };

  return Cita;
};