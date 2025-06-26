const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ticketType: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'used', 'cancelled', 'expired'],
      default: 'active',
    },
    qrCode: {
      type: String,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInTime: {
      type: Date,
    },
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected', 'processed'],
      default: 'none',
    },
    paymentId: {
      type: String,
    },
    transferredTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ticket', TicketSchema); 