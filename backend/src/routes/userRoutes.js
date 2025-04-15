const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateProfile,
  authUser
} = require('../controllers/userController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Rutas públicas
router.post('/register', createUser);
router.post('/login', authUser);

// Rutas protegidas para usuarios
router.route('/profile')
  .get(authMiddleware, getUserProfile)
  .put(authMiddleware, updateProfile);

// Rutas administrativas (requieren rol admin)
// En lugar de usar router.use, vamos a definir cada ruta explícitamente con sus middlewares
router.get('/admin', authMiddleware, checkRole(['admin']), getAllUsers);
router.get('/admin/:id', authMiddleware, checkRole(['admin']), getUserById);
router.post('/admin', authMiddleware, checkRole(['admin']), createUser);
router.put('/admin/:id', authMiddleware, checkRole(['admin']), updateUser);
router.delete('/admin/:id', authMiddleware, checkRole(['admin']), deleteUser);

module.exports = router; 