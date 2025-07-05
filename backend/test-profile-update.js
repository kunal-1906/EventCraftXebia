const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to database
mongoose.connect('mongodb://localhost:27017/eventcraft')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function testProfileUpdate() {
  try {
    console.log('👤 Testing profile update...');
    
    // Find attendee user
    const attendee = await User.findOne({ role: 'attendee' });
    
    if (!attendee) {
      console.log('❌ No attendee found');
      return;
    }
    
    console.log('\n📋 Before update:');
    console.log(`Name: ${attendee.name}`);
    console.log(`Phone: ${attendee.phone || 'Not set'}`);
    console.log(`Bio: ${attendee.bio || 'Not set'}`);
    
    // Update the user directly to test
    attendee.name = 'Updated Test Attendee';
    attendee.phone = '+919876543210';
    attendee.bio = 'This is a test bio update';
    
    // Ensure preferences object exists
    if (!attendee.preferences) {
      attendee.preferences = {};
    }
    if (!attendee.preferences.notifications) {
      attendee.preferences.notifications = {};
    }
    
    attendee.preferences.notifications.email = true;
    attendee.preferences.notifications.sms = true;
    attendee.preferences.notifications.push = true;
    
    await attendee.save();
    
    console.log('\n📋 After update:');
    console.log(`Name: ${attendee.name}`);
    console.log(`Phone: ${attendee.phone}`);
    console.log(`Bio: ${attendee.bio}`);
    console.log(`Email notifications: ${attendee.preferences.notifications.email}`);
    console.log(`SMS notifications: ${attendee.preferences.notifications.sms}`);
    
    console.log('\n✅ Profile update test successful!');

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

testProfileUpdate();
