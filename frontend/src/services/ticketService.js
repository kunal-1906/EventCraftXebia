import api from './api';
import authService from './authService';

// Helper function to simulate API delays
const mockDelay = (data, ms = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), ms);
  });
};

// Mock ticket data
const mockTickets = [
  {
    id: 'ticket001',
    eventId: 'e001',
    userId: 'u001',
    ticketType: 'standard',
    price: 299.99,
    status: 'confirmed', // confirmed, canceled, used
    purchaseDate: '2024-06-01T14:30:00',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TKT-e001-u001-1622554200000',
    ticketNumber: 'TCK10023478',
    seatInfo: null,
    checked: false
  }
];

// Mock ticket types
const mockTicketTypes = {
  'e001': [
    {
      id: 'tt001',
      eventId: 'e001',
      name: 'Early Bird',
      price: 199.99,
      available: 50,
      sold: 25,
      description: 'Limited early bird tickets at a special price',
      perks: ['Access to all sessions', 'Welcome pack', 'Coffee breaks']
    },
    {
      id: 'tt002',
      eventId: 'e001',
      name: 'Standard',
      price: 299.99,
      available: 300,
      sold: 120,
      description: 'Regular conference admission',
      perks: ['Access to all sessions', 'Coffee breaks']
    },
    {
      id: 'tt003',
      eventId: 'e001',
      name: 'VIP',
      price: 499.99,
      available: 50,
      sold: 15,
      description: 'Premium conference experience',
      perks: ['Access to all sessions', 'Welcome pack', 'Coffee breaks', 'Lunch included', 'Exclusive networking event', 'Front row seating']
    }
  ],
  'e002': [
    {
      id: 'tt004',
      eventId: 'e002',
      name: 'General Admission',
      price: 150,
      available: 5000,
      sold: 2500,
      description: 'Standard festival pass for all three days',
      perks: ['Access to all performances', 'Re-entry permitted']
    },
    {
      id: 'tt005',
      eventId: 'e002',
      name: 'VIP Pass',
      price: 350,
      available: 500,
      sold: 200,
      description: 'Premium festival experience',
      perks: ['Access to all performances', 'VIP viewing areas', 'Exclusive lounge access', 'Complimentary drinks', 'Fast lane entry']
    }
  ]
};

