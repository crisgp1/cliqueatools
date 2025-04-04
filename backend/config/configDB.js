const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Sequelize } = require('sequelize');

// Configuración de Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    // SSL configuración - requerido para Render y otros proveedores cloud
    // Usamos variables de entorno o valores seguros por defecto
    dialectOptions: {
      ssl: {
        require: process.env.DB_SSL === 'true' || true, // Habilitado por defecto
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' || false // Deshabilitado por defecto para mayor compatibilidad
      }
    },
    define: {
      timestamps: true, // Por defecto agrega createdAt y updatedAt
      underscored: true, // snake_case para nombres de columnas
      freezeTableName: false, // pluralizar nombres de tabla
      schema: process.env.DB_SCHEMA // Usar el schema definido en .env
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
    console.log('Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  Sequelize
};