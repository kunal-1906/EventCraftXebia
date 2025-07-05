const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

// Connect to database
mongoose.connect('mongodb://localhost:27017/eventcraft')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function debugEvent() {
  try {
    console.log('🔍 Searching for events...');
    
    // Find all events
    const events = await Event.find().populate('organizer', 'name email role');
    
    console.log(`📊 Found ${events.length} events:`);
    
    events.forEach((event, index) => {
      console.log(`\n--- Event ${index + 1} ---`);
      console.log(`ID: ${event._id}`);
      console.log(`Title: ${event.title}`);
      console.log(`Status: ${event.status}`);
      console.log(`Approval Status: ${event.approvalStatus}`);
      console.log(`Submitted for Approval: ${event.submittedForApproval}`);
      console.log(`Raw Organizer ID: ${event.organizer}`);
      console.log(`Populated Organizer: ${event.organizer ? event.organizer.name : 'None'}`);
      console.log(`Organizer Role: ${event.organizer ? event.organizer.role : 'None'}`);
    });

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

debugEvent();
