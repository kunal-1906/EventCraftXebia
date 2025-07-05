const express = require('express');
const router = express.Router();
const { checkJwt, checkUser, authorize } = require('../middleware/auth');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');
// We'll implement the controller later
// const eventController = require('../controllers/event.controller');

// Public event routes
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const category = req.query.category || '';
    
    let query = {
      // Only show approved and published events to public
      approvalStatus: 'approved',
      status: 'published'
    };
    
    // Search by title, description, or location
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Override status filter only if specific status requested
    if (status && status !== 'published') {
      query.status = status;
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Event.countDocuments(query);
    
    res.json({
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('attendees.user', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/search', (req, res) => {
  // Placeholder until we implement the controller
  res.status(200).json({ message: 'Search events endpoint' });
});

// Organizer event routes
router.post('/', checkJwt, checkUser, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      endDate,
      location,
      isVirtual,
      virtualLink,
      capacity,
      ticketPrice,
      category,
      tags,
      ticketTypes,
      image
    } = req.body;

    // Validation
    if (!title || !description || !date || !location || !category) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, description, date, location, category' 
      });
    }

    if (new Date(date) <= new Date()) {
      return res.status(400).json({ 
        message: 'Event date must be in the future' 
      });
    }

    if (endDate && new Date(endDate) <= new Date(date)) {
      return res.status(400).json({ 
        message: 'End date must be after start date' 
      });
    }

    // Create new event
    const event = new Event({
      title,
      description,
      date,
      endDate,
      location,
      isVirtual: isVirtual || false,
      virtualLink,
      capacity: capacity || 100,
      ticketPrice: ticketPrice || 0,
      category,
      tags: tags || [],
      ticketTypes: ticketTypes || [{
        name: 'General Admission',
        price: ticketPrice || 0,
        description: 'Standard event admission',
        quantity: capacity || 100,
        quantitySold: 0
      }],
      image: image || '',
      organizer: req.dbUser._id,
      // Admin can directly publish, organizers need approval
      status: req.dbUser.role === 'admin' ? 'published' : 'pending_approval',
      approvalStatus: req.dbUser.role === 'admin' ? 'approved' : 'pending',
      submittedForApproval: req.dbUser.role === 'organizer',
      submittedAt: req.dbUser.role === 'organizer' ? new Date() : undefined,
      approvedBy: req.dbUser.role === 'admin' ? req.dbUser._id : undefined,
      approvedAt: req.dbUser.role === 'admin' ? new Date() : undefined
    });

    await event.save();
    
    // Populate organizer info for response
    await event.populate('organizer', 'name email');

    const responseMessage = req.dbUser.role === 'admin' 
      ? 'Event created and published successfully!'
      : 'Event created and submitted for admin approval!';

    res.status(201).json({
      message: responseMessage,
      event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', checkJwt, checkUser, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const eventId = req.params.id;
    const updateData = req.body;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer or admin
    if (req.dbUser.role !== 'admin' && event.organizer.toString() !== req.dbUser._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    // Update validation
    if (updateData.date && new Date(updateData.date) <= new Date()) {
      return res.status(400).json({ message: 'Event date must be in the future' });
    }

    if (updateData.endDate && updateData.date && new Date(updateData.endDate) <= new Date(updateData.date)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('organizer', 'name email');

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', checkJwt, checkUser, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const eventId = req.params.id;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer or admin
    if (req.dbUser.role !== 'admin' && event.organizer.toString() !== req.dbUser._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Check if event has attendees
    if (event.attendees.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete event with registered attendees. Cancel the event instead.' 
      });
    }

    // Delete the event
    await Event.findByIdAndDelete(eventId);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Event registration routes
router.post('/:id/register', checkJwt, checkUser, async (req, res) => {
  try {
    const { ticketType, quantity = 1 } = req.body;
    const eventId = req.params.id;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.status !== 'published') {
      return res.status(400).json({ message: 'Event is not available for registration' });
    }
    
    // Create ticket(s)
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticket = new Ticket({
        event: eventId,
        user: req.dbUser._id,
        ticketType,
        price: event.ticketPrice || 0,
        status: 'confirmed'
      });
      tickets.push(ticket);
    }
    
    await Ticket.insertMany(tickets);

    // Add notification after successful registration
    const user = await User.findById(req.user.id);
        
    // Send confirmation email
    if (user.preferences?.notifications?.email) {
      await emailService.sendEventConfirmation(user, event);
        console.log(`✅ Registration confirmation email sent to ${user.email}`);
    }
        
    // Send confirmation SMS
    if (user.preferences?.notifications?.sms && user.phone) {
      await smsService.sendEventConfirmation(user, event);
        console.log(`✅ Registration confirmation SMS sent to ${user.phone}`);
    }
    
    res.status(201).json({ message: 'Registration successful', tickets });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/attendees', checkJwt, checkUser, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const tickets = await Ticket.find({ event: req.params.id })
      .populate('user', 'name email')
      .populate('event', 'title');
    
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching event attendees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Event feedback routes
router.post('/:id/feedback', checkJwt, checkUser, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const eventId = req.params.id;
    
    // Check if user has attended this event
    const ticket = await Ticket.findOne({ 
      event: eventId, 
      user: req.dbUser._id,
      status: 'confirmed'
    });
    
    if (!ticket) {
      return res.status(400).json({ message: 'You must attend the event to leave feedback' });
    }
    
    // Add feedback to event (you might want to create a separate Feedback model)
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // For now, we'll just return success
    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/feedback', (req, res) => {
  // Placeholder until we implement the controller
  res.status(200).json({ message: 'Get event feedback endpoint' });
});

// Get upcoming events (for attendees)
router.get('/upcoming', async (req, res) => {
  try {
    const events = await Event.find({ 
      status: 'published',
      date: { $gte: new Date() }
    })
    .populate('organizer', 'name')
    .sort({ date: 1 })
    .limit(20);
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get organizer's events
router.get('/organizer', checkJwt, checkUser, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.dbUser._id })
      .sort({ createdAt: -1 });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching organizer events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event analytics for organizer
router.get('/analytics', checkJwt, checkUser, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const organizerId = req.dbUser._id;
    
    // Get organizer's events
    const events = await Event.find({ organizer: organizerId });
    const eventIds = events.map(e => e._id);
    
    // Get tickets for organizer's events
    const tickets = await Ticket.find({ event: { $in: eventIds } });
    
    // Calculate analytics
    const totalEvents = events.length;
    const totalAttendees = tickets.length;
    const totalRevenue = tickets.reduce((sum, ticket) => sum + (ticket.price || 0), 0);
    const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
    
    // Get events by status
    const publishedEvents = events.filter(e => e.status === 'published').length;
    const draftEvents = events.filter(e => e.status === 'draft').length;
    const cancelledEvents = events.filter(e => e.status === 'cancelled').length;
    
    res.json({
      totalEvents,
      totalAttendees,
      totalRevenue,
      upcomingEvents,
      publishedEvents,
      draftEvents,
      cancelledEvents,
      events: events.slice(0, 5) // Return latest 5 events for dashboard
    });
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes for event management
// Get event analytics
router.get('/analytics', checkJwt, checkUser, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const organizerId = req.dbUser._id;
    
    // Get organizer's events
    const events = await Event.find({ organizer: organizerId });
    
    // Calculate analytics
    const totalEvents = events.length;
    const totalAttendees = events.reduce((total, event) => total + (event.attendees?.length || 0), 0);
    
    // Calculate total revenue from tickets
    const eventIds = events.map(e => e._id);
    const tickets = await Ticket.find({ event: { $in: eventIds } });
    const totalRevenue = tickets.reduce((total, ticket) => total + ticket.price, 0);
    
    // Calculate average views (using a mock value since views field doesn't exist)
    const avgViews = events.length > 0 ? events.reduce((total, event) => total + (event.attendees?.length * 10 || 0), 0) / events.length : 0;
    
    res.json({
      totalEvents,
      totalAttendees,
      totalRevenue,
      avgViews: Math.round(avgViews)
    });
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new event
router.post('/', checkJwt, checkUser, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { title, description, date, endDate, location, isVirtual, virtualLink, capacity, ticketPrice, ticketTypes, category, tags } = req.body;
    
    const event = new Event({
      title,
      description,
      date,
      endDate,
      location,
      isVirtual: isVirtual || false,
      virtualLink,
      capacity,
      ticketPrice: ticketPrice || 0,
      ticketTypes: ticketTypes || [],
      category,
      tags: tags || [],
      organizer: req.dbUser._id,
      status: 'draft' // Events start as draft and need admin approval
    });
    
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/:eventId', checkJwt, checkUser, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.eventId, organizer: req.dbUser._id },
      req.body,
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/:eventId', checkJwt, checkUser, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.eventId,
      organizer: req.dbUser._id
    });
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single event
router.get('/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .populate('organizer', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin approval routes
// Get events pending approval (Admin only)
router.get('/admin/pending', checkJwt, checkUser, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const events = await Event.find({ 
      $or: [
        { status: 'pending_approval' },
        { approvalStatus: 'pending', submittedForApproval: true }
      ]
    })
      .populate('organizer', 'name email')
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    const total = await Event.countDocuments({ 
      $or: [
        { status: 'pending_approval' },
        { approvalStatus: 'pending', submittedForApproval: true }
      ]
    });
    
    res.json({
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching pending events:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve event (Admin only)
router.put('/:eventId/approve', checkJwt, checkUser, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.approvalStatus !== 'pending' && event.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Event is not pending approval' });
    }
    
    event.approvalStatus = 'approved';
    event.status = 'published';
    event.approvedBy = req.dbUser._id;
    event.approvedAt = new Date();
    
    await event.save();
    
    // Populate organizer info for response
    await event.populate('organizer', 'name email');
    await event.populate('approvedBy', 'name email');
    
    // Send approval notification to organizer
    const organizer = event.organizer;
    console.log(`Sending approval notification to organizer: ${organizer.email}`);
    
    if (organizer.preferences?.notifications?.email) {
      await emailService.sendEventApprovalNotification(organizer, event);
      console.log(`✅ Approval email sent to ${organizer.email}`);
    }
    
    if (organizer.preferences?.notifications?.sms && organizer.phone) {
      await smsService.sendEventApprovalNotification(organizer, event);
      console.log(`✅ Approval SMS sent to ${organizer.phone}`);
    }
    
    res.json({
      message: 'Event approved and published successfully!',
      event
    });
  } catch (error) {
    console.error('Error approving event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject event (Admin only)
router.put('/:eventId/reject', checkJwt, checkUser, authorize('admin'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.approvalStatus !== 'pending') {
      return res.status(400).json({ message: 'Event is not pending approval' });
    }
    
    event.approvalStatus = 'rejected';
    event.status = 'rejected';
    event.rejectionReason = rejectionReason;
    event.approvedBy = req.dbUser._id;
    event.approvedAt = new Date();
    
    await event.save();
    
    // Populate organizer info for response
    await event.populate('organizer', 'name email');
    await event.populate('approvedBy', 'name email');
    
    res.json({
      message: 'Event rejected successfully!',
      event
    });
  } catch (error) {
    console.error('Error rejecting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get approval statistics (Admin only)
router.get('/admin/approval-stats', checkJwt, checkUser, authorize('admin'), async (req, res) => {
  try {
    const pending = await Event.countDocuments({ 
      approvalStatus: 'pending',
      submittedForApproval: true 
    });
    
    const approved = await Event.countDocuments({ approvalStatus: 'approved' });
    const rejected = await Event.countDocuments({ approvalStatus: 'rejected' });
    const published = await Event.countDocuments({ status: 'published' });
    
    res.json({
      pending,
      approved,
      rejected,
      published,
      total: pending + approved + rejected
    });
  } catch (error) {
    console.error('Error fetching approval stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;