module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    id_cliente: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: 'id_cliente'
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'nombre'
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'apellidos'
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'email',
      validate: {
        isEmail: {
          msg: 'El formato del email no es válido'
        }
      }
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'telefono'
    },
    rfc: {
      type: DataTypes.STRING(13),
      allowNull: true,
      field: 'rfc'
    },
    direccion: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'direccion'
    },
    ciudad: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'ciudad'
    },
    codigo_postal: {
      type: DataTypes.STRING(5),
      allowNull: true,
      field: 'codigo_postal'
    }
  }, {
    tableName: 'datos', // Nombre correcto de la tabla según init.sql
    schema: 'clientes', // Schema correcto según init.sql
    timestamps: false // La tabla clientes no tiene timestamps según el esquema
  });

  Cliente.associate = function(models) {
    // Un cliente puede tener muchos créditos
    Cliente.hasMany(models.Credito, {
      foreignKey: 'id_cliente',
      as: 'creditos'
    });

    // Un cliente puede tener muchos contratos
    Cliente.hasMany(models.Contrato, {
      foreignKey: 'id_cliente',
      as: 'contratos'
    });
  };

  return Cliente;
};