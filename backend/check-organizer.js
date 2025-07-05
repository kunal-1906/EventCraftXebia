const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to database
mongoose.connect('mongodb://localhost:27017/eventcraft')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function checkOrganizerDetails() {
  try {
    console.log('👤 Checking organizer details...');
    
    const organizer = await User.findById('6868bb11c5fa6b06c6e774f7');
    
    if (!organizer) {
      console.log('❌ Organizer not found');
      return;
    }
    
    console.log('\n📋 Organizer Details:');
    console.log('Name:', organizer.name);
    console.log('Email:', organizer.email);
    console.log('Phone:', organizer.phone || 'NOT SET');
    console.log('Role:', organizer.role);
    
    console.log('\n⚙️ Notification Preferences:');
    if (organizer.preferences && organizer.preferences.notifications) {
      console.log('Email notifications:', organizer.preferences.notifications.email);
      console.log('SMS notifications:', organizer.preferences.notifications.sms);
      console.log('Push notifications:', organizer.preferences.notifications.push);
    } else {
      console.log('No notification preferences set');
    }
    
    console.log('\n🔍 Full preferences object:');
    console.log(JSON.stringify(organizer.preferences, null, 2));

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

checkOrganizerDetails();
