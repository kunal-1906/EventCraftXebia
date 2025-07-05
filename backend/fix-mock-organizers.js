const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

// Connect to database
mongoose.connect('mongodb://localhost:27017/eventcraft')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function fixMockOrganizers() {
  try {
    console.log('🔧 Fixing events with mock organizer IDs...');
    
    // Find events with the mock organizer ID
    const mockId = '123456789012345678901235';
    const events = await Event.find({ organizer: mockId });
    console.log(`📅 Found ${events.length} events with mock organizer ID`);
    
    if (events.length === 0) {
      console.log('ℹ️ No events with mock organizer found');
      // Let's check all events
      const allEvents = await Event.find().populate('organizer');
      console.log(`\n📋 All events status:`);
      for (const event of allEvents) {
        console.log(`   ${event.title}: organizer = ${event.organizer ? event.organizer.name : 'NULL'}`);
      }
      mongoose.connection.close();
      return;
    }
    
    // Find a real organizer or admin to assign
    const realOrganizer = await User.findOne({ role: { $in: ['organizer', 'admin'] } });
    if (!realOrganizer) {
      console.log('❌ No real organizer or admin found');
      return;
    }
    
    console.log(`👤 Will assign real organizer: ${realOrganizer.name} (${realOrganizer.email})`);
    
    for (const event of events) {
      console.log(`📋 Fixing event: ${event.title}`);
      event.organizer = realOrganizer._id;
      await event.save();
      console.log(`   ✅ Updated organizer`);
    }
    
    console.log('\n🎉 All mock organizers fixed!');

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

fixMockOrganizers();
