const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

// Connect to database
mongoose.connect('mongodb://localhost:27017/eventcraft')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function createTestEvent() {
  try {
    console.log('📅 Creating test event...');
    
    // Find organizer
    const organizer = await User.findById('6868bb11c5fa6b06c6e774f7');
    
    if (!organizer) {
      console.log('❌ Organizer not found');
      return;
    }
    
    const testEvent = new Event({
      title: 'Test Notification Event',
      description: 'This event is for testing notifications',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
      location: 'Test Venue',
      capacity: 50,
      ticketPrice: 15,
      ticketTypes: [{
        name: 'General Admission',
        price: 15,
        description: 'Standard event admission',
        quantity: 50
      }],
      category: 'Technology',
      organizer: organizer._id,
      status: 'pending_approval',
      approvalStatus: 'pending',
      submittedForApproval: true,
      submittedAt: new Date()
    });
    
    await testEvent.save();
    
    console.log('✅ Test event created successfully');
    console.log('📋 Event ID:', testEvent._id);
    console.log('👤 Organizer:', organizer.name);
    console.log('📧 Organizer email:', organizer.email);
    console.log('📱 Organizer phone:', organizer.phone);

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

createTestEvent();
