/**
 * Servidor del microservicio auth-service
 * Responsable de la autenticación y gestión de usuarios
 */

// Importaciones de dependencias
const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs'); // Necesario para Password.js

// Importaciones de entidades y objetos de valor del dominio
const User = require('./domain/entities/User');
const Password = require('./domain/value-objects/Password');

// Cargar variables de entorno
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config(); // Cargar desde .env en el directorio raíz o variables de entorno del sistema
}

// Configuración de la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'postgres', // En Docker será 'postgres'
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cliqueatools',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
};

// Crear el pool de conexiones
const pool = new Pool(dbConfig);

// Verificar conexión a la base de datos
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión a la base de datos establecida:', res.rows[0].now);
  }
});

/**
 * Implementación básica del repositorio de usuarios
 * Esta implementación se deberá trasladar a su propio archivo cuando se complete
 */
const userRepository = {
  /**
   * Busca un usuario por nombre de usuario
   * @param {string} username - Nombre de usuario a buscar
   * @returns {Promise<User|null>} - Instancia de User o null si no se encuentra
   */
  async findByUsername(username) {
    try {
      const result = await pool.query(
        'SELECT * FROM usuario WHERE username = $1',
        [username]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return User.fromDatabase(result.rows[0]);
    } catch (error) {
      console.error('Error en findByUsername:', error);
      throw error;
    }
  },
  
  /**
   * Busca un usuario por correo electrónico
   * @param {string} email - Correo electrónico a buscar
   * @returns {Promise<User|null>} - Instancia de User o null si no se encuentra
   */
  async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM usuario WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return User.fromDatabase(result.rows[0]);
    } catch (error) {
      console.error('Error en findByEmail:', error);
      throw error;
    }
  },
  
  /**
   * Guarda un usuario en la base de datos (creación o actualización)
   * @param {User} user - Instancia de User a guardar
   * @returns {Promise<User>} - Instancia de User actualizada
   */
  async save(user) {
    try {
      const userData = user.toJSON();
      
      if (user.id) {
        // Actualizar usuario existente
        const result = await pool.query(
          `UPDATE usuario SET 
          username = $1, 
          password = $2, 
          email = $3, 
          nombre = $4, 
          apellidos = $5, 
          rol = $6, 
          cliente_id = $7,
          ultimo_acceso = $8,
          intentos_fallidos = $9,
          activo = $10,
          token_recuperacion = $11,
          fecha_expiracion_token = $12,
          fecha_actualizacion = NOW()
          WHERE id = $13 RETURNING *`,
          [
            userData.username,
            userData.password,
            userData.email,
            userData.nombre,
            userData.apellidos,
            userData.rol,
            userData.cliente_id,
            userData.ultimo_acceso,
            userData.intentos_fallidos,
            userData.activo,
            userData.token_recuperacion,
            userData.fecha_expiracion_token,
            userData.id
          ]
        );
        
        return User.fromDatabase(result.rows[0]);
      } else {
        // Crear nuevo usuario
        const result = await pool.query(
          `INSERT INTO usuario(
            username, password, email, nombre, apellidos, rol, cliente_id, 
            ultimo_acceso, intentos_fallidos, activo, token_recuperacion, 
            fecha_expiracion_token, fecha_creacion, fecha_actualizacion
          ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) 
          RETURNING *`,
          [
            userData.username,
            userData.password,
            userData.email,
            userData.nombre,
            userData.apellidos,
            userData.rol,
            userData.cliente_id,
            userData.ultimo_acceso,
            userData.intentos_fallidos,
            userData.activo,
            userData.token_recuperacion,
            userData.fecha_expiracion_token
          ]
        );
        
        return User.fromDatabase(result.rows[0]);
      }
    } catch (error) {
      console.error('Error en save:', error);
      throw error;
    }
  }
};

/**
 * Implementación básica del caso de uso de autenticación de usuario
 * Esta implementación se deberá trasladar a su propio archivo cuando se complete
 */
