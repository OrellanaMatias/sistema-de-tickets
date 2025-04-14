-- Asegurarse de que la base de datos exista
CREATE DATABASE IF NOT EXISTS ticketing;
USE ticketing;

-- Verificar que las tablas no existan antes de crearlas
-- Normalmente Sequelize se encargará de crear las tablas, este script es solo un respaldo

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `displayName` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('admin','tecnico','usuario') NOT NULL DEFAULT 'usuario',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de tickets
CREATE TABLE IF NOT EXISTS `Tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('abierto','en_progreso','cerrado') NOT NULL DEFAULT 'abierto',
  `priority` enum('baja','media','alta') NOT NULL DEFAULT 'media',
  `category` enum('hardware','software','red','impresoras','otro') NOT NULL DEFAULT 'otro',
  `userId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `Tickets_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar usuarios de prueba solo si no existen y solo en entorno de desarrollo
-- Contraseñas hasheadas con bcrypt (admin123, tecnico123, usuario123)
INSERT INTO `Users` (`displayName`, `email`, `password`, `role`, `active`, `createdAt`, `updatedAt`)
SELECT 'Administrador', 'admin@tickets.com', '$2a$12$atHJiijgbFQUnldY1p6GO.XA3XVI77RO4nSCo3Ki.WUpiO5nfiQ8u', 'admin', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `Users` WHERE `role` = 'admin' LIMIT 1);

INSERT INTO `Users` (`displayName`, `email`, `password`, `role`, `active`, `createdAt`, `updatedAt`)
SELECT 'Tecnico de Soporte', 'tecnico@tickets.com', '$2a$12$kDpSa1UAKa7Ifs6/70XBmeuw.0yZHUzOnw2CRDPzEyWiB9j4C7COS', 'tecnico', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `Users` WHERE `role` = 'tecnico' LIMIT 1);

INSERT INTO `Users` (`displayName`, `email`, `password`, `role`, `active`, `createdAt`, `updatedAt`)
SELECT 'Usuario Regular', 'usuario@tickets.com', '$2a$12$NkAZZ6ae1/wxtPjFluYA7u0sy0vmWMc9MdxA/QusQvgpTh4ugS2fK', 'usuario', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `Users` WHERE `role` = 'usuario' LIMIT 1);

-- Otorgar permisos
GRANT ALL PRIVILEGES ON ticketing.* TO 'root'@'%' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON ticketing.* TO 'user'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES; 