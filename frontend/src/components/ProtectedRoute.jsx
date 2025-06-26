import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useAuth from '../hooks/useAuth';

/**
 * A wrapper component for routes that require authentication
 * Redirects to login if user is not authenticated
 * Can also check for specific roles if provided
 */
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const user = useSelector((state) => state.user.user);
  const { isAuthenticated, isLoading, showRoleSelection } = useAuth();
  
  // Show loading spinner while checking authentication
  if (isLoading || showRoleSelection) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  // If roles are specified, check if user has required role
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User is authenticated and has required role, render children
  return children;
};

export default ProtectedRoute;