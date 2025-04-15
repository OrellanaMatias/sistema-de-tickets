const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Ticket = require('./Ticket');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

// Establecer relación con el usuario que creó el comentario
Comment.belongsTo(User, {
  foreignKey: {
    name: 'userId',
    allowNull: false
  },
  as: 'user'
});

// Establecer relación con el ticket al que pertenece el comentario
Comment.belongsTo(Ticket, {
  foreignKey: {
    name: 'ticketId',
    allowNull: false
  },
  as: 'ticket'
});

module.exports = Comment; 