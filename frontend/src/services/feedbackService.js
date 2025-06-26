import api from './api';
import authService from './authService';
import { mockEvents } from './eventService';

// Helper function to simulate API delays
const mockDelay = (data, ms = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), ms);
  });
};

// Mock data for reviews
const mockReviews = [
  {
    id: 'rev001',
    eventId: 'e001',
    userId: 'u001',
    userName: 'John Doe',
    rating: 4.5,
    comment: 'Great event! Well organized and informative.',
    date: '2024-06-01T10:15:00',
    status: 'approved',
    helpful: 5,
    unhelpful: 1
  },
  {
    id: 'rev002',
    eventId: 'e002',
    userId: 'u001',
    userName: 'John Doe',
    rating: 3.0,
    comment: 'The event was okay, but could have been better organized.',
    date: '2024-05-20T15:30:00',
    status: 'approved',
    helpful: 2,
    unhelpful: 1
  }
];

// Mock data for reports
const mockReports = [
  {
    id: 'rep001',
    entityType: 'event', // event, review, user
    entityId: 'e003',
    reporterId: 'u001',
    reason: 'inappropriate_content',
    description: 'This event contains inappropriate imagery in the poster.',
    date: '2024-06-05T08:45:00',
    status: 'pending' // pending, resolved, dismissed
  }
];