const ticketService = {
  // Get available ticket types for an event
  getTicketTypes: async (eventId) => {
    try {
      // In a real app: const response = await api.get(`/events/${eventId}/ticket-types`);
      
      // Check if event exists and has ticket types
      const ticketTypes = mockTicketTypes[eventId];
      
      if (!ticketTypes) {
        return mockDelay([]);
      }
      
      return mockDelay(ticketTypes);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch ticket types');
    }
  },
  
  // Purchase tickets
  purchaseTickets: async (eventId, ticketTypeId, quantity = 1) => {
    try {
      // In a real app: const response = await api.post(`/events/${eventId}/tickets`, { ticketTypeId, quantity });
      
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('You must be logged in to purchase tickets');
      }
      
      // Check if event exists and has ticket types
      const ticketTypes = mockTicketTypes[eventId];
      
      if (!ticketTypes) {
        throw new Error('Event not found or tickets not available');
      }
      
      // Find the ticket type
      const ticketType = ticketTypes.find(tt => tt.id === ticketTypeId);
      
      if (!ticketType) {
        throw new Error('Invalid ticket type');
      }
      
      // Check if enough tickets are available
      if (ticketType.available - ticketType.sold < quantity) {
        throw new Error(`Only ${ticketType.available - ticketType.sold} tickets available`);
      }
      
      // Generate tickets
      const tickets = [];
      
      for (let i = 0; i < quantity; i++) {
        const ticketId = 'ticket' + Math.floor(Math.random() * 100000);
        const ticketNumber = 'TCK' + Math.floor(Math.random() * 100000000);
        const timestamp = Date.now();
        
        // Generate QR code URL (in a real app, this would be a secure, encoded ticket reference)
        const qrCodeData = `TKT-${eventId}-${user.id}-${timestamp}-${i}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrCodeData}`;
        
        const ticket = {
          id: ticketId,
          eventId,
          userId: user.id,
          ticketType: ticketType.name,
          ticketTypeId,
          price: ticketType.price,
          status: 'confirmed',
          purchaseDate: new Date().toISOString(),
          qrCode: qrCodeUrl,
          ticketNumber,
          seatInfo: null,
          checked: false
        };
        
        tickets.push(ticket);
        mockTickets.push(ticket);
      }
      
      // Update ticket type sold count
      ticketType.sold += quantity;
      
      return mockDelay({
        message: `Successfully purchased ${quantity} tickets`,
        tickets,
        totalAmount: ticketType.price * quantity
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to purchase tickets');
    }
  },
  
  // Get user's tickets
  getUserTickets: async (options = {}) => {
    try {
      // In a real app: const response = await api.get('/tickets', { params: options });
      
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('You must be logged in to view your tickets');
      }
      
      // Filter tickets for the current user
      let userTickets = mockTickets.filter(t => t.userId === user.id);
      
      // Apply status filter if provided
      if (options.status) {
        userTickets = userTickets.filter(t => t.status === options.status);
      }
      
      // Apply event filter if provided
      if (options.eventId) {
        userTickets = userTickets.filter(t => t.eventId === options.eventId);
      }
      
      // Sort by purchase date, newest first
      userTickets.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
      
      return mockDelay(userTickets);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tickets');
    }
  },
  
  // Get a single ticket
  getTicket: async (ticketId) => {
    try {
      const response = await api.get(`/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch ticket');
    }
  },
  
  // Cancel a ticket
  cancelTicket: async (ticketId) => {
    try {
      const response = await api.put(`/tickets/${ticketId}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel ticket');
    }
  },
  
  // Generate QR code for a ticket
  generateTicketQR: async (ticketId) => {
    try {
      // In a real app: const response = await api.get(`/tickets/${ticketId}/qr`);
      
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('You must be logged in to generate ticket QR codes');
      }
      
      // Find ticket
      const ticket = mockTickets.find(t => t.id === ticketId);
      
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      
      // Check if user owns the ticket
      if (ticket.userId !== user.id && user.role !== 'organizer' && user.role !== 'admin') {
        throw new Error('You can only generate QR codes for your own tickets');
      }
      
      // Check if ticket is valid
      if (ticket.status !== 'confirmed') {
        throw new Error(`Cannot generate QR code for ${ticket.status} ticket`);
      }
      
      // In a real app, we might regenerate the QR code for security
      // For now, just return the existing one
      
      return mockDelay({
        qrCodeUrl: ticket.qrCode,
        ticketNumber: ticket.ticketNumber,
        ticketId: ticket.id,
        eventId: ticket.eventId
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate QR code');
    }
  },
  
  // Verify ticket (for organizers/staff)
  verifyTicket: async (ticketCode) => {
    try {
      // In a real app: const response = await api.post('/tickets/verify', { ticketCode });
      
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('You must be logged in to verify tickets');
      }
      
      // Check if user is authorized to verify tickets
      if (user.role !== 'organizer' && user.role !== 'admin') {
        throw new Error('Unauthorized. Only organizers and admins can verify tickets');
      }
      
      // Parse ticket code
      // Format: TKT-{eventId}-{userId}-{timestamp}-{index}
      const parts = ticketCode.split('-');
      
      if (parts.length !== 5 || parts[0] !== 'TKT') {
        throw new Error('Invalid ticket code format');
      }
      
      const eventId = parts[1];
      const userId = parts[2];
      
      // Find the ticket
      const ticket = mockTickets.find(t => 
        t.eventId === eventId && 
        t.userId === userId && 
        t.qrCode.includes(ticketCode)
      );
      
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      
      // Check ticket status
      if (ticket.status === 'canceled') {
        throw new Error('This ticket has been canceled');
      }
      
      if (ticket.status === 'used') {
        throw new Error('This ticket has already been used');
      }
      
      // Mark ticket as used
      ticket.status = 'used';
      ticket.checked = true;
      ticket.checkedAt = new Date().toISOString();
      ticket.checkedBy = user.id;
      
      return mockDelay({
        message: 'Ticket verified successfully',
        ticket,
        valid: true
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify ticket');
    }
  },
  
  // Get event check-in stats (for organizers)
  getEventCheckInStats: async (eventId) => {
    try {
      // In a real app: const response = await api.get(`/events/${eventId}/check-in-stats`);
      
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('You must be logged in to view check-in stats');
      }
      
      // Check if user is authorized
      if (user.role !== 'organizer' && user.role !== 'admin') {
        throw new Error('Unauthorized. Only organizers and admins can view check-in stats');
      }
      
      // Filter tickets for this event
      const eventTickets = mockTickets.filter(t => t.eventId === eventId);
      
      // Calculate stats
      const stats = {
        totalTickets: eventTickets.length,
        checkedIn: eventTickets.filter(t => t.checked).length,
        notCheckedIn: eventTickets.filter(t => !t.checked && t.status === 'confirmed').length,
        canceled: eventTickets.filter(t => t.status === 'canceled').length,
        checkInRate: eventTickets.length > 0 
          ? Math.round((eventTickets.filter(t => t.checked).length / eventTickets.length) * 100) 
          : 0
      };
      
      return mockDelay(stats);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch check-in stats');
    }
  },

  // Get user's tickets
  getMyTickets: async () => {
    const response = await api.get('/tickets/my-tickets');
    return response.data;
  },

  // Purchase ticket
  purchaseTicket: async (eventId, quantity = 1) => {
    const response = await api.post('/tickets/purchase', { eventId, quantity });
    return response.data;
  },

  // Get event tickets (for organizers)
  getEventTickets: async (eventId) => {
    const response = await api.get(`/tickets/event/${eventId}`);
    return response.data;
  }
};

export { ticketService };
export default ticketService;