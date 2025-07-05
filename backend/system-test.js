const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
const Event = require('./models/Event');
const User = require('./models/User');

// Connect to database
mongoose.connect('mongodb://localhost:27017/eventcraft')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function comprehensiveTest() {
  try {
    console.log('🧪 Comprehensive System Test\n');
    
    // 1. Check tickets in database
    console.log('🎫 TICKET SYSTEM STATUS:');
    const tickets = await Ticket.find().populate('user event');
    console.log(`✅ Total tickets in database: ${tickets.length}`);
    
    if (tickets.length > 0) {
      console.log('\nRecent tickets:');
      tickets.forEach((ticket, index) => {
        console.log(`  ${index + 1}. Event: "${ticket.event.title}" | User: ${ticket.user.email} | Status: ${ticket.status}`);
      });
    }
    
    // 2. Check user notification settings
    console.log('\n👥 USER NOTIFICATION SETTINGS:');
    const users = await User.find();
    
    users.forEach((user) => {
      const hasPhone = !!user.phone;
      const emailEnabled = user.preferences?.notifications?.email !== false;
      const smsEnabled = user.preferences?.notifications?.sms === true;
      
      console.log(`\n  ${user.name} (${user.role}):`);
      console.log(`    📧 Email: ${user.email} | Notifications: ${emailEnabled ? '✅' : '❌'}`);
      console.log(`    📱 Phone: ${user.phone || 'Not set'} | SMS: ${hasPhone && smsEnabled ? '✅' : '❌'}`);
    });
    
    // 3. Check events available for registration
    console.log('\n📅 EVENTS AVAILABLE FOR REGISTRATION:');
    const publishedEvents = await Event.find({ status: 'published' }).populate('organizer');
    
    publishedEvents.forEach((event) => {
      const spotsLeft = event.capacity - event.attendees.length;
      console.log(`\n  "${event.title}":`);
      console.log(`    📊 Status: ${event.status} | Capacity: ${event.attendees.length}/${event.capacity} (${spotsLeft} spots left)`);
      console.log(`    💰 Price: $${event.ticketPrice || 0}`);
      console.log(`    📍 Location: ${event.location}`);
      console.log(`    👤 Organizer: ${event.organizer.name}`);
    });
    
    // 4. Summary
    console.log('\n📋 SYSTEM STATUS SUMMARY:');
    console.log(`✅ Tickets in database: ${tickets.length > 0 ? 'YES' : 'NO'}`);
    console.log(`✅ Users with phone numbers: ${users.filter(u => u.phone).length}/${users.length}`);
    console.log(`✅ Users with email notifications: ${users.filter(u => u.preferences?.notifications?.email !== false).length}/${users.length}`);
    console.log(`✅ Users with SMS notifications: ${users.filter(u => u.preferences?.notifications?.sms === true).length}/${users.length}`);
    console.log(`✅ Published events: ${publishedEvents.length}`);
    
    console.log('\n🎯 WHAT TO TEST NEXT:');
    console.log('1. Register for an event via API: curl -X POST "http://localhost:5000/api/events/{eventId}/register" -H "x-mock-role: attendee" -d \'{"ticketType": "General Admission"}\'');
    console.log('2. Update user profile: curl -X PUT "http://localhost:5000/api/users/profile" -H "x-mock-role: attendee" -d \'{"phone": "+1234567890"}\'');
    console.log('3. Check if emails/SMS are being sent in server logs');

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

comprehensiveTest();
