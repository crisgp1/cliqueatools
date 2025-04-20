const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Sequelize } = require('sequelize');

// Configuración de la base de datos con soporte para múltiples schemas
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // Cambiar a console.log para ver todas las consultas SQL
    dialectOptions: {
      ssl: {
        require: process.env.DB_SSL === 'true' || true,
        rejectUnauthorized: false // No recomendado para producción
      }
    },
    define: {
      timestamps: true, // Crea campos createdAt y updatedAt
      underscored: true, // Usa snake_case para nombres de columnas
      freezeTableName: false, // Permite que Sequelize pluralice nombres de tablas
      // No definimos un schema por defecto para permitir que cada modelo especifique su propio schema
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  Sequelize
};