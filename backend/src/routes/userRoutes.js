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
router.use('/admin', authMiddleware, checkRole(['admin']));
router.get('/admin', getAllUsers);
router.get('/admin/:id', getUserById);
router.put('/admin/:id', updateUser);
router.delete('/admin/:id', deleteUser);

module.exports = router; 