const feedbackService = {
  // Submit a review for an event
  submitReview: async (eventId, { rating, comment }) => {
    try {
      // In a real app: const response = await api.post(`/events/${eventId}/reviews`, { rating, comment });
      
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('You must be logged in to submit a review');
      }
      
      // Check if user has already reviewed this event
      const existingReview = mockReviews.find(r => r.eventId === eventId && r.userId === user.id);
      
      if (existingReview) {
        throw new Error('You have already reviewed this event');
      }
      
      // Create new review
      const newReview = {
        id: 'rev' + Math.floor(Math.random() * 10000),
        eventId,
        userId: user.id,
        userName: user.name,
        rating,
        comment,
        date: new Date().toISOString(),
        status: 'pending',
        helpful: 0,
        unhelpful: 0
      };
      
      mockReviews.push(newReview);
      
      return mockDelay({
        message: 'Review submitted successfully',
        review: newReview
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit review');
    }
  },
  
  // Update an existing review
  updateReview: async (reviewId, { rating, comment }) => {
    try {
      // In a real app: const response = await api.put(`/reviews/${reviewId}`, { rating, comment });
      
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('You must be logged in to update a review');
      }
      
      // Find review
      const reviewIndex = mockReviews.findIndex(r => r.id === reviewId);
      
      if (reviewIndex === -1) {
        throw new Error('Review not found');
      }
      
      const review = mockReviews[reviewIndex];
      
      // Check if user is the author of the review
      if (review.userId !== user.id) {
        throw new Error('You can only update your own reviews');
      }
      
      // Update review
      mockReviews[reviewIndex] = {
        ...review,
        rating,
        comment,
        date: new Date().toISOString(), // Update the date to show it was edited
        status: 'pending' // Reset status to pending for re-moderation
      };
      
      return mockDelay({
        message: 'Review updated successfully',
        review: mockReviews[reviewIndex]
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update review');
    }
  },
  
  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      // In a real app: const response = await api.delete(`/reviews/${reviewId}`);
      
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('You must be logged in to delete a review');
      }
      
      // Find review
      const reviewIndex = mockReviews.findIndex(r => r.id === reviewId);
      
      if (reviewIndex === -1) {
        throw new Error('Review not found');
      }
      
      const review = mockReviews[reviewIndex];
      
      // Check if user is the author of the review or an admin
      if (review.userId !== user.id && user.role !== 'admin') {
        throw new Error('You can only delete your own reviews');
      }
      
      // Delete review
      const deleted = mockReviews.splice(reviewIndex, 1)[0];
      
      return mockDelay({
        message: 'Review deleted successfully',
        review: deleted
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete review');
    }
  },
  
  // Get reviews for an event
  getEventReviews: async (eventId, options = {}) => {
    try {
      // In a real app: const response = await api.get(`/events/${eventId}/reviews`, { params: options });
      
      // Filter reviews for the specified event
      let eventReviews = mockReviews.filter(r => r.eventId === eventId);
      
      // If not admin, only show approved reviews
      const user = authService.getCurrentUser();
      if (!user || user.role !== 'admin') {
        eventReviews = eventReviews.filter(r => r.status === 'approved');
      }
      
      // Apply sorting if specified
      if (options.sort === 'newest') {
        eventReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
      } else if (options.sort === 'highest') {
        eventReviews.sort((a, b) => b.rating - a.rating);
      } else if (options.sort === 'lowest') {
        eventReviews.sort((a, b) => a.rating - b.rating);
      } else if (options.sort === 'most_helpful') {
        eventReviews.sort((a, b) => b.helpful - a.helpful);
      }
      
      // Calculate average rating
      const totalRating = eventReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = eventReviews.length > 0 ? totalRating / eventReviews.length : 0;
      
      return mockDelay({
        reviews: eventReviews,
        totalReviews: eventReviews.length,
        averageRating: parseFloat(averageRating.toFixed(1))
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reviews');
    }
  },
  
  // Get reviews by a user
  getUserReviews: async () => {
    try {
      // In a real app: const response = await api.get('/user/reviews');
      
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('You must be logged in to view your reviews');
      }
      
      // Filter reviews for the current user
      const userReviews = mockReviews.filter(r => r.userId === user.id);
      
      return mockDelay(userReviews);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user reviews');
    }
  },
  
  // Mark a review as helpful/unhelpful
  rateReview: async (reviewId, isHelpful) => {
    try {
      // In a real app: const response = await api.post(`/reviews/${reviewId}/rate`, { isHelpful });
      
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('You must be logged in to rate a review');
      }
      
      // Find review
      const reviewIndex = mockReviews.findIndex(r => r.id === reviewId);
      
      if (reviewIndex === -1) {
        throw new Error('Review not found');
      }
      
      // Update helpful/unhelpful count
      if (isHelpful) {
        mockReviews[reviewIndex].helpful += 1;
      } else {
        mockReviews[reviewIndex].unhelpful += 1;
      }
      
      return mockDelay({
        message: `Review marked as ${isHelpful ? 'helpful' : 'unhelpful'}`,
        review: mockReviews[reviewIndex]
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to rate review');
    }
  },
  
  // Submit a report for inappropriate content
  submitReport: async (entityType, entityId, { reason, description }) => {
    try {
      // In a real app: const response = await api.post('/reports', { entityType, entityId, reason, description });
      
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('You must be logged in to submit a report');
      }
      
      // Check if user has already reported this entity
      const existingReport = mockReports.find(
        r => r.entityType === entityType && 
        r.entityId === entityId && 
        r.reporterId === user.id &&
        r.status === 'pending'
      );
      
      if (existingReport) {
        throw new Error('You have already reported this content');
      }
      
      // Create new report
      const newReport = {
        id: 'rep' + Math.floor(Math.random() * 10000),
        entityType,
        entityId,
        reporterId: user.id,
        reason,
        description,
        date: new Date().toISOString(),
        status: 'pending'
      };
      
      mockReports.push(newReport);
      
      return mockDelay({
        message: 'Report submitted successfully',
        report: newReport
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit report');
    }
  },
  
  // Get all reports (admin only)
  getReports: async (options = {}) => {
    try {
      // In a real app: const response = await api.get('/admin/reports', { params: options });
      
      const user = authService.getCurrentUser();
      
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized. Only admins can view reports');
      }
      
      // Filter reports based on options
      let filteredReports = [...mockReports];
      
      if (options.status) {
        filteredReports = filteredReports.filter(r => r.status === options.status);
      }
      
      if (options.entityType) {
        filteredReports = filteredReports.filter(r => r.entityType === options.entityType);
      }
      
      // Sort by date, newest first
      filteredReports.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      return mockDelay(filteredReports);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reports');
    }
  },
  
  // Update report status (admin only)
  updateReportStatus: async (reportId, status) => {
    try {
      // In a real app: const response = await api.put(`/admin/reports/${reportId}`, { status });
      
      const user = authService.getCurrentUser();
      
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized. Only admins can update report status');
      }
      
      // Find report
      const reportIndex = mockReports.findIndex(r => r.id === reportId);
      
      if (reportIndex === -1) {
        throw new Error('Report not found');
      }
      
      // Update status
      mockReports[reportIndex].status = status;
      mockReports[reportIndex].resolvedBy = user.id;
      mockReports[reportIndex].resolvedAt = new Date().toISOString();
      
      return mockDelay({
        message: `Report marked as ${status}`,
        report: mockReports[reportIndex]
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update report status');
    }
  }
};

export default feedbackService;
export { mockReviews, mockReports }; 