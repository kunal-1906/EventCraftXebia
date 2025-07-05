const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
const Event = require('./models/Event');
const User = require('./models/User');

// Connect to database
mongoose.connect('mongodb://localhost:27017/eventcraft')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function investigateTickets() {
  try {
    console.log('🎫 Investigating ticket system...');
    
    // Check existing tickets
    console.log('\n🔍 Checking existing tickets:');
    const tickets = await Ticket.find().populate('user event');
    console.log(`Found ${tickets.length} tickets in database`);
    
    if (tickets.length > 0) {
      tickets.forEach((ticket, index) => {
        console.log(`\n--- Ticket ${index + 1} ---`);
        console.log(`Event: ${ticket.event.title}`);
        console.log(`User: ${ticket.user.name} (${ticket.user.email})`);
        console.log(`Type: ${ticket.ticketType}`);
        console.log(`Price: $${ticket.price}`);
        console.log(`Status: ${ticket.status}`);
        console.log(`Purchase Date: ${ticket.purchaseDate}`);
      });
    } else {
      console.log('❌ No tickets found in database');
    }
    
    // Check events and their attendees
    console.log('\n📅 Checking event attendees:');
    const events = await Event.find().populate('organizer');
    
    events.forEach((event, index) => {
      console.log(`\n--- Event ${index + 1}: ${event.title} ---`);
      console.log(`Status: ${event.status}`);
      console.log(`Capacity: ${event.capacity}`);
      console.log(`Attendees count: ${event.attendees.length}`);
      
      if (event.attendees.length > 0) {
        console.log('Attendees:');
        event.attendees.forEach((attendee, i) => {
          console.log(`  ${i + 1}. User ID: ${attendee.user}, Type: ${attendee.ticketType}`);
        });
      }
    });
    
    // Check users and their notification preferences
    console.log('\n👥 Checking users notification preferences:');
    const users = await User.find();
    
    users.forEach((user, index) => {
      console.log(`\n--- User ${index + 1}: ${user.name} ---`);
      console.log(`Email: ${user.email}`);
      console.log(`Phone: ${user.phone || 'Not set'}`);
      console.log(`Role: ${user.role}`);
      
      if (user.preferences && user.preferences.notifications) {
        console.log('Notification preferences:');
        console.log(`  Email: ${user.preferences.notifications.email}`);
        console.log(`  SMS: ${user.preferences.notifications.sms}`);
        console.log(`  Push: ${user.preferences.notifications.push}`);
      } else {
        console.log('No notification preferences set');
      }
    });

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

investigateTickets();
