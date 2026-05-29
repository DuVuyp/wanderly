import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import PublicOnlyRoute from './components/routing/PublicOnlyRoute';
import ProtectedRoute from './components/routing/ProtectedRoute';
import RoleHomeRedirect from './components/routing/RoleHomeRedirect';
import Login from './pages/Login';
import Home from './pages/Home';
import ProviderDashboard from './pages/ProviderDashboard';
import Register from './pages/Register';
import Services from './pages/Services';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import ManageBookings from './pages/provider/ManageBookings';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          duration: 3000,
        }}
      />
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/" element={<RoleHomeRedirect />} />
        <Route element={<ProtectedRoute allowedRoles={['traveler', 'provider']} />}>
          <Route path="/home" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<Booking />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
          <Route path="/provider" element={<ProviderDashboard />} />
          <Route path="/provider/bookings" element={<ManageBookings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
