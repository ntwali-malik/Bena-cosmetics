import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/authService';

/**
 * RequireRole component to protect routes based on user role
 * Roles are expected to be lowercase: 'admin' or 'staff'
 * @param {string} allowedRoles - Array of allowed roles (e.g., ['admin', 'staff'])
 * @param {string} fallback - Route to redirect to if not authorized (default: '/admin-dashboard/dashboard')
 */
function RequireRole({ children, allowedRoles = ['admin'], fallback = '/admin-dashboard/dashboard' }) {
  const user = getCurrentUser();
  
  // Debug logging
  console.log('RequireRole - User:', user, 'Allowed roles:', allowedRoles, 'User role:', user?.role);
  
  if (!user) {
    console.log('RequireRole - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Normalize role to lowercase for comparison
  const userRole = (user.role || '').toLowerCase().trim();
  const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase().trim());
  
  console.log('RequireRole - Normalized user role:', userRole, 'Normalized allowed:', normalizedAllowedRoles, 'Match:', normalizedAllowedRoles.includes(userRole));
  
  if (!normalizedAllowedRoles.includes(userRole)) {
    console.log('RequireRole - Role not allowed, redirecting to:', fallback);
    return <Navigate to={fallback} replace />;
  }
  
  console.log('RequireRole - Access granted');
  return children;
}

/**
 * Check if current user has a specific role
 * Roles are compared in lowercase: 'admin' or 'staff'
 */
export function hasRole(role) {
  const user = getCurrentUser();
  if (!user || !user.role) return false;
  // Normalize both to lowercase for case-insensitive comparison
  return user.role.toLowerCase() === role.toLowerCase();
}

/**
 * Check if current user is admin (role must be lowercase 'admin')
 */
export function isAdmin() {
  return hasRole('admin');
}

/**
 * Check if current user is staff (role must be lowercase 'staff')
 */
export function isStaff() {
  return hasRole('staff');
}

export default RequireRole;

