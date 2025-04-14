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

// Obtener token usando authService para mantener consistencia
const getAuthHeader = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface SystemConfig {
  id?: number;
  appName: string;
  dbHost: string;
  dbPort: string;
  dbName: string;
  smtpServer: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass?: string;
  maxUploadSize: string;
  ticketAutoClose: string;
  maintenanceMode: boolean;
}

// Obtener la configuración actual del sistema
const getSystemConfig = async (): Promise<SystemConfig> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<SystemConfig>(`${API_URL}/config`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error al obtener configuración del sistema:', error);
    // Valores por defecto en caso de error
    return {
      appName: 'Sistema de Tickets',
      dbHost: 'mysql',
      dbPort: '3306',
      dbName: 'ticketing',
      smtpServer: 'smtp.example.com',
      smtpPort: '587',
      smtpUser: 'notifications@tickets.com',
      maxUploadSize: '10',
      ticketAutoClose: '15',
      maintenanceMode: false
    };
  }
};

// Actualizar la configuración del sistema
const updateSystemConfig = async (configData: Partial<SystemConfig>): Promise<SystemConfig | null> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.put<SystemConfig>(`${API_URL}/config`, configData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar configuración del sistema:', error);
    return null;
  }
};

// Realizar backup de la base de datos
const backupDatabase = async (): Promise<boolean> => {
  try {
    const headers = getAuthHeader();
    await axios.post(`${API_URL}/config/backup`, {}, { headers });
    return true;
  } catch (error) {
    console.error('Error al realizar backup de la base de datos:', error);
    return false;
  }
};

// Restaurar la base de datos desde un backup
const restoreDatabase = async (file: File): Promise<boolean> => {
  try {
    const headers = getAuthHeader();
    const formData = new FormData();
    formData.append('backupFile', file);
    
    await axios.post(`${API_URL}/config/restore`, formData, { 
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data'
      }
    });
    return true;
  } catch (error) {
    console.error('Error al restaurar la base de datos:', error);
    return false;
  }
};

// Realizar tareas de mantenimiento del sistema
const performMaintenance = async (task: 'clearCache' | 'optimizeTables' | 'clearLogs'): Promise<boolean> => {
  try {
    const headers = getAuthHeader();
    await axios.post(`${API_URL}/config/maintenance/${task}`, {}, { headers });
    return true;
  } catch (error) {
    console.error(`Error al realizar tarea de mantenimiento (${task}):`, error);
    return false;
  }
};

// Probar configuración SMTP
const testSmtpConnection = async (smtpConfig: Partial<SystemConfig>): Promise<boolean> => {
  try {
    const headers = getAuthHeader();
    await axios.post(`${API_URL}/config/test-smtp`, smtpConfig, { headers });
    return true;
  } catch (error) {
    console.error('Error al probar la configuración SMTP:', error);
    return false;
  }
};

const configService = {
  getSystemConfig,
  updateSystemConfig,
  backupDatabase,
  restoreDatabase,
  performMaintenance,
  testSmtpConnection
};

export default configService; 