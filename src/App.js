import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import { getCurrentUser } from './services/authService';
import RequireRole from './components/RequireRole';

function RoleRedirect() {
  const user = getCurrentUser();
  // Normalize role to lowercase for comparison (roles are stored as 'admin' or 'staff')
  const role = (user?.role || '').toLowerCase().trim();
  console.log('RoleRedirect - User:', user, 'Role:', role);
  if (role === 'admin') {
    console.log('RoleRedirect - Redirecting admin to /admin-dashboard/dashboard');
    return <Navigate to="/admin-dashboard/dashboard" replace />;
  }
  if (role === 'staff') {
    console.log('RoleRedirect - Redirecting staff to /staff-dashboard/dashboard');
    return <Navigate to="/staff-dashboard/dashboard" replace />;
  }
  console.log('RoleRedirect - No valid role, redirecting to login');
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
      <Route 
        path="/admin-dashboard/*" 
        element={
          <RequireAuth>
            <RequireRole allowedRoles={['admin']} fallback="/staff-dashboard/dashboard">
              <AdminDashboard />
            </RequireRole>
          </RequireAuth>
        } 
      />
      <Route 
        path="/staff-dashboard/*" 
        element={
          <RequireAuth>
            <RequireRole allowedRoles={['staff']} fallback="/admin-dashboard/dashboard">
              <StaffDashboard />
            </RequireRole>
          </RequireAuth>
        } 
      />
      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
