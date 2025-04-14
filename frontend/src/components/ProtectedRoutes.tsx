import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import PrivateRoute from './PrivateRoute';

// Importar los componentes de dashboard
import AdminDashboard from '../pages/AdminDashboard';
import TecnicoDashboard from '../pages/TecnicoDashboard';
import UsuarioDashboard from '../pages/UsuarioDashboard';

const ProtectedRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas para administradores */}
      <Route 
        path="/admin/*" 
        element={
          <PrivateRoute requiredRole="admin">
            <AdminDashboard />
          </PrivateRoute>
        } 
      />

      {/* Rutas protegidas para técnicos */}
      <Route 
        path="/tecnico/*" 
        element={
          <PrivateRoute requiredRole="tecnico">
            <TecnicoDashboard />
          </PrivateRoute>
        } 
      />

      {/* Rutas protegidas para usuarios */}
      <Route 
        path="/usuario/*" 
        element={
          <PrivateRoute requiredRole="usuario">
            <UsuarioDashboard />
          </PrivateRoute>
        } 
      />

      {/* Ruta por defecto - redirigir a login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default ProtectedRoutes; 