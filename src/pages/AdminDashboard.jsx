import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './admin/AdminLayout';
import DashboardHome from './admin/DashboardHome';
import Products from './admin/Products';
import Categories from './admin/Categories';
import Purchases from './admin/Purchases';
import RawMaterials from './admin/RawMaterials';
import Sales from './admin/Sales';
import Users from './admin/Users';
import Productions from './admin/Productions';
import Reports from './admin/Reports';
import RequireRole from '../components/RequireRole';

function AdminDashboard() {
  return (
    <Routes>
      <Route element={<AdminLayout />}> 
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<RequireRole allowedRoles={['admin']}><Categories /></RequireRole>} />
        <Route path="purchases" element={<RequireRole allowedRoles={['admin']}><Purchases /></RequireRole>} />
        <Route path="productions" element={<RequireRole allowedRoles={['admin']}><Productions /></RequireRole>} />
        <Route path="raw-materials" element={<RequireRole allowedRoles={['admin']}><RawMaterials /></RequireRole>} />
        <Route path="sales" element={<Sales />} />
        <Route path="users" element={<RequireRole allowedRoles={['admin']}><Users /></RequireRole>} />
        <Route path="reports" element={<Reports />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default AdminDashboard;


