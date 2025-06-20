import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from './Notification';

// Create the context
const NotificationContext = createContext();

// Generate unique IDs for notifications
const generateId = () => Math.random().toString(36).substring(2, 9);

// Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a notification
  const addNotification = useCallback((message, options = {}) => {
    const id = generateId();
    const notification = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration !== undefined ? options.duration : 3000,
      position: options.position || 'top-right',
    };
    
    setNotifications(prev => [...prev, notification]);
    return id;
  }, []);

  // Shortcuts for common notification types
  const success = useCallback((message, options = {}) => {
    return addNotification(message, { ...options, type: 'success' });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    return addNotification(message, { ...options, type: 'error' });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    return addNotification(message, { ...options, type: 'info' });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    return addNotification(message, { ...options, type: 'warning' });
  }, [addNotification]);

  // Remove a notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Value object to be provided to consumers
  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    info,
    warning,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Render all active notifications */}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          position={notification.position}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext; 