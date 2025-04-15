import axios from 'axios';
import authService from './authService';

// Usar una URL basada en la ubicación actual del navegador para mayor compatibilidad
const getBaseUrl = () => {
  const { protocol, hostname } = window.location;
  
  // Configuración para contenedor Docker y cualquier host
  const backendPort = '3000';
  const apiPath = '/api';
  
  // Usar el mismo hostname que el cliente está usando actualmente
  return `${protocol}//${hostname}:${backendPort}${apiPath}`;
};

// Verificar la variable de entorno para la URL de la API
const envUrl = import.meta.env.VITE_API_URL;

// Determinar si estamos dentro del contenedor Docker o ejecutando en navegador
const isRunningInBrowser = typeof window !== 'undefined';

// Usar la variable de entorno si está definida, de lo contrario usar la función getBaseUrl
// Si la URL contiene 'backend', reemplazarla con el hostname del navegador cuando se ejecuta en navegador
let API_URL = envUrl || getBaseUrl();

// Cuando se ejecuta en navegador y la URL contiene 'backend'
if (isRunningInBrowser && API_URL.includes('backend')) {
  const { protocol, hostname } = window.location;
  API_URL = API_URL.replace('http://backend', `${protocol}//${hostname}`);
}

// Configurar cabeceras de autenticación para las peticiones
const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Ticket {
  id?: number;
  title: string;
  description: string;
  status: 'abierto' | 'en_progreso' | 'cerrado';
  priority: 'baja' | 'media' | 'alta';
  category: string;
  userId?: number;
  assignedToId?: number;
  created_at?: string;
  updated_at?: string;
  creator?: {
    id: number;
    username: string;
    email: string;
  }
}

// Obtener todos los tickets (para admin y técnicos)
const getAllTickets = async (): Promise<Ticket[]> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<Ticket[]>(`${API_URL}/tickets`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    throw error;
  }
};

// Obtener tickets del usuario actual
const getUserTickets = async (): Promise<Ticket[]> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<Ticket[]>(`${API_URL}/tickets/user`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error al obtener tickets del usuario:', error);
    // Si hay error, retornamos un array vacío para facilitar el manejo en los componentes
    return [];
  }
};

// Obtener un ticket por su ID
const getTicketById = async (id: number): Promise<Ticket | null> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<Ticket>(`${API_URL}/tickets/${id}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener ticket ${id}:`, error);
    return null;
  }
};

// Crear un nuevo ticket
const createTicket = async (ticketData: Omit<Ticket, 'id' | 'created_at' | 'updated_at'>): Promise<Ticket | null> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.post<Ticket>(`${API_URL}/tickets`, ticketData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error al crear ticket:', error);
    throw error;
  }
};

// Actualizar un ticket existente
const updateTicket = async (id: number, ticketData: Partial<Ticket>): Promise<Ticket | null> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.put<Ticket>(`${API_URL}/tickets/${id}`, ticketData, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar ticket ${id}:`, error);
    throw error;
  }
};

// Cambiar el estado de un ticket
const updateTicketStatus = async (id: number, status: Ticket['status']): Promise<boolean> => {
  try {
    const headers = getAuthHeader();
    await axios.patch(`${API_URL}/tickets/${id}/status`, { status }, { headers });
    return true;
  } catch (error) {
    console.error(`Error al actualizar estado del ticket ${id}:`, error);
    throw error;
  }
};

// Asignar un ticket a un técnico
const assignTicket = async (id: number, technicianId: number): Promise<boolean> => {
  try {
    const headers = getAuthHeader();
    await axios.patch(`${API_URL}/tickets/${id}/assign`, { technicianId }, { headers });
    return true;
  } catch (error) {
    console.error(`Error al asignar ticket ${id}:`, error);
    throw error;
  }
};

// Obtener estadísticas de tickets para el usuario
const getUserTicketStats = async (): Promise<{
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
}> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<{
      total: number;
      pending: number;
      inProgress: number;
      resolved: number;
    }>(`${API_URL}/tickets/stats/user`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de tickets:', error);
    // Devolver valores por defecto en caso de error
    return {
      total: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0
    };
  }
};

// Obtener tickets asignados al técnico actual
const getTechnicianTickets = async (): Promise<Ticket[]> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<Ticket[]>(`${API_URL}/tickets/technician/all`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error al obtener tickets del técnico:', error);
    return [];
  }
};

// Obtener estadísticas de tickets para el técnico
const getTechnicianTicketStats = async () => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get(`${API_URL}/tickets/stats/technician`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de tickets del técnico:', error);
    return {
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      totalPending: 0
    };
  }
};

// Obtener todos los tickets pendientes (sin asignar) para el técnico
const getPendingTickets = async (): Promise<Ticket[]> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<Ticket[]>(`${API_URL}/tickets/pending`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error al obtener tickets pendientes:', error);
    return [];
  }
};

// Asignar un ticket a sí mismo (para técnicos)
const assignTicketToSelf = async (ticketId: number): Promise<Ticket> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.patch<Ticket>(
      `${API_URL}/tickets/${ticketId}/assign-self`, 
      {}, 
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Error al asignar ticket:', error);
    throw error;
  }
};

const ticketService = {
  getAllTickets,
  getUserTickets,
  getTicketById,
  createTicket,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  getUserTicketStats,
  getTechnicianTickets,
  getTechnicianTicketStats,
  getPendingTickets,
  assignTicketToSelf
};

export default ticketService; 