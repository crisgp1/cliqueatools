module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    usuario_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'usuario_id'
    },
    numero_empleado: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: true,
      field: 'numero_empleado'
    },
    usuario: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      field: 'usuario'
    },
    hashed_password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'hashed_password'
    },
    rol: {
      type: DataTypes.ENUM('capturista', 'director', 'creditos', 'gerencia', 'admin'),
      allowNull: false,
      field: 'rol'
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
    tableName: 'usuarios',
    schema: 'cliquea',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Usuario.associate = function(models) {
    // Definir asociaciones si es necesario en el futuro
  };

  return Usuario;
};