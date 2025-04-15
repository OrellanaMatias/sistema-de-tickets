import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import ResponsiveTable from '../../components/ResponsiveTable';
import userService, { User } from '../../services/userService';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'usuario'
  });

  // Cargar usuarios desde la API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const usersData = await userService.getUsers();
        console.log("Datos de usuarios recibidos:", usersData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
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
      alert('Por favor, ingresa un email válido');
      return;
    }

    // Validar que todos los campos obligatorios estén llenos
    if (!newUser.displayName || !newUser.email || !newUser.password) {
      alert('Por favor, completa todos los campos obligatorios');
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
        alert('Usuario creado exitosamente');
      } else {
        alert('Error al crear usuario. Verifica que el email tenga un formato válido y no esté ya registrado.');
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      alert('Error al crear usuario. Verifica que el email tenga un formato válido y no esté ya registrado.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (id: number) => {
    // Buscar el usuario actual y su estado
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    try {
      setIsLoading(true);
      // Invertir el estado actual
      const success = await userService.toggleUserStatus(id, !user.active);
      
      if (success) {
        setUsers(users.map(u => 
          u.id === id ? { ...u, active: !u.active } : u
        ));
      }
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        setIsLoading(true);
        const success = await userService.deleteUser(id);
        
        if (success) {
          setUsers(users.filter(u => u.id !== id));
        }
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      } finally {
        setIsLoading(false);
      }
    }
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
          <button 
            onClick={() => toggleUserStatus(user.id!)}
            className={`w-9 h-9 rounded flex items-center justify-center relative group ${user.active 
              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
              : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
            title={user.active ? "Desactivar usuario" : "Activar usuario"}
          >
            <i className={`fas ${user.active ? 'fa-ban' : 'fa-check'}`}></i>
            <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {user.active ? 'Desactivar usuario' : 'Activar usuario'}
            </span>
          </button>
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
        </div>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
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