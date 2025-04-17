module.exports = (sequelize, DataTypes) => {
  const Banco = sequelize.define('Banco', {
    id_banco: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: 'id_banco'
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'nombre',
      unique: true
    },
    nombre_corto: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'nombre_corto'
    },
    tasa_promedio: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'tasa_promedio',
      comment: 'Tasa de interés promedio anual'
    },
    cat_promedio: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'cat_promedio',
      comment: 'Costo Anual Total promedio'
    },
    comision: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'comision',
      comment: 'Comisión por apertura, ej: 2.00 = 2%'
    },
    plazo_maximo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'plazo_maximo'
    },
    monto_maximo: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'monto_maximo'
    },
    requisitos: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'requisitos'
    },
    contacto: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'contacto'
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'telefono'
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'correo'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'activo'
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'logo',
      comment: 'Ruta o URL al logo del banco'
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
    tableName: 'instituciones',
    schema: 'bancos',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  Banco.associate = function(models) {
    // Un banco puede tener muchos créditos
    Banco.hasMany(models.Credito, {
      foreignKey: 'id_banco',
      as: 'creditos'
    });
  };

  return Banco;
};