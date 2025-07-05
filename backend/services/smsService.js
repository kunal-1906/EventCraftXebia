const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async ({ to, body }) => {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    
    console.log(`SMS sent to ${to}, SID: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('Twilio error:', error);
    return { success: false, error };
  }
};

// Template helpers for common SMS messages
const sendEventReminderSMS = async (user, event) => {
  if (!user.phone) return { success: false, error: 'No phone number' };
  
  return sendSMS({
    to: user.phone,
    body: `Reminder: ${event.title} is tomorrow at ${new Date(event.date).toLocaleTimeString()} in ${event.location}. See you there!`
  });
};

const sendCheckInConfirmationSMS = async (user, event) => {
  if (!user.phone) return { success: false, error: 'No phone number' };
  
  return sendSMS({
    to: user.phone,
    body: `You've successfully checked in to ${event.title}. Enjoy the event!`
  });
};

const sendTicketPurchaseConfirmationSMS = async (user, event, ticketType) => {
  if (!user.phone) return { success: false, error: 'No phone number' };
  
  return sendSMS({
    to: user.phone,
    body: `Thank you for purchasing a ${ticketType} ticket for ${event.title}. Your ticket has been confirmed!`
  });
};

const sendEventConfirmation = async (user, event) => {
  if (!user.phone) return { success: false, error: 'No phone number' };
  
  return sendSMS({
    to: user.phone,
    body: `🎉 Registration confirmed for ${event.title} on ${new Date(event.date).toLocaleDateString()} at ${event.location}. See you there!`
  });
};

const sendEventApprovalNotification = async (organizer, event) => {
  if (!organizer.phone) return { success: false, error: 'No phone number' };
  
  return sendSMS({
    to: organizer.phone,
    body: `✅ Your event "${event.title}" has been approved and is now live! Attendees can now register.`
  });
};

module.exports = {
  sendSMS,
  sendEventReminderSMS,
  sendCheckInConfirmationSMS,
  sendTicketPurchaseConfirmationSMS,
  sendEventConfirmation,
  sendEventApprovalNotification
};