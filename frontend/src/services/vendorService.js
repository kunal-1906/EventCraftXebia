import api from './api';
import authService from './authService';

// Mock vendors data
const mockVendors = [
  {
    id: 'v001',
    name: 'Food Delights',
    description: 'Catering services for all types of events',
    contactEmail: 'food@example.com',
    contactPhone: '555-123-4567',
    services: ['catering', 'food trucks'],
    rating: 4.8,
  },
  {
    id: 'v002',
    name: 'Sound Systems Pro',
    description: 'Professional audio and lighting equipment',
    contactEmail: 'sound@example.com',
    contactPhone: '555-987-6543',
    services: ['audio equipment', 'lighting', 'stage setup'],
    rating: 4.5,
  }
];

// Helper function to simulate API delays
const mockDelay = (data, ms = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), ms);
  });
};

const vendorService = {
  // Get all vendors
  getVendors: async () => {
    try {
      // In a real app: const response = await api.get('/vendors');
      return mockDelay(mockVendors);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendors');
    }
  },
  
  // Get vendor by ID
  getVendor: async (id) => {
    try {
      // In a real app: const response = await api.get(`/vendors/${id}`);
      const vendor = mockVendors.find(v => v.id === id);
      
      if (!vendor) {
        throw new Error('Vendor not found');
      }
      
      return mockDelay(vendor);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendor');
    }
  },
  
  // Create new vendor
  createVendor: async (vendorData) => {
    try {
      // In a real app: const response = await api.post('/vendors', vendorData);
      const newVendor = {
        id: 'v' + Math.floor(Math.random() * 10000),
        ...vendorData,
        rating: 0,
        createdAt: new Date().toISOString()
      };
      
      mockVendors.push(newVendor);
      return mockDelay(newVendor);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create vendor');
    }
  },
  
  // Update vendor
  updateVendor: async (id, vendorData) => {
    try {
      // In a real app: const response = await api.put(`/vendors/${id}`, vendorData);
      const index = mockVendors.findIndex(v => v.id === id);
      
      if (index === -1) {
        throw new Error('Vendor not found');
      }
      
      // Update vendor
      mockVendors[index] = { ...mockVendors[index], ...vendorData };
      return mockDelay(mockVendors[index]);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update vendor');
    }
  },
  
  // Delete vendor
  deleteVendor: async (id) => {
    try {
      // In a real app: const response = await api.delete(`/vendors/${id}`);
      const index = mockVendors.findIndex(v => v.id === id);
      
      if (index === -1) {
        throw new Error('Vendor not found');
      }
      
      const deleted = mockVendors.splice(index, 1)[0];
      return mockDelay({ message: 'Vendor deleted successfully', vendor: deleted });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete vendor');
    }
  }
};

export default vendorService;
export { mockVendors }; 