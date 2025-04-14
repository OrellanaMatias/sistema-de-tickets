const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Config = sequelize.define('Config', {
  appName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Sistema de Tickets'
  },
  dbHost: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'mysql'
  },
  dbPort: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '3306'
  },
  dbName: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'ticketing'
  },
  smtpServer: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'smtp.example.com'
  },
  smtpPort: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '587'
  },
  smtpUser: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'notifications@tickets.com'
  },
  smtpPass: {
    type: DataTypes.STRING,
    allowNull: true
  },
  maxUploadSize: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '10'
  },
  ticketAutoClose: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '15'
  },
  maintenanceMode: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  timestamps: true
});

// Método para asegurar que exista una configuración inicial
Config.ensureConfig = async () => {
  const count = await Config.count();
  if (count === 0) {
    // Si no hay configuración, crear una con valores predeterminados
    await Config.create({});
    console.log('Configuración inicial creada');
  }
};

module.exports = Config; 