const express = require('express');
const router = express.Router();
const { expressjwt: jwt } = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const User = require('../models/User');
// We'll implement the controller later
// const authController = require('../controllers/auth.controller');

// Auth0 middleware for validating JWT tokens
const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

// Check if user exists in our database
router.post('/check-user', async (req, res) => {
  try {
    const { auth0Id, email } = req.body;
    
    if (!auth0Id) {
      return res.status(400).json({ message: 'Auth0 ID is required' });
    }
    
    console.log('Checking if user exists:', { auth0Id, email });
    
    // Find user in database
    const user = await User.findOne({ auth0Id });
    
    if (user) {
      console.log('User found:', user);
      return res.json({ 
        exists: true,
        user
      });
    }
    
    console.log('User not found with auth0Id:', auth0Id);
    res.json({ exists: false });
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Authentication routes
router.post('/register', checkJwt, async (req, res) => {
  try {
    const { name, email, picture, auth0Id, role } = req.body;
    
    // Validate required fields
    if (!name || !email || !auth0Id || !role) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['name', 'email', 'auth0Id', 'role']
      });
    }
    
    // Validate role
    const validRoles = ['attendee', 'organizer', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role',
        validRoles
      });
    }
    
    // Validate auth0Id matches token subject if JWT is present
    if (req.auth && auth0Id !== req.auth.sub) {
      return res.status(400).json({ message: 'Auth0 ID mismatch' });
    }
    
    // Check if user already exists
    let user = await User.findOne({ auth0Id });
    
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      name,
      email,
      picture,
      auth0Id,
      role
    });
    
    await user.save();
    console.log('New user created:', user);
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', (req, res) => {
  // Placeholder until we implement the controller
  res.status(200).json({ message: 'Login endpoint' });
});

router.post('/forgot-password', (req, res) => {
  // Placeholder until we implement the controller
  res.status(200).json({ message: 'Forgot password endpoint' });
});

router.post('/reset-password', (req, res) => {
  // Placeholder until we implement the controller
  res.status(200).json({ message: 'Reset password endpoint' });
});

// Get current user from Auth0 token
router.get('/me', checkJwt, async (req, res) => {
  try {
    // Get Auth0 user ID from token
    const auth0Id = req.auth.sub;
    
    // Find user in database
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  // Placeholder until we implement the controller
  res.status(200).json({ message: 'Logout endpoint' });
});

module.exports = router; 