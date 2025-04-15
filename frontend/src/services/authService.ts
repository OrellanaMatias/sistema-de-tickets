import axios from 'axios';

// Usar una URL basada en la ubicación actual del navegador para mayor compatibilidad
const getBaseUrl = () => {
  const { protocol, hostname } = window.location;
  
  // Configuración para contenedor Docker y cualquier host
  const backendPort = '3000';
  const apiPath = '/api';
  
  // Usar el mismo hostname que el cliente está usando actualmente
  return `${protocol}//${hostname}:${backendPort}${apiPath}`;
};

// Verificar la variable de entorno para la URL de la API 
const envUrl = import.meta.env.VITE_API_URL;

// Determinar si estamos dentro del contenedor Docker o ejecutando en navegador
const isRunningInBrowser = typeof window !== 'undefined';

// Usar la variable de entorno si está definida, de lo contrario usar la función getBaseUrl
// Si la URL contiene 'backend', reemplazarla con el hostname del navegador cuando se ejecuta en navegador
let API_URL = envUrl || getBaseUrl();

// Cuando se ejecuta en navegador y la URL contiene 'backend'
if (isRunningInBrowser && API_URL.includes('backend')) {
  const { protocol, hostname } = window.location;
  API_URL = API_URL.replace('http://backend', `${protocol}//${hostname}`);
}

console.log('API URL configurada a:', API_URL);

interface User {
  id: number;
  displayName: string; // Nombre para mostrar
  email: string;    // Email para iniciar sesión
  role: 'admin' | 'tecnico' | 'usuario';
}

interface LoginResponse {
  user: User;
  token: string;
}

// Valores predeterminados para modo depuración
const DEBUG_ADMIN_USER: User = {
  id: 0,
  displayName: 'Admin (Temporal)',
  email: '',
  role: 'admin'
};

const DEBUG_TOKEN = 'debug-jwt-token-1234567890';

// Almacenamiento para el rol original del usuario
let originalUserRole: string | null = null;
let originalUser: User | null = null;
// Variable para saber si estamos en modo de acceso a configuración
let configAccessMode = false;

// Verificar si estamos en modo depuración
const isDebugMode = (): boolean => {
  const value = localStorage.getItem('debug-mode') === 'true';
  
  // Para debugging, imprimir el valor actual
  console.log('[authService] isDebugMode() llamado, valor actual:', value);
  
  return value;
};

// Verificar si el usuario actual puede acceder a la configuración
const canAccessConfig = (): boolean => {
  return configAccessMode || isDebugMode() || getUserRole() === 'admin';
};

// Activar/desactivar acceso temporal a la configuración
const toggleConfigAccess = (enabled: boolean): void => {
  configAccessMode = enabled;
  console.log(`[authService] Acceso a configuración ${enabled ? 'activado' : 'desactivado'}`);
};

// Activar/desactivar modo depuración
const toggleDebugMode = (enabled: boolean): void => {
  localStorage.setItem('debug-mode', enabled ? 'true' : 'false');
  console.log(`[authService] Modo debug ${enabled ? 'activado' : 'desactivado'}`);
  
  if (enabled) {
    // Guardar el usuario y rol original antes de activar el modo debug
    const user = getUser();
    if (user) {
      originalUser = { ...user };
      originalUserRole = user.role;
      console.log('[authService] Guardando rol original:', originalUserRole);
    }
    
    // Intentar obtener datos de admin desde la API
    (async () => {
      try {
        const adminUser = await axios.get<{ user: User }>(`${API_URL}/auth/debug-admin`);
        if (adminUser.data && adminUser.data.user) {
          console.log('[authService] Usando admin de la API para debug');
          
          // Configurar el usuario de depuración desde API
          setToken(DEBUG_TOKEN);
          setUser(adminUser.data.user);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', 'admin');
          
          // Disparar evento storage para actualizar la UI
          try {
            window.dispatchEvent(new Event('storage'));
          } catch (e) {
            console.error('Error al disparar evento storage:', e);
          }
          return;
        }
      } catch (error) {
        console.warn('[authService] No se pudo obtener admin desde API, usando valores temporales');
      }
      
      // Si no se pudo obtener de la API, usar valores temporales
      setToken(DEBUG_TOKEN);
      setUser(DEBUG_ADMIN_USER);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', 'admin');
      
      // Disparar evento storage para actualizar la UI
      try {
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error('Error al disparar evento storage:', e);
      }
    })();
  } else {
    // Restaurar el usuario y rol original
    if (originalUser) {
      console.log('[authService] Restaurando usuario original con rol:', originalUserRole);
      setUser(originalUser);
      
      if (originalUserRole) {
        localStorage.setItem('userRole', originalUserRole);
      }
      
      // Disparar evento storage para actualizar la UI
      try {
        window.dispatchEvent(new Event('storage'));
      } catch (e) {
        console.error('Error al disparar evento storage:', e);
      }
      
      // Limpiar variables originales
      originalUser = null;
      originalUserRole = null;
    }
  }
};

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
  console.log('[DEBUG] configureAxios - Token:', token);
  
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('[DEBUG] configureAxios - Authorization header configurado');
  } else {
    delete axios.defaults.headers.common['Authorization'];
    console.log('[DEBUG] configureAxios - Authorization header eliminado');
  }
  
  console.log('[DEBUG] configureAxios - Headers actuales:', axios.defaults.headers.common);
};

