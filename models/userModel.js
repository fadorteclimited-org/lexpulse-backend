const mongoose = require('mongoose');
const {Schema} = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    required: true
  },
  lastName: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true
  },
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true
  },
  organization: {
    type: String,
  },
  gender: {
    type: String
  },
  phone: {
    type: Number,
    unique: true
  },
  country: {
    type: String,
    required: true
  },
  /* role: {
    type: String,
    required: [true, 'Please add a role'],
  }, */
  password: {
    type: String,
    required: [true, 'Please add a password']
  },
  activatedEmail: {
    type: Boolean
  },
  activatedPhone: {
    type: Boolean
  },
  userType: {
    type: String,
    required: [true, 'Please add a user type'],
  },
  image: {
    type: [
      String
    ]
  },
  accountActive: {
    type: Boolean
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  currency:{
    type: String,
    default: 'GHS',
  },
  wallets: [
    {
      type: Schema.Types.ObjectId,
    }
  ],
  availableBalance: {
    type: Number,
    default: 0,
  },
  pendingBalance: {
    type: Number,
    default: 0,
  },
  prevAvailableBalance: {
    type: Number,
    default: 0,
  },
  prevPendingBalance: {
    type: Number,
    default: 0,
  },
  withdrawalAccounts: {
    type: [
      {
        type: Schema.Types.ObjectId,
      }
    ],
  }
});

module.exports = mongoose.model('User', UserSchema);