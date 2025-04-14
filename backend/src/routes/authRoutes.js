const express = require('express');
const router = express.Router();
const { login, getProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Ruta para inicio de sesión
router.post('/login', login);

// Ruta para obtener perfil del usuario (protegida)
router.get('/profile', authMiddleware, getProfile);

module.exports = router; 