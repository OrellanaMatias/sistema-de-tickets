const User = require('./User');
const Ticket = require('./Ticket');
const Comment = require('./Comment');
const Config = require('./Config');

// Establecer relaciones que no se pudieron definir en los modelos
// debido a dependencias circulares

// Un ticket puede tener muchos comentarios
Ticket.hasMany(Comment, {
  foreignKey: 'ticketId',
  as: 'comments'
});

// Exportar todos los modelos
module.exports = {
  User,
  Ticket,
  Comment,
  Config
}; 