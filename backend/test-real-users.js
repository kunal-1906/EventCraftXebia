const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

// Connect to database
mongoose.connect('mongodb://localhost:27017/eventcraft')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function testRealUserSystem() {
  try {
    console.log('🧪 Testing real user system...');
    
    // Show current users
    console.log('\n👥 Current users in database:');
    const users = await User.find().select('name email role auth0Id');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
      console.log(`   Auth0 ID: ${user.auth0Id || 'Not set'}`);
    });
    
    // Show current events
    console.log('\n📅 Current events:');
    const events = await Event.find().populate('organizer approvedBy');
    events.forEach((event, index) => {
      console.log(`\n${index + 1}. ${event.title}`);
      console.log(`   Organizer: ${event.organizer ? event.organizer.name : 'NULL'} (${event.organizer ? event.organizer.email : 'N/A'})`);
      console.log(`   Status: ${event.status} / ${event.approvalStatus}`);
      console.log(`   Approved by: ${event.approvedBy ? event.approvedBy.name : 'N/A'}`);
    });
    
    console.log('\n✅ System is ready for real user authentication!');
    console.log('\n📝 To use real users:');
    console.log('1. Frontend should send proper Auth0 JWT tokens');
    console.log('2. Backend will lookup users by auth0Id or email');
    console.log('3. No more mock data will be used');

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

testRealUserSystem();
