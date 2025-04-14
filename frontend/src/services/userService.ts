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

export interface User {
  id?: number;
  displayName: string;
  email: string;
  password?: string;
  role: string;
  active: boolean;
  createdAt?: string;
}

// Obtener todos los usuarios
const getUsers = async (): Promise<User[]> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<User[]>(`${API_URL}/users/admin`, { headers });
    console.log('Respuesta de obtener usuarios:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    // En caso de error, devolver un array vacío
    return [];
  }
};

// Obtener un usuario por ID
const getUserById = async (id: number): Promise<User | null> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get<User>(`${API_URL}/users/admin/${id}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener usuario con ID ${id}:`, error);
    return null;
  }
};

// Crear un nuevo usuario
const createUser = async (userData: User): Promise<User | null> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.post<User>(`${API_URL}/users/admin`, userData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return null;
  }
};

// Actualizar un usuario existente
const updateUser = async (id: number, userData: Partial<User>): Promise<User | null> => {
  try {
    const headers = getAuthHeader();
    const response = await axios.put<User>(`${API_URL}/users/admin/${id}`, userData, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar usuario con ID ${id}:`, error);
    return null;
  }
};

// Eliminar un usuario
const deleteUser = async (id: number): Promise<boolean> => {
  try {
    const headers = getAuthHeader();
    await axios.delete(`${API_URL}/users/admin/${id}`, { headers });
    return true;
  } catch (error) {
    console.error(`Error al eliminar usuario con ID ${id}:`, error);
    return false;
  }
};

// Cambiar estado de un usuario (activar/desactivar)
const toggleUserStatus = async (id: number, active: boolean): Promise<boolean> => {
  try {
    const headers = getAuthHeader();
    await axios.put(
      `${API_URL}/users/admin/${id}`, 
      { active }, 
      { headers }
    );
    return true;
  } catch (error) {
    console.error(`Error al cambiar estado del usuario con ID ${id}:`, error);
    return false;
  }
};

// Exportar el servicio con las funciones reales que se conectan al backend
const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
};

export default userService; 