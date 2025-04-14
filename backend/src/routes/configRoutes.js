const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/auth');
const configController = require('../controllers/configController');
const multer = require('multer');

// Configuración de multer para manejar archivos de backup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'backend/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `backup-restore-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/octet-stream' || 
        file.mimetype === 'application/sql' || 
        file.originalname.endsWith('.sql')) {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no válido. Solo se permiten archivos .sql'));
    }
  }
});

// Middleware de autenticación y verificación de rol admin para todas las rutas
router.use(authMiddleware, checkRole(['admin']));

// Rutas de configuración con implementación real
router.get('/', configController.getSystemConfig);
router.put('/', configController.updateSystemConfig);
router.post('/backup', configController.backupDatabase);
router.post('/restore', upload.single('backupFile'), configController.restoreDatabase);
router.post('/test-smtp', configController.testSmtpConnection);
router.post('/maintenance/:task', configController.performMaintenance);

module.exports = router; 