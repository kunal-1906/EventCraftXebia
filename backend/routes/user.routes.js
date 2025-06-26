const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { checkJwt, checkUser, authorize } = require('../middleware/auth');

// Get current user
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
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register new user from Auth0
router.post('/register', checkJwt, async (req, res) => {
  try {
    const { name, email, picture, auth0Id, role } = req.body;
    
    // Validate auth0Id matches token subject
    if (auth0Id !== req.auth.sub) {
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
      role: role || 'attendee' // Default to attendee if no role provided
    });
    
    await user.save();
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register new user from Auth0 (with Auth0 token)
router.post('/create-from-auth0', checkJwt, async (req, res) => {
  try {
    const { name, email, picture, auth0Id, role } = req.body;
    
    // Validate auth0Id matches token subject (skip in development)
    if (process.env.NODE_ENV !== 'development' && auth0Id !== req.auth.sub) {
      return res.status(400).json({ message: 'Auth0 ID mismatch' });
    }
    
    // Validate role
    const validRoles = ['attendee', 'organizer', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role',
        validRoles
      });
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
    console.log('New user created from Auth0:', user);
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user from Auth0:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create dummy user (for development purposes only)
router.post('/dummy', async (req, res) => {
  try {
    const { name, email, picture, auth0Id, role } = req.body;
    
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
      role: role || 'attendee' // Default to attendee if no role provided
    });
    
    await user.save();
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating dummy user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', checkJwt, checkUser, async (req, res) => {
  try {
    const { name, bio, phone, location, preferences } = req.body;
    
    // Find user and update
    const user = await User.findByIdAndUpdate(
      req.dbUser._id,
      {
        $set: {
          name: name || req.dbUser.name,
          bio: bio || req.dbUser.bio,
          phone: phone || req.dbUser.phone,
          location: location || req.dbUser.location,
          preferences: preferences || req.dbUser.preferences,
          updatedAt: Date.now()
        }
      },
      { new: true }
    );
    
    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes

// Get all users (admin only)
router.get('/', checkJwt, checkUser, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role (admin only)
router.put('/:userId/role', checkJwt, checkUser, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['attendee', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;