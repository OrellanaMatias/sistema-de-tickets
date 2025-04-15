const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const statsRoutes = require('./routes/statsRoutes');
const configRoutes = require('./routes/configRoutes');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Config = require('./models/Config');
const bcryptjs = require('bcryptjs');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS para permitir solicitudes desde diferentes orígenes
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// Asegurar que existen los directorios necesarios
const ensureDirectories = () => {
  const dirs = [
    path.join(__dirname, '..', 'uploads'),
    path.join(__dirname, '..', 'backups')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directorio creado: ${dir}`);
    }
  });
};

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/config', configRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API del Sistema de Tickets' });
});

const connectWithRetry = async (maxRetries = 5, retryDelay = 5000) => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log(`Intento de conexión a la base de datos ${retries + 1}/${maxRetries}...`);
      
      await sequelize.authenticate();
      console.log('Conexión a base de datos establecida correctamente');
      
      console.log('Sincronizando modelos con la base de datos...');
      await sequelize.sync({ force: false, alter: true });
      console.log('Modelos sincronizados correctamente');
      
      // Inicializar configuración del sistema
      await Config.ensureConfig();
      
      return true;
    } catch (error) {
      retries++;
      console.error(`Fallo al conectar a la base de datos (intento ${retries}/${maxRetries}):`, error);
      
      if (retries >= maxRetries) {
        console.error('Número máximo de intentos alcanzado. No se pudo conectar a la base de datos.');
        return false;
      }
      
      console.log(`Reintentando en ${retryDelay/1000} segundos...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

const startServer = async () => {
  try {
    // Asegurar que existen los directorios necesarios
    ensureDirectories();
    
    const connected = await connectWithRetry();
    
    if (!connected) {
      console.log('Iniciando servidor sin conexión a la base de datos. Algunas funciones no estarán disponibles.');
    } else {
      console.log('Base de datos inicializada correctamente.');
    }
    
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
};

startServer();