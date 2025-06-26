const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const User = require('../models/User');

// Auth0 middleware for validating JWT tokens
const checkJwt = (req, res, next) => {
  // Completely bypass JWT validation in development mode
  if (process.env.NODE_ENV === 'development') {
    // Create mock auth object for development
    req.auth = {
      sub: 'dev-user-123',
      email: 'dev@example.com'
    };
    return next();
  }
  
  // Use actual JWT validation in production
  const jwtMiddleware = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
    }),
    audience: process.env.AUTH0_AUDIENCE || false,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    algorithms: ['RS256'],
    credentialsRequired: true
  });
  
  return jwtMiddleware(req, res, next);
};

// Middleware to check if user exists in our database
const checkUser = async (req, res, next) => {
  try {
    // Bypass user check in development mode
    if (process.env.NODE_ENV === 'development') {
      // Check for role header to simulate different users
      const mockRole = req.headers['x-mock-role'] || 'organizer'; // Default to organizer
      
      // Create mock users based on role
      const mockUsers = {
        admin: {
          _id: '123456789012345678901234',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin'
        },
        organizer: {
          _id: '123456789012345678901235',
          name: 'Organizer User', 
          email: 'organizer@example.com',
          role: 'organizer'
        },
        attendee: {
          _id: '123456789012345678901236',
          name: 'Attendee User',
          email: 'attendee@example.com', 
          role: 'attendee'
        }
      };
      
      req.dbUser = mockUsers[mockRole] || mockUsers.organizer;
      return next();
    }

    if (!req.auth || !req.auth.sub) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }

    const user = await User.findOne({ auth0Id: req.auth.sub });

    if (!user) {
      return res.status(404).json({ message: 'User not found in database' });
    }

    // Add user to request object
    req.dbUser = user;
    next();
  } catch (error) {
    console.error('Error in checkUser middleware:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to authorize based on user role
const authorize = (roles) => {
  return (req, res, next) => {
    // Bypass role check in development mode
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    if (!req.dbUser) {
      return res.status(401).json({ message: 'User not found in request' });
    }

    const role = req.dbUser.role;
    
    // If roles is a string, convert to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ 
        message: 'Access denied: insufficient permissions' 
      });
    }
    
    next();
  };
};

module.exports = { checkJwt, checkUser, authorize }; 