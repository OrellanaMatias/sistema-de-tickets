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
  const [confirmAction, setConfirmAction] = useState<'status' | 'assign' | 'deleteComment' | null>(null);
  const [newStatus, setNewStatus] = useState<'abierto' | 'en_progreso' | 'cerrado' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'tecnico' | 'usuario' | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);

  useEffect(() => {
    const user = authService.getUser();
    if (user) {
      setUserRole(user.role as 'admin' | 'tecnico' | 'usuario');
      setCurrentUserId(Number(user.id));
    }
    
    fetchTicket();
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

  const confirmationModal = () => {
    if (!showConfirmModal) return null;

    let title = '';
    let message = '';
    let actionFunction = () => {};
    
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
    } else if (confirmAction === 'deleteComment') {
      title = 'Eliminar comentario';
      message = '¿Estás seguro de que quieres eliminar este comentario?';
      actionFunction = handleDeleteComment;
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={actionLoading}
            >
              Cancelar
            </button>
            <button 
              onClick={actionFunction}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              disabled={actionLoading}
            >
              {actionLoading ? 
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando
                </span> : 
                'Confirmar'
              }
            </button>
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
        <div className="py-6 text-center border-t">
          <p className="text-gray-500">No hay comentarios para este ticket.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-4">
        {comments.map(comment => (
          <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <div className="bg-indigo-100 text-indigo-800 p-2 rounded-full">
                  <span className="text-sm font-medium">
                    {comment.user?.displayName?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{comment.user?.displayName}</p>
                  <p className="text-sm text-gray-500">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Fecha desconocida'} 
                    <span className="mx-1">•</span>
                    <span className={
                      comment.user?.role === 'admin' ? 'text-red-600' :
                      comment.user?.role === 'tecnico' ? 'text-blue-600' : ''
                    }>
                      {comment.user?.role === 'admin' ? 'Administrador' :
                       comment.user?.role === 'tecnico' ? 'Técnico' : 'Usuario'}
                    </span>
                  </p>
                </div>
              </div>
              {(userRole === 'admin' || (comment.userId === currentUserId)) && (
                <button 
                  onClick={() => openDeleteCommentConfirm(comment.id!)}
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar comentario"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                  </svg>
                </button>
              )}
            </div>
            <div className="mt-2 text-gray-700 whitespace-pre-wrap">
              {comment.text}
            </div>
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
        <div className="bg-white rounded-lg shadow">
          {/* Cabecera */}
          <div className="border-b p-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
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
            
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <div className="mr-6">
                <span className="font-medium text-gray-700">Ticket #</span> {ticket.id}
              </div>
              <div className="mr-6">
                <span className="font-medium text-gray-700">Creado</span> {formatDate(ticket.created_at)}
              </div>
              <div>
                <span className="font-medium text-gray-700">Actualizado</span> {formatDate(ticket.updated_at)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <div className="flex items-center">
                <i className="fas fa-user text-gray-400 mr-2"></i>
                <div>
                  <div className="text-xs text-gray-500">Creado por</div>
                  <div className="font-medium">{ticket.creator?.displayName || 'Usuario'}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <i className="fas fa-user-cog text-gray-400 mr-2"></i>
                <div>
                  <div className="text-xs text-gray-500">Asignado a</div>
                  <div className="font-medium">{ticket.assignedTo?.displayName || 'Sin asignar'}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <i className={`${getCategoryIcon(ticket.category)} text-gray-400 mr-2`}></i>
                <div>
                  <div className="text-xs text-gray-500">Categoría</div>
                  <div className="font-medium">{ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Acciones */}
          {(userRole === 'tecnico' || userRole === 'admin') && (
            <div className="bg-gray-50 p-4 flex flex-wrap gap-2 border-b">
              {/* Botones para cambiar estado */}
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
              {userRole === 'tecnico' && !ticket.assignedTo && (
                <button 
                  onClick={openAssignConfirm}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <i className="fas fa-user-plus mr-2"></i>
                  Asignarme
                </button>
              )}
            </div>
          )}
          
          {/* Descripción */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-medium mb-4">Descripción</h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{ticket.description}</p>
            </div>
          </div>
          
          {/* Comentarios */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Comentarios</h3>
            
            {renderComments()}
            
            {/* Formulario para añadir comentario */}
            <form onSubmit={handleAddComment} className="mt-6">
              <div className="mt-1">
                <textarea
                  rows={3}
                  className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  disabled={commentSubmitting}
                ></textarea>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
    <div className="p-4">
      <div className="mb-4 flex items-center">
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