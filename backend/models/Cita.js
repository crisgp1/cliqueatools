module.exports = (sequelize, DataTypes) => {
  const Cita = sequelize.define('Cita', {
    id_cita: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: 'id_cita'
    },
    id_cliente: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'id_cliente',
      references: {
        model: { tableName: 'datos', schema: 'clientes' },
        key: 'id_cliente'
      }
    },
    id_usuario: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'id_usuario',
      references: {
        model: { tableName: 'usuarios', schema: 'autenticacion' },
        key: 'id_usuario'
      }
    },
    id_vehiculo: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'id_vehiculo',
      references: {
        model: { tableName: 'vehiculos', schema: 'inventario' },
        key: 'id_vehiculo'
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
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'fecha_creacion'
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'fecha_actualizacion'
    }
  }, {
    tableName: 'citas',
    schema: 'servicio', // Asignamos la tabla al schema de servicio
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  Cita.associate = function(models) {
    // Una cita pertenece a un cliente
    Cita.belongsTo(models.Cliente, {
      foreignKey: 'id_cliente',
      as: 'cliente',
      targetKey: 'id_cliente'
    });

    // Una cita puede pertenecer a un usuario
    Cita.belongsTo(models.Usuario, {
      foreignKey: 'id_usuario',
      as: 'usuario',
      targetKey: 'id_usuario'
    });

    // Una cita puede estar relacionada con un vehículo
    Cita.belongsTo(models.Vehiculo, {
      foreignKey: 'id_vehiculo',
      as: 'vehiculo',
      targetKey: 'id_vehiculo'
    });
  };

  return Cita;
};