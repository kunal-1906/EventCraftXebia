const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketType: {
    type: String,
    default: 'General Admission'
  },
  price: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'used'],
    default: 'confirmed'
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  checkInDate: {
    type: Date
  },
  qrCode: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
TicketSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Ticket', TicketSchema);