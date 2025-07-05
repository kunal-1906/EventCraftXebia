const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('./models/Event');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventcraft');

async function findEvents() {
  try {
    const events = await Event.find({ title: { $regex: 'Eight', $options: 'i' } });
    console.log('Events matching "Eight":');
    events.forEach(event => {
      console.log(`ID: ${event._id}`);
      console.log(`Title: ${event.title}`);
      console.log(`Attendees: ${JSON.stringify(event.attendees)}`);
      console.log(`Attendees count: ${event.attendees.length}`);
      console.log('---');
    });
    
    if (events.length === 0) {
      console.log('No events found with "Eight" in title. Let me check all events:');
      const allEvents = await Event.find({}).limit(5);
      allEvents.forEach(event => {
        console.log(`Title: ${event.title}, ID: ${event._id}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findEvents();
