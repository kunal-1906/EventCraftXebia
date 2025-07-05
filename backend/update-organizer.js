const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to database
mongoose.connect('mongodb://localhost:27017/eventcraft')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function updateOrganizerNotifications() {
  try {
    console.log('🔧 Updating organizer notification settings...');
    
    const organizer = await User.findById('6868bb11c5fa6b06c6e774f7');
    
    if (!organizer) {
      console.log('❌ Organizer not found');
      return;
    }
    
    console.log(`👤 Updating organizer: ${organizer.name}`);
    
    // Add phone number and enable SMS notifications
    organizer.phone = '+917302752999'; // Test phone number
    
    // Ensure preferences object exists
    if (!organizer.preferences) {
      organizer.preferences = {};
    }
    if (!organizer.preferences.notifications) {
      organizer.preferences.notifications = {};
    }
    
    // Enable SMS notifications
    organizer.preferences.notifications.sms = true;
    organizer.preferences.notifications.email = true;
    organizer.preferences.notifications.push = true;
    
    await organizer.save();
    
    console.log('✅ Organizer updated successfully');
    console.log('📱 Phone:', organizer.phone);
    console.log('📧 Email notifications:', organizer.preferences.notifications.email);
    console.log('📱 SMS notifications:', organizer.preferences.notifications.sms);

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

updateOrganizerNotifications();
