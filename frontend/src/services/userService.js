import api from './api';
import authService from './authService';
import { mockEvents } from './eventService';

// Helper function to simulate API delays
const mockDelay = (data, ms = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), ms);
  });
};

const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      // In a real app: const response = await api.get('/user/profile');
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      return mockDelay(user);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },
  
  // Update user profile
  updateProfile: async (userData) => {
    try {
      // In a real app: const response = await api.put('/user/profile', userData);
      return authService.updateProfile(userData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },
  
  // Get user events
  getUserEvents: async () => {
    try {
      // In a real app: const response = await api.get('/user/events');
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      // Get events user is attending
      const attendingEvents = mockEvents.filter(e => e.attendees.includes(user.id));
      
      // If user is an organizer, also get events they're organizing
      let organizingEvents = [];
      if (user.role === 'organizer' || user.role === 'admin') {
        organizingEvents = mockEvents.filter(e => e.organizer === user.id);
      }
      
      return mockDelay({
        attending: attendingEvents,
        organizing: organizingEvents
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user events');
    }
  },
  
  // Upload profile picture
  uploadProfilePicture: async (file) => {
    try {
      // In a real app: 
      // const formData = new FormData();
      // formData.append('profilePicture', file);
      // const response = await api.post('/user/profile-picture', formData);
      
      // Mock implementation
      return new Promise((resolve) => {
        setTimeout(() => {
          // Simulate a successful upload
          const imageUrl = `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`;
          
          // Update the user profile with the new image URL
          const user = authService.getCurrentUser();
          if (user) {
            authService.updateProfile({ profilePicture: imageUrl });
          }
          
          resolve({ 
            data: { 
              url: imageUrl,
              message: 'Profile picture updated successfully'
            }
          });
        }, 1500); // Longer delay to simulate upload
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload profile picture');
    }
  }
};

export default userService; 