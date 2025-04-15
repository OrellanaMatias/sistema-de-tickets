import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import userService, { User } from '../../services/userService';
import authService from '../../services/authService';

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    displayName: '',
    email: '',
    password: '',
    role: 'usuario',
    active: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = authService.getUser();
        setCurrentUser(userData);
        
        // Fetch users from the API
        const usersData = await userService.getUsers();
        console.log("Datos de usuarios recibidos:", usersData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user => 
    (user.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.role?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        active: user.active
      });
    } else {
      setEditingUser(null);
      setFormData({
        displayName: '',
        email: '',
        password: '',
        role: 'usuario',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar el email antes de enviarlo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email || '')) {
      alert('Por favor, ingresa un email válido');
      return;
    }

    // Validar que todos los campos obligatorios estén llenos
    if (!formData.displayName || !formData.email || (!editingUser && !formData.password)) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      if (editingUser) {
        // Update existing user
        const updatedUser = await userService.updateUser(editingUser.id!, formData);
        if (updatedUser) {
          setUsers(users.map(user => user.id === editingUser.id ? { ...user, ...formData } : user));
          handleCloseModal();
          alert("Usuario actualizado exitosamente");
        } else {
          alert("Error al actualizar usuario. Por favor, inténtalo de nuevo.");
        }
      } else {
        // Create new user
        console.log("Intentando crear usuario con datos:", formData);
        
        // Asegúrate de que formData tenga todas las propiedades requeridas
        const userData: User = {
          ...formData,
          role: formData.role || 'usuario',
          active: formData.active !== undefined ? formData.active : true,
          displayName: formData.displayName || '',
          email: formData.email || '',
          password: formData.password || ''
        } as User;
        
        console.log("Datos finales que se enviarán al servidor:", userData);
        
        const newUser = await userService.createUser(userData);
        console.log("Respuesta del servidor al crear usuario:", newUser);
        
        if (newUser) {
          // Actualizar la lista de usuarios solo si se recibió una respuesta válida
          setUsers(prevUsers => [...prevUsers, newUser]);
          // Cerrar el modal solo si la operación fue exitosa
          handleCloseModal();
          alert("Usuario creado exitosamente");
        } else {
          console.error("Error: No se recibió respuesta válida del servidor al crear usuario");
          alert("Error al crear usuario. Verifica que el email tenga un formato válido y no esté ya registrado.");
        }
      }
    } catch (error) {
      console.error('Error detallado al guardar usuario:', error);
      alert("Error al guardar usuario. Verifica que el email tenga un formato válido y no esté ya registrado.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('¿Estás seguro que deseas eliminar este usuario?')) {
      setLoading(true);
      const success = await userService.deleteUser(id);
      if (success) {
        setUsers(users.filter(user => user.id !== id));
      }
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    setLoading(true);
    const success = await userService.toggleUserStatus(id, !currentStatus);
    if (success) {
      setUsers(users.map(user => 
        user.id === id ? { ...user, active: !currentStatus } : user
      ));
    }
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> Nuevo Usuario
          </button>
        </div>

        {/* Search and filter */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="Buscar por nombre, email o rol..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>

        {loading && <p className="text-center py-4">Cargando usuarios...</p>}

        {!loading && (
          <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="py-3 px-6">Usuario</th>
                  <th scope="col" className="py-3 px-6">Email</th>
                  <th scope="col" className="py-3 px-6">Rol</th>
                  <th scope="col" className="py-3 px-6">Estado</th>
                  <th scope="col" className="py-3 px-6">Creado</th>
                  <th scope="col" className="py-3 px-6">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">{user.displayName}</td>
                    <td className="py-4 px-6">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'tecnico' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="font-medium text-blue-600 hover:text-blue-900"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(user.id!, user.active)}
                          className={`font-medium ${user.active ? 'text-amber-600 hover:text-amber-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          <i className={`fas ${user.active ? 'fa-ban' : 'fa-check'}`}></i>
                        </button>
                        {currentUser?.id !== user.id && (
                          <button 
                            onClick={() => handleDeleteUser(user.id!)}
                            className="font-medium text-red-600 hover:text-red-900"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-900"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Nombre de usuario</label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  />
                </div>
                
                {!editingUser && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-900">Contraseña</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      required={!editingUser}
                    />
                  </div>
                )}
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900">Rol</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  >
                    <option value="usuario">Usuario</option>
                    <option value="tecnico">Técnico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-900">Usuario activo</label>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    {editingUser ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UsersManagement;