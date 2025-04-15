const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');
const User = require('../models/User');

// Obtener todos los comentarios de un ticket
const getTicketComments = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    // Verificar que el ticket exista
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: `Ticket con ID ${ticketId} no encontrado` });
    }
    
    // Verificar acceso si el usuario no es admin/técnico
    if (req.user.role === 'usuario' && ticket.userId !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permisos para ver los comentarios de este ticket' });
    }
    
    // Obtener comentarios con información del usuario
    const comments = await Comment.findAll({
      where: { ticketId },
      include: [
        { model: User, as: 'user', attributes: ['id', 'displayName', 'email', 'role'] }
      ],
      order: [['createdAt', 'ASC']]
    });
    
    // Transformar los comentarios para el frontend
    const transformedComments = comments.map(comment => {
      const plainComment = comment.get({ plain: true });
      return {
        id: plainComment.id,
        text: plainComment.text,
        userId: plainComment.userId,
        ticketId: plainComment.ticketId,
        user: plainComment.user,
        createdAt: plainComment.createdAt,
        updatedAt: plainComment.updatedAt
      };
    });
    
    return res.status(200).json(transformedComments);
  } catch (error) {
    console.error(`Error al obtener comentarios del ticket ${req.params.ticketId}:`, error);
    return res.status(500).json({ message: 'Error al obtener comentarios', error: error.message });
  }
};

// Crear un nuevo comentario
const createComment = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'El texto del comentario es obligatorio' });
    }
    
    // Verificar que el ticket exista
    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: `Ticket con ID ${ticketId} no encontrado` });
    }
    
    // Verificar acceso si el usuario no es admin/técnico
    if (req.user.role === 'usuario' && ticket.userId !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permisos para comentar en este ticket' });
    }
    
    // Crear el comentario
    const newComment = await Comment.create({
      text,
      userId,
      ticketId: Number(ticketId)
    });
    
    // Obtener el comentario con la información del usuario
    const commentWithUser = await Comment.findByPk(newComment.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'displayName', 'email', 'role'] }
      ]
    });
    
    // Transformar el comentario para el frontend
    const plainComment = commentWithUser.get({ plain: true });
    
    return res.status(201).json({
      id: plainComment.id,
      text: plainComment.text,
      userId: plainComment.userId,
      ticketId: plainComment.ticketId,
      user: plainComment.user,
      createdAt: plainComment.createdAt,
      updatedAt: plainComment.updatedAt
    });
  } catch (error) {
    console.error(`Error al crear comentario en ticket ${req.params.ticketId}:`, error);
    return res.status(500).json({ message: 'Error al crear comentario', error: error.message });
  }
};

// Eliminar un comentario (solo el propietario o admin)
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    // Verificar que el comentario exista
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: `Comentario con ID ${commentId} no encontrado` });
    }
    
    // Verificar permisos
    const isAdmin = req.user.role === 'admin';
    const isOwner = comment.userId === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este comentario' });
    }
    
    // Eliminar el comentario
    await comment.destroy();
    
    return res.status(200).json({ message: 'Comentario eliminado correctamente' });
  } catch (error) {
    console.error(`Error al eliminar comentario ${req.params.commentId}:`, error);
    return res.status(500).json({ message: 'Error al eliminar comentario', error: error.message });
  }
};

module.exports = {
  getTicketComments,
  createComment,
  deleteComment
}; 