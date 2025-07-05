const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
const User = require('./models/User');
const Event = require('./models/Event');

async function testMyTicketsEndpoint() {
  try {
    await mongoose.connect('mongodb://localhost:27017/eventcraft');
    console.log('✅ Connected to database');
    
    // Simulate the my-tickets endpoint logic
    const userEmail = 'er.aryansaxena@gmail.com';
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 User found:', user.email);
    
    // This is what the /api/tickets/my-tickets endpoint should do
    const tickets = await Ticket.find({ user: user._id })
      .populate('event', 'title description date location')
      .sort({ purchaseDate: -1 });
    
    console.log(`🎫 Found ${tickets.length} tickets`);
    
    // Format tickets for frontend (similar to backend response)
    const formattedTickets = tickets.map(ticket => ({
      _id: ticket._id,
      ticketNumber: ticket.ticketNumber || `TCK${ticket._id.toString().slice(-8).toUpperCase()}`,
      event: {
        _id: ticket.event._id,
        title: ticket.event.title,
        date: ticket.event.date,
        location: ticket.event.location
      },
      ticketType: ticket.ticketType,
      price: ticket.price,
      status: ticket.status,
      purchaseDate: ticket.purchaseDate
    }));
    
    console.log('📋 Formatted tickets for frontend:');
    console.log(JSON.stringify(formattedTickets, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testMyTicketsEndpoint();
