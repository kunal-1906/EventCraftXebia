const express = require('express');
const router = express.Router();
const { checkJwt, checkUser, authorize } = require('../middleware/auth');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const emailService = require('../services/emailService');
const smsService = require('../services/smsService');

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

// SPECIFIC ROUTES MUST COME BEFORE GENERIC /:id ROUTE

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

// Admin approval routes - MUST BE BEFORE /:id routes
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

// NOW THE GENERIC /:id ROUTE
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

// Create new event
router.post('/', checkJwt, checkUser, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { ticketTypes, ticketPrice, capacity } = req.body;
    
    const eventData = {
      ...req.body,
      organizer: req.dbUser._id,
      // Create default ticket type if none provided (matching eventcraft2 behavior)
      ticketTypes: ticketTypes || [{
        name: 'General Admission',
        price: ticketPrice || 0,
        description: 'Standard event admission',
        quantity: capacity || 100,
        quantitySold: 0
      }],
      // Admin can directly publish, organizers need approval (matching eventcraft2 behavior)
      status: req.dbUser.role === 'admin' ? 'published' : 'pending_approval',
      approvalStatus: req.dbUser.role === 'admin' ? 'approved' : 'pending',
      submittedForApproval: req.dbUser.role === 'organizer',
      submittedAt: req.dbUser.role === 'organizer' ? new Date() : undefined,
      approvedBy: req.dbUser.role === 'admin' ? req.dbUser._id : undefined,
      approvedAt: req.dbUser.role === 'admin' ? new Date() : undefined
    };
    
    const event = new Event(eventData);
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
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/:id', checkJwt, checkUser, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is organizer or admin
    if (req.dbUser.role !== 'admin' && event.organizer.toString() !== req.dbUser._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('organizer', 'name email');
    
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', checkJwt, checkUser, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is organizer or admin
    if (req.dbUser.role !== 'admin' && event.organizer.toString() !== req.dbUser._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit event for approval
router.put('/:id/submit', checkJwt, checkUser, authorize('organizer'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user is organizer
    if (event.organizer.toString() !== req.dbUser._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to submit this event' });
    }
    
    event.submittedForApproval = true;
    event.submittedAt = new Date();
    event.status = 'pending_approval';
    event.approvalStatus = 'pending';
    
    await event.save();
    
    res.json({ message: 'Event submitted for approval', event });
  } catch (error) {
    console.error('Error submitting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve event (Admin only)
router.put('/:eventId/approve', checkJwt, checkUser, authorize('admin'), async (req, res) => {
  try {
    console.log('🔍 Starting event approval process...');
    
    // First, find and populate the event with organizer
    const event = await Event.findById(req.params.eventId).populate('organizer', 'name email preferences phone');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    console.log('📅 Event found:', event.title);
    
    if (!event.organizer) {
      return res.status(400).json({ message: 'Event has no organizer assigned' });
    }
    
    console.log('👤 Organizer:', event.organizer.name, event.organizer.email);
    console.log('📱 Phone:', event.organizer.phone || 'No phone number');
    console.log('⚙️ Full preferences object:', JSON.stringify(event.organizer.preferences, null, 2));
    
    // More flexible approval checking
    const isApprovable = (
      event.approvalStatus === 'pending' || 
      event.status === 'pending_approval' ||
      event.status === 'draft' ||
      event.submittedForApproval === true
    );
    
    if (!isApprovable) {
      return res.status(400).json({ 
        message: `Event is not pending approval. Current status: ${event.status}, approval: ${event.approvalStatus}` 
      });
    }
    
    // Update event status
    event.approvalStatus = 'approved';
    event.status = 'published';
    event.approvedBy = req.dbUser._id;
    event.approvedAt = new Date();
    
    await event.save();
    console.log('✅ Event status updated to approved/published');
    
    // Send notifications to organizer
    const organizer = event.organizer;
    
    if (organizer) {
      console.log(`📧 Attempting to send approval notification to organizer: ${organizer.email}`);
      
      // Check preferences with detailed logging
      const emailPreference = organizer.preferences?.notifications?.email !== false;
      const smsPreference = organizer.preferences?.notifications?.sms === true;
      
      console.log('📧 Email preference check:', {
        'organizer.preferences': !!organizer.preferences,
        'organizer.preferences.notifications': !!organizer.preferences?.notifications,
        'email setting': organizer.preferences?.notifications?.email,
        'emailPreference result': emailPreference
      });
      
      console.log('📱 SMS preference check:', {
        'sms setting': organizer.preferences?.notifications?.sms,
        'phone available': !!organizer.phone,
        'smsPreference result': smsPreference
      });
      
      if (emailPreference) {
        try {
          console.log('📧 Attempting to send approval email...');
          const emailResult = await emailService.sendEventApprovalNotification(organizer, event);
          console.log(`✅ Approval email result:`, emailResult);
          console.log(`✅ Approval email sent to ${organizer.email}`);
        } catch (error) {
          console.error(`❌ Failed to send approval email to ${organizer.email}:`, error);
        }
      } else {
        console.log('📧 Email notifications disabled for this user or email preference is false');
      }
      
      if (smsPreference && organizer.phone) {
        try {
          console.log('📱 Attempting to send approval SMS...');
          const smsResult = await smsService.sendEventApprovalNotification(organizer, event);
          console.log(`✅ Approval SMS result:`, smsResult);
          console.log(`✅ Approval SMS sent to ${organizer.phone}`);
        } catch (error) {
          console.error(`❌ Failed to send approval SMS to ${organizer.phone}:`, error);
        }
      } else {
        if (!smsPreference) {
          console.log('📱 SMS notifications disabled for this user');
        }
        if (!organizer.phone) {
          console.log('📱 No phone number available for SMS');
        }
      }
    } else {
      console.log('❌ No organizer found for notifications');
    }
    
    res.json({
      message: 'Event approved and published successfully!',
      event
    });
  } catch (error) {
    console.error('Error approving event:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reject event (Admin only)
router.put('/:eventId/reject', checkJwt, checkUser, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    
    const event = await Event.findById(req.params.eventId).populate('organizer', 'name email preferences phone');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    event.approvalStatus = 'rejected';
    event.status = 'rejected';
    event.rejectedBy = req.dbUser._id;
    event.rejectedAt = new Date();
    event.rejectionReason = reason;
    
    await event.save();
    
    // Send rejection notification to organizer
    const organizer = event.organizer;
    
    if (organizer && organizer.preferences?.notifications?.email !== false) {
      try {
        await emailService.sendEmail({
          to: organizer.email,
          subject: `Event Rejected: ${event.title}`,
          html: `
            <h1>❌ Your event has been rejected</h1>
            <p>Hello ${organizer.name},</p>
            <p>Unfortunately, your event <strong>${event.title}</strong> has been rejected.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>You can make the necessary changes and resubmit your event for approval.</p>
            <p>Thank you for using EventCraft!</p>
          `
        });
        console.log(`✅ Rejection email sent to ${organizer.email}`);
      } catch (error) {
        console.error(`❌ Failed to send rejection email:`, error);
      }
    }
    
    res.json({
      message: 'Event rejected successfully',
      event
    });
  } catch (error) {
    console.error('Error rejecting event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Event registration route
router.post('/:id/register', checkJwt, checkUser, async (req, res) => {
  try {
    const { ticketType, quantity = 1 } = req.body;
    const eventId = req.params.id;
    
    console.log(`📧 User ${req.dbUser.email} registering for event ${eventId}`);
    
    const event = await Event.findById(eventId).populate('organizer', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.status !== 'published') {
      return res.status(400).json({ message: 'Event is not available for registration' });
    }
    
    // Check if user is already registered
    const existingTicket = await Ticket.findOne({
      event: eventId,
      user: req.dbUser._id
    });
    
    if (existingTicket) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }
    
    // Check capacity
    const totalAttendees = event.attendees.length;
    if (totalAttendees + quantity > event.capacity) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }
    
    console.log(`✅ Creating tickets for user ${req.dbUser.email}`);
    
    // Create ticket(s)
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticket = new Ticket({
        event: eventId,
        user: req.dbUser._id,
        ticketType: ticketType || 'General Admission',
        price: event.ticketPrice || 0,
        status: 'confirmed',
        purchaseDate: new Date()
      });
      tickets.push(ticket);
    }
    
    const savedTickets = await Ticket.insertMany(tickets);
    console.log(`✅ Created ${savedTickets.length} tickets`);

    // Add user to event attendees
    event.attendees.push({
      user: req.dbUser._id,
      ticketType: ticketType || 'General Admission',
      purchaseDate: new Date(),
      checkedIn: false
    });
    
    await event.save();
    console.log(`✅ Added user to event attendees`);

    // Get user with preferences for notifications
    const user = await User.findById(req.dbUser._id);
    
    console.log(`📧 Sending registration confirmation to: ${user.email}`);
    console.log(`⚙️ User preferences:`, user.preferences);
        
    // Send confirmation email
    if (user.preferences?.notifications?.email !== false) {
      try {
        await emailService.sendEventConfirmation(user, event);
        console.log(`✅ Registration confirmation email sent to ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to send confirmation email:`, error);
      }
    } else {
      console.log(`📧 Email notifications disabled for ${user.email}`);
    }
        
    // Send confirmation SMS
    if (user.preferences?.notifications?.sms === true && user.phone) {
      try {
        await smsService.sendEventConfirmation(user, event);
        console.log(`✅ Registration confirmation SMS sent to ${user.phone}`);
      } catch (error) {
        console.error(`❌ Failed to send confirmation SMS:`, error);
      }
    } else {
      if (!user.preferences?.notifications?.sms) {
        console.log(`📱 SMS notifications disabled for ${user.email}`);
      }
      if (!user.phone) {
        console.log(`📱 No phone number available for ${user.email}`);
      }
    }
    
    res.status(201).json({ 
      message: 'Registration successful', 
      tickets: savedTickets,
      event: {
        title: event.title,
        date: event.date,
        location: event.location
      }
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// TEST REGISTRATION ENDPOINT (remove in production)
router.post('/test-register/:id', checkJwt, checkUser, async (req, res) => {
  try {
    console.log('🧪 === TEST REGISTRATION ENDPOINT ===');
    console.log('JWT auth info:', req.auth);
    
    // Get the real user from the database using auth0Id
    const realUser = await User.findOne({ auth0Id: req.auth.sub });
    if (!realUser) {
      return res.status(404).json({ message: 'User not found in database' });
    }
    
    console.log('Real user:', realUser.email);
    console.log('Event ID:', req.params.id);
    
    const eventId = req.params.id;
    const event = await Event.findById(eventId).populate('organizer', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    console.log('Event found:', event.title);
    
    // Check if user is already registered
    const existingTicket = await Ticket.findOne({
      event: eventId,
      user: realUser._id
    });
    
    if (existingTicket) {
      return res.status(400).json({ message: 'Already registered' });
    }
    
    // Force create a test ticket
    const ticket = new Ticket({
      event: eventId,
      user: realUser._id,
      ticketType: 'Test Ticket',
      price: 0,
      status: 'confirmed',
      purchaseDate: new Date()
    });
    
    await ticket.save();
    console.log('✅ Test ticket created:', ticket._id);
    
    // Add user to event attendees
    event.attendees.push({
      user: realUser._id,
      ticketType: 'Test Ticket',
      purchaseDate: new Date(),
      checkedIn: false
    });
    
    await event.save();
    console.log('✅ User added to event attendees');
    
    // Send confirmation email
    if (realUser.preferences?.notifications?.email !== false) {
      try {
        await emailService.sendEventConfirmation(realUser, event);
        console.log(`✅ Test confirmation email sent to ${realUser.email}`);
      } catch (error) {
        console.error(`❌ Failed to send test email:`, error);
      }
    }
    
    // Send confirmation SMS
    if (realUser.preferences?.notifications?.sms === true && realUser.phone) {
      try {
        await smsService.sendEventConfirmation(realUser, event);
        console.log(`✅ Test confirmation SMS sent to ${realUser.phone}`);
      } catch (error) {
        console.error(`❌ Failed to send test SMS:`, error);
      }
    }
    
    res.json({ 
      message: 'Test registration successful', 
      ticket,
      notifications: {
        emailSent: realUser.preferences?.notifications?.email !== false,
        smsSent: realUser.preferences?.notifications?.sms === true && !!realUser.phone
      }
    });
  } catch (error) {
    console.error('Test registration error:', error);
    res.status(500).json({ message: 'Test failed', error: error.message });
  }
});

module.exports = router;