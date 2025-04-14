const User = require('../models/User');
const Ticket = require('../models/Ticket');
const { Op } = require('sequelize');


const getDashboardStats = async (req, res) => {
  try {
    const userCounts = {
      admin: await User.count({ where: { role: 'admin' } }),
      tecnico: await User.count({ where: { role: 'tecnico' } }),
      usuario: await User.count({ where: { role: 'usuario' } })
    };

    const ticketCounts = {
      abierto: await Ticket.count({ where: { status: 'abierto' } }),
      en_progreso: await Ticket.count({ where: { status: 'en_progreso' } }),
      cerrado: await Ticket.count({ where: { status: 'cerrado' } })
    };

    const totalUsers = userCounts.admin + userCounts.tecnico + userCounts.usuario;
    const totalTickets = ticketCounts.abierto + ticketCounts.en_progreso + ticketCounts.cerrado;
    
    res.json({
      userStats: userCounts,
      ticketStats: ticketCounts,
      totalUsers: totalUsers,
      totalTickets: totalTickets,
      pendingTickets: ticketCounts.abierto + ticketCounts.en_progreso,
      completedTickets: ticketCounts.cerrado
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const recentActivity = [
      { 
        id: 1, 
        type: 'ticket_created', 
        message: 'Usuario Regular creó el Ticket #101', 
        timestamp: new Date().toISOString() 
      },
      { 
        id: 2, 
        type: 'ticket_updated', 
        message: 'Técnico de Soporte actualizó el Ticket #99', 
        timestamp: new Date(Date.now() - 30*60*1000).toISOString() 
      },
      { 
        id: 3, 
        type: 'user_created', 
        message: 'Administrador registró un nuevo usuario', 
        timestamp: new Date(Date.now() - 2*60*60*1000).toISOString() 
      },
      { 
        id: 4, 
        type: 'ticket_closed', 
        message: 'Técnico de Soporte cerró el Ticket #95', 
        timestamp: new Date(Date.now() - 5*60*60*1000).toISOString() 
      },
      { 
        id: 5, 
        type: 'ticket_created', 
        message: 'Usuario Regular creó el Ticket #100', 
        timestamp: new Date(Date.now() - 1*24*60*60*1000).toISOString() 
      }
    ];

    res.json(recentActivity);
  } catch (error) {
    console.error('Error obteniendo actividad reciente:', error);
    res.status(500).json({ message: 'Error al obtener actividad reciente' });
  }
};


const getPerformanceSummary = async (req, res) => {
  try {
    const totalTickets = await Ticket.count();
    const resolvedTickets = await Ticket.count({ where: { status: 'cerrado' } });
    const pendingTickets = totalTickets - resolvedTickets;
    
    const resolvedPercentage = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;
    const pendingPercentage = totalTickets > 0 ? Math.round((pendingTickets / totalTickets) * 100) : 0;
    
    const averageResolutionTime = 2.5;
    
    const technicians = [
      { id: 1, name: 'Técnico 1', ticketsAssigned: 12, ticketsClosed: 10, averageResolutionTime: '2.5 días' },
      { id: 2, name: 'Técnico 2', ticketsAssigned: 8, ticketsClosed: 5, averageResolutionTime: '3.2 días' }
    ];
    
    const categories = {
      hardware: 15,
      software: 20,
      red: 8,
      impresoras: 12,
      otro: 5
    };
    
    const priorities = {
      alta: 10,
      media: 30,
      baja: 20
    };

    res.json({
      resolvedPercentage,
      pendingPercentage,
      averageResolutionTime,
      details: {
        technicians,
        categories,
        priorities
      }
    });
  } catch (error) {
    console.error('Error obteniendo resumen de rendimiento:', error);
    res.status(500).json({ message: 'Error al obtener resumen de rendimiento' });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getPerformanceSummary
}; 