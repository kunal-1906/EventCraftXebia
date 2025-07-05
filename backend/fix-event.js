const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

// Connect to database
mongoose.connect('mongodb://localhost:27017/eventcraft')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function fixEvent() {
  try {
    console.log('🔧 Fixing event organizer...');
    
    // Find the event
    const event = await Event.findById('686963c78a6f45b727da5b8e');
    if (!event) {
      console.log('❌ Event not found');
      return;
    }
    
    console.log(`📅 Found event: ${event.title}`);
    console.log(`🔍 Current organizer: ${event.organizer}`);
    
    // Find an organizer or admin to assign
    const organizer = await User.findOne({ role: { $in: ['organizer', 'admin'] } });
    if (!organizer) {
      console.log('❌ No organizer or admin found');
      return;
    }
    
    console.log(`👤 Assigning organizer: ${organizer.name} (${organizer.email})`);
    
    // Update the event
    event.organizer = organizer._id;
    await event.save();
    
    console.log('✅ Event organizer updated successfully');
    
    // Verify the update
    const updatedEvent = await Event.findById('686963c78a6f45b727da5b8e').populate('organizer');
    console.log(`✅ Verification - Organizer is now: ${updatedEvent.organizer.name}`);

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

fixEvent();
