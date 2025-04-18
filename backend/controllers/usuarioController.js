const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// Función auxiliar para generar token JWT
const generarToken = (usuario) => {
  return jwt.sign(
    { 
      id: usuario.id_usuario, 
      usuario: usuario.nombre_usuario,
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
      const { numero_empleado, usuario, password, rol, correo } = req.body;

      // Verificar si el usuario ya existe
      const usuarioExistente = await Usuario.findOne({ 
        where: { nombre_usuario: usuario }
      });

      if (usuarioExistente) {
        return res.status(400).json({ 
          success: false, 
          mensaje: 'El nombre de usuario ya está en uso' 
        });
      }

      // Verificar si el correo ya existe
      const correoExistente = await Usuario.findOne({
        where: { correo }
      });

      if (correoExistente) {
        return res.status(400).json({
          success: false,
          mensaje: 'El correo electrónico ya está registrado'
        });
      }

      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const contrasena_hash = await bcrypt.hash(password, salt);

      // Crear nuevo usuario
      const nuevoUsuario = await Usuario.create({
        numero_empleado,
        nombre_usuario: usuario,
        contrasena_hash,
        correo,
        rol
      });

      // Excluir la contraseña en la respuesta
      const { contrasena_hash: _, ...usuarioData } = nuevoUsuario.toJSON();

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

      console.log('Intento de login para usuario:', usuario);

      // Verificar si el usuario existe
      const usuarioEncontrado = await Usuario.findOne({
        where: { nombre_usuario: usuario }
      });

      if (!usuarioEncontrado) {
        console.log('Usuario no encontrado:', usuario);
        return res.status(401).json({ 
          success: false, 
          mensaje: 'Credenciales inválidas' 
        });
      }

      console.log('Usuario encontrado:', usuarioEncontrado.nombre_usuario);

      // Verificar contraseña
      console.log('Verificando contraseña...');
      const passwordCorrecta = await bcrypt.compare(
        password, 
        usuarioEncontrado.contrasena_hash
      );

      console.log('Resultado de verificación de contraseña:', passwordCorrecta);

      if (!passwordCorrecta) {
        console.log('Contraseña incorrecta para usuario:', usuario);
        return res.status(401).json({ 
          success: false, 
          mensaje: 'Credenciales inválidas' 
        });
      }

      // Generar token JWT
      const token = generarToken(usuarioEncontrado);

      // Excluir la contraseña en la respuesta
      const { contrasena_hash: _, ...usuarioData } = usuarioEncontrado.toJSON();

      console.log('Login exitoso para usuario:', usuario);

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
        attributes: { exclude: ['contrasena_hash'] }
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
        attributes: { exclude: ['contrasena_hash'] }
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
      const { numero_empleado, usuario, password, rol, correo } = req.body;

      const usuarioExistente = await Usuario.findByPk(id);

      if (!usuarioExistente) {
        return res.status(404).json({ 
          success: false, 
          mensaje: 'Usuario no encontrado' 
        });
      }

      // Verificar si el correo ya está en uso por otro usuario
      if (correo && correo !== usuarioExistente.correo) {
        const correoExistente = await Usuario.findOne({
          where: { correo }
        });

        if (correoExistente) {
          return res.status(400).json({
            success: false,
            mensaje: 'El correo electrónico ya está registrado por otro usuario'
          });
        }
      }

      // Verificar si el nombre de usuario ya está en uso por otro usuario
      if (usuario && usuario !== usuarioExistente.nombre_usuario) {
        const nombreUsuarioExistente = await Usuario.findOne({
          where: { nombre_usuario: usuario }
        });

        if (nombreUsuarioExistente) {
          return res.status(400).json({
            success: false,
            mensaje: 'El nombre de usuario ya está en uso por otro usuario'
          });
        }
      }

      // Si se proporciona una nueva contraseña, encriptarla
      let datosActualizar = { 
        numero_empleado, 
        nombre_usuario: usuario, 
        correo,
        rol 
      };
      
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const contrasena_hash = await bcrypt.hash(password, salt);
        datosActualizar.contrasena_hash = contrasena_hash;
      }

      // Actualizar usuario
      await usuarioExistente.update(datosActualizar);

      // Excluir la contraseña en la respuesta
      const { contrasena_hash: _, ...usuarioActualizado } = usuarioExistente.toJSON();

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
