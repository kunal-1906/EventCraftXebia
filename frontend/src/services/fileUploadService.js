import authService from './authService';

// Helper function to simulate API delays
const mockDelay = (data, ms = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data }), ms);
  });
};

// Mock storage for uploaded files
const mockFileStorage = {
  events: {},
  profiles: {},
  documents: {}
};

const fileUploadService = {
  // Upload file (generic)
  uploadFile: async (file, category = 'documents', metadata = {}) => {
    try {
      // In a real app, this would upload to a storage service like S3
      
      // Simulate upload processing
      return new Promise((resolve) => {
        setTimeout(() => {
          const user = authService.getCurrentUser();
          
          if (!user) {
            throw new Error('Not authenticated');
          }
          
          // Create a unique ID for the file
          const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          
          // Create a mock URL for the file
          const fileUrl = `https://eventcraft-storage.example.com/${category}/${fileId}`;
          
          // Store file data in mock storage
          if (!mockFileStorage[category]) {
            mockFileStorage[category] = {};
          }
          
          mockFileStorage[category][fileId] = {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            url: fileUrl,
            uploadedBy: user.id,
            uploadedAt: new Date().toISOString(),
            metadata
          };
          
          resolve({
            data: {
              id: fileId,
              url: fileUrl,
              name: file.name,
              size: file.size,
              type: file.type
            }
          });
        }, 1500); // Longer delay to simulate upload time
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'File upload failed');
    }
  },
  
  // Upload event image
  uploadEventImage: async (file, eventId) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }
      
      // Upload with category and metadata
      return fileUploadService.uploadFile(file, 'events', { eventId });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Image upload failed');
    }
  },
  
  // Upload profile picture
  uploadProfilePicture: async (file) => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }
      
      const user = authService.getCurrentUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      // Upload with category and metadata
      const result = await fileUploadService.uploadFile(file, 'profiles', { userId: user.id });
      
      // In a real app, we would also update the user profile with the new image URL
      return result;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Profile picture upload failed');
    }
  },
  
  // Upload event document (like schedule, brochure, etc.)
  uploadEventDocument: async (file, eventId, documentType) => {
    try {
      // Validate file type (allow PDFs, docs, etc.)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PDF and document files are allowed');
      }
      
      // Upload with category and metadata
      return fileUploadService.uploadFile(file, 'documents', { 
        eventId, 
        documentType 
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Document upload failed');
    }
  },
  
  // Delete file
  deleteFile: async (fileId, category = 'documents') => {
    try {
      // In a real app: const response = await api.delete(`/files/${fileId}`);
      return new Promise((resolve) => {
        setTimeout(() => {
          const user = authService.getCurrentUser();
          
          if (!user) {
            throw new Error('Not authenticated');
          }
          
          // Check if file exists
          if (!mockFileStorage[category] || !mockFileStorage[category][fileId]) {
            throw new Error('File not found');
          }
          
          // Check if user has permission to delete (either owner or admin)
          const file = mockFileStorage[category][fileId];
          if (file.uploadedBy !== user.id && user.role !== 'admin') {
            throw new Error('Not authorized to delete this file');
          }
          
          // Delete file
          delete mockFileStorage[category][fileId];
          
          resolve({
            data: {
              message: 'File deleted successfully',
              fileId
            }
          });
        }, 500);
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete file');
    }
  },
  
  // Get files by category and metadata
  getFiles: async (category = 'documents', metadata = {}) => {
    try {
      // In a real app: const response = await api.get(`/files`, { params: { category, ...metadata } });
      return new Promise((resolve) => {
        setTimeout(() => {
          const user = authService.getCurrentUser();
          
          if (!user) {
            throw new Error('Not authenticated');
          }
          
          // Check if category exists
          if (!mockFileStorage[category]) {
            resolve({ data: [] });
            return;
          }
          
          // Filter files by metadata
          const files = Object.values(mockFileStorage[category]).filter(file => {
            // Match all metadata criteria
            return Object.entries(metadata).every(([key, value]) => {
              return file.metadata && file.metadata[key] === value;
            });
          });
          
          resolve({ data: files });
        }, 500);
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch files');
    }
  }
};

export default fileUploadService;