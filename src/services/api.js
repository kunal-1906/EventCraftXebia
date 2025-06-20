import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-backend-api.com/api', 
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login on auth error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Authentication service
export const authService = {
  login: async (email, password) => {
    // In a real app, this would be an API call
    // For this demo, we're simulating authentication
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock user data - this would come from your API
        const users = [
          { id: 'u001', name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'attendee' },
          { id: 'u002', name: 'Jane Smith', email: 'jane@example.com', password: 'password123', role: 'organizer' },
          { id: 'u003', name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'admin' }
        ];
        
        const user = users.find(user => user.email === email && user.password === password);
        
        if (user) {
          // Create a simple token (in a real app, this would be a JWT from your backend)
          const token = btoa(JSON.stringify({ id: user.id, email: user.email, exp: Date.now() + 3600000 }));
          
          // Don't include password in the returned user
          const { password, ...userWithoutPassword } = user;
          
          // Store in localStorage (in a real app, consider more secure options)
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          
          resolve({ user: userWithoutPassword, token });
        } else {
          throw new Error('Invalid credentials');
        }
      }, 500); // Simulate network delay
    });
  },
  
  register: async (name, email, password, role) => {
    // In a real app, this would be an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a new user
        const newUser = {
          id: 'u' + Math.floor(Math.random() * 10000),
          name,
          email,
          role
        };
        
        // Create a token
        const token = btoa(JSON.stringify({ id: newUser.id, email: newUser.email, exp: Date.now() + 3600000 }));
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        resolve({ user: newUser, token });
      }, 500);
    });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};
