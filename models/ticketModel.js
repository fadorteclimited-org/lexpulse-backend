const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  attendeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  paymentMethod: {
    type: String
  },
  ticketInfo: [
    {
      ticketType: {
        type: String,
        required: true,
      },
      numberOfTickets: {
        type: Number,
        required: true,
      }
    }
  ],
  totalPrice: {
    type: Number
  },
  amountPaid: {
    type: Number
  },
  status: {
    type: String
  },
  paymentId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  scanned: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Ticket', TicketSchema);