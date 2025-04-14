import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TechnicianLayout } from '../../components/TechnicianLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
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

  // Aplicar filtro cada vez que cambie la pestaña activa o los tickets
  useEffect(() => {
    filterTickets();
  }, [activeTab, allTickets]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      // Obtener todos los tickets disponibles
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
        // Tickets asignados al técnico actual
        filtered = allTickets.filter(ticket => 
          ticket.assignedToId === currentUserId
        );
        break;
      case 'pending':
        // Tickets sin asignar
        filtered = allTickets.filter(ticket => 
          !ticket.assignedToId && ticket.status !== 'cerrado'
        );
        break;
      case 'all':
      default:
        // Todos los tickets
        filtered = [...allTickets];
        break;
    }
    
    setFilteredTickets(filtered);
  };

  const handleAssignToSelf = async (ticketId: number) => {
    setActionLoading(ticketId);
    try {
      await ticketService.assignTicketToSelf(ticketId);
      
      // Actualizar la lista completa
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
      
      // Actualizar la lista completa
      await fetchTickets();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    } finally {
      setActionLoading(null);
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

  const getStatusName = (status: string) => {
    switch (status) {
      case 'abierto':
        return 'Abierto';
      case 'en_progreso':
        return 'En Progreso';
      case 'cerrado':
        return 'Cerrado';
      default:
        return status;
    }
  };

  const renderTicketList = () => {
    if (filteredTickets.length === 0) {
      return (
        <div className="text-center py-10">
          <i className="fas fa-clipboard-list text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900">No hay tickets disponibles</h3>
          <p className="text-gray-500 mt-2">No se encontraron tickets para la selección actual.</p>
        </div>
      );
    }

    // Definición de columnas para la tabla de tickets
    const ticketColumns = [
      {
        header: 'Asunto',
        accessor: 'title',
        cell: (ticket: Ticket) => (
          <Link to={`/tickets/${ticket.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium">
            {ticket.title}
          </Link>
        )
      },
      {
        header: 'Usuario',
        accessor: 'creator',
        cell: (ticket: Ticket) => ticket.creator?.username || 'Usuario'
      },
      {
        header: 'Estado',
        accessor: 'status',
        cell: (ticket: Ticket) => (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(ticket.status)}`}>
            {getStatusName(ticket.status)}
          </span>
        )
      },
      {
        header: 'Prioridad',
        accessor: 'priority',
        cell: (ticket: Ticket) => (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(ticket.priority)}`}>
            {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
          </span>
        )
      },
      {
        header: 'Categoría',
        accessor: 'category',
        cell: (ticket: Ticket) => ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1),
        hideOnMobile: true
      },
      {
        header: 'Fecha',
        accessor: 'created_at',
        cell: (ticket: Ticket) => formatDate(ticket.created_at),
        hideOnMobile: true
      },
      {
        header: 'Acciones',
        accessor: 'actions',
        cell: (ticket: Ticket) => (
          <div className="flex flex-wrap gap-2">
            <Link 
              to={`/tickets/${ticket.id}`} 
              className="w-9 h-9 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center justify-center relative group"
              title="Ver detalles"
            >
              <i className="fas fa-eye"></i>
              <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Ver detalles
              </span>
            </Link>
            
            {/* Acción para asignar a sí mismo */}
            {!ticket.assignedToId && (
              <button 
                onClick={() => handleAssignToSelf(ticket.id!)}
                disabled={actionLoading === ticket.id}
                className="w-9 h-9 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors flex items-center justify-center relative group"
                title="Asignar a mí"
              >
                {actionLoading === ticket.id ? 
                  <i className="fas fa-spinner fa-spin"></i> : 
                  <i className="fas fa-hand-pointer"></i>
                }
                <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Asignar a mí
                </span>
              </button>
            )}
            
            {/* Acciones para cambiar estado */}
            {ticket.status !== 'en_progreso' && (
              <button 
                onClick={() => handleUpdateStatus(ticket.id!, 'en_progreso')}
                disabled={actionLoading === ticket.id}
                className="w-9 h-9 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors flex items-center justify-center relative group"
                title="Marcar como en progreso"
              >
                {actionLoading === ticket.id ? 
                  <i className="fas fa-spinner fa-spin"></i> : 
                  <i className="fas fa-play"></i>
                }
                <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Iniciar ticket
                </span>
              </button>
            )}
            
            {ticket.status !== 'cerrado' && (
              <button 
                onClick={() => handleUpdateStatus(ticket.id!, 'cerrado')}
                disabled={actionLoading === ticket.id}
                className="w-9 h-9 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors flex items-center justify-center relative group"
                title="Marcar como resuelto"
              >
                {actionLoading === ticket.id ? 
                  <i className="fas fa-spinner fa-spin"></i> : 
                  <i className="fas fa-check-circle"></i>
                }
                <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Resolver ticket
                </span>
              </button>
            )}
          </div>
        )
      }
    ];

    return (
      <ResponsiveTable
        columns={ticketColumns}
        data={filteredTickets}
        keyField="id"
        mobileCardTitle={(ticket) => ticket.title}
        emptyMessage="No hay tickets disponibles"
        compactOnMobile={true}
        className="overflow-hidden"
      />
    );
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Tickets</h1>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex flex-nowrap min-w-full">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-1 ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-ticket-alt mr-1 sm:mr-2"></i>
                <span className="hidden xs:inline">Todos</span> ({allTickets.length})
              </button>
              <button
                onClick={() => setActiveTab('assigned')}
                className={`py-4 px-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-1 ${
                  activeTab === 'assigned'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-clipboard-check mr-1 sm:mr-2"></i>
                <span className="hidden xs:inline">Mis Asignados</span> ({allTickets.filter(t => t.assignedToId === Number(authService.getUser()?.id)).length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-4 sm:px-6 text-center border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-1 ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-clipboard-list mr-1 sm:mr-2"></i>
                <span className="hidden xs:inline">Sin Asignar</span> ({allTickets.filter(t => !t.assignedToId && t.status !== 'cerrado').length})
              </button>
            </nav>
          </div>

          <div className="p-4">
            {renderTicketList()}
          </div>
        </div>
      </div>
    </TechnicianLayout>
  );
};

export default TecnicoTicketList; 