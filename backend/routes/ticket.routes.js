const express = require('express');
const router = express.Router();
const { checkJwt, checkUser, authorize } = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
// We'll implement the controller later
// const ticketController = require('../controllers/ticket.controller');

// Ticket routes
router.get('/', (req, res) => {
  // Placeholder until we implement the controller
  res.status(200).json({ message: 'Get all tickets endpoint' });
});

router.get('/:id', (req, res) => {
  // Placeholder until we implement the controller
  res.status(200).json({ message: 'Get ticket by ID endpoint' });
});

router.post('/', (req, res) => {
  // Placeholder until we implement the controller
  res.status(200).json({ message: 'Create ticket endpoint' });
});

router.put('/:id', (req, res) => {
  // Placeholder until we implement the controller
  res.status(200).json({ message: 'Update ticket endpoint' });
});

router.delete('/:id', (req, res) => {
  // Placeholder until we implement the controller
  res.status(200).json({ message: 'Delete ticket endpoint' });
});

// Ticket verification routes
router.post('/:id/verify', (req, res) => {
  // Placeholder until we implement the controller
  res.status(200).json({ message: 'Verify ticket endpoint' });
});

// QR code generation
router.get('/:id/qrcode', (req, res) => {
  // Placeholder until we implement the controller
  res.status(200).json({ message: 'Generate QR code endpoint' });
});

// Get user's tickets
router.get('/my-tickets', checkJwt, checkUser, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.dbUser._id })
      .populate('event', 'title date location image')
      .sort({ createdAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Purchase ticket
router.post('/purchase', checkJwt, checkUser, async (req, res) => {
  try {
    const { eventId, ticketType, quantity = 1 } = req.body;
    
    // Check if event exists and is published
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.status !== 'published') {
      return res.status(400).json({ message: 'Event is not available for ticket purchase' });
    }
    
    // Find the ticket type
    const selectedTicketType = event.ticketTypes.find(tt => tt.name === ticketType);
    if (!selectedTicketType) {
      return res.status(400).json({ message: 'Invalid ticket type' });
    }
    
    // Check capacity
    if (selectedTicketType.quantitySold + quantity > selectedTicketType.quantity) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }
    
    // Create tickets
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticket = new Ticket({
        event: eventId,
        user: req.dbUser._id,
        ticketType: ticketType,
        price: selectedTicketType.price,
        status: 'active'
      });
      tickets.push(ticket);
    }
    
    await Ticket.insertMany(tickets);
    
    // Update ticket type sold count
    selectedTicketType.quantitySold += quantity;
    await event.save();
    
    res.status(201).json(tickets);
  } catch (error) {
    console.error('Error purchasing tickets:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ticket details
router.get('/:ticketId', checkJwt, checkUser, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId)
      .populate('event', 'title date location description image')
      .populate('user', 'name email');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Check if user owns the ticket or is admin
    if (ticket.user._id.toString() !== req.dbUser._id.toString() && req.dbUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel ticket
router.put('/:ticketId/cancel', checkJwt, checkUser, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Check if user owns the ticket
    if (ticket.user.toString() !== req.dbUser._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    ticket.status = 'cancelled';
    await ticket.save();
    
    res.json(ticket);
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event tickets (for organizers)
router.get('/event/:eventId', checkJwt, checkUser, authorize('organizer', 'admin'), async (req, res) => {
  try {
    // Check if user is the organizer of this event
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.organizer.toString() !== req.dbUser._id.toString() && req.dbUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const tickets = await Ticket.find({ event: req.params.eventId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching event tickets:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 