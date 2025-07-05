const mongoose = require('mongoose');
require('dotenv').config();
const Ticket = require('./models/Ticket');
const User = require('./models/User');
const Event = require('./models/Event');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventcraft');

async function checkUserTickets() {
  try {
    console.log('🎫 Checking tickets for er.aryansaxena@gmail.com...\n');
    
    // Find the user
    const user = await User.findOne({ email: 'er.aryansaxena@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`👤 User found: ${user.name} (ID: ${user._id})`);
    
    // Find all tickets for this user
    const tickets = await Ticket.find({ user: user._id })
      .populate('event', 'title date location status')
      .sort({ createdAt: -1 });
    
    console.log(`\n🎫 Found ${tickets.length} tickets:\n`);
    
    tickets.forEach((ticket, index) => {
      console.log(`${index + 1}. Ticket ID: ${ticket._id}`);
      console.log(`   Event: ${ticket.event?.title || 'Event not found'}`);
      console.log(`   Event ID: ${ticket.event?._id || 'N/A'}`);
      console.log(`   Event Status: ${ticket.event?.status || 'N/A'}`);
      console.log(`   Ticket Type: ${ticket.ticketType}`);
      console.log(`   Price: $${ticket.price}`);
      console.log(`   Status: ${ticket.status}`);
      console.log(`   Purchase Date: ${ticket.purchaseDate}`);
      console.log(`   Created: ${ticket.createdAt}`);
      console.log('');
    });
    
    // Also check for any orphaned tickets (without valid events)
    console.log('🔍 Checking for invalid tickets...');
    const allTickets = await Ticket.find({ user: user._id });
    const invalidTickets = [];
    
    for (const ticket of allTickets) {
      const event = await Event.findById(ticket.event);
      if (!event) {
        invalidTickets.push(ticket);
      }
    }
    
    if (invalidTickets.length > 0) {
      console.log(`\n⚠️  Found ${invalidTickets.length} tickets with invalid events:`);
      invalidTickets.forEach(ticket => {
        console.log(`- Ticket ${ticket._id} references non-existent event ${ticket.event}`);
      });
    } else {
      console.log('✅ All tickets have valid events');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUserTickets();
