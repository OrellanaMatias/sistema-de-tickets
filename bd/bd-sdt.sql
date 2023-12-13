-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 13-12-2023 a las 03:57:44
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bd-sdt`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `password` varchar(255) NOT NULL DEFAULT ''
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `admin`
--

INSERT INTO `admin` (`id`, `name`, `password`) VALUES
(1, 'admin', 'admin');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prequest`
--

CREATE TABLE `prequest` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contacto` varchar(11) DEFAULT NULL,
  `curso` varchar(255) DEFAULT NULL,
  `services` text DEFAULT NULL,
  `others` varchar(255) DEFAULT NULL,
  `query` longtext DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0,
  `posting_date` date DEFAULT NULL,
  `remark` longtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `prequest`
--

INSERT INTO `prequest` (`id`, `name`, `email`, `contacto`, `curso`, `services`, `others`, `query`, `status`, `posting_date`, `remark`) VALUES
(7, 'Matias Orellana', 'meorellanaramirez@itel.edu.ar', '1169400937', '6ºU', '[\\\" Notebooks\\\"]', '', 'Notebooks pa jugar al PES 6', 0, '2023-12-13', 'PES 5 > PES 6');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ticket`
--

CREATE TABLE `ticket` (
  `id` int(11) NOT NULL,
  `ticket_id` varchar(11) DEFAULT NULL,
  `email_id` varchar(300) DEFAULT NULL,
  `subject` varchar(300) DEFAULT NULL,
  `task_type` varchar(300) DEFAULT NULL,
  `prioprity` varchar(300) DEFAULT NULL,
  `ticket` longtext DEFAULT NULL,
  `attachment` varchar(300) DEFAULT NULL,
  `status` varchar(300) DEFAULT NULL,
  `admin_remark` longtext DEFAULT NULL,
  `posting_date` date DEFAULT NULL,
  `admin_remark_date` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `ticket`
--

INSERT INTO `ticket` (`id`, `ticket_id`, `email_id`, `subject`, `task_type`, `prioprity`, `ticket`, `attachment`, `status`, `admin_remark`, `posting_date`, `admin_remark_date`) VALUES
(19, '4', 'meorellanaramirez@itel.edu.ar', 'La PC explotó espontaneamente', 'Fallo a nivel de hardware', 'Urgente', 'La PC explotó de la nada (Intenté correr el Valorant)', NULL, 'closed', 'xd', '2023-12-13', '2023-12-13 02:48:59');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `alt_email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `posting_date` timestamp NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `alt_email`, `password`, `mobile`, `gender`, `address`, `status`, `posting_date`) VALUES
(7, 'Matias Orellana', 'meorellanaramirez@itel.edu.ar', NULL, '1234', '1169400937', 'male', NULL, NULL, '2023-12-13 02:23:29');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usercheck`
--

CREATE TABLE `usercheck` (
  `id` int(11) NOT NULL,
  `logindate` varchar(255) DEFAULT '',
  `logintime` varchar(255) DEFAULT '',
  `user_id` int(11) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT '',
  `ip` varbinary(16) DEFAULT NULL,
  `mac` varbinary(16) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Volcado de datos para la tabla `usercheck`
--

INSERT INTO `usercheck` (`id`, `logindate`, `logintime`, `user_id`, `username`, `email`, `ip`, `mac`, `city`, `country`) VALUES
(15, '2023/12/13', '08:15:32am', 7, 'Matias Orellana', 'meorellanaramirez@itel.edu.ar', 0x3a3a31, 0x4e6f6d62726520646520686f73742e20, '', ''),
(14, '2023/12/13', '08:04:57am', 7, 'Matias Orellana', 'meorellanaramirez@itel.edu.ar', 0x3a3a31, 0x4e6f6d62726520646520686f73742e20, '', ''),
(13, '2023/12/13', '08:04:55am', 7, 'Matias Orellana', 'meorellanaramirez@itel.edu.ar', 0x3a3a31, 0x4e6f6d62726520646520686f73742e20, '', ''),
(12, '2023/12/13', '07:53:41am', 7, 'Matias Orellana', 'meorellanaramirez@itel.edu.ar', 0x3a3a31, 0x4e6f6d62726520646520686f73742e20, '', '');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `prequest`
--
ALTER TABLE `prequest`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `ticket`
--
ALTER TABLE `ticket`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usercheck`
--
ALTER TABLE `usercheck`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `prequest`
--
ALTER TABLE `prequest`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `ticket`
--
ALTER TABLE `ticket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `usercheck`
--
ALTER TABLE `usercheck`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
