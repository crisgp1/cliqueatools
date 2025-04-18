module.exports = (sequelize, DataTypes) => {
  const ContratoVehiculo = sequelize.define('ContratoVehiculo', {
    // No necesitamos un ID adicional ya que usamos una clave primaria compuesta
    contrato_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: 'id_contrato', // Cambiado para coincidir con el esquema en init.sql
      references: {
        model: 'contratos',
        key: 'id_contrato'
      }
    },
    vehiculo_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: 'id_vehiculo', // Cambiado para coincidir con el esquema en init.sql
      references: {
        model: 'vehiculos',
        key: 'id_vehiculo'
      }
    },
    // Añadimos los campos adicionales que existen en la tabla vehiculos_contrato
    precio_venta: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'precio_venta'
    },
    comision: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'comision'
    },
    impuestos: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'impuestos'
    },
    descuento: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'descuento'
    }
  }, {
    tableName: 'vehiculos_contrato', // Cambiado para coincidir con el esquema en init.sql
    schema: 'ventas', // Cambiado para coincidir con el esquema en init.sql
    timestamps: true, // La tabla tiene fecha_creacion según el esquema
    createdAt: 'fecha_creacion',
    updatedAt: false, // No hay campo de actualización
    underscored: true
  });

  ContratoVehiculo.associate = function(models) {
    // Las asociaciones ya están definidas en los modelos Contrato y Vehiculo
  };

  return ContratoVehiculo;
};
