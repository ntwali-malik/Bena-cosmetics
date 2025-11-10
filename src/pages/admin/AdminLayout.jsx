import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiBox, FiTag, FiShoppingCart, FiLayers, FiPackage, FiTrendingUp, FiUsers, FiFileText, FiLogOut } from 'react-icons/fi';
import { logout as doLogout } from '../../services/authService';
import { getCurrentUser } from '../../services/authService';
import { isAdmin } from '../../components/RequireRole';
import './admin.css';

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const admin = isAdmin();

  // Hard guard: if no user, force redirect (also on back/forward)
  useEffect(() => {
    const enforceAuth = () => {
      const user = getCurrentUser();
      if (!user) navigate('/login', { replace: true });
    };
    enforceAuth();
    const onPop = () => enforceAuth();
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [navigate, location.key]);

  const handleLogout = () => {
    doLogout();
    navigate('/login', { replace: true });
  };
  return (
    <div className={`admin-layout ${open ? 'sidebar-open' : ''}`}>
      <aside className="admin-sidebar glass">
        <div className="admin-brand">
          <img src="/logo.png" alt="Bena Cosmetics" className="sidebar-logo" />
          <div className="brand-text">
            <div className="brand-name">Bena Cosmetics</div>
            <div className="brand-subtitle">Ltd</div>
          </div>
        </div>
        <nav className="admin-nav">
          <NavLink className="admin-nav-item" to="dashboard">
            <FiHome className="nav-ico" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink className="admin-nav-item" to="products">
            <FiBox className="nav-ico" />
            <span>Product</span>
          </NavLink>
          {admin && (
            <NavLink className="admin-nav-item" to="categories">
              <FiTag className="nav-ico" />
              <span>Category</span>
            </NavLink>
          )}
          {admin && (
            <NavLink className="admin-nav-item" to="purchases">
              <FiShoppingCart className="nav-ico" />
              <span>Purchase</span>
            </NavLink>
          )}
          {admin && (
            <NavLink className="admin-nav-item" to="productions">
              <FiPackage className="nav-ico" />
              <span>Production</span>
            </NavLink>
          )}
          {admin && (
            <NavLink className="admin-nav-item" to="raw-materials">
              <FiLayers className="nav-ico" />
              <span>Raw materials</span>
            </NavLink>
          )}
          <NavLink className="admin-nav-item" to="sales">
            <FiTrendingUp className="nav-ico" />
            <span>Sale</span>
          </NavLink>
          {admin && (
            <NavLink className="admin-nav-item" to="users">
              <FiUsers className="nav-ico" />
              <span>User</span>
            </NavLink>
          )}
          <NavLink className="admin-nav-item" to="reports">
            <FiFileText className="nav-ico" />
            <span>Reports</span>
          </NavLink>
        </nav>
        <div className="admin-nav-footer">
          <button className="admin-logout" onClick={handleLogout}>
            <FiLogOut className="nav-ico" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-topbar">
          <button className="sidebar-toggle" onClick={() => setOpen((v) => !v)}>
            ☰
          </button>
          <div className="spacer" />
        </div>
        <div className="admin-content" onClick={() => { if (open) setOpen(false); }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;


