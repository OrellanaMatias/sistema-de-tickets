import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TechnicianLayout } from '../../components/TechnicianLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
import authService from '../../services/authService';
import ticketService from '../../services/ticketService';
import type { Ticket } from '../../services/ticketService';

const TecnicoDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [ticketStats, setTicketStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    ticketId: number | null;
    action: 'status';
    newStatus?: 'abierto' | 'en_progreso' | 'cerrado';
    ticketTitle?: string;
  }>({
    show: false,
    ticketId: null,
    action: 'status'
  });

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
      
      // Ordenar por fecha de creación (más recientes primero) y tomar los 5 primeros
      const sortedTickets = [...allTickets].sort((a, b) => {
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

  useEffect(() => {
    fetchData();
  }, []);

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

  const showConfirmation = (ticketId: number, action: 'status', newStatus?: 'abierto' | 'en_progreso' | 'cerrado') => {
    const ticket = recentTickets.find(t => t.id === ticketId);
    setConfirmModal({
      show: true,
      ticketId,
      action,
      newStatus,
      ticketTitle: ticket?.title
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      show: false,
      ticketId: null,
      action: 'status'
    });
  };

  const handleStatusChange = async (ticketId: number, newStatus: 'abierto' | 'en_progreso' | 'cerrado') => {
    setActionLoading(ticketId);
    closeConfirmModal();
    
    try {
      // Llamar a la API para actualizar el estado
      await ticketService.updateTicketStatus(ticketId, newStatus);
      
      // Actualizar la interfaz
      await fetchData();
    } catch (error) {
      console.error('Error al cambiar el estado del ticket:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const renderConfirmationModal = () => {
    if (!confirmModal.show) return null;
    
    let title = '';
    let message = '';
    let confirmAction = () => {};
    
    if (confirmModal.action === 'status' && confirmModal.newStatus) {
      let statusText = '';
      switch (confirmModal.newStatus) {
        case 'abierto':
          statusText = 'Abierto';
          break;
        case 'en_progreso':
          statusText = 'En Progreso';
          break;
        case 'cerrado':
          statusText = 'Resuelto';
          break;
      }
      
      title = `Cambiar estado a ${statusText}`;
      message = `¿Estás seguro de que quieres cambiar el estado del ticket "${confirmModal.ticketTitle}" a ${statusText}?`;
      confirmAction = () => handleStatusChange(confirmModal.ticketId!, confirmModal.newStatus!);
    }
    
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4">{title}</h3>
          <p className="text-gray-700 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeConfirmModal}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmAction}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
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

  // Definición de columnas para la tabla de tickets recientes
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
      header: 'Técnico Asignado',
      accessor: 'assignedToId',
      cell: (ticket: Ticket) => (
        ticket.assignedToId ? 
        (recentTickets.find(t => t.assignedToId === ticket.assignedToId)?.creator?.username || 'Técnico') : 
        <span className="text-gray-400 italic">Sin asignar</span>
      ),
      hideOnMobile: true
    },
    {
      header: 'Estado',
      accessor: 'status',
      cell: (ticket: Ticket) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(ticket.status)}`}>
          {ticket.status === 'abierto' ? 'Abierto' : 
           ticket.status === 'en_progreso' ? 'En Progreso' : 'Cerrado'}
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
          
          {/* Cambiar a En Progreso */}
          {ticket.status !== 'en_progreso' && (
            <button 
              onClick={() => showConfirmation(ticket.id!, 'status', 'en_progreso')}
              disabled={actionLoading === ticket.id}
              className="w-9 h-9 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors flex items-center justify-center relative group"
              title="Marcar como En Progreso"
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
          
          {/* Cambiar a Resuelto */}
          {ticket.status !== 'cerrado' && (
            <button 
              onClick={() => showConfirmation(ticket.id!, 'status', 'cerrado')}
              disabled={actionLoading === ticket.id}
              className="w-9 h-9 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors flex items-center justify-center relative group"
              title="Marcar como Resuelto"
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
          
          {/* Reabrir ticket si está cerrado */}
          {ticket.status === 'cerrado' && (
            <button 
              onClick={() => showConfirmation(ticket.id!, 'status', 'abierto')}
              disabled={actionLoading === ticket.id}
              className="w-9 h-9 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center justify-center relative group"
              title="Reabrir ticket"
            >
              {actionLoading === ticket.id ? 
                <i className="fas fa-spinner fa-spin"></i> : 
                <i className="fas fa-folder-open"></i>
              }
              <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Reabrir ticket
              </span>
            </button>
          )}
        </div>
      )
    }
  ];

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
        
        {/* Tickets recientes */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold">Tickets Recientes</h2>
          </div>
          
          <div className="p-5">
            {recentTickets.length === 0 ? (
              <div className="text-center py-6">
                <div className="mb-4">
                  <i className="fas fa-ticket-alt text-4xl text-gray-300"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No hay tickets disponibles</h3>
                <p className="text-gray-500 mb-4">No hay tickets en el sistema.</p>
              </div>
            ) : (
              <div>
                <ResponsiveTable 
                  columns={ticketColumns}
                  data={recentTickets}
                  keyField="id"
                  mobileCardTitle={(ticket) => ticket.title}
                  emptyMessage="No hay tickets recientes disponibles"
                />
                
                <div className="mt-4 p-4 text-center">
                  <div className="text-gray-600 mb-2 italic">
                    <i className="fas fa-info-circle mr-1"></i>
                    Nota: Solo los administradores pueden asignar tickets a técnicos
                  </div>
                  <Link 
                    to="/tecnico/tickets" 
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                  >
                    Ver todos los tickets <i className="fas fa-arrow-right ml-1"></i>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Modal de confirmación */}
        {renderConfirmationModal()}
      </div>
    </TechnicianLayout>
  );
};

export default TecnicoDashboard;