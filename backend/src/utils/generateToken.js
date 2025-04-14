const jwt = require('jsonwebtoken');

/**
 * Genera un token JWT para la autenticación de usuarios con opciones de seguridad mejoradas
 * 
 * @param {Object} payload - Datos a incluir en el token (preferiblemente solo IDs y roles, no información sensible)
 * @param {string} [expiresIn='24h'] - Tiempo de expiración del token (por defecto 24 horas)
 * @returns {string} - Token JWT generado
 */
const generateToken = (payload, expiresIn = '24h') => {
  // Asegurar que el secreto esté definido
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    console.error('JWT_SECRET no está definido en variables de entorno en producción');
    throw new Error('Error de configuración del servidor');
  }

  // Usar un secreto por defecto solo en desarrollo
  const jwtSecret = secret || 'secreto_jwt_desarrollo_local';
  
  // Añadir fecha de emisión y más opciones de seguridad
  return jwt.sign(
    payload,
    jwtSecret,
    { 
      expiresIn,
      issuer: 'ticketing-app',
      audience: 'user',
      notBefore: 0, // El token es válido inmediatamente
      jwtid: require('crypto').randomBytes(16).toString('hex') // ID único para el token
    }
  );
};

module.exports = generateToken; 