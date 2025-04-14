const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { Op } = require('sequelize');

const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'username', 'email'] }
      ],
      order: [['updatedAt', 'DESC']]
    });
    return res.status(200).json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    return res.status(500).json({ message: 'Error al obtener tickets', error: error.message });
  }
};

const getUserTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const tickets = await Ticket.findAll({
      where: { userId },
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'username', 'email'] }
      ],
      order: [['updatedAt', 'DESC']]
    });
    return res.status(200).json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets del usuario:', error);
    return res.status(500).json({ message: 'Error al obtener tickets del usuario', error: error.message });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'username', 'email'] }
      ]
    });
    
    if (!ticket) {
      return res.status(404).json({ message: `Ticket con ID ${id} no encontrado` });
    }
    
    if (req.user.role === 'usuario' && ticket.userId !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permisos para ver este ticket' });
    }
    
    return res.status(200).json(ticket);
  } catch (error) {
    console.error(`Error al obtener ticket ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al obtener detalles del ticket', error: error.message });
  }
};

const createTicket = async (req, res) => {
  try {
    const { title, description, priority, category } = req.body;
    const userId = req.user.id;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Título y descripción son obligatorios' });
    }
    
    const newTicket = await Ticket.create({
      title,
      description,
      priority: priority || 'media',
      category: category || 'otro',
      status: 'abierto',
      userId
    });
    
    return res.status(201).json(newTicket);
  } catch (error) {
    console.error('Error al crear ticket:', error);
    return res.status(500).json({ message: 'Error al crear ticket', error: error.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, category } = req.body;
    
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) {
      return res.status(404).json({ message: `Ticket con ID ${id} no encontrado` });
    }
    
    await ticket.update({
      title: title || ticket.title,
      description: description || ticket.description,
      priority: priority || ticket.priority,
      category: category || ticket.category
    });
    
    return res.status(200).json(ticket);
  } catch (error) {
    console.error(`Error al actualizar ticket ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al actualizar ticket', error: error.message });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['abierto', 'en_progreso', 'cerrado'].includes(status)) {
      return res.status(400).json({ message: 'Estado no válido' });
    }
    
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) {
      return res.status(404).json({ message: `Ticket con ID ${id} no encontrado` });
    }
    
    await ticket.update({ status });
    
    return res.status(200).json({ message: 'Estado actualizado correctamente', ticket });
  } catch (error) {
    console.error(`Error al actualizar estado del ticket ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al actualizar estado', error: error.message });
  }
};

const assignTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { technicianId } = req.body;
    
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: `Ticket con ID ${id} no encontrado` });
    }
    
    if (technicianId) {
      const technician = await User.findOne({
        where: { id: technicianId, role: 'tecnico' }
      });
      
      if (!technician) {
        return res.status(404).json({ message: 'Técnico no encontrado' });
      }
    }
    
    await ticket.update({ 
      assignedToId: technicianId || null,
      status: technicianId ? 'en_progreso' : 'abierto'
    });
    
    return res.status(200).json({ 
      message: technicianId ? 'Ticket asignado correctamente' : 'Ticket desasignado',
      ticket
    });
  } catch (error) {
    console.error(`Error al asignar ticket ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al asignar ticket', error: error.message });
  }
};

const getUserTicketStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const total = await Ticket.count({ where: { userId } });
    
    const pending = await Ticket.count({ where: { userId, status: 'abierto' } });
    
    const inProgress = await Ticket.count({ where: { userId, status: 'en_progreso' } });
    
    const resolved = await Ticket.count({ where: { userId, status: 'cerrado' } });
    
    return res.status(200).json({
      total,
      pending,
      inProgress,
      resolved
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};

module.exports = {
  getAllTickets,
  getUserTickets,
  getTicketById,
  createTicket,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  getUserTicketStats
}; 