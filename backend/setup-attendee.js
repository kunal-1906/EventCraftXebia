const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to database
mongoose.connect('mongodb://localhost:27017/eventcraft')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function setupAttendeeForTesting() {
  try {
    console.log('👤 Setting up attendee for testing...');
    
    // Find attendee user
    const attendee = await User.findOne({ role: 'attendee' });
    
    if (!attendee) {
      console.log('❌ No attendee found');
      return;
    }
    
    console.log(`📧 Found attendee: ${attendee.name} (${attendee.email})`);
    
    // Update phone and preferences
    attendee.phone = '+917302752999'; // Test phone number
    
    // Ensure preferences object exists
    if (!attendee.preferences) {
      attendee.preferences = {};
    }
    if (!attendee.preferences.notifications) {
      attendee.preferences.notifications = {};
    }
    
    // Enable all notifications
    attendee.preferences.notifications.email = true;
    attendee.preferences.notifications.sms = true;
    attendee.preferences.notifications.push = true;
    
    await attendee.save();
    
    console.log('✅ Attendee updated successfully');
    console.log('📱 Phone:', attendee.phone);
    console.log('📧 Email notifications:', attendee.preferences.notifications.email);
    console.log('📱 SMS notifications:', attendee.preferences.notifications.sms);

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

setupAttendeeForTesting();
