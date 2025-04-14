import React, { useState, useEffect } from "react";
import { AdminLayout } from "../../components/AdminLayout";

interface DatabaseConfig {
  host: string;
  port: string;
  username: string;
  database: string;
}

interface EmailConfig {
  smtpServer: string;
  port: string;
  senderEmail: string;
  useAuthentication: boolean;
}

interface SystemSettings {
  appName: string;
  logoUrl: string;
  maintenanceMode: boolean;
  allowUserRegistration: boolean;
  defaultUserRole: string;
  sessionTimeout: number;
}

const ConfiguracionGeneral: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"general" | "database" | "email">("general");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Configuración del sistema
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    appName: "Sistema de Tickets",
    logoUrl: "/logo.png",
    maintenanceMode: false,
    allowUserRegistration: true,
    defaultUserRole: "usuario",
    sessionTimeout: 60,
  });

  // Configuración de base de datos
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    host: "mysql",
    port: "3306",
    username: "root",
    database: "ticketing",
  });

  // Configuración de correo electrónico
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    smtpServer: "smtp.example.com",
    port: "587",
    senderEmail: "noreply@example.com",
    useAuthentication: true,
  });

  useEffect(() => {
    // Simulamos la carga de configuración desde el backend
    const loadConfig = async () => {
      try {
        // Aquí se haría la petición al backend
        // const response = await fetch('/api/settings');
        // const data = await response.json();
        // setSystemSettings(data.system);
        // setDbConfig(data.database);
        // setEmailConfig(data.email);
      } catch (error) {
        console.error("Error al cargar configuración:", error);
      }
    };

    loadConfig();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Aquí se enviaría la configuración al backend
      // await fetch('/api/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     system: systemSettings,
      //     database: dbConfig,
      //     email: emailConfig
      //   })
      // });

      // Simulamos la espera de respuesta del servidor
      setTimeout(() => {
        setSuccessMessage("Configuración guardada correctamente");
        setSaving(false);
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }, 1000);
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="w-full p-4">
        <h1 className="text-2xl font-bold mb-6">Configuración General</h1>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
            <i className="fas fa-check-circle mr-2"></i>
            {successMessage}
          </div>
        )}

        {/* Navegación por pestañas */}
        <div className="mb-6 border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button
                onClick={() => setActiveTab("general")}
                className={`inline-block py-2 px-4 text-sm font-medium ${
                  activeTab === "general"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <i className="fas fa-cog mr-2"></i>
                Configuración General
              </button>
            </li>
            <li className="mr-2">
              <button
                onClick={() => setActiveTab("database")}
                className={`inline-block py-2 px-4 text-sm font-medium ${
                  activeTab === "database"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <i className="fas fa-database mr-2"></i>
                Base de Datos
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("email")}
                className={`inline-block py-2 px-4 text-sm font-medium ${
                  activeTab === "email"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <i className="fas fa-envelope mr-2"></i>
                Correo Electrónico
              </button>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Configuración General */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Aplicación
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={systemSettings.appName}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        appName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL del Logo
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={systemSettings.logoUrl}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        logoUrl: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo de Sesión (minutos)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        sessionTimeout: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol Predeterminado para Nuevos Usuarios
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={systemSettings.defaultUserRole}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        defaultUserRole: e.target.value,
                      })
                    }
                  >
                    <option value="usuario">Usuario</option>
                    <option value="tecnico">Técnico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    className="mr-2 h-4 w-4 text-blue-600"
                    checked={systemSettings.maintenanceMode}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        maintenanceMode: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="maintenanceMode"
                    className="text-sm font-medium text-gray-700"
                  >
                    Activar Modo Mantenimiento
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowRegistration"
                    className="mr-2 h-4 w-4 text-blue-600"
                    checked={systemSettings.allowUserRegistration}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        allowUserRegistration: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="allowRegistration"
                    className="text-sm font-medium text-gray-700"
                  >
                    Permitir Registro de Usuarios
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Configuración de Base de Datos */}
          {activeTab === "database" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Host de Base de Datos
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={dbConfig.host}
                    onChange={(e) =>
                      setDbConfig({
                        ...dbConfig,
                        host: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puerto
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={dbConfig.port}
                    onChange={(e) =>
                      setDbConfig({
                        ...dbConfig,
                        port: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={dbConfig.username}
                    onChange={(e) =>
                      setDbConfig({
                        ...dbConfig,
                        username: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Base de Datos
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={dbConfig.database}
                  onChange={(e) =>
                    setDbConfig({
                      ...dbConfig,
                      database: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-start">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  Probar Conexión
                </button>
              </div>
            </div>
          )}

          {/* Configuración de Correo Electrónico */}
          {activeTab === "email" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servidor SMTP
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={emailConfig.smtpServer}
                    onChange={(e) =>
                      setEmailConfig({
                        ...emailConfig,
                        smtpServer: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puerto
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={emailConfig.port}
                    onChange={(e) =>
                      setEmailConfig({
                        ...emailConfig,
                        port: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo del Remitente
                </label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={emailConfig.senderEmail}
                  onChange={(e) =>
                    setEmailConfig({
                      ...emailConfig,
                      senderEmail: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useAuth"
                  className="mr-2 h-4 w-4 text-blue-600"
                  checked={emailConfig.useAuthentication}
                  onChange={(e) =>
                    setEmailConfig({
                      ...emailConfig,
                      useAuthentication: e.target.checked,
                    })
                  }
                />
                <label
                  htmlFor="useAuth"
                  className="text-sm font-medium text-gray-700"
                >
                  Usar Autenticación
                </label>
              </div>

              {emailConfig.useAuthentication && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de Usuario SMTP
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="username@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña SMTP
                    </label>
                    <input
                      type="password"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-start">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  Enviar Correo de Prueba
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 mr-3"
              onClick={() => {
                // Lógica para cancelar cambios
                // Podríamos recargar las configuraciones originales
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`px-6 py-2 ${
                saving
                  ? "bg-blue-400"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white rounded-md flex items-center`}
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Guardando...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ConfiguracionGeneral; 