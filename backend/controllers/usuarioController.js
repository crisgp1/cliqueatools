const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// Función auxiliar para generar token JWT
const generarToken = (usuario) => {
  return jwt.sign(
    { 
      id: usuario.usuario_id, 
      usuario: usuario.usuario,
      rol: usuario.rol 
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

// Controlador de usuarios
const usuarioController = {
  // Registrar un nuevo usuario
  registro: async (req, res) => {
    try {
      const { numero_empleado, usuario, password, rol } = req.body;

      // Verificar si el usuario ya existe
      const usuarioExistente = await Usuario.findOne({ 
        where: { usuario }
      });

      if (usuarioExistente) {
        return res.status(400).json({ 
          success: false, 
          mensaje: 'El nombre de usuario ya está en uso' 
        });
      }

      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const hashed_password = await bcrypt.hash(password, salt);

      // Crear nuevo usuario
      const nuevoUsuario = await Usuario.create({
        numero_empleado,
        usuario,
        hashed_password,
        rol
      });

      // Excluir la contraseña en la respuesta
      const { hashed_password: _, ...usuarioData } = nuevoUsuario.toJSON();

      res.status(201).json({
        success: true,
        mensaje: 'Usuario registrado exitosamente',
        data: usuarioData
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ 
        success: false, 
        mensaje: 'Error en el servidor',
        error: error.message 
      });
    }
  },

  // Iniciar sesión
  login: async (req, res) => {
    try {
      const { usuario, password } = req.body;

      // Verificar si el usuario existe
      const usuarioEncontrado = await Usuario.findOne({
        where: { usuario }
      });

      if (!usuarioEncontrado) {
        return res.status(401).json({ 
          success: false, 
          mensaje: 'Credenciales inválidas' 
        });
      }

      // Verificar contraseña
      const passwordCorrecta = await bcrypt.compare(
        password, 
        usuarioEncontrado.hashed_password
      );

      if (!passwordCorrecta) {
        return res.status(401).json({ 
          success: false, 
          mensaje: 'Credenciales inválidas' 
        });
      }

      // Generar token JWT
      const token = generarToken(usuarioEncontrado);

      // Excluir la contraseña en la respuesta
      const { hashed_password: _, ...usuarioData } = usuarioEncontrado.toJSON();

      res.json({
        success: true,
        mensaje: 'Inicio de sesión exitoso',
        data: {
          usuario: usuarioData,
          token
        }
      });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ 
        success: false, 
        mensaje: 'Error en el servidor',
        error: error.message 
      });
    }
  },

  // Obtener todos los usuarios (solo para administradores)
  obtenerTodos: async (req, res) => {
    try {
      const usuarios = await Usuario.findAll({
        attributes: { exclude: ['hashed_password'] }
      });

      res.json({
        success: true,
        data: usuarios
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ 
        success: false, 
        mensaje: 'Error en el servidor',
        error: error.message 
      });
    }
  },

  // Obtener un usuario por su ID
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;
      
      const usuario = await Usuario.findByPk(id, {
        attributes: { exclude: ['hashed_password'] }
      });

      if (!usuario) {
        return res.status(404).json({ 
          success: false, 
          mensaje: 'Usuario no encontrado' 
        });
      }

      res.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
      res.status(500).json({ 
        success: false, 
        mensaje: 'Error en el servidor',
        error: error.message 
      });
    }
  },

  // Actualizar un usuario
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { numero_empleado, usuario, password, rol } = req.body;

      const usuarioExistente = await Usuario.findByPk(id);

      if (!usuarioExistente) {
        return res.status(404).json({ 
          success: false, 
          mensaje: 'Usuario no encontrado' 
        });
      }

      // Si se proporciona una nueva contraseña, encriptarla
      let datosActualizar = { numero_empleado, usuario, rol };
      
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashed_password = await bcrypt.hash(password, salt);
        datosActualizar.hashed_password = hashed_password;
      }

      // Actualizar usuario
      await usuarioExistente.update(datosActualizar);

      // Excluir la contraseña en la respuesta
      const { hashed_password: _, ...usuarioActualizado } = usuarioExistente.toJSON();

      res.json({
        success: true,
        mensaje: 'Usuario actualizado exitosamente',
        data: usuarioActualizado
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ 
        success: false, 
        mensaje: 'Error en el servidor',
        error: error.message 
      });
    }
  },

  // Eliminar un usuario
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      const usuarioExistente = await Usuario.findByPk(id);

      if (!usuarioExistente) {
        return res.status(404).json({ 
          success: false, 
          mensaje: 'Usuario no encontrado' 
        });
      }

      await usuarioExistente.destroy();

      res.json({
        success: true,
        mensaje: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ 
        success: false, 
        mensaje: 'Error en el servidor',
        error: error.message 
      });
    }
  }
};

module.exports = usuarioController;