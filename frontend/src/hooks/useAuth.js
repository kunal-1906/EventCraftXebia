import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, logout as logoutAction } from '../redux/userSlice';
import { cleanupAuthData } from '../utils/authCleanup';
import axios from 'axios';

/**
 * Custom hook to handle Auth0 authentication and sync with Redux store
 */
const useAuth = () => {
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [initialUser, setInitialUser] = useState(null);
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.user.user);
  
  const { 
    isAuthenticated, 
    loginWithRedirect, 
    logout: auth0Logout, 
    user: auth0User, 
    isLoading, 
    getAccessTokenSilently 
  } = useAuth0();

  // Check if user exists in database
  const checkUser = useCallback(async () => {
    if (!isAuthenticated || !auth0User || isLoading) return;

    try {
      const token = await getAccessTokenSilently();
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.post(`${apiUrl}/api/auth/check-user`, {
        auth0Id: auth0User.sub,
        email: auth0User.email
      });

      if (response.data.exists) {
        // User exists - login
        dispatch(setUser({
          ...response.data.user,
          token
        }));
      } else {
        // New user - show role selection
        setInitialUser({
          auth0Id: auth0User.sub,
          email: auth0User.email,
          name: auth0User.name || '',
          picture: auth0User.picture || '',
          token
        });
        setShowRoleSelection(true);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  }, [isAuthenticated, auth0User, isLoading, getAccessTokenSilently, dispatch]);

  // Check user when authenticated
  useEffect(() => {
    if (isAuthenticated && !currentUser) {
      checkUser();
    }
  }, [isAuthenticated, currentUser, checkUser]);

  // Hide role selection when user is set
  useEffect(() => {
    if (currentUser && showRoleSelection) {
      setShowRoleSelection(false);
    }
  }, [currentUser, showRoleSelection]);

  const login = useCallback(() => {
    loginWithRedirect({
      appState: { returnTo: '/dashboard' }
    });
  }, [loginWithRedirect]);

  const logout = useCallback(() => {
    // First, navigate to homepage
    window.location.href = '/';
    
    // Then perform cleanup after a short delay to allow navigation
    setTimeout(() => {
      // Clear Redux state
      dispatch(logoutAction());
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      
      // Clear sessionStorage as well
      sessionStorage.removeItem('auth_callback_handled');
      sessionStorage.removeItem('auth_callback_time');
      
      // Clear axios auth header
      delete axios.defaults.headers.common['Authorization'];
      
      // Clean up any Auth0 related stale data
      cleanupAuthData();
      
      // Finally call Auth0 logout
      auth0Logout({ 
        logoutParams: {
          returnTo: window.location.origin
        }
      });
    }, 100); // Small delay to ensure navigation starts first
  }, [dispatch, auth0Logout]);

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    user: auth0User,
    showRoleSelection,
    setShowRoleSelection,
    initialUser
  };
};

export default useAuth; 