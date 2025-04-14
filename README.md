# Sistema de Gestión de Tickets de Soporte Técnico

Un sistema completo para la gestión de tickets de soporte técnico, desarrollado con React.js para el frontend y Node.js/Express para el backend.

## Características

- **Panel de Administración**: Gestión de usuarios, tickets y estadísticas
- **Panel de Técnicos**: Gestión de tickets asignados, actualizaciones y resolución
- **Panel de Usuarios**: Creación y seguimiento de tickets de soporte
- **Autenticación Segura**: Sistema de autenticación con JWT
- **Base de Datos Relacional**: Almacenamiento persistente con MySQL
- **Diseño Responsive**: Interfaz adaptable a diferentes dispositivos

## Tecnologías Utilizadas

### Frontend
- React.js
- Tailwind CSS
- Axios para peticiones HTTP
- React Router para navegación

### Backend
- Node.js con Express
- Sequelize ORM para la base de datos
- JWT para autenticación
- MySQL como base de datos

### Infraestructura
- Docker y Docker Compose para contenedores
- Persistencia de datos con volúmenes Docker

## Requisitos Previos

- Node.js (v14 o superior)
- Docker y Docker Compose
- Git

## Instalación y Ejecución

### Con Docker (Recomendado)

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/OrellanaMatias/sistema-de-tickets.git
   cd sistema-tickets
   ```

2. Iniciar los contenedores:
   ```bash
   docker-compose up
   ```

3. Acceder a la aplicación:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - PHPMyAdmin: http://localhost:8080


## Estructura del Proyecto

```
sistema-tickets/
├── backend/               # Servidor API
│   ├── src/
│   │   ├── config/        # Configuración de la base de datos
│   │   ├── controllers/   # Controladores de rutas
│   │   ├── middleware/    # Middleware (autenticación, etc.)
│   │   ├── models/        # Modelos de datos
│   │   ├── routes/        # Definición de rutas
│   │   └── index.js       # Punto de entrada
│   └── package.json
├── frontend/              # Aplicación React
│   ├── public/
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── services/      # Servicios para API
│   │   └── App.tsx        # Componente principal
│   └── package.json
├── mysql-init/            # Scripts de inicialización de MySQL
└── docker-compose.yml     # Configuración de Docker
```

## Usuarios por Defecto

El sistema se inicializa con los siguientes usuarios predeterminados:

- **Administrador**: 
  - Email: admin@tickets.com
  - Contraseña: admin123

- **Técnico**: 
  - Email: tecnico@tickets.com
  - Contraseña: tecnico123

- **Usuario**: 
  - Email: usuario@tickets.com
  - Contraseña: usuario123


## Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE). 