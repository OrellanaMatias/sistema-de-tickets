import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/login');
          return;
        }
        
        // Verificar que el usuario tiene rol de administrador
        const role = authService.getUserRole();
        if (role !== 'admin') {
          navigate('/');
          return;
        }
        
        const userData = authService.getUser();
        setUser(userData);
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    return <div className="p-4 text-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bienvenido, {user.username}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="py-6">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-semibold">Funciones de Administrador</h2>
            <p className="mb-4">Desde aquí podrás gestionar usuarios, ver estadísticas y administrar el sistema de tickets.</p>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="mb-2 text-lg font-medium">Gestión de Usuarios</h3>
                <p className="mb-4 text-sm text-gray-600">Administra usuarios, asigna roles y permisos.</p>
                <button className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600">
                  Gestionar Usuarios
                </button>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="mb-2 text-lg font-medium">Gestión de Tickets</h3>
                <p className="mb-4 text-sm text-gray-600">Visualiza y administra todos los tickets del sistema.</p>
                <button className="px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600">
                  Ver Tickets
                </button>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="mb-2 text-lg font-medium">Configuración del Sistema</h3>
                <p className="mb-4 text-sm text-gray-600">Ajusta la configuración general del sistema de tickets.</p>
                <button className="px-3 py-1 text-sm text-white bg-purple-500 rounded hover:bg-purple-600">
                  Configuración
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 