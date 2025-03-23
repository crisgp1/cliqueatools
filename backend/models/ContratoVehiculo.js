module.exports = (sequelize, DataTypes) => {
  const ContratoVehiculo = sequelize.define('ContratoVehiculo', {
    // No necesitamos un ID adicional ya que usamos una clave primaria compuesta
    contrato_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: 'contrato_id',
      references: {
        model: 'contratos',
        key: 'contrato_id'
      }
    },
    vehiculo_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: 'vehiculo_id',
      references: {
        model: 'vehiculos',
        key: 'vehiculo_id'
      }
    }
    // No necesitamos campos adicionales en esta tabla pivote simple
  }, {
    tableName: 'contrato_vehiculos',
    schema: 'cliquea',
    timestamps: false, // La tabla pivote no tiene timestamps según el esquema
    underscored: true
  });

  ContratoVehiculo.associate = function(models) {
    // Las asociaciones ya están definidas en los modelos Contrato y Vehiculo
  };

  return ContratoVehiculo;
};