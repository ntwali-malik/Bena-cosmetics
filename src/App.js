import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import { getCurrentUser } from './services/authService';

function RoleRedirect() {
  const user = getCurrentUser();
  // Normalize role to lowercase for comparison (roles are stored as 'admin' or 'staff')
  const role = (user?.role || '').toLowerCase();
  if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
  if (role === 'staff') return <Navigate to="/staff-dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function RequireAuth({ children }) {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/admin-dashboard/*" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
      <Route path="/staff-dashboard/*" element={<RequireAuth><StaffDashboard /></RequireAuth>} />
      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
