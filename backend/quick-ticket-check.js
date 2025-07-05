const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
const User = require('./models/User');
const Event = require('./models/Event');

async function checkTickets() {
  try {
    await mongoose.connect('mongodb://localhost:27017/eventcraft');
    console.log('✅ Connected to database');
    
    // Find user by email
    const user = await User.findOne({ email: 'er.aryansaxena@gmail.com' });
    if (!user) {
      console.log('❌ User not found with email er.aryansaxena@gmail.com');
      
      // List all users to see what we have
      const allUsers = await User.find({}, 'email name');
      console.log('📋 Available users:', allUsers.map(u => ({ email: u.email, name: u.name })));
      
      return;
    }
    
    console.log('👤 User found:', { email: user.email, name: user.name, id: user._id });
    
    // Get tickets for this user
    const tickets = await Ticket.find({ user: user._id });
    console.log(`🎫 Found ${tickets.length} tickets for user`);
    
    if (tickets.length === 0) {
      console.log('🔍 No tickets found. Let me check all tickets...');
      const allTickets = await Ticket.find({});
      console.log(`📊 Total tickets in database: ${allTickets.length}`);
      
      if (allTickets.length > 0) {
        console.log('📋 Sample tickets:');
        allTickets.slice(0, 3).forEach(ticket => {
          console.log(`  - Ticket ${ticket._id} for user ${ticket.user} event ${ticket.event}`);
        });
      }
    } else {
      // Populate event details for found tickets
      const populatedTickets = await Ticket.find({ user: user._id }).populate('event', 'title date location');
      populatedTickets.forEach(ticket => {
        console.log(`  🎫 Ticket ${ticket._id}:`);
        console.log(`     Event: ${ticket.event?.title || 'Unknown'}`);
        console.log(`     Status: ${ticket.status}`);
        console.log(`     Type: ${ticket.ticketType}`);
        console.log(`     Price: $${ticket.price}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

checkTickets();
