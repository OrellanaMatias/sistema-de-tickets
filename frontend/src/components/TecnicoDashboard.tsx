import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const TecnicoDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/login');
          return;
        }
        
        // Verificar que el usuario tiene rol de técnico
        const role = authService.getUserRole();
        if (role !== 'tecnico') {
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
            <h1 className="text-2xl font-bold text-gray-900">Panel de Técnico</h1>
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
            <h2 className="mb-4 text-xl font-semibold">Panel del Técnico</h2>
            <p className="mb-4">Desde aquí podrás gestionar los tickets asignados, actualizar su estado y resolver problemas.</p>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="mb-2 text-lg font-medium">Tickets Asignados</h3>
                <p className="mb-4 text-sm text-gray-600">Visualiza y gestiona los tickets que te han sido asignados.</p>
                <button className="px-3 py-1 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600">
                  Ver Mis Tickets
                </button>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="mb-2 text-lg font-medium">Tickets Resueltos</h3>
                <p className="mb-4 text-sm text-gray-600">Histórico de tickets que has resuelto.</p>
                <button className="px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600">
                  Ver Histórico
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TecnicoDashboard; 