// Iniciar sesión
const login = async (email: string, password: string): Promise<User> => {
  try {
    // Si estamos en modo depuración, intentar usar credenciales desde la API
    if (isDebugMode()) {
      console.log('[authService] Modo debug: intentando obtener credenciales de prueba');
      
      try {
        const debugResponse = await axios.get<LoginResponse>(`${API_URL}/auth/debug-credentials`);
        
        if (debugResponse.data && debugResponse.data.user) {
          console.log('[authService] Usando credenciales de prueba de la API');
          
          // Guardar token y usuario en localStorage
          setToken(debugResponse.data.token || DEBUG_TOKEN);
          setUser(debugResponse.data.user);
          
          // Guardar estado de autenticación para compatibilidad con otros componentes
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userRole', debugResponse.data.user.role);
          
          // Disparar evento para notificar cambios en localStorage
          try {
            window.dispatchEvent(new Event('storage'));
          } catch (e) {
            console.error('Error al disparar evento storage:', e);
          }
          
          return debugResponse.data.user;
        }
      } catch (error) {
        console.warn('[authService] No se pudieron obtener credenciales de prueba, usando valores temporales');
        
        // Si la API de debug no está disponible, usar valores temporales básicos
        setToken(DEBUG_TOKEN);
        setUser(DEBUG_ADMIN_USER);
        
        // Guardar estado de autenticación para compatibilidad con otros componentes
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'admin');
        
        // Disparar evento para notificar cambios en localStorage
        try {
          window.dispatchEvent(new Event('storage'));
        } catch (e) {
          console.error('Error al disparar evento storage:', e);
        }
        
        return DEBUG_ADMIN_USER;
      }
    }
    
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
      
      // Si hay un error de conexión, activar automáticamente el modo debug
      if (error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
        console.log('[authService] Error de conexión detectado - ofreciendo modo debug');
        if (window.confirm('El servidor no está disponible. ¿Desea activar el modo de depuración para continuar?')) {
          toggleDebugMode(true);
          
          // Si las credenciales son de administrador, devolvemos el usuario de depuración
          if (email === 'admin@tickets.com' && password === 'admin123') {
            return DEBUG_ADMIN_USER;
          }
        }
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
    // Simulación en modo depuración
    if (isDebugMode()) {
      console.log('[authService] Modo debug: simulando registro exitoso');
      return {
        id: 999,
        displayName: username,
        email,
        role: 'usuario'
      };
    }
    
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
  // Si estamos en modo depuración, solo limpiamos la sesión pero mantenemos el modo debug activo
  const debugModeEnabled = isDebugMode();
  
  // Eliminar todos los elementos del localStorage relacionados con la autenticación
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
  localStorage.removeItem('isAuthenticated');
  
  // Mantener la configuración de debug-mode si estaba activa
  if (!debugModeEnabled) {
    localStorage.removeItem('debug-mode');
  }
  
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
  // En modo debug, siempre autenticado
  if (isDebugMode()) {
    return true;
  }
  
  const token = getToken();
  return !!token;
};

// Obtener el rol del usuario actual
const getUserRole = (): string | null => {
  // En modo debug, siempre admin
  if (isDebugMode()) {
    return 'admin';
  }
  
  const user = getUser();
  return user ? user.role : null;
};

// Obtener perfil del usuario
const getProfile = async (): Promise<User> => {
  try {
    // Si estamos en modo depuración, devolvemos el usuario de depuración
    if (isDebugMode()) {
      console.log('[authService] Modo debug: devolviendo perfil simulado');
      return DEBUG_ADMIN_USER;
    }
    
    configureAxios();
    const response = await axios.get<{ user: User }>(`${API_URL}/auth/profile`);
    return response.data.user;
  } catch (error) {
    // Si hay error de conexión y tenemos usuario en localStorage, lo usamos
    if (axios.isAxiosError(error) && error.message.includes('Network Error')) {
      const user = getUser();
      if (user) {
        console.log('[authService] Error de red: usando perfil almacenado');
        return user;
      }
      
      // Si no hay usuario en localStorage, activar modo debug
      console.log('[authService] Error de red: activando modo debug automáticamente');
      toggleDebugMode(true);
      return DEBUG_ADMIN_USER;
    }
    
    throw new Error(error instanceof Error ? error.message : 'Error al obtener perfil');
  }
};

// Función para obtener el usuario actual
const getCurrentUser = async () => {
  try {
    // Si estamos en modo depuración, devolvemos el usuario de depuración
    if (isDebugMode()) {
      console.log('[authService] Modo debug: devolviendo usuario simulado');
      return DEBUG_ADMIN_USER;
    }
    
    // Primero intentamos obtener del localStorage
    const storedUser = getUser();
    const storedToken = getToken();
    console.log('[DEBUG] getCurrentUser - Stored user:', storedUser);
    console.log('[DEBUG] getCurrentUser - Token:', storedToken);
    
    if (storedUser && storedToken) {
      // Asegurarnos de que axios esté configurado con el token correcto
      configureAxios();
      
      return storedUser;
    }
    
    // Si no tenemos un usuario almacenado pero hay un token, intentamos obtener el perfil
    if (storedToken) {
      try {
        console.log('[DEBUG] getCurrentUser - Intentando obtener perfil con token existente');
        // Hacer una solicitud para obtener el perfil del usuario
        const user = await getProfile();
        return user;
      } catch (profileError) {
        console.error('Error al obtener perfil del usuario:', profileError);
        
        // Si hay error de conexión, activar modo debug
        if (axios.isAxiosError(profileError) && profileError.message.includes('Network Error')) {
          console.log('[authService] Error de red: activando modo debug automáticamente');
          toggleDebugMode(true);
          return DEBUG_ADMIN_USER;
        }
      }
    }
    
    // Si no pudimos obtener el perfil pero tenemos un userRole, creamos un objeto usuario básico
    const userRole = localStorage.getItem('userRole');
    if (userRole && (userRole === 'admin' || userRole === 'tecnico' || userRole === 'usuario')) {
      const user: User = {
        id: 1,
        displayName: userRole === 'admin' ? 'Administrator' : (userRole === 'tecnico' ? 'Technician' : 'User'),
        email: userRole === 'admin' ? 'admin@tickets.com' : (userRole === 'tecnico' ? 'tecnico@tickets.com' : 'user@tickets.com'),
        role: userRole as 'admin' | 'tecnico' | 'usuario'
      };
      
      // Guardar este usuario básico en localStorage
      setUser(user);
      return user;
    }
    
    // Si llegamos aquí, no hay usuario autenticado
    return null;
  } catch (error) {
    console.error('Error en getCurrentUser:', error);
    return null;
  }
};

// Obtener técnicos (para administradores)
const getTechnicians = async (): Promise<{id: number, displayName: string}[]> => {
  try {
    const token = getToken();
    const response = await fetch(`${API_URL}/users/technicians`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al obtener técnicos');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en getTechnicians:', error);
    return [];
  }
};

const authService = {
  login,
  register,
  logout,
  isAuthenticated,
  getToken,
  setToken,
  getUser,
  setUser,
  configureAxios,
  getUserRole,
  getProfile,
  getCurrentUser,
  toggleDebugMode,
  isDebugMode,
  toggleConfigAccess,
  canAccessConfig,
  getTechnicians
};

export default authService; 