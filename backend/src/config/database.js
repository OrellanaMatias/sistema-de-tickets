const { Sequelize } = require('sequelize');

// Configuración para la conexión con la base de datos MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'ticketing',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'mysql',
    dialect: 'mysql',
    logging: console.log, // Habilitar logging para depuración
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    dialectOptions: {
      connectTimeout: 60000
    },
    retry: {
      match: [
        /Deadlock/i,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
        /TimeoutError/,
        /SequelizeConnectionAcquireTimeoutError/
      ],
      max: 5
    }
  }
);

module.exports = sequelize; 