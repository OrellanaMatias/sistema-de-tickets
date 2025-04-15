const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('abierto', 'en_progreso', 'cerrado'),
    defaultValue: 'abierto',
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('baja', 'media', 'alta'),
    defaultValue: 'media',
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('hardware', 'software', 'red', 'impresoras', 'otro'),
    defaultValue: 'otro',
    allowNull: false
  }
});

// Establecer relación con el usuario que creó el ticket
Ticket.belongsTo(User, {
  foreignKey: {
    name: 'userId',
    allowNull: false
  },
  as: 'creator'
});

// Establecer relación con el técnico asignado (opcional)
Ticket.belongsTo(User, {
  foreignKey: {
    name: 'assignedToId',
    allowNull: true
  },
  as: 'assignedTo'
});

module.exports = Ticket;

// La relación con los comentarios se establecerá después de exportar
// para evitar el ciclo de dependencias 