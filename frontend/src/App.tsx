import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TicketList from './pages/tickets/TicketList';
import TicketDetail from './pages/tickets/TicketDetail';
import CreateTicket from './pages/tickets/CreateTicket';
import AdminDashboard from './pages/admin/Dashboard';
import UsersManagement from './pages/admin/UsersManagement';
import Config from './pages/admin/Config';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './pages/Register';
import authService from './services/authService';
import UsuarioDashboard from './pages/usuario/Dashboard';
import Configuracion from './pages/usuario/Configuracion';
import ConfiguracionTecnico from './pages/tecnico/Configuracion';
import TecnicoDashboard from './pages/tecnico/Dashboard';
import TecnicoTicketList from './pages/tecnico/TicketList';
import Users from './pages/admin/Users';

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Función para verificar si el usuario está autenticado desde localStorage
  const checkAuthFromStorage = () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole) {
      setUser({
        id: '1',
        username: userRole === 'admin' ? 'Administrator' : (userRole === 'tecnico' ? 'Technician' : 'User'),
        email: userRole === 'admin' ? 'admin@tickets.com' : (userRole === 'tecnico' ? 'tecnico@tickets.com' : 'user@tickets.com'),
        role: userRole
      });
      return true;
    } else {
      // Si no hay token o userRole, el usuario no está autenticado
      setUser(null);
      return false;
    }
  };

  // Efecto para verificar autenticación cuando el componente se monta
  useEffect(() => {
    // Configurar cabeceras de Axios cuando la aplicación se inicia
    authService.configureAxios();
    console.log('[DEBUG] App.tsx - axios configurado inicialmente');
    
    // Verificar si hay un usuario autenticado
    const checkAuth = async () => {
      try {
        // Primero, intentamos obtener desde localStorage rápidamente
        if (checkAuthFromStorage()) {
          setLoading(false);
          return;
        }
        
        // Si no está en localStorage, intentar obtener desde el servicio
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Función para detectar cambios en localStorage
    const handleStorageChange = (event: StorageEvent) => {
      // Verificar si los cambios afectan a la autenticación
      if (event.key === 'token' || event.key === 'userRole' || event.key === 'user') {
        checkAuthFromStorage();
      }
    };

    // Verificar periódicamente la autenticación (cada 3 segundos)
    const authCheckInterval = setInterval(() => {
      checkAuthFromStorage();
    }, 3000);

    // Escuchar eventos de cambio en localStorage desde otras ventanas/pestañas
    window.addEventListener('storage', handleStorageChange);
    
    // Crear un custom event listener para el logout
    const checkLogout = () => {
      if (!localStorage.getItem('token')) {
        setUser(null);
      }
    };
    
    // Añadir listener para el evento personalizado de logout
    window.addEventListener('app:logout', checkLogout);
    
    // Cleanup function
    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('app:logout', checkLogout);
    };
  }, []);

  // Función para determinar a dónde redirigir basado en el rol del usuario
  const getRedirectPath = (role: string) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'tecnico':
        return '/tecnico';
      case 'usuario':
      default:
        return '/usuario';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={user ? <Navigate to={getRedirectPath(user.role)} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={getRedirectPath(user.role)} /> : <Register />} />
        
        {/* Ruta raíz - Redirige según esté autenticado o no */}
        <Route 
          path="/" 
          element={!user ? <Navigate to="/login" /> : <Navigate to={getRedirectPath(user.role)} />} 
        />
        
        {/* Rutas para tickets - Requieren autenticación */}
        <Route 
          path="/tickets/create" 
          element={!user ? <Navigate to="/login" /> : <CreateTicket />} 
        />
        <Route 
          path="/tickets/:id" 
          element={!user ? <Navigate to="/login" /> : <TicketDetail />} 
        />
        
        {/* Rutas de administrador */}
        <Route 
          path="/admin" 
          element={
            !user ? <Navigate to="/login" /> : 
            user.role !== 'admin' ? <Navigate to={getRedirectPath(user.role)} /> : 
            <Navigate to="/admin/dashboard" />
          } 
        />
        <Route 
          path="/admin/dashboard" 
          element={
            !user ? <Navigate to="/login" /> : 
            user.role !== 'admin' ? <Navigate to={getRedirectPath(user.role)} /> : 
            <AdminDashboard />
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            !user ? <Navigate to="/login" /> : 
            user.role !== 'admin' ? <Navigate to={getRedirectPath(user.role)} /> : 
            <Users />
          } 
        />
        <Route 
          path="/admin/config" 
          element={
            !user ? <Navigate to="/login" /> : 
            user.role !== 'admin' ? <Navigate to={getRedirectPath(user.role)} /> : 
            <Config />
          } 
        />
        
        {/* Ruta de técnico */}
        <Route
          path="/tecnico"
          element={
            !user ? <Navigate to="/login" /> : 
            user.role !== 'tecnico' ? <Navigate to={getRedirectPath(user.role)} /> :
            <TecnicoDashboard />
          }
        />
        
        {/* Ruta de usuario */}
        <Route
          path="/usuario"
          element={
            !user ? <Navigate to="/login" /> : 
            user.role !== 'usuario' ? <Navigate to={getRedirectPath(user.role)} /> :
            <UsuarioDashboard />
          }
        />
        
        {/* Rutas específicas de usuario */}
        <Route
          path="/usuario/tickets"
          element={
            !user ? <Navigate to="/login" /> : 
            user.role !== 'usuario' ? <Navigate to={getRedirectPath(user.role)} /> :
            <TicketList />
          }
        />
        
        <Route
          path="/usuario/configuracion"
          element={
            !user ? <Navigate to="/login" /> : 
            user.role !== 'usuario' ? <Navigate to={getRedirectPath(user.role)} /> :
            <Configuracion />
          }
        />
        
        {/* Añadir ruta de configuración para técnico */}
        <Route
          path="/tecnico/configuracion"
          element={
            !user ? <Navigate to="/login" /> : 
            user.role !== 'tecnico' ? <Navigate to={getRedirectPath(user.role)} /> :
            <ConfiguracionTecnico />
          }
        />
        
        {/* Añadir ruta para tickets de técnico */}
        <Route
          path="/tecnico/tickets"
          element={
            !user ? <Navigate to="/login" /> : 
            user.role !== 'tecnico' ? <Navigate to={getRedirectPath(user.role)} /> :
            <TecnicoTicketList />
          }
        />
        
        {/* Ruta de fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
