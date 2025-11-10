import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './admin/AdminLayout';
import DashboardHome from './admin/DashboardHome';
import Products from './admin/Products';
import Sales from './admin/Sales';
import Reports from './admin/Reports';

function StaffDashboard() {
  return (
    <Routes>
      <Route element={<AdminLayout />}> 
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="products" element={<Products />} />
        <Route path="sales" element={<Sales />} />
        <Route path="reports" element={<Reports />} />
        <Route path="" element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default StaffDashboard;


