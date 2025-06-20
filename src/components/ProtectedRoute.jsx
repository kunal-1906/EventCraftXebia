import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const user = useSelector((state) => state.user.user);
  const location = useLocation();

  // If the user isn't logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and the user doesn't have the required role, redirect to unauthorized
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If the user is logged in and has the required role (or no role is required), render the children
  return children;
};

export default ProtectedRoute;