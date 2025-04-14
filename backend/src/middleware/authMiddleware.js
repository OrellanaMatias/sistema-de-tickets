const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware para proteger rutas verificando el token JWT
 * Solo permite acceso a usuarios autenticados
 */
const protect = async (req, res, next) => {
  let token;

  // Verificar si existe el token en los headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Obtener token del header
      token = req.headers.authorization.split(' ')[1];

      // Verificar token con opciones de seguridad
      const jwtSecret = process.env.JWT_SECRET || 'secreto_jwt_desarrollo_local';
      const decoded = jwt.verify(token, jwtSecret, {
        issuer: 'ticketing-app',
        audience: 'user'
      });

      // Agregar usuario al request (sin password)
      // Solo si el usuario existe y está activo
      const user = await User.findOne({ 
        where: { 
          id: decoded.id,
          active: true 
        },
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Error de autenticación:', error.message);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Sesión expirada, por favor inicie sesión nuevamente' });
      }
      
      return res.status(401).json({ message: 'No autorizado, token inválido' });
    }
  } else {
    return res.status(401).json({ message: 'No autorizado, no se proporcionó token' });
  }
};

/**
 * Middleware para verificar roles de usuario
 * Restringe el acceso a ciertos roles específicos
 * @param {Array} roles - Array de roles permitidos
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'No tiene permiso para realizar esta acción' 
      });
    }
    
    next();
  };
};

module.exports = { protect, authorize }; 