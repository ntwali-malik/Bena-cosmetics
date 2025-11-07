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

function AdminDashboard() {
  return (
    <Routes>
      <Route element={<AdminLayout />}> 
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="productions" element={<Productions />} />
        <Route path="raw-materials" element={<RawMaterials />} />
        <Route path="sales" element={<Sales />} />
        <Route path="users" element={<Users />} />
        <Route path="reports" element={<Reports />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default AdminDashboard;


