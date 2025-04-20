module.exports = (sequelize, DataTypes) => {
  const Credito = sequelize.define('Credito', {
    id_credito: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      field: 'id_credito'
    },
    id_cliente: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'id_cliente',
      references: {
        model: 'datos',
        key: 'id_cliente'
      }
    },
    id_vehiculo: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'id_vehiculo',
      references: {
        model: 'vehiculos',
        key: 'id_vehiculo'
      }
    },
    id_banco: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'id_banco',
      references: {
        model: 'instituciones',
        key: 'id_banco'
      }
    },
    id_plan: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'id_plan',
      references: {
        model: 'planes_financiamiento',
        key: 'id_plan'
      }
    },
    folio: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      field: 'folio'
    },
    estado: {
      type: DataTypes.ENUM('solicitud', 'analisis', 'aprobado', 'rechazado', 'activo', 'pagado', 'cancelado', 'mora', 'restructurado'),
      allowNull: false,
      defaultValue: 'solicitud',
      field: 'estado'
    },
    monto_financiado: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'monto_financiado',
      validate: {
        min: {
          args: [0],
          msg: 'El monto financiado debe ser mayor a 0'
        }
      }
    },
    enganche: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'enganche',
      validate: {
        min: {
          args: [0],
          msg: 'El enganche no puede ser negativo'
        }
      }
    },
    plazo_meses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'plazo_meses',
      validate: {
        isInt: {
          msg: 'El plazo debe ser un número entero'
        },
        min: {
          args: [1],
          msg: 'El plazo mínimo es de 1 mes'
        }
      }
    },
    monto_mensual: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'monto_mensual',
      validate: {
        min: {
          args: [0],
          msg: 'El monto mensual debe ser mayor a 0'
        }
      }
    },
    tasa_anual: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'tasa_anual',
      comment: 'Tasa de interés anual, ej: 12.50 = 12.5%',
      validate: {
        min: {
          args: [0],
          msg: 'La tasa anual no puede ser negativa'
        },
        max: {
          args: [100],
          msg: 'La tasa anual no puede ser mayor a 100%'
        }
      }
    },
    cat_personalizado: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'cat_personalizado',
      comment: 'CAT personalizado',
      validate: {
        min: {
          args: [0],
          msg: 'El CAT no puede ser negativo'
        },
        max: {
          args: [100],
          msg: 'El CAT no puede ser mayor a 100%'
        }
      }
    },
    comision_apertura: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'comision_apertura'
    },
    seguro_auto: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'seguro_auto'
    },
    seguro_vida: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'seguro_vida'
    },
    otros_cargos: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'otros_cargos'
    },
    fecha_solicitud: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'fecha_solicitud'
    },
    fecha_aprobacion: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'fecha_aprobacion'
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'fecha_inicio'
    },
    fecha_vencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'fecha_vencimiento'
    },
    dia_pago: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'dia_pago',
      validate: {
        min: {
          args: [1],
          msg: 'El día de pago debe ser entre 1 y 31'
        },
        max: {
          args: [31],
          msg: 'El día de pago debe ser entre 1 y 31'
        }
      }
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'observaciones'
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'fecha_creacion'
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'fecha_actualizacion'
    },
    creado_por: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'creado_por',
      references: {
        model: 'usuarios',
        key: 'id_usuario'
      }
    },
    actualizado_por: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'actualizado_por',
      references: {
        model: 'usuarios',
        key: 'id_usuario'
      }
    }
  }, {
    tableName: 'creditos',
    schema: 'financiamiento',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion',
    underscored: true
  });

  Credito.associate = function(models) {
    // Un crédito pertenece a un cliente
    Credito.belongsTo(models.Cliente, {
      foreignKey: 'id_cliente',
      as: 'cliente'
    });

    // Un crédito pertenece a un vehículo
    Credito.belongsTo(models.Vehiculo, {
      foreignKey: 'id_vehiculo',
      as: 'vehiculo'
    });

    // Un crédito pertenece a un banco
    Credito.belongsTo(models.Banco, {
      foreignKey: 'id_banco',
      as: 'banco'
    });
    
    // Commented out until Plan model is properly defined
    // Credito.belongsTo(models.Plan, {
    //   foreignKey: 'id_plan',
    //   as: 'plan',
    //   allowNull: true
    // });
    
    // Commented out until TablaAmortizacion model is properly defined
    // Credito.hasMany(models.TablaAmortizacion, {
    //   foreignKey: 'id_credito',
    //   as: 'tabla_amortizacion'
    // });
    
    // Commented out until Pago model is properly defined
    // Credito.hasMany(models.Pago, {
    //   foreignKey: 'id_credito',
    //   as: 'pagos'
    // });
    
    // Commented out until DocumentoCredito model is properly defined
    // Credito.hasMany(models.DocumentoCredito, {
    //   foreignKey: 'id_credito',
    //   as: 'documentos'
    // });
    
    // Commented out until HistorialEstatusCredito model is properly defined
    // Credito.hasMany(models.HistorialEstatusCredito, {
    //   foreignKey: 'id_credito',
    //   as: 'historial_estatus'
    // });
    
    // Un crédito fue creado por un usuario
    Credito.belongsTo(models.Usuario, {
      foreignKey: 'creado_por',
      as: 'creador'
    });
    
    // Un crédito fue actualizado por un usuario
    Credito.belongsTo(models.Usuario, {
      foreignKey: 'actualizado_por',
      as: 'actualizador'
    });
  };

  return Credito;
};