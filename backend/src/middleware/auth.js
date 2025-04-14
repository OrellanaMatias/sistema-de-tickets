const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar el token JWT
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_jwt_desarrollo');
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Middleware para verificar roles
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    if (roles.includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).json({ error: 'No tienes permisos para acceder a este recurso' });
  };
};

module.exports = {
  authMiddleware,
  checkRole
}; 