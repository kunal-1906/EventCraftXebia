const mongoose = require('mongoose');
const Event = require('./models/Event');

// Connect to database
mongoose.connect('mongodb://localhost:27017/eventcraft')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function resetEventStatus() {
  try {
    console.log('🔄 Resetting event status to pending...');
    
    const eventId = '686968fac3ade51df726ac8e';
    const event = await Event.findById(eventId);
    
    if (!event) {
      console.log('❌ Event not found');
      return;
    }
    
    console.log(`📅 Resetting event: ${event.title}`);
    
    // Reset to pending status
    event.status = 'pending_approval';
    event.approvalStatus = 'pending';
    event.approvedBy = undefined;
    event.approvedAt = undefined;
    event.rejectedBy = undefined;
    event.rejectedAt = undefined;
    event.rejectionReason = undefined;
    
    await event.save();
    console.log('✅ Event status reset to pending');

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

resetEventStatus();
