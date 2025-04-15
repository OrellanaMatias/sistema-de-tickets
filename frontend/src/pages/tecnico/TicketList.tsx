import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TechnicianLayout } from '../../components/TechnicianLayout';
import ticketService from '../../services/ticketService';
import type { Ticket } from '../../services/ticketService';
import authService from '../../services/authService';

const TecnicoTicketList = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'assigned' | 'pending'>('all');
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [activeTab, allTickets]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const tickets = await ticketService.getAllTickets();
      setAllTickets(tickets);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = () => {
    if (allTickets.length === 0) return;
    
    let filtered: Ticket[];
    const currentUserId = Number(authService.getUser()?.id);
    
    switch (activeTab) {
      case 'assigned':
        filtered = allTickets.filter(ticket => 
          ticket.assignedToId === currentUserId
        );
        break;
      case 'pending':
        filtered = allTickets.filter(ticket => 
          !ticket.assignedToId && ticket.status !== 'cerrado'
        );
        break;
      case 'all':
      default:
        filtered = [...allTickets];
        break;
    }
    
    setFilteredTickets(filtered);
  };

  const handleAssignToSelf = async (ticketId: number) => {
    setActionLoading(ticketId);
    try {
      await ticketService.assignTicketToSelf(ticketId);
      await fetchTickets();
    } catch (error) {
      console.error('Error al asignar ticket:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (ticketId: number, status: 'abierto' | 'en_progreso' | 'cerrado') => {
    setActionLoading(ticketId);
    try {
      await ticketService.updateTicketStatus(ticketId, status);
      await fetchTickets();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'abierto': return 'bg-blue-100 text-blue-800';
      case 'en_progreso': return 'bg-yellow-100 text-yellow-800';
      case 'cerrado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'abierto': return 'Abierto';
      case 'en_progreso': return 'En Progreso';
      case 'cerrado': return 'Cerrado';
      default: return status;
    }
  };

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
        <h1 className="text-2xl font-bold mb-4">Tickets</h1>
        
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-3 px-6 text-center font-medium text-sm flex-1 ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Todos ({allTickets.length})
            </button>
            <button
              onClick={() => setActiveTab('assigned')}
              className={`py-3 px-6 text-center font-medium text-sm flex-1 ${
                activeTab === 'assigned'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mis Asignados ({allTickets.filter(t => t.assignedToId === Number(authService.getUser()?.id)).length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-3 px-6 text-center font-medium text-sm flex-1 ${
                activeTab === 'pending'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sin Asignar ({allTickets.filter(t => !t.assignedToId && t.status !== 'cerrado').length})
            </button>
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">No hay tickets disponibles</h3>
            <p className="text-gray-500 mt-2">No se encontraron tickets para la selección actual.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map(ticket => (
              <div 
                key={ticket.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-grow overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(ticket.status)}`}>
                      {getStatusName(ticket.status)}
                    </span>
                    <span className="text-sm text-gray-500 truncate">
                      {ticket.creator?.displayName || 'Usuario'}
                    </span>
                  </div>
                  <h3 className="font-medium text-lg mb-1 truncate">
                    <Link to={`/tickets/${ticket.id}`} className="hover:text-blue-600">
                      {ticket.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-500 truncate mb-2">
                    {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)} • 
                    Prioridad: {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Link 
                    to={`/tickets/${ticket.id}`} 
                    className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <i className="fas fa-eye mr-2"></i>
                    Ver
                  </Link>
                  
                  {!ticket.assignedToId && (
                    <button 
                      onClick={() => handleAssignToSelf(ticket.id!)}
                      disabled={actionLoading === ticket.id}
                      className="inline-flex items-center justify-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      {actionLoading === ticket.id ? 
                        <i className="fas fa-spinner fa-spin mr-2"></i> : 
                        <i className="fas fa-hand-pointer mr-2"></i>
                      }
                      Asignarme
                    </button>
                  )}
                  
                  {ticket.status === 'abierto' && (
                    <button 
                      onClick={() => handleUpdateStatus(ticket.id!, 'en_progreso')}
                      disabled={actionLoading === ticket.id}
                      className="inline-flex items-center justify-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600"
                    >
                      {actionLoading === ticket.id ? 
                        <i className="fas fa-spinner fa-spin mr-2"></i> : 
                        <i className="fas fa-play mr-2"></i>
                      }
                      Iniciar
                    </button>
                  )}
                  
                  {ticket.status === 'en_progreso' && (
                    <button 
                      onClick={() => handleUpdateStatus(ticket.id!, 'cerrado')}
                      disabled={actionLoading === ticket.id}
                      className="inline-flex items-center justify-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600"
                    >
                      {actionLoading === ticket.id ? 
                        <i className="fas fa-spinner fa-spin mr-2"></i> : 
                        <i className="fas fa-check-circle mr-2"></i>
                      }
                      Resolver
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TechnicianLayout>
  );
};

export default TecnicoTicketList; 