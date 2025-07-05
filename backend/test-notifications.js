const dotenv = require('dotenv');
dotenv.config();

const emailService = require('./services/emailService');
const smsService = require('./services/smsService');

async function testNotifications() {
  console.log('🧪 Testing notification services...');
  
  // Test data
  const testOrganizer = {
    name: 'Test Organizer',
    email: 'aryansaxenaalig@gmail.com', // Use the FROM_EMAIL for testing
    phone: '+917302752999' // Test phone number
  };
  
  const testEvent = {
    title: 'Test Event',
    date: new Date(),
    location: 'Test Location',
    price: 25
  };
  
  console.log('\n📧 Testing email service...');
  console.log('Environment variables:');
  console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? 'Set' : 'Not set');
  console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
  
  try {
    const emailResult = await emailService.sendEventApprovalNotification(testOrganizer, testEvent);
    console.log('📧 Email result:', emailResult);
  } catch (error) {
    console.error('📧 Email error:', error);
  }
  
  console.log('\n📱 Testing SMS service...');
  console.log('Environment variables:');
  console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set');
  console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set');
  console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER);
  
  try {
    const smsResult = await smsService.sendEventApprovalNotification(testOrganizer, testEvent);
    console.log('📱 SMS result:', smsResult);
  } catch (error) {
    console.error('📱 SMS error:', error);
  }
}

testNotifications();
