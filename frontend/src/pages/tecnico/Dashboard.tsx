import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TechnicianLayout } from '../../components/TechnicianLayout';
import authService from '../../services/authService';
import ticketService from '../../services/ticketService';

const TecnicoDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [ticketStats, setTicketStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const userData = authService.getUser();
      setUser(userData);
      
      setLoading(true);
      
      // Obtener todos los tickets para calcular estadísticas
      const allTickets = await ticketService.getAllTickets();
      
      // Calcular estadísticas
      const total = allTickets.length;
      const pending = allTickets.filter(ticket => ticket.status === 'abierto').length;
      const inProgress = allTickets.filter(ticket => ticket.status === 'en_progreso').length;
      const resolved = allTickets.filter(ticket => ticket.status === 'cerrado').length;
      
      setTicketStats({
        total,
        pending,
        inProgress,
        resolved
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <TechnicianLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </TechnicianLayout>
    );
  }

  return (
    <TechnicianLayout>
      <div className="pb-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard del Técnico</h1>
        
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between">
              <div>
                <div className="text-gray-500 text-sm">Total Tickets</div>
                <div className="text-2xl font-bold">{ticketStats.total}</div>
              </div>
              <div className="bg-indigo-100 rounded-full h-12 w-12 flex items-center justify-center">
                <i className="fas fa-ticket-alt text-indigo-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between">
              <div>
                <div className="text-gray-500 text-sm">Abiertos</div>
                <div className="text-2xl font-bold">{ticketStats.pending}</div>
              </div>
              <div className="bg-blue-100 rounded-full h-12 w-12 flex items-center justify-center">
                <i className="fas fa-folder-open text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between">
              <div>
                <div className="text-gray-500 text-sm">En Progreso</div>
                <div className="text-2xl font-bold">{ticketStats.inProgress}</div>
              </div>
              <div className="bg-yellow-100 rounded-full h-12 w-12 flex items-center justify-center">
                <i className="fas fa-clock text-yellow-600 text-xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex justify-between">
              <div>
                <div className="text-gray-500 text-sm">Resueltos</div>
                <div className="text-2xl font-bold">{ticketStats.resolved}</div>
              </div>
              <div className="bg-green-100 rounded-full h-12 w-12 flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/tecnico/tickets" 
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="bg-blue-100 rounded-full h-12 w-12 flex items-center justify-center mr-4">
                <i className="fas fa-list text-blue-600 text-xl"></i>
              </div>
              <div>
                <h3 className="font-medium">Ver todos los tickets</h3>
                <p className="text-sm text-gray-600">Gestiona todos los tickets disponibles</p>
              </div>
            </Link>
            
            <Link 
              to="/tecnico/tickets?filter=pending" 
              className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <div className="bg-yellow-100 rounded-full h-12 w-12 flex items-center justify-center mr-4">
                <i className="fas fa-clipboard-list text-yellow-600 text-xl"></i>
              </div>
              <div>
                <h3 className="font-medium">Tickets pendientes</h3>
                <p className="text-sm text-gray-600">Ver tickets sin asignar</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </TechnicianLayout>
  );
};

export default TecnicoDashboard;