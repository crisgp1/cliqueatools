module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    id_usuario: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: 'id_usuario'
    },
    numero_empleado: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: true,
      field: 'numero_empleado'
    },
    nombre_usuario: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      field: 'nombre_usuario'
    },
    contrasena_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'contrasena_hash'
    },
    correo: {
      type: DataTypes.STRING(150),
      unique: true,
      allowNull: false,
      field: 'correo'
    },
      rol: {
      type: DataTypes.ENUM('capturista', 'director', 'creditos', 'gerencia', 'administrador', 'vendedor', 'mecanico', 'valuador', 'contador', 'atencion_cliente', 'logistica', 'marketing', 'legal', 'rh'),
      allowNull: false,
      field: 'rol'
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
    tableName: 'usuarios',
    schema: 'autenticacion', // Explícitamente declaramos el schema
    timestamps: true,
    underscored: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  Usuario.associate = function(models) {
    // Definir asociaciones si es necesario en el futuro
  };

  return Usuario;
};