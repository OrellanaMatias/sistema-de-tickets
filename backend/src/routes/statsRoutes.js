const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentActivity, getPerformanceSummary } = require('../controllers/statsController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Todas las rutas de estadísticas requieren autenticación
router.use(authMiddleware);

// Ruta para obtener estadísticas del dashboard (admin y técnico)
router.get('/dashboard', checkRole(['admin', 'tecnico']), getDashboardStats);

// Ruta para obtener actividad reciente (admin y técnico)
router.get('/recent-activity', checkRole(['admin', 'tecnico']), getRecentActivity);

// Ruta para obtener resumen de rendimiento (solo admin)
router.get('/performance', checkRole(['admin']), getPerformanceSummary);

module.exports = router; 