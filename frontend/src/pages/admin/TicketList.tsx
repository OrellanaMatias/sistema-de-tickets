import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import ticketService, { Ticket } from '../../services/ticketService';
import authService from '../../services/authService';

interface Technician {
  id: number;
  displayName: string;
  email?: string;
}

const AdminTicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<number | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'abierto' | 'en_progreso' | 'cerrado'>('todos');

  useEffect(() => {
    fetchTickets();
    fetchTechnicians();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketService.getAllTickets();
      setTickets(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los tickets. Por favor, intenta nuevamente.');
      console.error('Error al cargar tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const data = await authService.getTechnicians();
      setTechnicians(data);
    } catch (err) {
      console.error('Error al cargar técnicos:', err);
    }
  };

  const openAssignModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSelectedTechnicianId(ticket.assignedToId || null);
    setShowModal(true);
  };

  const handleAssignTicket = async () => {
    if (!selectedTicket || selectedTechnicianId === undefined) return;
    
    setAssignLoading(true);
    try {
      await ticketService.assignTicket(selectedTicket.id!, selectedTechnicianId!);
      // Actualizar la lista de tickets
      await fetchTickets();
      setShowModal(false);
      setSelectedTicket(null);
      setSelectedTechnicianId(null);
    } catch (err) {
      console.error('Error al asignar ticket:', err);
      alert('Error al asignar el ticket. Por favor, intenta nuevamente.');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUnassignTicket = async () => {
    if (!selectedTicket) return;
    
    setAssignLoading(true);
    try {
      // Pasar null como technicianId para desasignar
      await ticketService.assignTicket(selectedTicket.id!, null as any);
      // Actualizar la lista de tickets
      await fetchTickets();
      setShowModal(false);
      setSelectedTicket(null);
    } catch (err) {
      console.error('Error al desasignar ticket:', err);
      alert('Error al desasignar el ticket. Por favor, intenta nuevamente.');
    } finally {
      setAssignLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    // Filtrar por término de búsqueda
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.creator?.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.assignedTo?.displayName && ticket.assignedTo.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtrar por estado
    const matchesStatus = filterStatus === 'todos' || ticket.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'abierto': return 'bg-blue-100 text-blue-800';
      case 'en_progreso': return 'bg-yellow-100 text-yellow-800';
      case 'cerrado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'abierto': return 'Abierto';
      case 'en_progreso': return 'En Progreso';
      case 'cerrado': return 'Cerrado';
      default: return status;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-orange-100 text-orange-800';
      case 'baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'alta': return 'Alta';
      case 'media': return 'Media';
      case 'baja': return 'Baja';
      default: return priority;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const AssignModal = () => {
    if (!showModal || !selectedTicket) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Asignar Ticket</h3>
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="mb-2">
              <h4 className="text-lg font-medium">{selectedTicket.title}</h4>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Creado por:</span> {selectedTicket.creator?.displayName || 'Usuario'}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Fecha:</span> {formatDate(selectedTicket.created_at)}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Prioridad:</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${getPriorityClass(selectedTicket.priority)}`}>
                {getPriorityText(selectedTicket.priority)}
              </span>
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar técnico para asignar
            </label>
            <div className="relative">
              <select 
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                value={selectedTechnicianId || ''}
                onChange={(e) => setSelectedTechnicianId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Seleccionar técnico</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>
                    {tech.displayName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={assignLoading}
            >
              Cancelar
            </button>
            
            {selectedTicket.assignedToId && (
              <button 
                onClick={handleUnassignTicket}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                disabled={assignLoading}
              >
                {assignLoading ? 'Procesando...' : 'Desasignar'}
              </button>
            )}
            
            <button 
              onClick={handleAssignTicket}
              className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              disabled={assignLoading || !selectedTechnicianId}
            >
              {assignLoading ? 'Procesando...' : 'Asignar'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestión de Tickets</h1>
          <button
            onClick={fetchTickets}
            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center shadow-md transition-all duration-200"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Actualizar
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                placeholder="Buscar por título, descripción o usuario..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="md:w-1/4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por estado</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="todos">Todos los estados</option>
                <option value="abierto">Abiertos</option>
                <option value="en_progreso">En Progreso</option>
                <option value="cerrado">Cerrados</option>
              </select>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">No se encontraron tickets que coincidan con los criterios de búsqueda.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridad
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creado por
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asignado a
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{ticket.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-indigo-600">{ticket.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {ticket.description?.substring(0, 50)}
                          {ticket.description && ticket.description.length > 50 ? '...' : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(ticket.priority)}`}>
                          {getPriorityText(ticket.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.creator?.displayName || 'Usuario'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.assignedTo?.displayName || <span className="text-gray-500">Sin asignar</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(ticket.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-3">
                          <Link 
                            to={`/tickets/${ticket.id}`}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-100 transition-colors"
                            title="Ver detalles"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            onClick={() => openAssignModal(ticket)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded-full hover:bg-purple-100 transition-colors"
                            title="Asignar a técnico"
                          >
                            <i className="fas fa-user-cog"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <AssignModal />
    </AdminLayout>
  );
};

export default AdminTicketList; 