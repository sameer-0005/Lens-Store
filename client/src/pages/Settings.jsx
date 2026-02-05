import { useState, useEffect } from 'react';
import { User, Moon, Sun, Package, LogOut, AlertTriangle, Box } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Loader from '../components/Loader';
import api from '../api/axios';

const Settings = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
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

  return (
    <div className="page-container px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h1>

      {/* User Info */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
            <User className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-4 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="h-5 w-5 text-gray-500" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500" />
            )}
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              darkMode ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                darkMode ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="card p-4 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Inventory Summary</h3>
        {loading ? (
          <Loader size="small" text="" />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-primary-600" />
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats?.totalLenses || 0}
                </p>
                <p className="text-xs text-gray-500">Total Lenses</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Box className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats?.totalBoxes || 0}
                </p>
                <p className="text-xs text-gray-500">Total Boxes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats?.lowStock || 0}
                </p>
                <p className="text-xs text-gray-500">Low Stock</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats?.outOfStock || 0}
                </p>
                <p className="text-xs text-gray-500">Out of Stock</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full card p-4 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        <LogOut className="h-5 w-5" />
        <span className="font-medium">Sign Out</span>
      </button>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">
        Lens Store v1.0.0
      </p>
    </div>
  );
};

export default Settings;
