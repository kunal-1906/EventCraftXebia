const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

// Connect to database
mongoose.connect('mongodb://localhost:27017/eventcraft')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function cleanupMockData() {
  try {
    console.log('🧹 Cleaning up mock data...');
    
    // 1. Find events with mock organizer IDs
    const mockOrganizerIds = [
      '123456789012345678901234', // Mock admin
      '123456789012345678901235', // Mock organizer  
      '123456789012345678901236'  // Mock attendee
    ];
    
    console.log('\n📅 Checking events...');
    const eventsWithMockOrganizers = await Event.find({ 
      organizer: { $in: mockOrganizerIds } 
    });
    
    console.log(`Found ${eventsWithMockOrganizers.length} events with mock organizers`);
    
    if (eventsWithMockOrganizers.length > 0) {
      // Find a real organizer or admin to reassign events to
      const realUser = await User.findOne({ role: { $in: ['organizer', 'admin'] } });
      
      if (realUser) {
        console.log(`👤 Reassigning events to real user: ${realUser.name} (${realUser.email})`);
        
        for (const event of eventsWithMockOrganizers) {
          console.log(`  📋 Updating event: ${event.title}`);
          event.organizer = realUser._id;
          await event.save();
        }
        
        console.log('✅ All events reassigned to real users');
      } else {
        console.log('❌ No real users found to reassign events to');
      }
    }
    
    // 2. Find events with mock approvedBy IDs
    console.log('\n🔍 Checking for mock approvedBy fields...');
    const eventsWithMockApprovedBy = await Event.find({ 
      approvedBy: { $in: mockOrganizerIds } 
    });
    
    console.log(`Found ${eventsWithMockApprovedBy.length} events with mock approvedBy`);
    
    if (eventsWithMockApprovedBy.length > 0) {
      const realAdmin = await User.findOne({ role: 'admin' });
      
      if (realAdmin) {
        console.log(`👤 Reassigning approvals to real admin: ${realAdmin.name} (${realAdmin.email})`);
        
        for (const event of eventsWithMockApprovedBy) {
          console.log(`  📋 Updating approval for: ${event.title}`);
          event.approvedBy = realAdmin._id;
          await event.save();
        }
        
        console.log('✅ All approvals reassigned to real admin');
      } else {
        console.log('❌ No real admin found to reassign approvals to');
      }
    }
    
    // 3. Show final status
    console.log('\n📊 Final database status:');
    const allEvents = await Event.find().populate('organizer approvedBy');
    
    allEvents.forEach((event, index) => {
      console.log(`\n--- Event ${index + 1}: ${event.title} ---`);
      console.log(`Organizer: ${event.organizer ? event.organizer.name : 'NULL'} (${event.organizer ? event.organizer.email : 'N/A'})`);
      console.log(`Status: ${event.status} / ${event.approvalStatus}`);
      console.log(`Approved by: ${event.approvedBy ? event.approvedBy.name : 'N/A'} (${event.approvedBy ? event.approvedBy.email : 'N/A'})`);
    });

    // Close connection
    mongoose.connection.close();
    console.log('\n🎉 Cleanup completed!');
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

cleanupMockData();
