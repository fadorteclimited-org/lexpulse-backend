const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  eventHostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  poster: {
    type: String,
    required: true,
  },
  cover: {
    type: String,
  },
  eventName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
  },
  currency: {
    type: String,
    required: true,
  },
  ticketInfo: [
    {
      ticketType: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      ticketsAvailable: {
        type: Number,
        required: true,
      },
      ticketsLeft: {
        type: Number,
        required: true,
      },
      sold: {
        type: Number,
        default: 0,
      },
      saleStart: {
        type: Date, // Optional sale start date
      },
      saleEnd: {
        type: Date, // Optional sale end date
      },
    },
  ],
  eventDate: {
    type: Date,
    required: true,
  },
  eventEnd: {
    type: String, // Optional event end time
  },
  startSalesDate: {
    type: Date, // Optional sales start date
  },
  endSalesDate: {
    type: Date, // Optional sales end date
  },
  image: {
    type: [String],
  },
  description: {
    type: String,
    required: true,
  },
  minAge: {
    type: Number, // Optional minimum age restriction

  },
  dress: {
    type: String, // Optional dress code
  },
  venue: {
    name: {
      type: String,
    },
    street: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    district: {
      type: String,
    },
    saved: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
    },
  },
  lastEntry: {
    type: String,
    default: 'Anytime',
  },
  approved: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  weightedRating: {
    type: Number,
    default: 0,
  },
  ticketSales: {
    type: Number,
    default: 0,
  },
  scanners: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Scanner',
    default: []
  },
  flagged: {
    type: Boolean,
    default: false,
  },
  reason: {
    type: String,
    default: '',
  }
});

module.exports = mongoose.model('Event', EventSchema);