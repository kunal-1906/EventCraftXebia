const express = require('express');
const router = express.Router();
const { checkJwt, checkUser, authorize } = require('../middleware/auth');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

// Get user's tickets
router.get('/', checkJwt, checkUser, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.dbUser._id })
      .populate('event', 'title date location status')
      .sort({ purchaseDate: -1 });
    
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific ticket
router.get('/:id', checkJwt, checkUser, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('event', 'title date location organizer')
      .populate('user', 'name email');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Check if user owns this ticket or is the event organizer
    if (
      ticket.user._id.toString() !== req.dbUser._id.toString() &&
      req.dbUser.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }
    
    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel ticket
router.put('/:id/cancel', checkJwt, checkUser, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('event');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Check if user owns this ticket
    if (ticket.user.toString() !== req.dbUser._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this ticket' });
    }
    
    // Check if event hasn't started yet
    if (new Date() >= new Date(ticket.event.date)) {
      return res.status(400).json({ message: 'Cannot cancel ticket for events that have already started' });
    }
    
    ticket.status = 'cancelled';
    await ticket.save();
    
    // Remove user from event attendees
    const event = await Event.findById(ticket.event._id);
    event.attendees = event.attendees.filter(
      attendee => attendee.user.toString() !== req.dbUser._id.toString()
    );
    await event.save();
    
    res.json({ message: 'Ticket cancelled successfully', ticket });
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check-in ticket (for organizers)
router.put('/:id/checkin', checkJwt, checkUser, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('event');
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Check if user is the event organizer or admin
    if (
      req.dbUser.role !== 'admin' &&
      ticket.event.organizer.toString() !== req.dbUser._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to check-in this ticket' });
    }
    
    ticket.status = 'used';
    ticket.checkInDate = new Date();
    await ticket.save();
    
    // Update attendee check-in status in event
    const event = await Event.findById(ticket.event._id);
    const attendee = event.attendees.find(
      att => att.user.toString() === ticket.user.toString()
    );
    if (attendee) {
      attendee.checkedIn = true;
    }
    await event.save();
    
    res.json({ message: 'Ticket checked in successfully', ticket });
  } catch (error) {
    console.error('Error checking in ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tickets for a specific event (organizer only)
router.get('/event/:eventId', checkJwt, checkUser, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is the event organizer or admin
    if (
      req.dbUser.role !== 'admin' &&
      event.organizer.toString() !== req.dbUser._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view tickets for this event' });
    }
    
    const tickets = await Ticket.find({ event: req.params.eventId })
      .populate('user', 'name email phone')
      .sort({ purchaseDate: -1 });
    
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching event tickets:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;