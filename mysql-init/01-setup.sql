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
  `assignedToId` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `assignedToId` (`assignedToId`),
  CONSTRAINT `Tickets_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Tickets_ibfk_2` FOREIGN KEY (`assignedToId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de comentarios
CREATE TABLE IF NOT EXISTS `Comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `text` text NOT NULL,
  `userId` int NOT NULL,
  `ticketId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `ticketId` (`ticketId`),
  CONSTRAINT `Comments_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Comments_ibfk_2` FOREIGN KEY (`ticketId`) REFERENCES `Tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar usuarios de prueba solo si no existen y solo en entorno de desarrollo
-- Contraseñas hasheadas con bcrypt (admin123, tecnico123, usuario123)
INSERT INTO `Users` (`displayName`, `email`, `password`, `role`, `active`, `createdAt`, `updatedAt`)
SELECT 'Matias Orellana', 'meorellanaramirez@gmail.com', '$2a$12$IpZXevwS.hWFA4a1J46NXeIK590aaXgKy65aG73KpGuUa39b0lC.a', 'admin', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `Users` WHERE `role` = 'admin' LIMIT 1);

INSERT INTO `Users` (`displayName`, `email`, `password`, `role`, `active`, `createdAt`, `updatedAt`)
SELECT 'Emanuel Orellana', 'meorellanaramirez@itel.edu.ar', '$2a$12$IpZXevwS.hWFA4a1J46NXeIK590aaXgKy65aG73KpGuUa39b0lC.a', 'tecnico', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `Users` WHERE `role` = 'tecnico' LIMIT 1);

INSERT INTO `Users` (`displayName`, `email`, `password`, `role`, `active`, `createdAt`, `updatedAt`)
SELECT 'Oreo', 'orellana@gmail.com', '$2a$12$IpZXevwS.hWFA4a1J46NXeIK590aaXgKy65aG73KpGuUa39b0lC.a', 'usuario', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM `Users` WHERE `role` = 'usuario' LIMIT 1);

-- Otorgar permisos
GRANT ALL PRIVILEGES ON ticketing.* TO 'root'@'%' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON ticketing.* TO 'user'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES; 