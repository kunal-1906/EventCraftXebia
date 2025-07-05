const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('./models/Event');
const User = require('./models/User');
const Ticket = require('./models/Ticket');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventcraft');

async function testEightEventRegistration() {
  try {
    console.log('🎯 Testing registration for "Eight" event specifically...\n');
    
    // Find the Eight event
    const event = await Event.findOne({ title: { $regex: 'Eight', $options: 'i' } });
    if (!event) {
      console.log('❌ No "Eight" event found');
      return;
    }
    
    console.log(`📅 Found event: "${event.title}" (ID: ${event._id})`);
    console.log(`📊 Status: ${event.status}, Approval: ${event.approvalStatus}`);
    console.log(`👥 Current attendees: ${event.attendees.length}/${event.capacity}`);
    
    // Find the user
    const user = await User.findOne({ email: 'er.aryansaxena@gmail.com' });
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`\n👤 User: ${user.name} (${user.email})`);
    console.log(`📱 Phone: ${user.phone || 'Not provided'}`);
    console.log(`🔔 Email notifications: ${user.preferences?.notifications?.email !== false ? 'Enabled' : 'Disabled'}`);
    console.log(`📱 SMS notifications: ${user.preferences?.notifications?.sms === true ? 'Enabled' : 'Disabled'}`);
    
    // Check existing tickets
    const existingTickets = await Ticket.find({ 
      event: event._id, 
      user: user._id 
    });
    
    console.log(`\n🎫 Existing tickets for this event: ${existingTickets.length}`);
    
    if (existingTickets.length > 0) {
      console.log('⚠️  User already registered. Cleaning up first...');
      await Ticket.deleteMany({ event: event._id, user: user._id });
      
      // Remove from attendees array
      event.attendees = event.attendees.filter(
        attendee => attendee.user.toString() !== user._id.toString()
      );
      await event.save();
      console.log('✅ Cleanup completed');
    }
    
    // Now test registration
    console.log('\n📤 Making registration request...');
    
    try {
      const response = await axios.post(`http://localhost:5000/api/events/${event._id}/register`, {
        ticketType: 'General Admission',
        quantity: 1
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-mock-role': 'attendee'
        }
      });
      
      console.log('✅ Registration successful!');
      console.log('📋 Response:', response.data);
      
      // Verify in database
      const newTickets = await Ticket.find({ event: event._id, user: user._id });
      const updatedEvent = await Event.findById(event._id);
      
      console.log('\n🔍 Verification:');
      console.log(`🎫 Tickets created: ${newTickets.length}`);
      console.log(`👥 Event attendees now: ${updatedEvent.attendees.length}`);
      
      const userInAttendees = updatedEvent.attendees.some(
        attendee => attendee.user.toString() === user._id.toString()
      );
      console.log(`✅ User in attendees array: ${userInAttendees}`);
      
    } catch (error) {
      console.error('❌ Registration failed:');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      } else {
        console.error('Error:', error.message);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testEightEventRegistration();
