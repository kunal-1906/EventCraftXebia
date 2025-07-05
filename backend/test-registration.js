const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const Event = require('./models/Event');
const User = require('./models/User');
const Ticket = require('./models/Ticket');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventcraft');

async function testRegistration() {
  try {
    console.log('🔍 Looking for events...');
    
    // Find events with "Eight" in title
    const events = await Event.find({ title: { $regex: 'Eight', $options: 'i' } });
    console.log(`Found ${events.length} events with "Eight" in title`);
    
    if (events.length === 0) {
      console.log('No events found with "Eight". Let me check all published events:');
      const allEvents = await Event.find({ status: 'published' }).limit(5);
      console.log(`Found ${allEvents.length} published events:`);
      allEvents.forEach(event => {
        console.log(`- "${event.title}" (ID: ${event._id})`);
      });
      
      if (allEvents.length > 0) {
        console.log('Using first event for test registration...');
        const testEvent = allEvents[0];
        await testEventRegistration(testEvent._id);
      }
      return;
    }
    
    const event = events[0];
    console.log(`\nEvent found: "${event.title}" (ID: ${event._id})`);
    console.log(`Current attendees: ${event.attendees.length}`);
    console.log(`Capacity: ${event.capacity}`);
    console.log(`Status: ${event.status}`);
    
    await testEventRegistration(event._id);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

async function testEventRegistration(eventId) {
  try {
    console.log(`\n🧪 Testing registration for event ${eventId}...`);
    
    // Find the user
    const user = await User.findOne({ email: 'er.aryansaxena@gmail.com' });
    if (!user) {
      console.log('❌ User er.aryansaxena@gmail.com not found');
      return;
    }
    
    console.log(`👤 User found: ${user.name} (${user.email})`);
    console.log(`📱 Phone: ${user.phone || 'Not provided'}`);
    console.log(`🔔 Email notifications: ${user.preferences?.notifications?.email !== false ? 'Enabled' : 'Disabled'}`);
    console.log(`📱 SMS notifications: ${user.preferences?.notifications?.sms === true ? 'Enabled' : 'Disabled'}`);
    
    // Check existing tickets
    const existingTickets = await Ticket.find({ 
      event: eventId, 
      user: user._id 
    });
    
    console.log(`🎫 Existing tickets: ${existingTickets.length}`);
    
    if (existingTickets.length > 0) {
      console.log('User already has tickets for this event');
      existingTickets.forEach(ticket => {
        console.log(`- Ticket ${ticket._id}: ${ticket.status}, purchased ${ticket.purchaseDate}`);
      });
    }
    
    // Make registration request
    console.log('\n📤 Making registration request...');
    
    const response = await axios.post(`http://localhost:5000/api/events/${eventId}/register`, {
      ticketType: 'General Admission',
      quantity: 1
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-mock-role': 'attendee'
      }
    });
    
    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegistration();
