import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ticketService, { TicketComment } from '../../services/ticketService';
import authService from '../../services/authService';
import { AdminLayout } from '../../components/AdminLayout';
import { TechnicianLayout } from '../../components/TechnicianLayout';
import { UserLayout } from '../../components/UserLayout';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'abierto' | 'en_progreso' | 'cerrado';
  priority: 'baja' | 'media' | 'alta';
  category: string;
  created_at?: string;
  updated_at?: string;
  creator?: {
    id: number;
    displayName: string;
    email: string;
  };
  assignedTo?: {
    id: number;
    displayName: string;
    email: string;
  };
}

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'status' | 'assign' | 'assignToTech' | 'deleteComment' | null>(null);
  const [newStatus, setNewStatus] = useState<'abierto' | 'en_progreso' | 'cerrado' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'tecnico' | 'usuario' | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [technicians, setTechnicians] = useState<{id: number, displayName: string}[]>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<number | null>(null);

  useEffect(() => {
    const user = authService.getUser();
    if (user) {
      setUserRole(user.role as 'admin' | 'tecnico' | 'usuario');
      setCurrentUserId(Number(user.id));
    }
    
    fetchTicket();
    
    // Cargar técnicos si el usuario es admin
    if (user?.role === 'admin') {
      fetchTechnicians();
    }
  }, [id]);

  const fetchTicket = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await ticketService.getTicketById(Number(id));
      if (data) {
        setTicket({
          ...data,
          id: Number(data.id)
        });
        
        // Cargar comentarios reales
        fetchComments();
      }
    } catch (error) {
      console.error('Error al cargar el ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!id) return;
    
    setCommentsLoading(true);
    try {
      const commentsData = await ticketService.getTicketComments(Number(id));
      setComments(commentsData);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      // Esta función debería existir en el servicio de usuarios o adaptarse según la API
      const response = await authService.getTechnicians();
      setTechnicians(response);
    } catch (error) {
      console.error('Error al cargar técnicos:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '' || !id) return;
    
    setCommentSubmitting(true);
    try {
      const comment = await ticketService.createComment(Number(id), newComment);
      setComments(prev => [...prev, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error al añadir comentario:', error);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const openStatusConfirm = (status: 'abierto' | 'en_progreso' | 'cerrado') => {
    setNewStatus(status);
    setConfirmAction('status');
    setShowConfirmModal(true);
  };

  const openAssignConfirm = () => {
    setConfirmAction('assign');
    setShowConfirmModal(true);
  };

  const openAssignToTechnicianModal = () => {
    setConfirmAction('assignToTech');
    setShowConfirmModal(true);
  };

  const openDeleteCommentConfirm = (commentId: number) => {
    setSelectedCommentId(commentId);
    setConfirmAction('deleteComment');
    setShowConfirmModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!ticket?.id || !newStatus) return;
    
    setActionLoading(true);
    try {
      await ticketService.updateTicketStatus(ticket.id, newStatus);
      await fetchTicket();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    } finally {
      setActionLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleAssignToSelf = async () => {
    if (!ticket?.id) return;
    
    setActionLoading(true);
    try {
      await ticketService.assignTicketToSelf(ticket.id);
      await fetchTicket();
    } catch (error) {
      console.error('Error al asignar ticket:', error);
    } finally {
      setActionLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleAssignToTechnician = async () => {
    if (!ticket?.id || !selectedTechnicianId) return;
    
    setActionLoading(true);
    try {
      await ticketService.assignTicket(ticket.id, selectedTechnicianId);
      await fetchTicket();
    } catch (error) {
      console.error('Error al asignar ticket:', error);
    } finally {
      setActionLoading(false);
      setShowConfirmModal(false);
      setSelectedTechnicianId(null);
    }
  };

  const handleDeleteComment = async () => {
    if (!selectedCommentId) return;
    
    setActionLoading(true);
    try {
      await ticketService.deleteComment(selectedCommentId);
      // Actualizar la lista de comentarios
      setComments(prev => prev.filter(comment => comment.id !== selectedCommentId));
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
    } finally {
      setActionLoading(false);
      setShowConfirmModal(false);
      setSelectedCommentId(null);
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

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-orange-100 text-orange-800';
      case 'baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hardware': return 'fas fa-desktop';
      case 'software': return 'fas fa-code';
      case 'red': return 'fas fa-network-wired';
      case 'impresoras': return 'fas fa-print';
      default: return 'fas fa-question-circle';
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

  const formatCommentDate = (dateString?: string) => {
    if (!dateString) return 'Fecha desconocida';
    
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const confirmationModal = () => {
    if (!showConfirmModal) return null;

    let title = '';
    let message = '';
    let actionFunction = () => {};
    let content = null;
    
    if (confirmAction === 'status' && newStatus) {
      let statusText = '';
      switch (newStatus) {
        case 'abierto': statusText = 'Abierto'; break;
        case 'en_progreso': statusText = 'En Progreso'; break;
        case 'cerrado': statusText = 'Cerrado'; break;
      }
      
      title = `Cambiar estado a ${statusText}`;
      message = `¿Estás seguro de que quieres cambiar el estado del ticket "${ticket?.title}" a ${statusText}?`;
      actionFunction = handleUpdateStatus;
    } else if (confirmAction === 'assign') {
      title = 'Asignar ticket';
      message = `¿Estás seguro de que quieres asignarte el ticket "${ticket?.title}"?`;
      actionFunction = handleAssignToSelf;
    } else if (confirmAction === 'assignToTech') {
      title = 'Asignar ticket a técnico';
      message = 'Selecciona el técnico al que deseas asignar este ticket:';
      actionFunction = handleAssignToTechnician;
      content = (
        <div className="mt-4 w-full">
          <select 
            className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            value={selectedTechnicianId || ''}
            onChange={(e) => setSelectedTechnicianId(Number(e.target.value))}
          >
            <option value="">Selecciona un técnico</option>
            {technicians.map(tech => (
              <option key={tech.id} value={tech.id}>{tech.displayName}</option>
            ))}
          </select>
        </div>
      );
    } else if (confirmAction === 'deleteComment') {
      title = 'Eliminar comentario';
      message = '¿Estás seguro de que quieres eliminar este comentario?';
      actionFunction = handleDeleteComment;
    }

    return (
      <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full sm:w-full sm:p-6 p-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                <i className="fas fa-info-circle text-indigo-600"></i>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{message}</p>
                  {content}
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2 flex flex-col-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={actionFunction}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : confirmAction === 'deleteComment' ? 'Eliminar' : 'Confirmar'}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={() => setShowConfirmModal(false)}
                disabled={actionLoading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComments = () => {
    if (commentsLoading) {
      return (
        <div className="py-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Cargando comentarios...</p>
        </div>
      );
    }

    if (comments.length === 0) {
      return (
        <div className="py-4 text-center">
          <p className="text-gray-500">No hay comentarios para este ticket.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3 w-full">
        {comments.map(comment => (
          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg break-words">
            <div className="flex justify-between items-center mb-1">
              <div className="font-medium text-gray-900">{comment.user?.displayName || 'Usuario'}</div>
              {((userRole === 'admin') || 
                 (userRole === 'tecnico' && comment.user?.id === currentUserId) || 
                 (userRole === 'usuario' && comment.user?.id === currentUserId)) && (
                <button 
                  onClick={() => openDeleteCommentConfirm(comment.id!)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Eliminar comentario"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                  </svg>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-1">
              {formatCommentDate(comment.createdAt)}
              <span className="mx-1">•</span>
              <span className={
                comment.user?.role === 'admin' ? 'text-red-600' :
                comment.user?.role === 'tecnico' ? 'text-blue-600' : ''
              }>
                {comment.user?.role === 'admin' ? 'Administrador' :
                 comment.user?.role === 'tecnico' ? 'Técnico' : 'Usuario'}
              </span>
            </p>
            <div className="text-gray-700 text-sm">{comment.text}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!ticket) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="font-bold mb-2">Ticket no encontrado</h2>
          <p>No se pudo encontrar el ticket solicitado.</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
          >
            Volver
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="bg-white rounded-lg shadow flex flex-col h-full">
          {/* Cabecera */}
          <div className="border-b p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
              <h1 className="text-xl font-bold text-gray-900">
                {ticket.title}
              </h1>
              <div className="flex gap-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusClass(ticket.status)}`}>
                  {ticket.status === 'abierto' ? 'Abierto' : 
                   ticket.status === 'en_progreso' ? 'En Progreso' : 'Cerrado'}
                </span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityClass(ticket.priority)}`}>
                  Prioridad {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Ticket #</span> {ticket.id}
              </div>
              <div>
                <span className="font-medium text-gray-700">Creado</span> {formatDate(ticket.created_at)}
              </div>
              <div className="col-span-2 md:col-span-1">
                <span className="font-medium text-gray-700">Actualizado</span> {formatDate(ticket.updated_at)}
              </div>
              <div className="col-span-2 md:col-span-1">
                <span className="font-medium text-gray-700">Categoría</span> {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
              </div>
              <div className="col-span-2 md:col-span-1">
                <span className="font-medium text-gray-700">Creado por</span> {ticket.creator?.displayName || 'Usuario'}
              </div>
              <div className="col-span-2 md:col-span-1">
                <span className="font-medium text-gray-700">Asignado a</span> {ticket.assignedTo?.displayName || 'Sin asignar'}
              </div>
            </div>
          </div>
          
          {/* Acciones */}
          {(userRole === 'tecnico' || userRole === 'admin') && (
            <div className="bg-gray-50 p-3 flex flex-wrap gap-2 border-b">
              {/* Botones para cambiar estado (solo técnicos) */}
              {userRole === 'tecnico' && (
                <>
                  {ticket.status !== 'abierto' && (
                    <button 
                      onClick={() => openStatusConfirm('abierto')}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <i className="fas fa-folder-open mr-2 text-blue-500"></i>
                      Reabrir
                    </button>
                  )}
                  
                  {ticket.status !== 'en_progreso' && (
                    <button 
                      onClick={() => openStatusConfirm('en_progreso')}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-500 hover:bg-yellow-600"
                    >
                      <i className="fas fa-play mr-2"></i>
                      Iniciar
                    </button>
                  )}
                  
                  {ticket.status !== 'cerrado' && (
                    <button 
                      onClick={() => openStatusConfirm('cerrado')}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-500 hover:bg-green-600"
                    >
                      <i className="fas fa-check-circle mr-2"></i>
                      Resolver
                    </button>
                  )}
                  
                  {/* Botón para asignarse el ticket (solo técnicos) */}
                  {!ticket.assignedTo && (
                    <button 
                      onClick={openAssignConfirm}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <i className="fas fa-user-plus mr-2"></i>
                      Asignarme
                    </button>
                  )}
                </>
              )}
              
              {/* Botón para asignar a un técnico (solo admin) */}
              {userRole === 'admin' && (
                <button 
                  onClick={openAssignToTechnicianModal}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <i className="fas fa-user-cog mr-2"></i>
                  Asignar a técnico
                </button>
              )}
            </div>
          )}
          
          {/* Contenido principal (descripción y comentarios) en un contenedor con desplazamiento */}
          <div className="flex flex-col md:flex-row overflow-y-auto flex-1">
            {/* Descripción - ocupa una proporción menor en escritorio */}
            <div className="p-4 md:w-2/5 md:border-r">
              <h2 className="text-lg font-medium mb-3">Descripción</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line break-words">{ticket.description}</p>
              </div>
            </div>
            
            {/* Comentarios - ocupa una proporción mayor en escritorio */}
            <div className="p-4 md:w-3/5 flex flex-col max-h-full">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Comentarios</h3>
              
              {/* Contenedor con scroll independiente para los comentarios */}
              <div className="overflow-y-auto flex-1 pr-1">
                {renderComments()}
              </div>
              
              {/* Formulario de comentarios siempre visible */}
              <div className="pt-3 border-t mt-3">
                <form onSubmit={handleAddComment} className="w-full">
                  <div className="w-full">
                    <textarea
                      rows={2}
                      className="shadow-sm block w-full sm:text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-y px-4 py-3"
                      placeholder="Escribe un comentario..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      disabled={commentSubmitting}
                    ></textarea>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto"
                      disabled={commentSubmitting || newComment.trim() === ''}
                    >
                      {commentSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </>
                      ) : 'Enviar comentario'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {confirmationModal()}
      </>
    );
  };

  const renderWithLayout = () => {
    const content = renderContent();
    
    if (userRole === 'admin') {
      return <AdminLayout>{content}</AdminLayout>;
    } else if (userRole === 'tecnico') {
      return <TechnicianLayout>{content}</TechnicianLayout>;
    } else {
      return <UserLayout>{content}</UserLayout>;
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i> Volver
        </button>
      </div>
      
      {renderWithLayout()}
    </div>
  );
};

export default TicketDetail; 