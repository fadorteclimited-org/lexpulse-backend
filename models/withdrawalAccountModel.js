const mongoose = require('mongoose');

const WithdrawalAccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: String,
        required: true,
    },
    bankCode: String,
    currency: String,
    bankName: String,
    recipient_code: String,
    service: {
        type: String,
        enum: [' Pawapay', 'Paystack'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    active: {
        type: Boolean,
        default: true,
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

module.exports = mongoose.model('WithdrawalAccount', WithdrawalAccountSchema);