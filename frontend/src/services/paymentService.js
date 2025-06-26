import api from './api';
import authService from './authService';

// Helper function to simulate API delays
const mockDelay = (data, ms = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), ms);
  });
};

// Mock payment history data
const mockPayments = [
  {
    id: 'pmt001',
    userId: 'u001',
    eventId: 'e001',
    eventTitle: 'Tech Conference 2024',
    amount: 299.99,
    date: '2024-06-15T10:30:00',
    status: 'completed',
    paymentMethod: 'credit_card'
  }
];

const paymentService = {
  // Process payment
  processPayment: async (paymentData) => {
    try {
      // In a real app: const response = await api.post('/payments/process', paymentData);
      
      // Simulate payment processing
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Randomly succeed or fail to simulate real payment processing
          const isSuccessful = Math.random() > 0.2; // 80% success rate
          
          if (isSuccessful) {
            const user = authService.getCurrentUser();
            
            // Create a new payment record
            const newPayment = {
              id: 'pmt' + Math.floor(Math.random() * 10000),
              userId: user?.id || paymentData.userId,
              eventId: paymentData.eventId,
              eventTitle: paymentData.eventTitle,
              amount: paymentData.amount,
              date: new Date().toISOString(),
              status: 'completed',
              paymentMethod: paymentData.paymentMethod || 'credit_card'
            };
            
            // Add to mock payments
            mockPayments.push(newPayment);
            
            resolve({
              data: {
                success: true,
                payment: newPayment,
                transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
                message: 'Payment successful!'
              }
            });
          } else {
            reject(new Error('Payment processing failed. Please try again.'));
          }
        }, 1500); // Longer delay to simulate payment processing
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Payment failed');
    }
  },
  
  // Get payment history
  getPaymentHistory: async () => {
    try {
      // In a real app: const response = await api.get('/payments/history');
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      // Filter payments for current user
      const userPayments = mockPayments.filter(p => p.userId === user.id);
      
      return mockDelay(userPayments);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment history');
    }
  },
  
  // Get payment details
  getPaymentDetails: async (paymentId) => {
    try {
      // In a real app: const response = await api.get(`/payments/${paymentId}`);
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      // Find payment
      const payment = mockPayments.find(p => p.id === paymentId && p.userId === user.id);
      
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      return mockDelay(payment);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment details');
    }
  },
  
  // Get event revenue (for organizers)
  getEventRevenue: async (eventId) => {
    try {
      // In a real app: const response = await api.get(`/events/${eventId}/revenue`);
      const user = authService.getCurrentUser();
      
      if (!user || (user.role !== 'organizer' && user.role !== 'admin')) {
        throw new Error('Unauthorized');
      }
      
      // Get all payments for this event
      const eventPayments = mockPayments.filter(p => p.eventId === eventId);
      
      // Calculate revenue
      const totalRevenue = eventPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const paymentCount = eventPayments.length;
      
      return mockDelay({
        eventId,
        totalRevenue,
        paymentCount,
        payments: eventPayments
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch event revenue');
    }
  },
  
  // Generate receipt/invoice
  generateReceipt: async (paymentId) => {
    try {
      // In a real app: const response = await api.get(`/payments/${paymentId}/receipt`);
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      // Find payment
      const payment = mockPayments.find(p => p.id === paymentId && p.userId === user.id);
      
      if (!payment) {
        throw new Error('Payment not found');
      }
      
      // Generate receipt data
      const receiptData = {
        receiptNumber: 'REC-' + payment.id,
        date: payment.date,
        customerName: user.name,
        customerEmail: user.email,
        paymentId: payment.id,
        eventTitle: payment.eventTitle,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        taxAmount: payment.amount * 0.1, // 10% tax
        totalAmount: payment.amount * 1.1
      };
      
      return mockDelay(receiptData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate receipt');
    }
  }
};

export default paymentService; 