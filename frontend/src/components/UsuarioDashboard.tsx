import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import ticketService from '../services/ticketService';
import { UserLayout } from './UserLayout';
import type { Ticket } from '../services/ticketService';

const UsuarioDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [ticketStats, setTicketStats] = useState({
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!authService.isAuthenticated()) {
          navigate('/login');
          return;
        }
        
        // Verificar que el usuario tiene rol de usuario regular
        const role = authService.getUserRole();
        if (role !== 'usuario') {
          navigate('/');
          return;
        }
        
        const userData = authService.getUser();
        setUser(userData);
        
        setLoading(true);
        
        // Obtener estadísticas de tickets
        const stats = await ticketService.getUserTicketStats();
        setTicketStats({
          pending: stats.pending,
          inProgress: stats.inProgress,
          resolved: stats.resolved
        });
        
        // Obtener los tickets del usuario
        const tickets = await ticketService.getUserTickets();
        
        // Ordenar por fecha de creación (más recientes primero) y tomar los 5 primeros
        const sortedTickets = [...tickets].sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        }).slice(0, 5);
        
        setRecentTickets(sortedTickets);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'abierto':
        return 'bg-blue-100 text-blue-800';
      case 'en_progreso':
        return 'bg-yellow-100 text-yellow-800';
      case 'cerrado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'media':
        return 'bg-orange-100 text-orange-800';
      case 'baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard de Usuario</h1>
          <Link 
            to="/tickets/create" 
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            <i className="fas fa-plus-circle mr-2"></i>
            Crear Ticket
          </Link>
        </div>
        
        {/* Resumen y acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-medium mb-1">Tickets Abiertos</h2>
                <p className="text-3xl font-bold text-blue-600">{ticketStats.pending}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <i className="fas fa-ticket-alt fa-lg"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-medium mb-1">En Progreso</h2>
                <p className="text-3xl font-bold text-yellow-500">{ticketStats.inProgress}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <i className="fas fa-clock fa-lg"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-gray-600 text-sm font-medium mb-1">Resueltos</h2>
                <p className="text-3xl font-bold text-green-500">{ticketStats.resolved}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <i className="fas fa-check-circle fa-lg"></i>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tickets recientes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Tickets Recientes</h2>
          </div>
          <div className="p-5">
            {recentTickets.length === 0 ? (
              <div className="text-center py-6">
                <div className="mb-4">
                  <i className="fas fa-ticket-alt text-4xl text-gray-300"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No tienes tickets</h3>
                <p className="text-gray-500 mb-4">No tienes tickets creados todavía.</p>
                <Link
                  to="/tickets/create"
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  <i className="fas fa-plus-circle mr-2"></i>
                  Crear mi primer ticket
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asunto</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{ticket.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(ticket.status)}`}>
                            {ticket.status === 'abierto' ? 'Abierto' : 
                             ticket.status === 'en_progreso' ? 'En Progreso' : 'Cerrado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(ticket.priority)}`}>
                            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(ticket.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link to={`/tickets/${ticket.id}`} className="text-indigo-600 hover:text-indigo-900">
                            Ver Detalles
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {recentTickets.length > 0 && (
              <div className="mt-4">
                <Link 
                  to="/usuario/tickets" 
                  className="text-indigo-600 hover:text-indigo-900 font-medium"
                >
                  Ver todos los tickets <i className="fas fa-arrow-right ml-1"></i>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UsuarioDashboard; 