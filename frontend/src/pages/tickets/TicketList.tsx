import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { UserLayout } from '../../components/UserLayout';
import { TechnicianLayout } from '../../components/TechnicianLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
import authService from '../../services/authService';
import ticketService, { Ticket } from '../../services/ticketService';

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      // Obtener el rol del usuario
      const role = authService.getUserRole();
      setUserRole(role);
      
      // Asegurarnos de que axios esté configurado con el token correcto
      authService.configureAxios();
      console.log('[DEBUG] TicketList - Token configurado:', authService.getToken());
      console.log('[DEBUG] TicketList - Usuario actual:', authService.getUser());
      
      setLoading(true);
      try {
        let fetchedTickets: Ticket[] = [];
        
        // Cargar tickets según el rol
        if (role === 'admin') {
          fetchedTickets = await ticketService.getAllTickets();
        } else if (role === 'tecnico') {
          fetchedTickets = await ticketService.getTechnicianTickets();
        } else {
          fetchedTickets = await ticketService.getUserTickets();
        }
        
        console.log('[DEBUG] TicketList - Tickets obtenidos:', fetchedTickets);
        setTickets(fetchedTickets);
      } catch (error) {
        console.error('Error al cargar tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
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

  const TicketsContent = () => {
    // Definición de columnas para la tabla de tickets
    const ticketColumns = [
      {
        header: 'Asunto',
        accessor: 'title',
        cell: (ticket: Ticket) => (
          <span className="text-indigo-600 font-medium">{ticket.title}</span>
        )
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
        header: 'Categoría',
        accessor: 'category',
        cell: (ticket: Ticket) => (
          <span className="text-gray-500">
            {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
          </span>
        ),
        hideOnMobile: true
      },
      {
        header: 'Fecha',
        accessor: 'created_at',
        cell: (ticket: Ticket) => (
          <span className="text-gray-500">{formatDate(ticket.created_at)}</span>
        ),
        hideOnMobile: true
      },
      {
        header: 'Acciones',
        accessor: 'actions',
        cell: (ticket: Ticket) => (
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
        )
      }
    ];

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Mis Tickets</h1>
          <Link
            to="/tickets/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded inline-flex items-center transition-colors"
          >
            <i className="fas fa-plus-circle mr-2"></i>
            Crear nuevo ticket
          </Link>
        </div>
        
        {loading ? (
          <div className="py-4 text-center">
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Cargando tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="mb-4">
              <i className="fas fa-ticket-alt text-4xl text-gray-300"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay tickets</h3>
            <p className="text-gray-500 mb-4">No se han encontrado tickets en el sistema.</p>
            <Link
              to="/tickets/create"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              <i className="fas fa-plus-circle mr-2"></i>
              Crear nuevo ticket
            </Link>
          </div>
        ) : (
          <ResponsiveTable
            columns={ticketColumns}
            data={tickets}
            keyField="id"
            mobileCardTitle={(ticket) => ticket.title}
            emptyMessage="No hay tickets disponibles"
            compactOnMobile={true}
            className="bg-white shadow overflow-hidden rounded-md"
          />
        )}
      </div>
    );
  };

  // Renderizar con el layout según el rol
  if (userRole === 'admin') {
    return <AdminLayout>{TicketsContent()}</AdminLayout>;
  } else if (userRole === 'tecnico') {
    return <TechnicianLayout>{TicketsContent()}</TechnicianLayout>;
  } else {
    return <UserLayout>{TicketsContent()}</UserLayout>;
  }
};

export default TicketList; 