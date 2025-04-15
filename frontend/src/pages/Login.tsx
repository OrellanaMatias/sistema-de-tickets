import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugMode, setDebugMode] = useState(localStorage.getItem('debug-mode') === 'true');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log('[DEBUG] Login - Iniciando sesión con email:', email);
      const user = await authService.login(email, password);
      console.log('[DEBUG] Login - Usuario autenticado:', user);
      console.log('[DEBUG] Login - Token:', authService.getToken());
      console.log('[DEBUG] Login - UserRole:', authService.getUserRole());
      
      // Asegurar que axios esté configurado con el token correcto
      authService.configureAxios();
      
      console.log('Usuario autenticado:', user);
      
      // Redireccionar según el rol del usuario
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'tecnico') {
        navigate('/tecnico/dashboard');
      } else {
        navigate('/usuario/dashboard');
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDebugMode = () => {
    const newState = !debugMode;
    setDebugMode(newState);
    authService.toggleDebugMode(newState);
  };

  const handleAdminLogin = () => {
    setEmail('admin@tickets.com');
    setPassword('admin123');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 w-full max-w-md bg-white rounded-lg shadow-lg">
        <h1 className="text-xl font-bold text-center text-gray-700 mb-6">
          Iniciar Sesión
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <button
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
            <button
              className="text-blue-500 hover:text-blue-700 text-sm"
              type="button"
              onClick={handleAdminLogin}
            >
              Admin Demo
            </button>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              ¿No tienes cuenta? <a href="/register" className="text-blue-500 hover:text-blue-700">Registrarse</a>
            </span>
            
            <div className="flex items-center">
              <label className="block text-gray-500 text-xs mr-2" htmlFor="debug-mode">
                Modo depuración
              </label>
              <div 
                className={`w-10 h-5 flex items-center ${debugMode ? 'bg-green-500' : 'bg-gray-300'} rounded-full p-1 cursor-pointer`