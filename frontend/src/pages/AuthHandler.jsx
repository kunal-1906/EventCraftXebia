import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useSelector } from 'react-redux';

const AuthHandler = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const user = useSelector(state => state.user.user);
  
  useEffect(() => {
    // If already authenticated and we have a user, redirect to dashboard
    if (isAuthenticated && user && !isLoading) {
      navigate('/dashboard', { replace: true });
      return;
    }
    
    // If not authenticated and not loading, trigger login
    if (!isLoading && !isAuthenticated) {
      login();
    }
  }, [login, isAuthenticated, isLoading, navigate, user]);
  
  // Show loading spinner while authenticating
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600">Authenticating...</p>
    </div>
  );
};

export default AuthHandler; 