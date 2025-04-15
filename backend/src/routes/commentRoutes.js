const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getTicketComments,
  createComment,
  deleteComment
} = require('../controllers/commentController');

// Middleware de autenticación para todas las rutas de comentarios
router.use(authMiddleware);

// Obtener comentarios de un ticket
router.get('/ticket/:ticketId', getTicketComments);

// Crear un comentario en un ticket
router.post('/ticket/:ticketId', createComment);

// Eliminar un comentario
router.delete('/:commentId', deleteComment);

module.exports = router; 