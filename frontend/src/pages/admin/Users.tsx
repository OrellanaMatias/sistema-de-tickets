import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
import userService, { User } from '../../services/userService';
import authService from '../../services/authService';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string | JSX.Element;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  type: 'danger' | 'warning' | 'info';
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalProps | null>(null);
  const [newUser, setNewUser] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'usuario'
  });

  // Mostrar una notificación toast
  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  // Eliminar un toast específico
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Mostrar modal de confirmación - Versión simplificada
  const showConfirmation = (props: Omit<ConfirmModalProps, 'isOpen'>) => {
    setConfirmModal({ ...props, isOpen: true });
  };

  // Cerrar modal de confirmación - Versión simplificada
  const closeConfirmation = () => {
    setConfirmModal(null);
  };

  // Cargar usuarios desde la API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Obtener el usuario actual
        const userData = authService.getUser();
        setCurrentUser(userData);
        
        const usersData = await userService.getUsers();
        console.log("Datos de usuarios recibidos:", usersData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        showToast('Error al cargar la lista de usuarios', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filtrar usuarios por búsqueda
  const filteredUsers = users.filter(user => 
    (user.displayName?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (user.role?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser({
      ...newUser,
      [name]: value
    });
  };

  const handleUserCreate = async () => {
    // Validar el email antes de enviarlo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      showToast('Por favor, ingresa un email válido', 'error');
      return;
    }

    // Validar que todos los campos obligatorios estén llenos
    if (!newUser.displayName || !newUser.email || !newUser.password) {
      showToast('Por favor, completa todos los campos obligatorios', 'warning');
      return;
    }

    // Crear usuario en la API
    try {
      setIsLoading(true);
      console.log("Datos que se enviarán al servidor:", {
        ...newUser,
        active: true
      });
      
      const createdUser = await userService.createUser({
        ...newUser,
        active: true
      } as User);
      
      if (createdUser) {
        setUsers([...users, createdUser]);
        setShowModal(false);
        setNewUser({
          displayName: '',
          email: '',
          password: '',
          role: 'usuario'
        });
        showToast('Usuario creado exitosamente', 'success');
      } else {
        showToast('Error al crear usuario. Verifica que el email tenga un formato válido y no esté ya registrado.', 'error');
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      showToast('Error al crear usuario. Verifica que el email tenga un formato válido y no esté ya registrado.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (id: number) => {
    // Verificar si está intentando desactivarse a sí mismo
    if (currentUser && currentUser.id === id) {
      showToast('No puedes desactivar tu propia cuenta. Esto te impediría acceder al sistema.', 'warning');
      return;
    }
    
    // Buscar el usuario actual y su estado
    const user = users.find(u => u.id === id);
    if (!user) return;

    const displayName = user.displayName || user.email || 'Usuario';

    // Confirmar acción mediante el modal personalizado
    showConfirmation({
      title: `${user.active ? 'Desactivar' : 'Activar'} usuario`,
      message: (
        <>
          ¿Estás seguro de que deseas {user.active ? 'desactivar' : 'activar'} al usuario <span className="font-bold text-blue-600">{displayName}</span>?
        </>
      ),
      confirmText: user.active ? 'Desactivar' : 'Activar',
      cancelText: 'Cancelar',
      type: 'warning',
      onConfirm: async () => {
        try {
          closeConfirmation(); // Cerrar el modal inmediatamente
          setIsLoading(true);
          // Invertir el estado actual
          const success = await userService.toggleUserStatus(id, !user.active);
          
          if (success) {
            setUsers(users.map(u => 
              u.id === id ? { ...u, active: !u.active } : u
            ));
            showToast(`Usuario ${user.active ? 'desactivado' : 'activado'} correctamente`, 'success');
          } else {
            showToast(`Error al ${user.active ? 'desactivar' : 'activar'} usuario`, 'error');
          }
        } catch (error) {
          console.error('Error al cambiar estado del usuario:', error);
          showToast('Error al cambiar el estado del usuario', 'error');
        } finally {
          setIsLoading(false);
        }
      },
      onCancel: closeConfirmation
    });
  };

  const deleteUser = async (id: number) => {
    // Verificar si está intentando eliminarse a sí mismo
    if (currentUser && currentUser.id === id) {
      showToast('No puedes eliminar tu propia cuenta. Esto te impediría acceder al sistema.', 'warning');
      return;
    }
    
    // Buscar el usuario para mostrar sus datos en la confirmación
    const user = users.find(u => u.id === id);
    if (!user) return;

    const displayName = user.displayName || user.email || 'Usuario';

    // Mostrar el modal de confirmación personalizado
    showConfirmation({
      title: 'Eliminar usuario',
      message: (
        <>
          ¿Estás seguro de que deseas eliminar al usuario <span className="font-bold text-red-600">{displayName}</span>? Esta acción no se puede deshacer.
        </>
      ),
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger',
      onConfirm: async () => {
        try {
          closeConfirmation(); // Cerrar el modal inmediatamente
          setIsLoading(true);
          const result = await userService.deleteUser(id);
          
          if (result.success) {
            setUsers(users.filter(u => u.id !== id));
            showToast('Usuario eliminado correctamente', 'success');
          } else {
            // Mostrar el mensaje de error específico devuelto por el servidor
            showToast(result.message || 'Error al eliminar usuario', 'error');
          }
        } catch (error) {
          console.error('Error al eliminar usuario:', error);
          showToast('Error al eliminar usuario', 'error');
        } finally {
          setIsLoading(false);
        }
      },
      onCancel: closeConfirmation
    });
  };

  // Columnas para la tabla responsiva
  const userColumns = [
    {
      header: 'Usuario',
      accessor: 'displayName',
      cell: (user: User) => (
        <div className="font-medium text-gray-900">{user.displayName || 'Sin nombre'}</div>
      )
    },
    {
      header: 'Email',
      accessor: 'email',
      cell: (user: User) => user.email
    },
    {
      header: 'Rol',
      accessor: 'role',
      cell: (user: User) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
            user.role === 'tecnico' ? 'bg-blue-100 text-blue-800' : 
            'bg-green-100 text-green-800'}`}>
          {user.role}
        </span>
      )
    },
    {
      header: 'Estado',
      accessor: 'active',
      cell: (user: User) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {user.active ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      header: 'Acciones',
      accessor: 'actions',
      cell: (user: User) => (
        <div className="flex flex-wrap gap-2">
          {/* Deshabilitar el botón de toggle si es el usuario actual */}
          <button 
            onClick={() => toggleUserStatus(user.id!)}
            className={`w-9 h-9 rounded flex items-center justify-center relative group ${
              user.active 
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } ${currentUser && currentUser.id === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={
              currentUser && currentUser.id === user.id 
                ? "No puedes cambiar tu propio estado" 
                : user.active ? "Desactivar usuario" : "Activar usuario"
            }
            disabled={currentUser && currentUser.id === user.id}
          >
            <i className={`fas ${user.active ? 'fa-ban' : 'fa-check'}`}></i>
            <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {currentUser && currentUser.id === user.id 
                ? "No puedes cambiar tu propio estado" 
                : user.active ? 'Desactivar usuario' : 'Activar usuario'}
            </span>
          </button>
          
          {/* Mostrar botón de eliminar solo si no es el usuario actual */}
          {!(currentUser && currentUser.id === user.id) && (
            <button 
              onClick={() => deleteUser(user.id!)}
              className="w-9 h-9 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center justify-center relative group"
              title="Eliminar usuario"
            >
              <i className="fas fa-trash"></i>
              <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Eliminar usuario
              </span>
            </button>
          )}
        </div>
      )
    }
  ];

  // Componente Toast para mostrar notificaciones
  const Toast = ({ toast }: { toast: Toast }) => {
    const { id, message, type } = toast;
    
    const bgColor = 
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' :
      type === 'warning' ? 'bg-amber-500' : 'bg-blue-500';
      
    const icon = 
      type === 'success' ? 'fa-check-circle' : 
      type === 'error' ? 'fa-exclamation-circle' :
      type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    return (
      <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between`}>
        <div className="flex items-center">
          <i className={`fas ${icon} mr-3`}></i>
          <span>{message}</span>
        </div>
        <button 
          onClick={() => removeToast(id)} 
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    );
  };

  // Componente de Modal de Confirmación - Versión simplificada
  const ConfirmModal = () => {
    if (!confirmModal) return null;
    
    const { title, message, confirmText, cancelText, onConfirm, onCancel, type } = confirmModal;
    
    const confirmButtonColor = 
      type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 
      type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' : 
      'bg-blue-600 hover:bg-blue-700';

    const iconColor = 
      type === 'danger' ? 'text-red-500' : 
      type === 'warning' ? 'text-amber-500' : 
      'text-blue-500';

    const icon = 
      type === 'danger' ? 'fa-exclamation-circle' : 
      type === 'warning' ? 'fa-exclamation-triangle' : 
      'fa-info-circle';
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center mb-4">
            <div className={`${iconColor} text-2xl mr-3`}>
              <i className={`fas ${icon}`}></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          </div>
          <div className="mb-6">
            {typeof message === 'string' ? (
              <p className="text-gray-700">{message}</p>
            ) : (
              message
            )}
          </div>
          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${confirmButtonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Contenedor de Toasts */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-auto max-w-md">
          {toasts.map(toast => (
            <div key={toast.id} className="animate-fade-in-down">
              <Toast toast={toast} />
            </div>
          ))}
        </div>

        {/* Modal de confirmación */}
        {confirmModal && <ConfirmModal />}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center"
          >
            <i className="fas fa-user-plus mr-2"></i>
            Nuevo Usuario
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="Buscar por nombre, email o rol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">Cargando usuarios...</p>
          </div>
        ) : (
          <>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <i className="fas fa-users text-gray-400 text-4xl mb-3"></i>
                <p className="text-gray-500">No se encontraron usuarios</p>
              </div>
            ) : (
              <ResponsiveTable 
                data={filteredUsers} 
                columns={userColumns} 
                keyField="id"
              />
            )}
          </>
        )}

        {/* Modal para crear usuario */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl p-5 w-full max-w-md mx-auto">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-semibold text-gray-900">Crear Nuevo Usuario</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={newUser.displayName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={newUser.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    id="role"
                    name="role"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={newUser.role}
                    onChange={handleInputChange}
                  >
                    <option value="usuario">Usuario</option>
                    <option value="tecnico">Técnico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="flex justify-end pt-5 gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={handleUserCreate}
                  >
                    Crear Usuario
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UsersPage; 