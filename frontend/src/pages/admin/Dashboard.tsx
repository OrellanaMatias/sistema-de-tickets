import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import authService from '../../services/authService';
import statsService from '../../services/statsService';

interface DashboardStats {
  totalUsers: number;
  totalTickets: number;
  pendingTickets: number;
  completedTickets: number;
}

interface RecentActivity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
}

interface PerformanceSummary {
  resolvedPercentage: number;
  pendingPercentage: number;
  averageResolutionTime: number;
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Hace menos de una hora';
  } else if (diffInHours === 1) {
    return 'Hace 1 hora';
  } else if (diffInHours < 24) {
    return `Hace ${diffInHours} horas`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return diffInDays === 1 ? 'Hace 1 día' : `Hace ${diffInDays} días`;
  }
};

const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'user_created':
      return 'fas fa-user-plus';
    case 'ticket_resolved':
    case 'ticket_closed':
      return 'fas fa-check-circle';
    case 'ticket_created':
      return 'fas fa-ticket-alt';
    case 'ticket_assigned':
      return 'fas fa-user-tag';
    case 'ticket_updated':
      return 'fas fa-edit';
    default:
      return 'fas fa-info-circle';
  }
};

const getActivityClass = (type: string): string => {
  switch (type) {
    case 'user_created':
      return 'bg-blue-100 text-blue-600';
    case 'ticket_resolved':
    case 'ticket_closed':
      return 'bg-green-100 text-green-600';
    case 'ticket_created':
      return 'bg-purple-100 text-purple-600';
    case 'ticket_assigned':
      return 'bg-yellow-100 text-yellow-600';
    case 'ticket_updated':
      return 'bg-indigo-100 text-indigo-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTickets: 0,
    pendingTickets: 0,
    completedTickets: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [performance, setPerformance] = useState<PerformanceSummary>({
    resolvedPercentage: 0,
    pendingPercentage: 0,
    averageResolutionTime: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtener información del usuario
        const userData = authService.getUser();
        setUser(userData);
        
        // Obtener estadísticas del dashboard
        const statsData = await statsService.getDashboardStats();
        setStats({
          totalUsers: statsData.totalUsers,
          totalTickets: statsData.totalTickets,
          pendingTickets: statsData.pendingTickets,
          completedTickets: statsData.completedTickets
        });
        
        // Obtener actividad reciente
        const activityData = await statsService.getRecentActivity();
        setRecentActivity(activityData);
        
        // Obtener resumen de rendimiento
        const performanceData = await statsService.getPerformanceSummary();
        setPerformance(performanceData);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return (
    <AdminLayout>
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-blue-500 text-4xl mb-4"></i>
          <p>Cargando datos del dashboard...</p>
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard General</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-600 text-sm font-medium mb-1">Usuarios Totales</h2>
              <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <i className="fas fa-users fa-lg"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-600 text-sm font-medium mb-1">Tickets Totales</h2>
              <p className="text-3xl font-bold text-gray-800">{stats.totalTickets}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <i className="fas fa-ticket-alt fa-lg"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-600 text-sm font-medium mb-1">Tickets Pendientes</h2>
              <p className="text-3xl font-bold text-orange-500">{stats.pendingTickets}</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <i className="fas fa-clock fa-lg"></i>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-600 text-sm font-medium mb-1">Tickets Resueltos</h2>
              <p className="text-3xl font-bold text-green-500">{stats.completedTickets}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <i className="fas fa-check-circle fa-lg"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className={`p-2 rounded-full ${getActivityClass(activity.type)} mr-3`}>
                    <i className={getActivityIcon(activity.type)}></i>
                  </div>
                  <div>
                    <p className="font-medium">{activity.message}</p>
                    <p className="text-sm text-gray-500">{formatTimestamp(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold mb-4">Resumen de Rendimiento</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Tickets resueltos</span>
                <span className="text-sm font-medium">{performance.resolvedPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${performance.resolvedPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Tickets pendientes</span>
                <span className="text-sm font-medium">{performance.pendingPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${performance.pendingPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Tiempo promedio de resolución</span>
                <span className="text-sm font-medium">
                  {performance.averageResolutionTime.toFixed(1)} días
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((performance.averageResolutionTime / 5) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 