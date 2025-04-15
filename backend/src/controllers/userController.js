const User = require('../models/User');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const generateToken = require('../utils/generateToken');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const createUser = asyncHandler(async (req, res) => {
  try {
    console.log("Datos recibidos en createUser:", req.body);
    console.log("URL de la solicitud:", req.originalUrl);
    
    const { email, password, displayName, role, active } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Por favor proporcione email y contraseña');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Error de validación: El email no tiene un formato válido:", email);
      return res.status(400).json({ error: 'El formato del email no es válido' });
    }

    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
      console.log("Error: El usuario ya existe:", email);
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Determinar si la solicitud proviene del panel de administración o del registro público
    const isAdmin = req.originalUrl.includes('/admin');
    
    console.log("Creando usuario con datos:", { email, displayName, role, active, isAdmin });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      displayName,
      password: hashedPassword,
      role: role || 'usuario',
      active: active !== undefined ? active : true
    });

    console.log("Usuario creado exitosamente:", user.id);

    if (user) {
      // Determinar qué información devolver según el origen de la solicitud
      if (isAdmin) {
        // Para solicitudes desde el panel de administración, devolver datos sin token
        res.status(201).json({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          active: user.active,
          createdAt: user.createdAt
        });
      } else {
        // Para solicitudes de registro público, incluir token de autenticación
        res.status(201).json({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          token: generateToken(user.id)
        });
      }
    } else {
      res.status(400);
      throw new Error('Datos de usuario inválidos');
    }
  } catch (error) {
    console.error("Error detallado al crear usuario:", error);
    res.status(500).json({ 
      error: error.message || 'Error en el servidor',
      details: error.toString()
    });
  }
});

const updateUser = async (req, res) => {
  try {
    const { displayName, password, email, role, active } = req.body;
    const userId = req.params.id;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    if (displayName) user.displayName = displayName;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    if (email) user.email = email;
    if (role) user.role = role;
    if (active !== undefined) user.active = active;
    
    await user.save();
    
    res.json({
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      active: user.active
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Primero verificamos si hay tickets asignados (para técnicos)
    if (user.role === 'tecnico') {
      const Ticket = require('../models/Ticket');
      const ticketsAsignados = await Ticket.count({
        where: { assignedToId: userId }
      });
      
      if (ticketsAsignados > 0) {
        return res.status(400).json({ 
          error: 'No se puede eliminar este técnico porque tiene tickets asignados', 
          message: 'Antes de eliminar este técnico, reasigna o desasigna sus tickets.'
        });
      }
    }
    
    // Eliminar automáticamente los comentarios del usuario
    try {
      const Comment = require('../models/Comment');
      const { sequelize } = require('../models/Comment');
      
      // Usar una transacción para asegurar que todo se realiza de forma atómica
      const transaction = await sequelize.transaction();
      
      try {
        // Eliminar comentarios del usuario
        await Comment.destroy({
          where: { userId: userId },
          transaction
        });
        
        // Eliminar el usuario
        await user.destroy({ transaction });
        
        // Confirmar transacción
        await transaction.commit();
        
        return res.json({ 
          message: 'Usuario eliminado correctamente',
          details: 'También se han eliminado todos sus comentarios asociados'
        });
      } catch (error) {
        // Revertir cambios si hay algún error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error durante la eliminación:', error);
      return res.status(500).json({ 
        error: 'Error al eliminar el usuario', 
        message: 'Ocurrió un problema al intentar eliminar los comentarios del usuario.'
      });
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor', message: error.message });
  }
};

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (user) {
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (user) {
    user.email = req.body.email || user.email;
    user.displayName = req.body.displayName || user.displayName;
    
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      role: updatedUser.role,
      token: generateToken(updatedUser.id)
    });
  } else {
    res.status(404);
    throw new Error('Usuario no encontrado');
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      token: generateToken(user.id)
    });
  } else {
    res.status(401);
    throw new Error('Email o contraseña incorrectos');
  }
});

// Obtener todos los técnicos
const getTechnicians = async (req, res) => {
  try {
    // Verificar que quien solicita es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
    }

    const technicians = await User.findAll({
      where: { role: 'tecnico', active: true },
      attributes: ['id', 'displayName', 'email'],
      order: [['displayName', 'ASC']]
    });

    return res.status(200).json(technicians);
  } catch (error) {
    console.error('Error al obtener técnicos:', error);
    return res.status(500).json({ message: 'Error al obtener técnicos', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateProfile,
  authUser,
  getTechnicians
}; 