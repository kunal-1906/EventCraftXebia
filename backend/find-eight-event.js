const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('./models/Event');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventcraft');

async function findEightEvent() {
  try {
    // Look for events with "Eight" in the title
    const events = await Event.find({ title: { $regex: 'Eight', $options: 'i' } });
    console.log(`Found ${events.length} events with "Eight" in title:`);
    
    events.forEach(event => {
      console.log(`- "${event.title}" (ID: ${event._id})`);
      console.log(`  Status: ${event.status}`);
      console.log(`  Approval: ${event.approvalStatus}`);
      console.log(`  Attendees: ${event.attendees.length}/${event.capacity}`);
      console.log(`  Date: ${event.date}`);
      console.log('');
    });
    
    if (events.length === 0) {
      console.log('No events found with "Eight" in title');
      console.log('Creating a test "Eight" event...');
      
      const eightEvent = new Event({
        title: 'Eight',
        description: 'Test event with title Eight',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        location: 'Test Location',
        capacity: 100,
        ticketPrice: 0,
        organizer: '6868a5c0c5fa6b06c6e77522', // Use existing organizer
        status: 'published',
        approvalStatus: 'approved',
        category: 'test'
      });
      
      await eightEvent.save();
      console.log(`✅ Created "Eight" event with ID: ${eightEvent._id}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findEightEvent();
