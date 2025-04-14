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
  const { email, password, displayName, role } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Por favor proporcione email y contraseña');
  }

  const userExists = await User.findOne({ where: { email } });

  if (userExists) {
    res.status(400);
    throw new Error('El usuario ya existe');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    email,
    displayName,
    password: hashedPassword,
    role
  });

  if (user) {
    res.status(201).json({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      token: generateToken(user.id)
    });
  } else {
    res.status(400);
    throw new Error('Datos de usuario inválidos');
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
    
    user.active = false;
    await user.save();
    
    res.json({ message: 'Usuario desactivado correctamente' });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
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

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateProfile,
  authUser
}; 