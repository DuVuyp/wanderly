import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/auth/AdminLogin';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import UsersManagement from './pages/UsersManagement';
import AdminProtectedRoute from './components/ProtectedRoute';
// Empty components for now to prevent breaking routing
const AdminProperties = () => <div className="p-6">Properties Management (Coming soon)</div>;
const AdminRoomTypes = () => <div className="p-6">Room Types Management (Coming soon)</div>;
const AdminBookings = () => <div className="p-6">Bookings Management (Coming soon)</div>;
const AdminBackup = () => <div className="p-6">Backup Management (Coming soon)</div>;

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
          <Route path="properties" element={<AdminProperties />} />
          <Route path="room-types" element={<AdminRoomTypes />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="backup" element={<AdminBackup />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
