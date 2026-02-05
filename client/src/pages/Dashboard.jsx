import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, AlertTriangle, Box, XCircle, 
  Search, Plus, FileUp, ArrowRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import api from '../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/lens/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <Loader text="Loading dashboard..." />
      </div>
    );
  }

  const lowStockCount = (stats?.lowStock || 0) + (stats?.outOfStock || 0);

  return (
    <div className="page-container px-4 pt-6 pb-24">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {getGreeting()}, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Here's your inventory overview
        </p>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                Low Stock Alert
              </h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                {lowStockCount} item{lowStockCount > 1 ? 's' : ''} need{lowStockCount === 1 ? 's' : ''} attention
              </p>
              <button
                onClick={() => navigate('/low-stock')}
                className="mt-3 flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800"
              >
                View Low Stock Items
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Package className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalLenses || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Lenses</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.lowStock || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Box className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalBoxes || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Boxes</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.outOfStock || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Out of Stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h2>
      <div className="space-y-3">
        <button
          onClick={() => navigate('/search')}
          className="w-full card p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Search className="h-6 w-6 text-primary-600" />
          </div>
          <div className="text-left flex-1">
            <p className="font-medium text-gray-900 dark:text-white">Search Lenses</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Find and manage inventory</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </button>

        <button
          onClick={() => navigate('/lens/add')}
          className="w-full card p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Plus className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-left flex-1">
            <p className="font-medium text-gray-900 dark:text-white">Add New Lens</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add item to inventory</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </button>

        <button
          onClick={() => navigate('/import')}
          className="w-full card p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <FileUp className="h-6 w-6 text-purple-600" />
          </div>
          <div className="text-left flex-1">
            <p className="font-medium text-gray-900 dark:text-white">Import from CSV</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Bulk import lenses</p>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
