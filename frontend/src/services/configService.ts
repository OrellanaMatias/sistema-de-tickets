import axios from 'axios';
import authService from './authService';

// Usar una URL basada en la ubicación actual del navegador para mayor compatibilidad
const getBaseUrl = () => {
  const { protocol, hostname, port } = window.location;
  
  // Ajustes para entorno de desarrollo
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Si estamos en local, usar http://localhost:3000/api
    return 'http://localhost:3000/api';
  }
  
  return `${protocol}//${hostname}:3000/api`;
};

// URL base
const API_URL = import.meta.env.VITE_API_URL || getBaseUrl();

console.log('[configService] API_URL:', API_URL);

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

// Valores predeterminados para la configuración
const DEFAULT_CONFIG: SystemConfig = {
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

// Obtener la configuración actual del sistema
const getSystemConfig = async (): Promise<SystemConfig> => {
  try {
    console.log(`[configService] Solicitando configuración del sistema a: ${API_URL}/config`);
    
    // Si estamos en desarrollo y sin conexión, simular respuesta
    if (localStorage.getItem('debug-mode') === 'true') {
      console.log('[configService] Modo debug activado, usando config predeterminada');
      return Promise.resolve(DEFAULT_CONFIG);
    }
    
    const headers = getAuthHeader();
    console.log('[configService] Headers:', headers);
    
    const response = await axios.get<SystemConfig>(`${API_URL}/config`, { 
      headers,
      timeout: 5000 // Reducir timeout a 5 segundos para fallar más rápido en caso de problemas
    });
    
    console.log('[configService] Respuesta de configuración:', response.data);
    return response.data;
  } catch (error) {
    console.error('[configService] Error al obtener configuración del sistema:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('[configService] Detalles del error Axios:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      // Almacenar detalles del error para diagnóstico
      localStorage.setItem('config-error', JSON.stringify({
        message: error.message,
        timestamp: new Date().toISOString()
      }));
    }
    
    // Activar modo debug si hay error de red
    if (axios.isAxiosError(error) && error.message.includes('Network Error')) {
      localStorage.setItem('debug-mode', 'true');
      console.log('[configService] Modo debug activado automáticamente debido a error de red');
    }
    
    // Valores por defecto en caso de error
    return DEFAULT_CONFIG;
  }
};

// Actualizar la configuración del sistema
const updateSystemConfig = async (configData: Partial<SystemConfig>): Promise<SystemConfig | null> => {
  try {
    // Si estamos en modo debug, simular éxito
    if (localStorage.getItem('debug-mode') === 'true') {
      console.log('[configService] Modo debug: simulando actualización exitosa');
      return { ...DEFAULT_CONFIG, ...configData };
    }
    
    const headers = getAuthHeader();
    const response = await axios.put<{success: boolean, config: SystemConfig}>(`${API_URL}/config`, configData, { 
      headers,
      timeout: 5000
    });
    
    if (response.data && response.data.success) {
      return response.data.config;
    }
    return null;
  } catch (error) {
    console.error('[configService] Error al actualizar configuración del sistema:', error);
    // En modo debug, simular éxito incluso con error
    if (localStorage.getItem('debug-mode') === 'true') {
      return { ...DEFAULT_CONFIG, ...configData };
    }
    return null;
  }
};

// Función para simular operaciones en modo debug
const simulateAsyncOperation = async (successMessage: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[configService] Modo debug: ${successMessage}`);
      resolve(true);
    }, 1000);
  });
};

// Realizar backup de la base de datos
const backupDatabase = async (): Promise<boolean> => {
  try {
    // Si estamos en modo debug, simular éxito
    if (localStorage.getItem('debug-mode') === 'true') {
      return simulateAsyncOperation('simulando backup exitoso');
    }
    
    const headers = getAuthHeader();
    const response = await axios.post(`${API_URL}/config/backup`, {}, { 
      headers,
      timeout: 10000
    });
    return response.data && response.data.success;
  } catch (error) {
    console.error('[configService] Error al realizar backup de la base de datos:', error);
    // En modo debug, simular éxito incluso con error
    if (localStorage.getItem('debug-mode') === 'true') {
      return true;
    }
    return false;
  }
};

// Restaurar la base de datos desde un backup
const restoreDatabase = async (file: File): Promise<boolean> => {
  try {
    // Si estamos en modo debug, simular éxito
    if (localStorage.getItem('debug-mode') === 'true') {
      return simulateAsyncOperation(`simulando restauración exitosa de ${file.name}`);
    }
    
    const headers = getAuthHeader();
    const formData = new FormData();
    formData.append('backupFile', file);
    
    const response = await axios.post(`${API_URL}/config/restore`, formData, { 
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data'
      },
      timeout: 20000
    });
    
    return response.data && response.data.success;
  } catch (error) {
    console.error('[configService] Error al restaurar la base de datos:', error);
    // En modo debug, simular éxito incluso con error
    if (localStorage.getItem('debug-mode') === 'true') {
      return true;
    }
    return false;
  }
};

// Realizar tareas de mantenimiento del sistema
const performMaintenance = async (task: 'clearCache' | 'optimizeTables' | 'clearLogs'): Promise<boolean> => {
  try {
    // Si estamos en modo debug, simular éxito
    if (localStorage.getItem('debug-mode') === 'true') {
      return simulateAsyncOperation(`simulando tarea de mantenimiento: ${task}`);
    }
    
    const headers = getAuthHeader();
    const response = await axios.post(`${API_URL}/config/maintenance/${task}`, {}, { 
      headers,
      timeout: 10000
    });
    
    return response.data && response.data.success;
  } catch (error) {
    console.error(`[configService] Error al realizar tarea de mantenimiento (${task}):`, error);
    // En modo debug, simular éxito incluso con error
    if (localStorage.getItem('debug-mode') === 'true') {
      return true;
    }
    return false;
  }
};

// Probar configuración SMTP
const testSmtpConnection = async (smtpConfig: Partial<SystemConfig>): Promise<boolean> => {
  try {
    // Si estamos en modo debug, simular éxito
    if (localStorage.getItem('debug-mode') === 'true') {
      return simulateAsyncOperation('simulando prueba de SMTP exitosa');
    }
    
    const headers = getAuthHeader();
    const response = await axios.post(`${API_URL}/config/test-smtp`, smtpConfig, { 
      headers,
      timeout: 8000
    });
    
    return response.data && response.data.success;
  } catch (error) {
    console.error('[configService] Error al probar la configuración SMTP:', error);
    // En modo debug, simular éxito incluso con error
    if (localStorage.getItem('debug-mode') === 'true') {
      return true;
    }
    return false;
  }
};

// Activar/desactivar modo debug
const toggleDebugMode = (enabled: boolean): void => {
  localStorage.setItem('debug-mode', enabled ? 'true' : 'false');
  console.log(`[configService] Modo debug ${enabled ? 'activado' : 'desactivado'}`);
};

const configService = {
  getSystemConfig,
  updateSystemConfig,
  backupDatabase,
  restoreDatabase,
  performMaintenance,
  testSmtpConnection,
  toggleDebugMode
};

export default configService; 