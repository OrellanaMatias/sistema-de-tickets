import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { 
  FaSpinner, FaCog, FaDatabase, FaEnvelope, 
  FaServer, FaTools, FaSave 
} from 'react-icons/fa';
import { AdminLayout } from '../../components/AdminLayout';
import configService, { SystemConfig } from '../../services/configService';
import authService from '../../services/authService';

const Config = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [user, setUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const userData = await authService.getProfile();
        setUser(userData);

        if (userData?.role !== 'admin') {
          setMessage({ text: 'No tienes permisos para acceder a esta página', type: 'error' });
          return;
        }

        const configData = await configService.getSystemConfig();
        setConfig(configData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setMessage({ text: 'Error al cargar la configuración del sistema', type: 'error' });
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
    });
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      const result = await configService.updateSystemConfig(config);
      if (result) {
        setMessage({ text: 'Configuración guardada correctamente', type: 'success' });
      } else {
        setMessage({ text: 'Error al guardar la configuración', type: 'error' });
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      setMessage({ text: 'Error al guardar la configuración', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackupDatabase = async () => {
    setMessage({ text: '', type: '' });
    
    try {
      const result = await configService.backupDatabase();
      if (result) {
        setMessage({ text: 'Backup de base de datos realizado correctamente', type: 'success' });
      } else {
        setMessage({ text: 'Error al realizar el backup de la base de datos', type: 'error' });
      }
    } catch (error) {
      console.error('Error al hacer backup:', error);
      setMessage({ text: 'Error al realizar el backup de la base de datos', type: 'error' });
    }
  };

  const handleRestoreDatabase = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setMessage({ text: 'Selecciona un archivo de backup válido', type: 'error' });
      return;
    }
    
    setMessage({ text: '', type: '' });
    
    try {
      const result = await configService.restoreDatabase(fileInputRef.current.files[0]);
      if (result) {
        setMessage({ text: 'Base de datos restaurada correctamente', type: 'success' });
      } else {
        setMessage({ text: 'Error al restaurar la base de datos', type: 'error' });
      }
    } catch (error) {
      console.error('Error al restaurar:', error);
      setMessage({ text: 'Error al restaurar la base de datos', type: 'error' });
    }
  };

  const handleTestSmtp = async () => {
    if (!config) return;
    
    setMessage({ text: '', type: '' });
    
    try {
      const result = await configService.testSmtpConnection({
        smtpServer: config.smtpServer,
        smtpPort: config.smtpPort,
        smtpUser: config.smtpUser,
        smtpPass: config.smtpPass
      });
      
      if (result) {
        setMessage({ text: 'Conexión SMTP probada correctamente', type: 'success' });
      } else {
        setMessage({ text: 'Error al probar la conexión SMTP', type: 'error' });
      }
    } catch (error) {
      console.error('Error al probar SMTP:', error);
      setMessage({ text: 'Error al probar la conexión SMTP', type: 'error' });
    }
  };

  const handleMaintenance = async (task: 'clearCache' | 'optimizeTables' | 'clearLogs') => {
    setMessage({ text: '', type: '' });
    
    try {
      const result = await configService.performMaintenance(task);
      if (result) {
        setMessage({ text: 'Tarea de mantenimiento completada correctamente', type: 'success' });
      } else {
        setMessage({ text: 'Error al realizar la tarea de mantenimiento', type: 'error' });
      }
    } catch (error) {
      console.error('Error en mantenimiento:', error);
      setMessage({ text: 'Error al realizar la tarea de mantenimiento', type: 'error' });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <FaSpinner className="animate-spin text-blue-500 text-3xl" />
        </div>
      </AdminLayout>
    );
  }

  if (!config) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          No se pudo cargar la configuración del sistema.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Configuración del Sistema</h1>
        
        {message.text && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
        
        <div className="flex border-b mb-4">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'general' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('general')}
          >
            <FaCog className="inline mr-2" /> General
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'database' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('database')}
          >
            <FaDatabase className="inline mr-2" /> Base de Datos
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'email' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('email')}
          >
            <FaEnvelope className="inline mr-2" /> Email
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'advanced' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('advanced')}
          >
            <FaServer className="inline mr-2" /> Avanzado
          </button>
        </div>
        
        <form className="space-y-4">
          {activeTab === 'general' && (
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Nombre de la Aplicación</label>
                <input
                  type="text"
                  name="appName"
                  value={config.appName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Tamaño máximo de archivos (MB)</label>
                <input
                  type="text"
                  name="maxUploadSize"
                  value={config.maxUploadSize}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Días para auto-cierre de tickets</label>
                <input
                  type="text"
                  name="ticketAutoClose"
                  value={config.ticketAutoClose}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={config.maintenanceMode}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700 font-medium">Modo mantenimiento</span>
                </label>
              </div>
            </div>
          )}
          
          {activeTab === 'database' && (
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Host de la Base de Datos</label>
                <input
                  type="text"
                  name="dbHost"
                  value={config.dbHost}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Puerto de la Base de Datos</label>
                <input
                  type="text"
                  name="dbPort"
                  value={config.dbPort}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Nombre de la Base de Datos</label>
                <input
                  type="text"
                  name="dbName"
                  value={config.dbName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Backup de Base de Datos</h3>
                  <button
                    type="button"
                    onClick={handleBackupDatabase}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    <FaDatabase className="inline mr-2" /> Crear Backup
                  </button>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Restaurar Base de Datos</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={handleRestoreDatabase}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
                    >
                      Restaurar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'email' && (
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Servidor SMTP</label>
                <input
                  type="text"
                  name="smtpServer"
                  value={config.smtpServer}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Puerto SMTP</label>
                <input
                  type="text"
                  name="smtpPort"
                  value={config.smtpPort}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Usuario SMTP</label>
                <input
                  type="text"
                  name="smtpUser"
                  value={config.smtpUser}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Contraseña SMTP</label>
                <input
                  type="password"
                  name="smtpPass"
                  value={config.smtpPass || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="******"
                />
              </div>
              
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleTestSmtp}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  <FaEnvelope className="inline mr-2" /> Probar Conexión SMTP
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'advanced' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Tareas de Mantenimiento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => handleMaintenance('clearCache')}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
                >
                  <FaTools className="inline mr-2" /> Limpiar Caché
                </button>
                
                <button
                  type="button"
                  onClick={() => handleMaintenance('optimizeTables')}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
                >
                  <FaTools className="inline mr-2" /> Optimizar Tablas
                </button>
                
                <button
                  type="button"
                  onClick={() => handleMaintenance('clearLogs')}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
                >
                  <FaTools className="inline mr-2" /> Limpiar Logs
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-6 border-t pt-4">
            <button
              type="button"
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded flex items-center"
            >
              {isSaving ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Guardando...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> Guardar Configuración
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default Config; 