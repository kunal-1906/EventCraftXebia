import api from './api';
import authService from './authService';

// Mock events data
const mockEvents = [
  {
    id: 'e001',
    title: 'Tech Conference 2024',
    description: 'Annual tech conference with industry leaders',
    date: '2024-11-15T09:00:00',
    endDate: '2024-11-17T18:00:00',
    location: 'Convention Center, New York',
    price: 299.99,
    organizer: 'u002',
    status: 'approved',
    capacity: 500,
    attendees: ['u001'],
    categories: ['technology', 'networking'],
    image: 'https://picsum.photos/800/400',
  },
  {
    id: 'e002',
    title: 'Music Festival',
    description: 'Three-day music festival featuring top artists',
    date: '2024-08-20T14:00:00',
    endDate: '2024-08-22T23:00:00',
    location: 'Central Park, New York',
    price: 150,
    organizer: 'u002',
    status: 'approved',
    capacity: 10000,
    attendees: [],
    categories: ['music', 'entertainment'],
    image: 'https://picsum.photos/800/401',
  },
  {
    id: 'e003',
    title: 'Startup Pitch Night',
    description: 'Pitch your startup idea to investors',
    date: '2024-07-10T18:00:00',
    endDate: '2024-07-10T21:00:00',
    location: 'Innovation Hub, San Francisco',
    price: 0,
    organizer: 'u002',
    status: 'pending',
    capacity: 100,
    attendees: ['u001'],
    categories: ['business', 'networking'],
    image: 'https://picsum.photos/800/402',
  }
];

// Helper function to simulate API delays
const mockDelay = (data, ms = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), ms);
  });
};

export const eventService = {
  // Get upcoming events
  getUpcomingEvents: async () => {
    const response = await api.get('/events/upcoming');
    return response.data;
  },

  // Get organizer's events
  getOrganizerEvents: async () => {
    try {
      const response = await api.get('/events/organizer');
      return response.data;
    } catch (error) {
      console.error('Error fetching organizer events:', error);
      // Fallback: Get all events and filter by organizer in frontend
      // This is a temporary solution for demo purposes
      try {
        const allEventsResponse = await api.get('/events');
        const allEvents = allEventsResponse.data.events || [];
        // For demo, return first 3 events as if they belong to the current organizer
        return allEvents.slice(0, 3);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return mockDelay([]);
      }
    }
  },

  // Get event analytics
  getEventAnalytics: async () => {
    try {
      const response = await api.get('/events/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching event analytics:', error);
      // Return demo analytics data
      return mockDelay({
        totalEvents: 6,
        totalAttendees: 1250,
        totalRevenue: 4500,
        upcomingEvents: 4,
        draftEvents: 2,
        publishedEvents: 4
      });
    }
  },

  // Get all events
  getEvents: async (filters = {}) => {
    try {
      const response = await api.get('/events', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to mock data if API fails
      let filteredEvents = [...mockEvents];
      
      // Apply filters
      if (filters.organizer) {
        filteredEvents = filteredEvents.filter(e => e.organizer === filters.organizer);
      }
      
      if (filters.status) {
        filteredEvents = filteredEvents.filter(e => e.status === filters.status);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredEvents = filteredEvents.filter(e => 
          e.title.toLowerCase().includes(searchTerm) || 
          e.description.toLowerCase().includes(searchTerm)
        );
      }
      
      return mockDelay(filteredEvents);
    }
  },
  
  // Get single event
  getEvent: async (eventId) => {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  },
  
  // Create new event
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      // Provide more detailed error information
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.join(', ') || 
                          error.message || 
                          'Failed to create event';
      throw new Error(errorMessage);
    }
  },
  
  // Update event
  updateEvent: async (eventId, eventData) => {
    const response = await api.put(`/events/${eventId}`, eventData);
    return response.data;
  },
  
  // Delete event
  deleteEvent: async (eventId) => {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  },
  
  // Register for event
  registerForEvent: async (eventId) => {
    try {
      // In a real app: const response = await api.post(`/events/${eventId}/register`);
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('You must be logged in to register for events');
      }
      
      const eventIndex = mockEvents.findIndex(e => e.id === eventId);
      
      if (eventIndex === -1) {
        throw new Error('Event not found');
      }
      
      const event = mockEvents[eventIndex];
      
      // Check if user is already registered
      if (event.attendees.includes(user.id)) {
        throw new Error('You are already registered for this event');
      }
      
      // Check if event is at capacity
      if (event.attendees.length >= event.capacity) {
        throw new Error('This event is at full capacity');
      }
      
      // Register user
      mockEvents[eventIndex].attendees.push(user.id);
      
      return mockDelay({
        message: 'Registration successful',
        event: mockEvents[eventIndex]
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register for event');
    }
  },
  
  // Cancel registration
  cancelRegistration: async (eventId) => {
    try {
      // In a real app: const response = await api.delete(`/events/${eventId}/register`);
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('You must be logged in to cancel registration');
      }
      
      const eventIndex = mockEvents.findIndex(e => e.id === eventId);
      
      if (eventIndex === -1) {
        throw new Error('Event not found');
      }
      
      const event = mockEvents[eventIndex];
      
      // Check if user is registered
      if (!event.attendees.includes(user.id)) {
        throw new Error('You are not registered for this event');
      }
      
      // Remove user from attendees
      mockEvents[eventIndex].attendees = event.attendees.filter(id => id !== user.id);
      
      return mockDelay({
        message: 'Registration cancelled successfully',
        event: mockEvents[eventIndex]
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel registration');
    }
  },
  
  // Approve event (admin only)
  approveEvent: async (eventId) => {
    try {
      const response = await api.put(`/events/${eventId}/approve`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to approve event');
    }
  },
  
  // Reject event (admin only)
  rejectEvent: async (eventId, reason) => {
    try {
      const response = await api.put(`/events/${eventId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reject event');
    }
  },

  // Get pending events for admin
  getPendingEvents: async () => {
    try {
      const response = await api.get('/events/admin/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending events:', error);
      // Fallback to mock data
      const pendingEvents = mockEvents.filter(e => e.status === 'pending');
      return mockDelay(pendingEvents);
    }
  }
};

export default eventService;
export { mockEvents }; 