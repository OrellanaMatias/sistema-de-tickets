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

### Instalación Manual

#### Backend

1. Ir al directorio backend:
   ```bash
   cd backend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env`
   - Configurar la conexión a la base de datos

4. Iniciar el servidor:
   ```bash
   npm run dev
   ```

#### Frontend

1. Ir al directorio frontend:
   ```bash
   cd frontend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

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

## Contribución

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Haz fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y commit (`git commit -am 'Añadir nueva funcionalidad'`)
4. Sube los cambios (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE). 