module.exports = (sequelize, DataTypes) => {
  const Banco = sequelize.define('Banco', {
    banco_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'banco_id'
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'nombre'
    },
    tasa: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'tasa',
      comment: 'Tasa de interés anual, ej: 12.50 = 12.5%'
    },
    cat: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'cat',
      comment: 'Costo Anual Total, ej: 16.20 = 16.2%'
    },
    comision: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'comision',
      comment: 'Comisión por apertura, ej: 2.00 = 2%'
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'logo',
      comment: 'Ruta o URL al logo del banco'
    }
  }, {
    tableName: 'bancos',
    schema: 'cliquea',
    timestamps: false // La tabla bancos no tiene timestamps según el esquema
  });

  Banco.associate = function(models) {
    // Un banco puede tener muchos créditos
    Banco.hasMany(models.Credito, {
      foreignKey: 'banco_id',
      as: 'creditos'
    });
  };

  return Banco;
};