const authenticateUser = {
  /**
   * Ejecuta el caso de uso de autenticación
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<Object>} - Datos del usuario y token JWT
   */
  async execute(username, password) {
    try {
      // Buscar usuario por nombre de usuario
      const user = await userRepository.findByUsername(username);
      
      if (!user) {
        throw new Error('Credenciales inválidas');
      }
      
      // Verificar si la cuenta está activa
      if (!user.activo) {
        throw new Error('La cuenta está desactivada. Contacte al administrador.');
      }
      
      // Verificar contraseña
      const isPasswordValid = await user.verifyPassword(password);
      
      if (!isPasswordValid) {
        // Registrar intento fallido
        await userRepository.save(user.registerFailedAttempt());
        throw new Error('Credenciales inválidas');
      }
      
      // Registrar acceso exitoso
      await userRepository.save(user.registerSuccessLogin());
      
      // Generar respuesta con datos básicos del usuario
      // En una implementación completa, aquí se generaría un token JWT
      return {
        user: user.toBasicInfo(),
        // token: jwt.sign(user.toBasicInfo(), process.env.JWT_SECRET, { expiresIn: '24h' })
      };
    } catch (error) {
      console.error('Error en authenticateUser:', error);
      throw error;
    }
  }
};

/**
 * Implementación básica del caso de uso de registro de usuario
 * Esta implementación se deberá trasladar a su propio archivo cuando se complete
 */
const registerUser = {
  /**
   * Ejecuta el caso de uso de registro
   * @param {Object} userData - Datos del usuario a registrar
   * @param {string} plainPassword - Contraseña en texto plano
   * @returns {Promise<Object>} - Datos básicos del usuario registrado
   */
  async execute(userData, plainPassword) {
    try {
      // Verificar si ya existe un usuario con el mismo username
      const existingUserByUsername = await userRepository.findByUsername(userData.username);
      if (existingUserByUsername) {
        throw new Error('El nombre de usuario ya está en uso');
      }
      
      // Verificar si ya existe un usuario con el mismo email
      const existingUserByEmail = await userRepository.findByEmail(userData.email);
      if (existingUserByEmail) {
        throw new Error('El correo electrónico ya está registrado');
      }
      
      // Crear nuevo usuario
      const newUser = await User.create(userData, plainPassword);
      
      // Validar datos del usuario
      const validationErrors = newUser.validate();
      if (Object.keys(validationErrors).length > 0) {
        throw new Error(JSON.stringify(validationErrors));
      }
      
      // Guardar usuario en la base de datos
      const savedUser = await userRepository.save(newUser);
      
      // Devolver datos básicos del usuario
      return savedUser.toBasicInfo();
    } catch (error) {
      console.error('Error en registerUser:', error);
      throw error;
    }
  }
};

// === RUTAS ===

// Ruta de verificación (health check)
app.get('/', (req, res) => {
  res.json({ service: 'auth-service', status: 'running' });
});

// Ruta de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Se requieren nombre de usuario y contraseña' 
      });
    }
    
    const result = await authenticateUser.execute(username, password);
    
    res.json(result);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(401).json({ error: error.message || 'Error de autenticación' });
  }
});

// Ruta de registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, email, nombre, apellidos, rol = 'cliente', clienteId = null } = req.body;
    
    if (!username || !password || !email || !nombre || !apellidos) {
      return res.status(400).json({ 
        error: 'Faltan campos obligatorios' 
      });
    }
    
    const userData = {
      username,
      email,
      nombre,
      apellidos,
      rol,
      clienteId
    };
    
    const result = await registerUser.execute(userData, password);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error en registro:', error);
    
    // Determinar el código de estado adecuado
    let statusCode = 500;
    if (error.message.includes('ya está en uso') || error.message.includes('ya está registrado')) {
      statusCode = 409; // Conflicto
    } else if (error.message.includes('La contraseña debe')) {
      statusCode = 400; // Bad Request
    }
    
    res.status(statusCode).json({ error: error.message || 'Error al registrar usuario' });
  }
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor auth-service ejecutándose en el puerto ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de señales para cierre graceful
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

/**
 * Función para cerrar conexiones y finalizar el servidor de forma controlada
 */
function shutdown() {
  console.log('Cerrando el servidor auth-service...');
  
  // Cerrar el pool de conexiones a la base de datos
  pool.end(() => {
    console.log('Conexión a la base de datos cerrada');
    process.exit(0);
  });
  
  // Si después de 5 segundos no se ha cerrado, forzar el cierre
  setTimeout(() => {
    console.error('Forzando cierre por timeout');
    process.exit(1);
  }, 5000);
}

// Exportar para testing (opcional)
module.exports = app;
