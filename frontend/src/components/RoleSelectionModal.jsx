import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../redux/userSlice';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Button from './ui/Button';
import Card from './ui/Card';
import { useNavigate } from 'react-router-dom';

const RoleSelectionModal = ({ isOpen, onClose, user }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.user.user);
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedRole('');
      setError(null);
    }
  }, [isOpen]);
  
  // Close modal if user is already set
  useEffect(() => {
    if (currentUser && isOpen) {
      onClose();
    }
  }, [currentUser, isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      setError("Please select a role to continue");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const auth0Id = user.auth0Id || user.sub;
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const fullUrl = `${apiUrl}/api/users/create-from-auth0`;
      
      console.log('Registering user with:', { auth0Id, role: selectedRole, apiUrl, fullUrl });
      console.log('User token available:', !!user.token);
      
      // Use the create-from-auth0 endpoint with Auth0 token
      const response = await axios.post(fullUrl, {
        name: user.name,
        email: user.email,
        picture: user.picture,
        auth0Id: auth0Id,
        role: selectedRole
      }, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Registration successful:', response.data);

      // Update Redux store
      dispatch(setUser({
        ...response.data,
        token: user.token
      }));
      
      // Set auth header for future requests
      if (user.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      }
      
      // Close modal and navigate
      onClose();
      navigateToDashboard(response.data.role);
    } catch (error) {
      console.error('Error registering user:', error);
      setError("An error occurred while registering your account.");
      setIsLoading(false);
    }
  };
  
  const navigateToDashboard = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'organizer':
        navigate('/organizer/dashboard', { replace: true });
        break;
      case 'attendee':
      default:
        navigate('/attendee/dashboard', { replace: true });
        break;
    }
  };

  const roles = [
    {
      id: 'attendee',
      title: 'Attendee',
      description: 'Discover and attend events',
      icon: '🎟️'
    },
    {
      id: 'organizer',
      title: 'Organizer',
      description: 'Create and manage events',
      icon: '📅'
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Full system access and management',
      icon: '⚙️'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-primary-900">Welcome to EventCraft!</h2>
                  <p className="text-secondary-600 mt-2">
                    Please select how you'd like to use the platform
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedRole === role.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-secondary-200 hover:border-primary-200 hover:bg-secondary-50'
                      }`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <div className="text-3xl mr-4">{role.icon}</div>
                      <div>
                        <h3 className="font-medium text-secondary-900">{role.title}</h3>
                        <p className="text-sm text-secondary-600">{role.description}</p>
                      </div>
                      <div className="ml-auto">
                        <div
                          className={`w-5 h-5 rounded-full border ${
                            selectedRole === role.id
                              ? 'border-primary-500 bg-primary-500'
                              : 'border-secondary-300'
                          }`}
                        >
                          {selectedRole === role.id && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="white"
                              className="w-5 h-5"
                            >
                              <path
                                fillRule="evenodd"
                                d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {!selectedRole && (
                  <p className="text-orange-500 text-sm mb-4">
                    * Please select a role to continue
                  </p>
                )}

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="primary"
                    onClick={handleRoleSelect}
                    disabled={isLoading || !selectedRole}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      'Continue'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoleSelectionModal; 