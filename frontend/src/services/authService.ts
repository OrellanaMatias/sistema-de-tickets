import axios from 'axios';

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

console.log('API URL configurada a:', API_URL);

interface User {
  id: number;
  username: string; // Nombre para mostrar
  email: string;    // Email para iniciar sesión
  role: 'admin' | 'tecnico' | 'usuario';
}

interface LoginResponse {
  user: User;
  token: string;
}

// Guardar token en localStorage
const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Obtener token de localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Guardar usuario en localStorage
const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Obtener usuario de localStorage
const getUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Configurar axios para incluir token en todas las peticiones
const configureAxios = (): void => {
  const token = getToken();
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Iniciar sesión
const login = async (email: string, password: string): Promise<User> => {
  try {
    console.log('Intentando iniciar sesión con:', email);
    console.log('URL de la API:', API_URL);
    console.log('URL completa:', `${API_URL}/auth/login`);
    
    // Verificar datos de la solicitud
    console.log('Datos de la solicitud:', { email, password: password ? '****' : 'vacío' });
    
    // Hacer la solicitud con un timeout más largo
    const response = await axios.post<LoginResponse>(
      `${API_URL}/auth/login`, 
      { email, password },
      { 
        timeout: 10000, // 10 segundos
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('Respuesta recibida del servidor');
    console.log('Código de estado:', response.status);
    console.log('Respuesta de login:', response.data);
    
    if (!response.data || !response.data.token) {
      console.error('Respuesta incompleta, falta token');
      throw new Error('La respuesta del servidor no es válida');
    }
    
    // Guardar token y usuario en localStorage
    setToken(response.data.token);
    setUser(response.data.user);
    
    // Guardar estado de autenticación para compatibilidad con otros componentes
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', response.data.user.role);
    
    // Configurar axios para incluir token
    configureAxios();
    
    // Disparar evento para notificar cambios en localStorage (útil para App.tsx)
    try {
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Error al disparar evento storage:', e);
    }
    
    return response.data.user;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Detalles del error axios:');
      console.error('- Código:', error.code);
      console.error('- Mensaje:', error.message);
      
      if (error.response) {
        console.error('- Estado:', error.response.status);
        console.error('- Datos:', error.response.data);
      } else if (error.request) {
        console.error('- No se recibió respuesta del servidor');
        console.error('- Request:', error.request);
      }
    }
    
    // Mensaje de error más específico
    let errorMessage = 'Error al iniciar sesión';
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Tiempo de espera agotado. El servidor no respondió a tiempo.';
      } else if (!error.response) {
        errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión a internet.';
      } else if (error.response.status === 401) {
        errorMessage = 'Credenciales inválidas. Verifique su email y contraseña.';
      } else if (error.response.status >= 500) {
        errorMessage = 'Error en el servidor. Intente nuevamente más tarde.';
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }
    
    throw new Error(errorMessage);
  }
};

// Registrar usuario
const register = async (username: string, email: string, password: string): Promise<User> => {
  try {
    const response = await axios.post<{ user: User }>(`${API_URL}/auth/register`, {
      username,
      email,
      password
    });
    
    return response.data.user;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error al registrar usuario');
  }
};

// Cerrar sesión
const logout = (): void => {
  // Eliminar todos los elementos del localStorage relacionados con la autenticación
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
  localStorage.removeItem('isAuthenticated');
  
  // También podemos limpiar todo el localStorage si es necesario
  // localStorage.clear();
  
  // Eliminar la cabecera de autorización en axios
  delete axios.defaults.headers.common['Authorization'];
  
  // Disparar evento para notificar cambios en localStorage
  try {
    // Disparar evento de storage para App.tsx
    window.dispatchEvent(new Event('storage'));
    
    // Disparar un evento personalizado para el logout
    const logoutEvent = new CustomEvent('app:logout');
    window.dispatchEvent(logoutEvent);
  } catch (e) {
    console.error('Error al disparar eventos:', e);
    
    // Forzar recarga de la página como último recurso
    window.location.href = '/login';
  }
};

// Verificar si el usuario está autenticado
const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

// Obtener el rol del usuario actual
const getUserRole = (): string | null => {
  const user = getUser();
  return user ? user.role : null;
};

// Obtener perfil del usuario
const getProfile = async (): Promise<User> => {
  try {
    configureAxios();
    const response = await axios.get<{ user: User }>(`${API_URL}/auth/profile`);
    return response.data.user;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error al obtener perfil');
  }
};

// Función para obtener el usuario actual
const getCurrentUser = async () => {
  try {
    // Primero intentamos obtener del localStorage
    const storedUser = getUser();
    if (storedUser) {
      return storedUser;
    }
    
    // Si no hay usuario en localStorage pero hay token, intentamos obtener el perfil
    const token = getToken();
    if (token) {
      try {
        // Intentar obtener el perfil del usuario desde el servidor
        const profile = await getProfile();
        if (profile) {
          // Actualizar la información del usuario en localStorage
          setUser(profile);
          return profile;
        }
      } catch (profileError) {
        console.error('Error obteniendo perfil del usuario:', profileError);
      }
      
      // Si no pudimos obtener el perfil pero tenemos un userRole, creamos un objeto usuario básico
      const userRole = localStorage.getItem('userRole');
      if (userRole && (userRole === 'admin' || userRole === 'tecnico' || userRole === 'usuario')) {
        const user: User = {
          id: 1,
          username: userRole === 'admin' ? 'Administrator' : (userRole === 'tecnico' ? 'Technician' : 'User'),
          email: userRole === 'admin' ? 'admin@tickets.com' : (userRole === 'tecnico' ? 'tecnico@tickets.com' : 'user@tickets.com'),
          role: userRole as 'admin' | 'tecnico' | 'usuario'
        };
        
        // Guardar este usuario básico en localStorage
        setUser(user);
        return user;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Inicializar axios con token si existe
configureAxios();

const authService = {
  login,
  register,
  logout,
  getToken,
  getUser,
  isAuthenticated,
  getUserRole,
  getProfile,
  getCurrentUser
};

export default authService; 