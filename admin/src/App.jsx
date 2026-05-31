import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/auth/AdminLogin';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import UsersManagement from './pages/UsersManagement';
import AdminProtectedRoute from './components/ProtectedRoute';
import AdminLocations from './pages/Locations/AdminLocations';
import AdminCategories from './pages/Categories/AdminCategories';
import AdminFeatures from './pages/Features/AdminFeatures';
import AdminBackup from './pages/Backup/AdminBackup';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminProtectedRoute />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="locations" element={<AdminLocations />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="features" element={<AdminFeatures />} />
          <Route path="backup" element={<AdminBackup />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
