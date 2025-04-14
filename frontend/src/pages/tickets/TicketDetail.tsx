import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'abierto' | 'en_progreso' | 'cerrado';
  priority: 'baja' | 'media' | 'alta';
  created_at: string;
  assigned_to?: string;
}

interface Comment {
  id: number;
  text: string;
  user: string;
  timestamp: string;
}

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setTicket({
        id: Number(id),
        title: 'Problema con la impresora',
        description: 'La impresora no responde cuando intento imprimir documentos desde mi computadora. Ya verifiqué que está encendida y tiene papel.',
        status: 'abierto',
        priority: 'media',
        created_at: '2023-04-10',
        assigned_to: 'Técnico Soporte'
      });
      
      setComments([
        {
          id: 1,
          text: '¿Has intentado reiniciar la impresora?',
          user: 'Técnico Soporte',
          timestamp: '2023-04-10 14:30'
        },
        {
          id: 2,
          text: 'Sí, ya lo intenté pero sigue sin funcionar.',
          user: 'Usuario',
          timestamp: '2023-04-10 15:20'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '') return;
    
    const comment: Comment = {
      id: comments.length + 1,
      text: newComment,
      user: 'Usuario',
      timestamp: new Date().toLocaleString()
    };
    
    setComments([...comments, comment]);
    setNewComment('');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          No se pudo encontrar el ticket #{id}.
        </div>
        <div className="mt-4">
          <Link to="/" className="text-blue-500 hover:underline">
            Volver a la lista de tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <Link to="/" className="text-blue-500 hover:underline">
          &larr; Volver a la lista de tickets
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between">
          <h1 className="text-lg font-medium text-gray-900">
            Ticket #{ticket.id}: {ticket.title}
          </h1>
          <div className="flex space-x-2">
            <span
              className={`px-2 py-1 text-xs rounded-full ${getStatusClass(
                ticket.status
              )}`}
            >
              {ticket.status === 'abierto'
                ? 'Abierto'
                : ticket.status === 'en_progreso'
                ? 'En Progreso'
                : 'Cerrado'}
            </span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${getPriorityClass(
                ticket.priority
              )}`}
            >
              Prioridad: {ticket.priority}
            </span>
          </div>
        </div>
        
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Creado</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {ticket.created_at}
              </dd>
            </div>
            
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Asignado a</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {ticket.assigned_to || 'No asignado'}
              </dd>
            </div>
            
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Descripción</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {ticket.description}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Comentarios</h2>
        </div>
        
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <li key={comment.id} className="px-4 py-4">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                      {comment.user.charAt(0)}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{comment.user}</h3>
                      <p className="text-sm text-gray-500">{comment.timestamp}</p>
                    </div>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="px-4 py-4 border-t border-gray-200">
            <form onSubmit={handleAddComment}>
              <div>
                <label htmlFor="comment" className="sr-only">
                  Comentario
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={3}
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Añadir un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Comentar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail; 