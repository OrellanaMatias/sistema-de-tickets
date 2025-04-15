const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { Op } = require('sequelize');

const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      include: [
        { model: User, as: 'creator', attributes: ['id', 'displayName', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'displayName', 'email'] }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // Transformar los campos de fecha para el frontend
    const transformedTickets = tickets.map(ticket => {
      const plainTicket = ticket.get({ plain: true });
      return {
        ...plainTicket,
        created_at: plainTicket.createdAt,
        updated_at: plainTicket.updatedAt
      };
    });

    return res.status(200).json(transformedTickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    return res.status(500).json({ message: 'Error al obtener tickets', error: error.message });
  }
};

const getUserTickets = async (req, res) => {
  try {
    console.log('[DEBUG] getUserTickets - Usuario en la solicitud:', req.user);
    const userId = req.user.id;
    console.log('[DEBUG] getUserTickets - ID de usuario:', userId);
    
    const tickets = await Ticket.findAll({
      where: { userId },
      include: [
        { model: User, as: 'assignedTo', attributes: ['id', 'displayName', 'email'] }
      ],
      order: [['updatedAt', 'DESC']]
    });
    
    console.log('[DEBUG] getUserTickets - Tickets encontrados:', tickets.length);

    // Transformar los campos de fecha para el frontend
    const transformedTickets = tickets.map(ticket => {
      const plainTicket = ticket.get({ plain: true });
      return {
        ...plainTicket,
        created_at: plainTicket.createdAt,
        updated_at: plainTicket.updatedAt
      };
    });
    
    return res.status(200).json(transformedTickets);
  } catch (error) {
    console.error('Error al obtener tickets del usuario:', error);
    return res.status(500).json({ message: 'Error al obtener tickets del usuario', error: error.message });
  }
};

const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[DEBUG] getTicketById - Buscando ticket con ID:', id);
    console.log('[DEBUG] getTicketById - Usuario en la solicitud:', req.user);
    
    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'displayName', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'displayName', 'email'] }
      ]
    });
    
    if (!ticket) {
      console.log(`[DEBUG] getTicketById - Ticket con ID ${id} no encontrado`);
      return res.status(404).json({ message: `Ticket con ID ${id} no encontrado` });
    }
    
    // Si el usuario es normal, solo puede ver sus propios tickets
    if (req.user.role === 'usuario' && ticket.userId !== req.user.id) {
      console.log(`[DEBUG] getTicketById - Acceso denegado al usuario ${req.user.id} para ticket ${id}`);
      return res.status(403).json({ message: 'No tienes permisos para ver este ticket' });
    }
    
    console.log('[DEBUG] getTicketById - Ticket encontrado:', ticket.id);

    // Transformar los campos de fecha para el frontend
    const plainTicket = ticket.get({ plain: true });
    const transformedTicket = {
      ...plainTicket,
      created_at: plainTicket.createdAt,
      updated_at: plainTicket.updatedAt
    };
    
    return res.status(200).json(transformedTicket);
  } catch (error) {
    console.error(`Error al obtener ticket ${req.params.id}:`, error);
    return res.status(500).json({ message: 'Error al obtener detalles del ticket', error: error.message });
  }
};

const createTicket = async (req, res) => {
  try {
    const { title, description, priority, category } = req.body;
    const userId = req.user.id;
    
    console.log('[DEBUG] createTicket - Datos recibidos:', { title, description, priority, category });
    console.log('[DEBUG] createTicket - Usuario creador:', { id: userId, role: req.user.role });
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Título y descripción son obligatorios' });
    }
    
    // Asegurarnos de que userId es un número válido
    if (!userId || isNaN(userId)) {
      console.error('[DEBUG] createTicket - ID de usuario inválido:', userId);
      return res.status(400).json({ message: 'ID de usuario inválido', error: 'Invalid userId' });
    }
    
    const newTicket = await Ticket.create({
      title,
      description,
      priority: priority || 'media',
      category: category || 'otro',
      status: 'abierto',
      userId
    });
    
    console.log('[DEBUG] createTicket - Ticket creado:', { 
      id: newTicket.id, 
      title: newTicket.title,
      userId: newTicket.userId 
    });
    
    // Cargar ticket con sus relaciones para devolverlo completo
    const ticketWithRelations = await Ticket.findByPk(newTicket.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'displayName', 'email'] }
      ]
    });
    
    // Transformar los campos de fecha para el frontend
    const plainTicket = ticketWithRelations.get({ plain: true });
    const transformedTicket = {
      ...plainTicket,
      created_at: plainTicket.createdAt,
      updated_at: plainTicket.updatedAt
    };
    
    return res.status(201).json(transformedTicket);
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
    
    // Transformar los campos de fecha para el frontend
    const updatedTicket = ticket.get({ plain: true });
    const transformedTicket = {
      ...updatedTicket,
      created_at: updatedTicket.createdAt,
      updated_at: updatedTicket.updatedAt
    };
    
    return res.status(200).json(transformedTicket);
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
    
    // Transformar los campos de fecha para el frontend
    const updatedTicket = ticket.get({ plain: true });
    const transformedTicket = {
      ...updatedTicket,
      created_at: updatedTicket.createdAt,
      updated_at: updatedTicket.updatedAt
    };
    
    return res.status(200).json({ 
      message: 'Estado actualizado correctamente', 
      ticket: transformedTicket 
    });
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
    
    // Transformar los campos de fecha para el frontend
    const updatedTicket = ticket.get({ plain: true });
    const transformedTicket = {
      ...updatedTicket,
      created_at: updatedTicket.createdAt,
      updated_at: updatedTicket.updatedAt
    };
    
    return res.status(200).json({ 
      message: technicianId ? 'Ticket asignado correctamente' : 'Ticket desasignado',
      ticket: transformedTicket
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