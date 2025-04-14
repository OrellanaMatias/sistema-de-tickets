const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/auth');

// Controlador de tickets (lo crearemos después)
const {
  getAllTickets,
  getUserTickets,
  getTicketById,
  createTicket,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  getUserTicketStats
} = require('../controllers/ticketController');

// Middleware de autenticación para todas las rutas de tickets
router.use(authMiddleware);

// Rutas accesibles para todos los usuarios autenticados
router.post('/', createTicket);
router.get('/user', getUserTickets);
router.get('/stats/user', getUserTicketStats);
router.get('/:id', getTicketById);

// Rutas para administradores y técnicos
router.get('/', checkRole(['admin', 'tecnico']), getAllTickets);
router.put('/:id', checkRole(['admin', 'tecnico']), updateTicket);
router.patch('/:id/status', checkRole(['admin', 'tecnico']), updateTicketStatus);
router.patch('/:id/assign', checkRole(['admin']), assignTicket);

// Rutas para técnicos
router.get('/technician/all', checkRole(['admin', 'tecnico']), getAllTickets);
router.get('/pending', checkRole(['admin', 'tecnico']), getAllTickets);
router.patch('/:id/assign-self', checkRole(['tecnico']), (req, res) => {
  // Obtener el ID del técnico autenticado
  const technicianId = req.user.id;
  
  // Pasar el ID del técnico como technicianId para usar la función assignTicket existente
  req.body.technicianId = technicianId;
  
  // Llamar a la función assignTicket
  assignTicket(req, res);
});

module.exports = router; 