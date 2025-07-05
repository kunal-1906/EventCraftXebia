const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to database
mongoose.connect('mongodb://localhost:27017/eventcraft')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function checkProfileUpdate() {
  try {
    console.log('🔍 Checking profile update results...');
    
    // Find attendee user
    const attendee = await User.findOne({ role: 'attendee' });
    
    if (!attendee) {
      console.log('❌ No attendee found');
      return;
    }
    
    console.log('\n📋 Current attendee profile:');
    console.log(`Name: ${attendee.name}`);
    console.log(`Email: ${attendee.email}`);
    console.log(`Phone: ${attendee.phone || 'Not set'}`);
    console.log(`Bio: ${attendee.bio || 'Not set'}`);
    console.log(`Location: ${attendee.location || 'Not set'}`);
    console.log(`Last updated: ${attendee.updatedAt}`);
    
    console.log('\n✅ Profile update verification complete!');

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

checkProfileUpdate();
