import axios from 'axios';
import authService from './authService';

// Usar una URL basada en la ubicación actual del navegador para mayor compatibilidad
const getBaseUrl = () => {
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:3000/api`;
};

// Verificar la variable de entorno - si contiene host.docker.internal, ignorarla
const envUrl = import.meta.env.VITE_API_URL;
const API_URL = (envUrl && !envUrl.includes('host.docker.internal')) 
  ? envUrl 
  : getBaseUrl();

// Obtener token usando authService
const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

interface StatsResponse {
  totalUsers: number;
  totalTickets: number;
  pendingTickets: number;
  completedTickets: number;
}

interface RecentActivity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}

interface PerformanceSummary {
  resolvedPercentage: number;
  pendingPercentage: number;
  averageResolutionTime: number; // en días
}

// Obtener estadísticas generales
const getDashboardStats = async (): Promise<StatsResponse> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<StatsResponse>(`${API_URL}/stats/dashboard`, { 
      headers 
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    // Devolver valores predeterminados en caso de error
    return {
      totalUsers: 0,
      totalTickets: 0,
      pendingTickets: 0,
      completedTickets: 0
    };
  }
};

// Obtener actividad reciente
const getRecentActivity = async (): Promise<RecentActivity[]> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<RecentActivity[]>(`${API_URL}/stats/recent-activity`, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener actividad reciente:', error);
    return [];
  }
};

// Obtener resumen de rendimiento
const getPerformanceSummary = async (): Promise<PerformanceSummary> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<PerformanceSummary>(`${API_URL}/stats/performance`, {
      headers
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener resumen de rendimiento:', error);
    // Devolver valores predeterminados en caso de error
    return {
      resolvedPercentage: 0,
      pendingPercentage: 0,
      averageResolutionTime: 0
    };
  }
};

const statsService = {
  getDashboardStats,
  getRecentActivity,
  getPerformanceSummary
};

export default statsService; 