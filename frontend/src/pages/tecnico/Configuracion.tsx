import { useState, useEffect } from 'react';
import { TechnicianLayout } from '../../components/TechnicianLayout';
import authService from '../../services/authService';

// Extender la interfaz de usuario para el técnico
interface TechnicianData {
  username?: string;
  email?: string;
  specialization?: string;
  availability?: string;
  role?: string;
}

const ConfiguracionTecnico = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    specialization: '',
    availability: 'full'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('perfil');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = authService.getUser() as TechnicianData;
        if (user) {
          setUserData({
            ...userData,
            username: user.username || '',
            email: user.email || '',
            specialization: user.specialization || 'Hardware',
            availability: user.availability || 'full'
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos del técnico:', error);
        setMessage({ text: 'Error al cargar tus datos', type: 'error' });
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      // Aquí iría la llamada a la API para actualizar el perfil
      // await userService.updateProfile(userData);
      
      setMessage({ text: 'Perfil actualizado correctamente', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setMessage({ text: 'Error al actualizar perfil', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    // Validación básica
    if (userData.newPassword !== userData.confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
      setSaving(false);
      return;
    }

    try {
      // Aquí iría la llamada a la API para cambiar la contraseña
      // await userService.changePassword(userData.currentPassword, userData.newPassword);
      
      setUserData({
        ...userData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setMessage({ text: 'Contraseña actualizada correctamente', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setMessage({ text: 'Error al cambiar contraseña', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <TechnicianLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </TechnicianLayout>
    );
  }

  return (
    <TechnicianLayout>
      <div className="pb-6">
        <h1 className="text-2xl font-bold mb-6">Configuración de Técnico</h1>
        
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('perfil')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'perfil'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-user mr-2"></i>
                Perfil
              </button>
              <button
                onClick={() => setActiveTab('profesional')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'profesional'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-toolbox mr-2"></i>
                Información Profesional
              </button>
              <button
                onClick={() => setActiveTab('seguridad')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'seguridad'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-lock mr-2"></i>
                Seguridad
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {message.text && (
              <div className={`mb-4 p-3 rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {message.type === 'error' ? <i className="fas fa-exclamation-circle mr-2"></i> : <i className="fas fa-check-circle mr-2"></i>}
                {message.text}
              </div>
            )}
            
            {activeTab === 'perfil' && (
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                    Nombre <span className="font-normal text-gray-500 text-xs">(Nombre que se mostrará en la plataforma)</span>
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={userData.username}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Correo electrónico <span className="font-normal text-gray-500 text-xs">(Usado para iniciar sesión)</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    readOnly
                  />
                  <p className="text-xs mt-1 text-gray-500">El correo electrónico no se puede cambiar ya que se utiliza para iniciar sesión.</p>
                </div>
                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                      saving ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {saving ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Guardando...
                      </>
                    ) : (
                      'Guardar cambios'
                    )}
                  </button>
                </div>
              </form>
            )}
            
            {activeTab === 'profesional' && (
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="specialization">
                    Especialización
                  </label>
                  <select
                    id="specialization"
                    name="specialization"
                    value={userData.specialization}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Redes">Redes</option>
                    <option value="Servidores">Servidores</option>
                    <option value="Impresoras">Impresoras</option>
                    <option value="General">Soporte General</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="availability">
                    Disponibilidad
                  </label>
                  <select
                    id="availability"
                    name="availability"
                    value={userData.availability}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="full">Tiempo completo</option>
                    <option value="morning">Solo mañanas</option>
                    <option value="afternoon">Solo tardes</option>
                    <option value="limited">Disponibilidad limitada</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Áreas de experiencia
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        id="hardware"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="hardware" className="ml-2 block text-sm text-gray-900">
                        Reparación de Hardware
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="software"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="software" className="ml-2 block text-sm text-gray-900">
                        Soporte de Software
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="network"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="network" className="ml-2 block text-sm text-gray-900">
                        Configuración de Redes
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="printers"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="printers" className="ml-2 block text-sm text-gray-900">
                        Reparación de Impresoras
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                      saving ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {saving ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Guardando...
                      </>
                    ) : (
                      'Guardar información profesional'
                    )}
                  </button>
                </div>
              </form>
            )}
            
            {activeTab === 'seguridad' && (
              <form onSubmit={handleUpdatePassword}>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
                    Contraseña actual
                  </label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={userData.currentPassword}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                    Nueva contraseña
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={userData.newPassword}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                    Confirmar nueva contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={userData.confirmPassword}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                      saving ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {saving ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Actualizando...
                      </>
                    ) : (
                      'Cambiar contraseña'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </TechnicianLayout>
  );
};

export default ConfiguracionTecnico; 