const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

// Connect to database
mongoose.connect('mongodb://localhost:27017/eventcraft')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function fixAllEvents() {
  try {
    console.log('🔧 Fixing all events with null organizers...');
    
    // Find all events
    const events = await Event.find();
    console.log(`📅 Found ${events.length} events`);
    
    // Find an organizer or admin to assign
    const organizer = await User.findOne({ role: { $in: ['organizer', 'admin'] } });
    if (!organizer) {
      console.log('❌ No organizer or admin found');
      return;
    }
    
    console.log(`👤 Will assign organizer: ${organizer.name} (${organizer.email})`);
    
    for (const event of events) {
      console.log(`\n📋 Processing event: ${event.title} (${event._id})`);
      console.log(`   Current organizer: ${event.organizer || 'NULL'}`);
      
      if (!event.organizer) {
        event.organizer = organizer._id;
        await event.save();
        console.log(`   ✅ Updated organizer for "${event.title}"`);
      } else {
        console.log(`   ℹ️ Event already has organizer`);
      }
    }
    
    console.log('\n🎉 All events processed!');

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

fixAllEvents();
