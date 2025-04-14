import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { 
  FaSpinner, FaCog, FaDatabase, FaEnvelope, 
  FaServer, FaTools, FaSave, FaSync, FaExclamationTriangle
} from 'react-icons/fa';
import { AdminLayout } from '../../components/AdminLayout';
import configService, { SystemConfig } from '../../services/configService';
import authService from '../../services/authService';

// Componentes para los íconos
const SpinnerIcon = () => <FaSpinner />;
const CogIcon = () => <FaCog />;
const DatabaseIcon = () => <FaDatabase />;
const EnvelopeIcon = () => <FaEnvelope />;
const ServerIcon = () => <FaServer />;
const ToolsIcon = () => <FaTools />;
const SaveIcon = () => <FaSave />;
const SyncIcon = () => <FaSync />;
const WarningIcon = () => <FaExclamationTriangle />;

const Config = () => {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [user, setUser] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState<string[]>([]);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setLoadingDetails([]);
      
      setLoadingDetails(prev => [...prev, "Verificando autenticación..."]);
      const userData = await authService.getProfile();
      setUser(userData);

      if (userData?.role !== 'admin') {
        setMessage({ text: 'No tienes permisos para acceder a esta página', type: 'error' });
        setIsLoading(false);
        return;
      }

      setLoadingDetails(prev => [...prev, "Cargando configuración del sistema..."]);

      // Aumentar el número de intentos
      setLoadAttempts(prev => prev + 1);
      
      const configData = await configService.getSystemConfig();
      setLoadingDetails(prev => [...prev, "Configuración cargada correctamente"]);
      setConfig(configData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoadingDetails(prev => [...prev, `Error al cargar la configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`]);
      setMessage({ text: 'Error al cargar la configuración del sistema. Revisa la consola para más detalles.', type: 'error' });
      setIsLoading(false);
    }
  };

  useEffect(() => {
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

  // Si está cargando, mostrar indicador con detalles
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-full">
          <div className="animate-spin text-blue-500 text-4xl mb-4">
            <SpinnerIcon />
          </div>
          <p className="text-lg font-medium mb-4">Cargando configuración del sistema...</p>
          
          {/* Mostrar detalles del proceso de carga */}
          <div className="bg-gray-100 p-4 rounded-lg w-full max-w-md">
            {loadingDetails.map((detail, index) => (
              <div key={index} className="text-sm py-1">
                <span className="text-green-600 mr-2">✓</span>
                {detail}
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Si no hay configuración y ya intentamos cargarla, mostrar un formulario alternativo
  if (!config && loadAttempts > 0) {
    return (
      <AdminLayout>
        <div className="p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center mb-2">
              <div className="text-red-500 mr-2">
                <WarningIcon />
              </div>
              <p className="font-bold">Error al cargar la configuración</p>
            </div>
            <p>No se pudo cargar la configuración del sistema. Esto puede deberse a un problema con el servidor backend.</p>
          </div>
          
          <div className="flex mt-4">
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            >
              <div className="mr-2">
                <SyncIcon />
              </div> 
              Intentar nuevamente
            </button>
          </div>
          
          <div className="mt-8 bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Información de diagnóstico</h3>
            {loadingDetails.map((detail, index) => (
              <div key={index} className="text-sm py-1">
                {detail}
              </div>
            ))}
          </div>
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
            <div className="inline mr-2">
              <CogIcon />
            </div> 
            General
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'database' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('database')}
          >
            <div className="inline mr-2">
              <DatabaseIcon />
            </div> 
            Base de Datos
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'email' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('email')}
          >
            <div className="inline mr-2">
              <EnvelopeIcon />
            </div> 
            Email
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'advanced' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('advanced')}
          >
            <div className="inline mr-2">
              <ServerIcon />
            </div> 
            Avanzado
          </button>
        </div>
        
        <form className="space-y-4">
          {config && activeTab === 'general' && (
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
          
          {config && activeTab === 'database' && (
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Host</label>
                <input
                  type="text"
                  name="dbHost"
                  value={config.dbHost}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Puerto</label>
                <input
                  type="text"
                  name="dbPort"
                  value={config.dbPort}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Nombre de la base de datos</label>
                <input
                  type="text"
                  name="dbName"
                  value={config.dbName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="mt-6 space-y-4">
                <h3 className="font-medium text-lg">Operaciones de base de datos</h3>
                
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleBackupDatabase}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Realizar backup
                  </button>
                  
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".sql"
                      className="hidden"
                      id="backup-file"
                    />
                    <label
                      htmlFor="backup-file"
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer"
                    >
                      Seleccionar archivo
                    </label>
                    
                    <button
                      type="button"
                      onClick={handleRestoreDatabase}
                      className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 ml-2"
                    >
                      Restaurar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {config && activeTab === 'email' && (
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
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Probar conexión
                </button>
              </div>
            </div>
          )}
          
          {config && activeTab === 'advanced' && (
            <div>
              <h3 className="font-medium text-lg mb-4">Mantenimiento del sistema</h3>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleMaintenance('clearCache')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full text-left"
                >
                  <div className="inline mr-2">
                    <ToolsIcon />
                  </div> 
                  Limpiar caché del sistema
                </button>
                
                <button
                  type="button"
                  onClick={() => handleMaintenance('optimizeTables')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full text-left"
                >
                  <div className="inline mr-2">
                    <ToolsIcon />
                  </div> 
                  Optimizar tablas de la base de datos
                </button>
                
                <button
                  type="button"
                  onClick={() => handleMaintenance('clearLogs')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full text-left"
                >
                  <div className="inline mr-2">
                    <ToolsIcon />
                  </div> 
                  Eliminar logs antiguos
                </button>
              </div>
              
              <div className="mt-8">
                <div className="bg-yellow-100 p-4 rounded-lg text-yellow-800 mb-4">
                  <p className="font-medium">⚠️ Advertencia</p>
                  <p className="text-sm">Estas operaciones son potencialmente peligrosas y pueden afectar al funcionamiento del sistema. Úsalas con precaución.</p>
                </div>
              </div>
            </div>
          )}
          
          {config && (
            <div className="mt-6 border-t pt-4">
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveConfig}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin mr-2">
                      <SpinnerIcon />
                    </div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <div className="mr-2">
                      <SaveIcon />
                    </div>
                    Guardar configuración
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </AdminLayout>
  );
};

export default Config; 