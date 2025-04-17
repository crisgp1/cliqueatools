module.exports = (sequelize, DataTypes) => {
  const Vehiculo = sequelize.define('Vehiculo', {
    // Todos los campos quedan igual
    id_vehiculo: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: 'id_vehiculo'
    },
    // ... [todos los demás campos se mantienen exactamente igual]
    
    // Modificar estos dos campos de referencia para evitar problemas entre esquemas
    creado_por: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'creado_por',
      // Aquí está el cambio: simplificar la referencia para evitar problemas de esquema cruzado
      references: {
        model: 'usuarios', // Sin especificar schema en la referencia
        key: 'id_usuario'
      }
    },
    actualizado_por: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'actualizado_por',
      // Igual que arriba, simplificar la referencia
      references: {
        model: 'usuarios', // Sin especificar schema en la referencia
        key: 'id_usuario'
      }
    }
  }, {
    tableName: 'vehiculos',
    schema: 'inventario',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  // Esta parte puede dejarse comentada inicialmente para evitar errores de asociación
  // hasta que todos los modelos estén correctamente configurados
  Vehiculo.associate = function(models) {
    // Comentamos temporalmente todas las asociaciones para evitar errores
    // Las iremos descomentando una vez que el modelo básico funcione
    
    /* 
    // Un vehículo puede estar en muchos créditos
    Vehiculo.hasMany(models.Credito, {
      foreignKey: 'id_vehiculo',
      as: 'creditos'
    });

    // Un vehículo puede estar en muchos contratos (relación muchos a muchos)
    Vehiculo.belongsToMany(models.Contrato, {
      through: models.ContratoVehiculo,
      foreignKey: 'id_vehiculo',
      otherKey: 'id_contrato',
      as: 'contratos'
    });
    
    // Un vehículo fue creado por un usuario
    Vehiculo.belongsTo(models.Usuario, {
      foreignKey: 'creado_por',
      as: 'creador'
    });
    
    // Un vehículo fue actualizado por un usuario
    Vehiculo.belongsTo(models.Usuario, {
      foreignKey: 'actualizado_por',
      as: 'actualizador'
    });
    */
  };

  return Vehiculo;
};