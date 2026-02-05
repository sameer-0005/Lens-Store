import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import LowStock from './pages/LowStock';
import AddLens from './pages/AddLens';
import EditLens from './pages/EditLens';
import Import from './pages/Import';
import Settings from './pages/Settings';

const App = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {user && <Navbar />}
      
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to="/" replace /> : <Login />
        } />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/search" element={
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>
        } />
        
        <Route path="/low-stock" element={
          <ProtectedRoute>
            <LowStock />
          </ProtectedRoute>
        } />
        
        <Route path="/lens/add" element={
          <ProtectedRoute>
            <AddLens />
          </ProtectedRoute>
        } />
        
        <Route path="/lens/:id/edit" element={
          <ProtectedRoute>
            <EditLens />
          </ProtectedRoute>
        } />
        
        <Route path="/import" element={
          <ProtectedRoute>
            <Import />
          </ProtectedRoute>
        } />
        
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {user && <BottomNav />}
    </div>
  );
};

export default App;
