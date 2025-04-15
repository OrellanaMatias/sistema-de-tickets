const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar el token JWT
const authMiddleware = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.header('Authorization');
    console.log('[DEBUG] authMiddleware - Header de autorización:', authHeader ? 'Presente' : 'Ausente');
    
    // Extraer el token si existe (formato: "Bearer TOKEN")
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;
    
    console.log('[DEBUG] authMiddleware - Token extraído:', token ? `${token.substring(0, 15)}...` : 'No presente');
    
    if (!token) {
      console.log('[DEBUG] authMiddleware - No se proporcionó token');
      return res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    }
    
    try {
      // Verificar el token
      const jwtSecret = process.env.JWT_SECRET || 'secreto_jwt_desarrollo_local';
      const decoded = jwt.verify(token, jwtSecret);
      console.log('[DEBUG] authMiddleware - Token decodificado:', decoded);
      
      // Buscar el usuario en la base de datos
      const user = await User.findByPk(decoded.id);
      console.log('[DEBUG] authMiddleware - Usuario encontrado:', user ? `ID: ${user.id}, Role: ${user.role}` : 'No');
      
      if (!user || !user.active) {
        console.log('[DEBUG] authMiddleware - Usuario no encontrado o inactivo');
        return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
      }
      
      // Adjuntar el usuario y token a la solicitud
      req.user = user;
      req.token = token;
      console.log('[DEBUG] authMiddleware - Usuario autenticado:', { id: user.id, role: user.role });
      
      // Continuar con la siguiente función
      next();
    } catch (jwtError) {
      console.error('[DEBUG] authMiddleware - Error al verificar token:', jwtError.message);
      return res.status(401).json({ error: 'Token inválido o expirado', details: jwtError.message });
    }
  } catch (error) {
    console.error('[DEBUG] authMiddleware - Error general:', error.message);
    res.status(500).json({ error: 'Error del servidor al procesar la autenticación' });
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