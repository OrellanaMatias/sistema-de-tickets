import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { UserLayout } from '../../components/UserLayout';
import { TechnicianLayout } from '../../components/TechnicianLayout';
import authService from '../../services/authService';
import ticketService from '../../services/ticketService';

type Priority = 'baja' | 'media' | 'alta';
type Category = 'hardware' | 'software' | 'red' | 'impresoras' | 'otro';

const CreateTicket: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('media');
  const [category, setCategory] = useState<Category>('hardware');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    title: '',
    description: ''
  });
  const [userRole, setUserRole] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        navigate('/login');
        return;
      }
      
      const role = authService.getUserRole();
      if (role) {
        setUserRole(role);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    let hasErrors = false;
    const newErrors = {
      title: '',
      description: ''
    };
    
    if (!title.trim()) {
      newErrors.title = 'El título es obligatorio';
      hasErrors = true;
    } else if (title.length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres';
      hasErrors = true;
    }
    
    if (!description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
      hasErrors = true;
    } else if (description.length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
      hasErrors = true;
    }
    
    setErrors(newErrors);
    
    if (hasErrors) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Crear el ticket en la base de datos
      await ticketService.createTicket({
        title,
        description,
        priority,
        category,
        status: 'abierto'
      });
      
      setLoading(false);
      
      // Redirigir según el rol del usuario
      if (userRole === 'admin') {
        navigate('/admin/tickets');
      } else if (userRole === 'tecnico') {
        navigate('/tecnico/tickets');
      } else {
        navigate('/usuario/tickets');
      }
    } catch (error) {
      console.error('Error al crear el ticket:', error);
      setLoading(false);
    }
  };

  const renderForm = () => (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Crear Nuevo Ticket</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Título*
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`shadow appearance-none border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500`}
            placeholder="Resumen breve del problema"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
              Categoría
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="shadow border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            >
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="red">Red</option>
              <option value="impresoras">Impresoras</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
              Prioridad
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="shadow border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Descripción*
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`shadow appearance-none border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500`}
            placeholder="Describe detalladamente el problema que estás experimentando"
            rows={5}
          ></textarea>
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>
        
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                Creando...
              </>
            ) : (
              'Crear Ticket'
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // Renderizar con el layout según el rol
  if (userRole === 'admin') {
    return <AdminLayout>{renderForm()}</AdminLayout>;
  } else if (userRole === 'tecnico') {
    return <TechnicianLayout>{renderForm()}</TechnicianLayout>;
  } else {
    return <UserLayout>{renderForm()}</UserLayout>;
  }
};

export default CreateTicket; 