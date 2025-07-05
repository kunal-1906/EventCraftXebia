const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const Event = require('./models/Event');
const User = require('./models/User');
const Ticket = require('./models/Ticket');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventcraft');

async function testRegistrationFlow() {
  try {
    console.log('🔍 Testing complete registration flow...\n');
    
    // 1. Find events
    console.log('1. Looking for events...');
    const events = await Event.find({}).limit(5);
    console.log(`Found ${events.length} events:`);
    
    events.forEach((event, index) => {
      console.log(`${index + 1}. "${event.title}" (ID: ${event._id})`);
      console.log(`   Status: ${event.status}, Attendees: ${event.attendees.length}/${event.capacity}`);
    });
    
    if (events.length === 0) {
      console.log('❌ No events found in database');
      return;
    }
    
    // Use first event for testing
    const testEvent = events[0];
    console.log(`\n2. Using event: "${testEvent.title}" (${testEvent._id})\n`);
    
    // 2. Check user
    console.log('3. Checking user er.aryansaxena@gmail.com...');
    const user = await User.findOne({ email: 'er.aryansaxena@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`✅ User found: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`📱 Phone: ${user.phone || 'Not provided'}`);
    console.log(`🔔 Notifications: Email=${user.preferences?.notifications?.email !== false}, SMS=${user.preferences?.notifications?.sms === true}`);
    
    // 3. Check existing tickets
    console.log('\n4. Checking existing tickets...');
    const existingTickets = await Ticket.find({ 
      event: testEvent._id, 
      user: user._id 
    });
    
    console.log(`Found ${existingTickets.length} existing tickets`);
    
    // 4. Check existing attendees
    console.log('\n5. Checking attendees array...');
    console.log(`Current attendees: ${testEvent.attendees.length}`);
    const isAlreadyAttendee = testEvent.attendees.some(attendee => 
      attendee.user && attendee.user.toString() === user._id.toString()
    );
    console.log(`User already in attendees: ${isAlreadyAttendee}`);
    
    if (existingTickets.length > 0) {
      console.log('\n⚠️  User already has tickets. Cleaning up first...');
      await Ticket.deleteMany({ event: testEvent._id, user: user._id });
      
      // Remove from attendees
      testEvent.attendees = testEvent.attendees.filter(attendee => 
        !attendee.user || attendee.user.toString() !== user._id.toString()
      );
      await testEvent.save();
      
      console.log('✅ Cleanup completed');
    }
    
    // 5. Test registration
    console.log('\n6. Testing registration API call...');
    
    const response = await axios.post(`http://localhost:5000/api/events/${testEvent._id}/register`, {
      ticketType: 'General Admission',
      quantity: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-mock-role': 'attendee'
      }
    });
    
    console.log('✅ Registration API call successful!');
    console.log('Response:', response.data);
    
    // 6. Verify results
    console.log('\n7. Verifying results...');
    
    // Check tickets
    const newTickets = await Ticket.find({ 
      event: testEvent._id, 
      user: user._id 
    });
    console.log(`✅ Tickets created: ${newTickets.length}`);
    
    // Check attendees
    const updatedEvent = await Event.findById(testEvent._id);
    console.log(`✅ Event attendees: ${updatedEvent.attendees.length}`);
    
    const isNowAttendee = updatedEvent.attendees.some(attendee => 
      attendee.user && attendee.user.toString() === user._id.toString()
    );
    console.log(`✅ User added to attendees: ${isNowAttendee}`);
    
    console.log('\n🎉 Registration test completed successfully!');
    console.log('\nSummary:');
    console.log(`- Event: ${testEvent.title}`);
    console.log(`- User: ${user.email}`);
    console.log(`- Tickets created: ${newTickets.length}`);
    console.log(`- Added to attendees: ${isNowAttendee}`);
    console.log(`- Email notifications: ${user.preferences?.notifications?.email !== false ? 'Enabled' : 'Disabled'}`);
    console.log(`- SMS notifications: ${user.preferences?.notifications?.sms === true ? 'Enabled' : 'Disabled'}`);
    
  } catch (error) {
    console.error('\n❌ Registration test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    process.exit(0);
  }
}

testRegistrationFlow();
