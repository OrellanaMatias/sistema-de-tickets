const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const statsRoutes = require('./routes/statsRoutes');
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const bcryptjs = require('bcryptjs');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/stats', statsRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({ message: 'API del Sistema de Tickets' });
});

// Función para conectar a la base de datos con reintentos
const connectWithRetry = async (maxRetries = 5, retryDelay = 5000) => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log(`Intento de conexión a la base de datos ${retries + 1}/${maxRetries}...`);
      
      // Verificar la conexión primero
      await sequelize.authenticate();
      console.log('Conexión a base de datos establecida correctamente');
      
      // Sincronizar modelos con la base de datos de manera forzada para garantizar creación
      console.log('Sincronizando modelos con la base de datos...');
      await sequelize.sync({ force: false, alter: true });
      console.log('Modelos sincronizados correctamente');
      
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

// Iniciar el servidor
const startServer = async () => {
  try {
    // Intentar conectar a la base de datos con reintentos
    const connected = await connectWithRetry();
    
    if (!connected) {
      console.log('Iniciando servidor sin conexión a la base de datos. Algunas funciones no estarán disponibles.');
    } else {
      console.log('Base de datos inicializada correctamente.');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
};

startServer(); 