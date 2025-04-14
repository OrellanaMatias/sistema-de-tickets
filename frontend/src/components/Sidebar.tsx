import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

interface SidebarProps {
  role: 'admin' | 'tecnico' | 'usuario';
}

interface NavLinkItem {
  to: string;
  icon: string;
  text: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpiar TODOS los datos de localStorage
    localStorage.clear();
    
    // Usar la función de logout del servicio
    authService.logout();
    
    // Forzar redirección al login usando window.location
    // Esto asegura una recarga completa de la página
    window.location.href = '/login';
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Enlaces para administradores
  const adminLinks: NavLinkItem[] = [
    {
      to: '/admin/dashboard',
      icon: 'fas fa-home',
      text: 'Dashboard'
    },
    {
      to: '/admin/users',
      icon: 'fas fa-users',
      text: 'Usuarios'
    },
    {
      to: '/admin/config',
      icon: 'fas fa-cog',
      text: 'Configuración'
    }
  ];

  // Enlaces para técnicos
  const technicianLinks: NavLinkItem[] = [
    {
      to: '/tecnico',
      icon: 'fas fa-home',
      text: 'Dashboard'
    },
    {
      to: '/tecnico/tickets',
      icon: 'fas fa-ticket-alt',
      text: 'Tickets'
    },
    {
      to: '/tecnico/configuracion',
      icon: 'fas fa-cog',
      text: 'Configuración'
    }
  ];

  // Enlaces para usuarios
  const userLinks: NavLinkItem[] = [
    {
      to: '/usuario',
      icon: 'fas fa-home',
      text: 'Dashboard'
    },
    {
      to: '/usuario/tickets',
      icon: 'fas fa-ticket-alt',
      text: 'Mis Tickets'
    },
    {
      to: '/usuario/configuracion',
      icon: 'fas fa-cog',
      text: 'Configuración'
    }
  ];

  // Determinar qué enlaces mostrar según el rol
  const getLinks = () => {
    switch (role) {
      case 'admin':
        return adminLinks;
      case 'tecnico':
        return technicianLinks;
      case 'usuario':
      default:
        return userLinks;
    }
  };

  return (
    <>
      {/* Botón para móvil */}
      <button 
        className="fixed z-50 p-2 bg-blue-600 rounded-md text-white md:hidden top-4 left-4"
        onClick={toggleSidebar}
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0`}>
        <div className="p-5 border-b border-gray-700">
          <h2 className="text-2xl font-semibold">Sistema de Tickets</h2>
          <p className="text-sm text-gray-400 mt-1">Panel de {role.charAt(0).toUpperCase() + role.slice(1)}</p>
        </div>

        <nav className="mt-5">
          <ul>
            {getLinks().map((link) => (
              <li key={link.to} className="mb-2">
                <NavLink 
                  to={link.to} 
                  className={({ isActive }) => 
                    `flex items-center px-4 py-3 transition-colors ${
                      isActive 
                        ? 'bg-blue-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`
                  }
                  end={link.to === '/admin' || link.to === '/tecnico' || link.to === '/usuario'}
                >
                  <i className={`${link.icon} mr-3`}></i>
                  {link.text}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-5 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 