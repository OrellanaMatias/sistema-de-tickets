import { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

export interface PrivateRouteProps {
  children: ReactElement;
  requiredRole?: string;
}

const PrivateRoute = ({ children, requiredRole }: PrivateRouteProps) => {
  const location = useLocation();
  
  // Verificar autenticación usando el servicio
  const isAuthenticated = authService.isAuthenticated();
  const userRole = localStorage.getItem('userRole');
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Si requiere un rol específico y el usuario no lo tiene
  if (requiredRole && userRole !== requiredRole && requiredRole !== 'any') {
    // Redirigir según el rol del usuario
    if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'tecnico') {
      return <Navigate to="/tecnico" replace />;
    } else if (userRole === 'usuario') {
      return <Navigate to="/usuario" replace />;
    } else {
      // Si el rol no es conocido, enviar al login
      return <Navigate to="/login" replace />;
    }
  }
  
  // Si está autenticado y tiene el rol correcto, mostrar el componente hijo
  return children;
};

export default PrivateRoute; 