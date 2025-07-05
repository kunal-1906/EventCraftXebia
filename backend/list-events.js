const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('./models/Event');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventcraft');

async function listEvents() {
  try {
    const events = await Event.find({}).limit(10);
    console.log(`Found ${events.length} events total:`);
    
    events.forEach((event, index) => {
      console.log(`${index + 1}. "${event.title}" (ID: ${event._id})`);
      console.log(`   Status: ${event.status}, Attendees: ${event.attendees.length}/${event.capacity}`);
      console.log(`   Date: ${event.date}`);
    });
    
    // Look specifically for "Eight"
    const eightEvents = await Event.find({ title: { $regex: 'Eight', $options: 'i' } });
    console.log(`\nEvents with "Eight" in title: ${eightEvents.length}`);
    eightEvents.forEach(event => {
      console.log(`- "${event.title}" (ID: ${event._id})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listEvents();
