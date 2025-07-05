const axios = require('axios');

async function testMyTicketsEndpoint() {
  try {
    console.log('🧪 Testing /api/tickets/my-tickets endpoint...\n');
    
    const response = await axios.get('http://localhost:5000/api/tickets/my-tickets', {
      headers: {
        'Content-Type': 'application/json',
        'x-mock-role': 'attendee'
      }
    });
    
    console.log('✅ API Response received');
    console.log('📊 Status:', response.status);
    console.log('📋 Data length:', response.data.length);
    console.log('\n🎫 Tickets:');
    
    response.data.forEach((ticket, index) => {
      console.log(`\n${index + 1}. Ticket ID: ${ticket._id}`);
      console.log(`   Event: ${ticket.event?.title || 'No event'}`);
      console.log(`   Event ID: ${ticket.event?._id || 'No event ID'}`);
      console.log(`   Type: ${ticket.ticketType}`);
      console.log(`   Price: $${ticket.price}`);
      console.log(`   Status: ${ticket.status}`);
      console.log(`   Purchase Date: ${ticket.purchaseDate}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
  
  process.exit(0);
}

testMyTicketsEndpoint();
