import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FiHome, FiBox, FiTag, FiShoppingCart, FiLayers, FiPackage, FiTrendingUp, FiUsers, FiFileText } from 'react-icons/fi';
import './admin.css';

function AdminLayout() {
  const [open, setOpen] = useState(false);
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
          <NavLink className="admin-nav-item" to="categories">
            <FiTag className="nav-ico" />
            <span>Category</span>
          </NavLink>
          <NavLink className="admin-nav-item" to="purchases">
            <FiShoppingCart className="nav-ico" />
            <span>Purchase</span>
          </NavLink>
          <NavLink className="admin-nav-item" to="productions">
            <FiPackage className="nav-ico" />
            <span>Production</span>
          </NavLink>
          <NavLink className="admin-nav-item" to="raw-materials">
            <FiLayers className="nav-ico" />
            <span>Raw materials</span>
          </NavLink>
          <NavLink className="admin-nav-item" to="sales">
            <FiTrendingUp className="nav-ico" />
            <span>Sale</span>
          </NavLink>
          <NavLink className="admin-nav-item" to="users">
            <FiUsers className="nav-ico" />
            <span>User</span>
          </NavLink>
          <NavLink className="admin-nav-item" to="reports">
            <FiFileText className="nav-ico" />
            <span>Reports</span>
          </NavLink>
        </nav>
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


